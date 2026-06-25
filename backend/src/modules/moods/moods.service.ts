import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MoodEntity } from './entities/mood.entity';
import {
  MoodLevel,
  MOOD_LEVEL_MAP,
  CreateMoodDto,
  MoodQueryDto,
  MonthStatQueryDto,
  MonthStatDto,
} from './dto/mood.dto';

/**
 * 心情模块服务
 *
 * 职责：
 * - 记录心情（简化 4 级 → 数据库 10 种 mapping）
 * - 分页查询历史心情
 * - 月度统计（分布、趋势、连续打卡）
 */
@Injectable()
export class MoodsService {
  private readonly logger = new Logger(MoodsService.name);

  constructor(
    @InjectRepository(MoodEntity)
    private readonly moodRepo: Repository<MoodEntity>,
  ) {}

  // ══════════════════════════════════════════════
  //  常量
  // ══════════════════════════════════════════════

  /**
   * 心情等级 → 中文描述
   */
  private readonly LEVEL_LABELS: Record<MoodLevel, string> = {
    [MoodLevel.LOW]: '低落',
    [MoodLevel.FAIR]: '一般',
    [MoodLevel.GOOD]: '不错',
    [MoodLevel.HAPPY]: '开心',
  };

  /**
   * 数据库 mood_type → 简化等级映射
   */
  private readonly TYPE_TO_LEVEL: Record<string, MoodLevel> = {
    sad: MoodLevel.LOW,
    tired: MoodLevel.LOW,
    anxious: MoodLevel.LOW,
    lonely: MoodLevel.LOW,
    angry: MoodLevel.LOW,
    neutral: MoodLevel.FAIR,
    calm: MoodLevel.GOOD,
    grateful: MoodLevel.GOOD,
    happy: MoodLevel.HAPPY,
    excited: MoodLevel.HAPPY,
  };

  // ══════════════════════════════════════════════
  //  记录心情
  // ══════════════════════════════════════════════

  /**
   * 记录心情
   *
   * 简化 4 级输入 → 映射到数据库 mood_type
   *   低落 → sad（随机选）
   *   一般 → neutral
   *   不错 → calm（随机选）
   *   开心 → happy（随机选）
   */
  async create(userId: string, dto: CreateMoodDto): Promise<MoodResponseData> {
    const levelMap = MOOD_LEVEL_MAP[dto.level];
    if (!levelMap) {
      throw new BadRequestException(`无效的心情等级: ${dto.level}`);
    }

    // 从该等级的 types 数组中选一个
    const types = levelMap.types;
    const moodType = types[Math.floor(Math.random() * types.length)];

    const intensity = dto.intensity ?? levelMap.defaultIntensity;
    const now = new Date();

    const record = new MoodEntity();
    record.userId = userId;
    record.moodType = moodType;
    record.intensity = intensity;
    record.journal = dto.journal || undefined;
    record.tags = dto.tags || undefined;
    record.factors = dto.factors || undefined;
    record.energyLevel = dto.energyLevel || undefined;
    record.sleepHours = dto.sleepHours || undefined;
    record.recordDate = dto.recordDate || this.formatDate(now);
    record.recordTime = this.formatTime(now);

    const saved = await this.moodRepo.save(record);

    this.logger.log(
      `用户 ${userId} 记录心情: ${dto.level}(${moodType}) 强度=${intensity}`,
    );

    return this.toResponse(saved);
  }

  // ══════════════════════════════════════════════
  //  查询历史
  // ══════════════════════════════════════════════

  /**
   * 分页查询历史心情
   */
  async findHistory(
    userId: string,
    query: MoodQueryDto,
  ): Promise<{ items: MoodResponseData[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      level,
      startDate,
      endDate,
    } = query;

    const qb = this.moodRepo
      .createQueryBuilder('mood')
      .where('mood.userId = :userId', { userId });

    // 按等级筛选（level → types 映射）
    if (level) {
      const levelMap = MOOD_LEVEL_MAP[level];
      if (levelMap) {
        qb.andWhere('mood.moodType IN (:...types)', { types: levelMap.types });
      }
    }

    if (startDate) {
      qb.andWhere('mood.recordDate >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('mood.recordDate <= :endDate', { endDate });
    }

    qb.orderBy('mood.recordDate', 'DESC')
      .addOrderBy('mood.recordTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items: items.map((item) => this.toResponse(item)),
      total,
    };
  }

  // ══════════════════════════════════════════════
  //  月度统计
  // ══════════════════════════════════════════════

  /**
   * 月度统计
   *
   * 返回：
   * - 总记录天数
   * - 平均等级(数值化: low=1, fair=2, good=3, happy=4)
   * - 平均强度 / 平均精力
   * - 每日心情分布
   * - 整体分布
   * - 连续打卡天数
   */
  async getMonthStats(
    userId: string,
    query: MonthStatQueryDto,
  ): Promise<MonthStatDto> {
    const { year, month } = query;

    // 计算该月的日期范围
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // 查询该月所有记录
    const records = await this.moodRepo.find({
      where: {
        userId,
        recordDate: Between(startDate, endDate),
      },
      order: { recordDate: 'ASC' },
    });

    if (records.length === 0) {
      return {
        year,
        month,
        totalDays: 0,
        averageLevel: 0,
        averageIntensity: 0,
        averageEnergy: 0,
        dailyDistribution: {},
        distribution: { low: 0, fair: 0, good: 0, happy: 0 },
        streakDays: 0,
      };
    }

    // 按日聚合
    const dailyMap = new Map<string, MoodEntity[]>();
    for (const record of records) {
      const day = record.recordDate;
      if (!dailyMap.has(day)) {
        dailyMap.set(day, []);
      }
      dailyMap.get(day)!.push(record);
    }

    // 每日取最后一条作为该日心情
    const dailyLevels: { date: string; level: MoodLevel; intensity: number }[] = [];
    const dailyDistribution: Record<string, Record<string, number>> = {};
    const distribution: Record<string, number> = {
      low: 0,
      fair: 0,
      good: 0,
      happy: 0,
    };

    let totalIntensity = 0;
    let totalEnergy = 0;
    let energyCount = 0;

    for (const [date, dayRecords] of dailyMap) {
      // 取当天最后一条
      const last = dayRecords[dayRecords.length - 1];
      const level = this.typeToLevel(last.moodType);

      dailyLevels.push({ date, level, intensity: last.intensity });

      // 当日分布
      const dayDist: Record<string, number> = {};
      for (const r of dayRecords) {
        const l = this.typeToLevel(r.moodType);
        dayDist[l] = (dayDist[l] || 0) + 1;
      }
      dailyDistribution[date] = dayDist;

      // 整体分布
      distribution[level] = (distribution[level] || 0) + 1;

      totalIntensity += last.intensity;
      if (last.energyLevel) {
        totalEnergy += last.energyLevel;
        energyCount++;
      }
    }

    // 计算平均等级（数值化）
    const levelValues: Record<string, number> = {
      low: 1,
      fair: 2,
      good: 3,
      happy: 4,
    };
    const totalLevelValue = dailyLevels.reduce(
      (sum, d) => sum + (levelValues[d.level] || 0),
      0,
    );
    const averageLevel =
      Math.round((totalLevelValue / dailyLevels.length) * 10) / 10;

    // 连续打卡
    const streakDays = this.calcStreakDays(dailyLevels);

    return {
      year,
      month,
      totalDays: dailyMap.size,
      averageLevel,
      averageIntensity:
        Math.round((totalIntensity / dailyLevels.length) * 10) / 10,
      averageEnergy:
        energyCount > 0
          ? Math.round((totalEnergy / energyCount) * 10) / 10
          : 0,
      dailyDistribution,
      distribution,
      streakDays,
    };
  }

  /**
   * 获取最新一条心情记录
   */
  async findLatest(userId: string): Promise<MoodResponseData | null> {
    const record = await this.moodRepo.findOne({
      where: { userId },
      order: { recordDate: 'DESC', recordTime: 'DESC' },
    });
    return record ? this.toResponse(record) : null;
  }

  // ══════════════════════════════════════════════
  //  内部辅助
  // ══════════════════════════════════════════════

  /**
   * 数据库 mood_type → 简化等级
   */
  private typeToLevel(moodType: string): MoodLevel {
    return this.TYPE_TO_LEVEL[moodType] || MoodLevel.FAIR;
  }

  /**
   * 实体 → 响应 DTO
   */
  private toResponse(entity: MoodEntity): MoodResponseData {
    return {
      id: entity.id,
      level: this.typeToLevel(entity.moodType),
      moodType: entity.moodType,
      intensity: entity.intensity,
      journal: entity.journal || undefined,
      tags: entity.tags || undefined,
      factors: entity.factors || undefined,
      energyLevel: entity.energyLevel || undefined,
      sleepHours: entity.sleepHours ? Number(entity.sleepHours) : undefined,
      recordDate: entity.recordDate,
      recordTime: entity.recordTime,
      weather: entity.weather || undefined,
      createdAt: entity.createdAt,
    };
  }

  /**
   * Date → YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().split('T')[0];
  }

  /**
   * Date → HH:mm:ss
   */
  private formatTime(date: Date): string {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  /**
   * 计算连续打卡天数（从最近开始往前统计）
   */
  private calcStreakDays(
    dailyLevels: { date: string; level: MoodLevel }[],
  ): number {
    if (dailyLevels.length === 0) return 0;

    // 按日期排序（升序）
    const sorted = [...dailyLevels].sort(
      (a, b) => a.date.localeCompare(b.date),
    );

    let streak = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      const curr = new Date(sorted[i].date);
      const prev = new Date(sorted[i - 1].date);
      const diffMs = curr.getTime() - prev.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
}

// ─── 类型导出 ───

export interface MoodResponseData {
  id: string;
  level: string;
  moodType: string;
  intensity: number;
  journal?: string;
  tags?: string[];
  factors?: string[];
  energyLevel?: number;
  sleepHours?: number;
  recordDate: string;
  recordTime: string;
  weather?: string;
  createdAt: Date;
}
