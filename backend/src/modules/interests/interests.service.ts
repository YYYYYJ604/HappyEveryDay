import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { InterestEntity } from './entities/interest.entity';
import { UserInterestEntity } from './entities/user-interest.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { ActivityCheckinEntity } from '../activities/entities/activity-checkin.entity';
import {
  SelectInterestDto,
  UpdateInterestLevelDto,
  InterestTaskQueryDto,
  InterestGrowthQueryDto,
  InterestResponseDto,
  UserInterestResponseDto,
  InterestTaskResponseDto,
  InterestGrowthResponseDto,
  InterestMonthlySummaryDto,
} from './dto/interest.dto';

/**
 * 兴趣模块服务
 *
 * 职责：
 * - 兴趣列表（系统预设标签库）
 * - 用户选择/取消兴趣
 * - 按兴趣推荐活动任务
 * - 兴趣成长记录与统计
 */
@Injectable()
export class InterestsService {
  private readonly logger = new Logger(InterestsService.name);

  constructor(
    @InjectRepository(InterestEntity)
    private readonly interestRepo: Repository<InterestEntity>,

    @InjectRepository(UserInterestEntity)
    private readonly userInterestRepo: Repository<UserInterestEntity>,

    @InjectRepository(ActivityEntity)
    private readonly activityRepo: Repository<ActivityEntity>,

    @InjectRepository(ActivityCheckinEntity)
    private readonly checkinRepo: Repository<ActivityCheckinEntity>,
  ) {}

  // ══════════════════════════════════════════════
  //  兴趣列表
  // ══════════════════════════════════════════════

  /**
   * 获取所有兴趣（按 sortOrder 排序）
   */
  async findAll(): Promise<InterestResponseDto[]> {
    const interests = await this.interestRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return interests.map((i) => this.toInterestResponse(i));
  }

  /**
   * 获取单个兴趣详情
   */
  async findById(id: string): Promise<InterestResponseDto> {
    const interest = await this.interestRepo.findOne({ where: { id } });
    if (!interest) {
      throw new NotFoundException('兴趣不存在');
    }
    return this.toInterestResponse(interest);
  }

  // ══════════════════════════════════════════════
  //  用户兴趣选择
  // ══════════════════════════════════════════════

  /**
   * 获取用户选择的兴趣（含成长数据）
   */
  async findUserInterests(userId: string): Promise<UserInterestResponseDto[]> {
    const userInterests = await this.userInterestRepo.find({
      where: { userId },
      relations: { interest: true },
      order: { createdAt: 'ASC' },
    });
    return userInterests.map((ui) => this.toUserInterestResponse(ui));
  }

  /**
   * 用户选择兴趣（批量，最多 10 个）
   *
   * 重复选择自动忽略（Unique 约束）。
   */
  async selectInterests(
    userId: string,
    dto: SelectInterestDto,
  ): Promise<UserInterestResponseDto[]> {
    const { interestIds } = dto;

    if (!interestIds || interestIds.length === 0) {
      throw new BadRequestException('请至少选择一个兴趣');
    }

    if (interestIds.length > 10) {
      throw new BadRequestException('最多选择 10 个兴趣');
    }

    // 验证所有兴趣 ID 存在
    const existing = await this.interestRepo.find({
      where: { id: In(interestIds), isActive: true },
    });
    if (existing.length !== interestIds.length) {
      throw new NotFoundException('部分兴趣不存在');
    }

    // 批量创建（unique 约束会自动忽略重复）
    const created: UserInterestEntity[] = [];
    for (const interestId of interestIds) {
      try {
        // 先查是否已有
        const exists = await this.userInterestRepo.findOne({
          where: { userId, interestId },
        });
        if (exists) {
          created.push(exists);
          continue;
        }

        const ui = this.userInterestRepo.create({
          userId,
          interestId,
          level: 'beginner',
        });
        const saved = await this.userInterestRepo.save(ui);
        created.push(saved);
      } catch (err: any) {
        // 唯一约束冲突，忽略
        this.logger.warn(`兴趣 ${interestId} 可能已存在: ${err.message}`);
      }
    }

    // 重新加载 relations
    const result = await this.userInterestRepo.find({
      where: { userId },
      relations: { interest: true },
      order: { createdAt: 'ASC' },
    });

    this.logger.log(`用户 ${userId} 选择了 ${created.length} 个兴趣`);
    return result.map((ui) => this.toUserInterestResponse(ui));
  }

  /**
   * 取消选择兴趣
   */
  async removeInterest(userId: string, interestId: string): Promise<void> {
    const ui = await this.userInterestRepo.findOne({
      where: { userId, interestId },
    });
    if (!ui) {
      throw new NotFoundException('未选择该兴趣');
    }

    await this.userInterestRepo.remove(ui);
    this.logger.log(`用户 ${userId} 取消了兴趣 ${interestId}`);
  }

  /**
   * 更新兴趣等级
   */
  async updateLevel(
    userId: string,
    interestId: string,
    dto: UpdateInterestLevelDto,
  ): Promise<UserInterestResponseDto> {
    const ui = await this.userInterestRepo.findOne({
      where: { userId, interestId },
      relations: { interest: true },
    });
    if (!ui) {
      throw new NotFoundException('未选择该兴趣');
    }

    ui.level = dto.level;
    const saved = await this.userInterestRepo.save(ui);
    return this.toUserInterestResponse(saved);
  }

  // ══════════════════════════════════════════════
  //  兴趣任务推荐
  // ══════════════════════════════════════════════

  /**
   * 根据用户兴趣推荐活动任务
   *
   * 逻辑：
   * 1. 获取用户所有的兴趣 ID
   * 2. 筛选该兴趣下的活动
   * 3. 按难度/时长过滤
   * 4. 标记用户是否已完成
   * 5. 按推荐度排序（评分 + 参与人数 + 完成率）
   */
  async recommendTasks(
    userId: string,
    interestId: string,
    query: InterestTaskQueryDto,
  ): Promise<{ items: InterestTaskResponseDto[]; total: number }> {
    const { page = 1, limit = 20, difficulty, durationMin } = query;

    const qb = this.activityRepo
      .createQueryBuilder('a')
      .where('a.interestId = :interestId', { interestId })
      .andWhere('a.isActive = :isActive', { isActive: true });

    if (difficulty) {
      qb.andWhere('a.difficulty = :difficulty', { difficulty });
    }

    if (durationMin) {
      qb.andWhere('a.durationMin <= :durationMin', { durationMin });
    }

    // 按推荐度排序: avgRating DESC, completionCount DESC, participantCount DESC
    qb.orderBy('a.avgRating', 'DESC')
      .addOrderBy('a.completionCount', 'DESC')
      .addOrderBy('a.participantCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    // 获取用户已完成的活动 ID 列表
    const completedActivityIds = await this.getCompletedActivityIds(userId);

    return {
      items: items.map((a) => ({
        id: a.id,
        interestId: a.interestId,
        title: a.title,
        description: a.description || undefined,
        difficulty: a.difficulty,
        durationMin: a.durationMin || undefined,
        participantCount: a.participantCount,
        completionCount: a.completionCount,
        avgRating: Number(a.avgRating),
        isCompleted: completedActivityIds.has(a.id),
      })),
      total,
    };
  }

  /**
   * 推荐所有兴趣下的任务（首页推荐）
   */
  async recommendAllTasks(
    userId: string,
    query: InterestTaskQueryDto,
  ): Promise<{ items: InterestTaskResponseDto[]; total: number }> {
    const { page = 1, limit = 20, difficulty } = query;

    // 获取用户兴趣 ID 列表
    const userInterests = await this.userInterestRepo.find({
      where: { userId },
    });
    const interestIds = userInterests.map((ui) => ui.interestId);

    if (interestIds.length === 0) {
      return { items: [], total: 0 };
    }

    const qb = this.activityRepo
      .createQueryBuilder('a')
      .where('a.interestId IN (:...interestIds)', { interestIds })
      .andWhere('a.isActive = :isActive', { isActive: true });

    if (difficulty) {
      qb.andWhere('a.difficulty = :difficulty', { difficulty });
    }

    qb.orderBy('a.avgRating', 'DESC')
      .addOrderBy('a.completionCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    const completedActivityIds = await this.getCompletedActivityIds(userId);

    return {
      items: items.map((a) => ({
        id: a.id,
        interestId: a.interestId,
        title: a.title,
        description: a.description || undefined,
        difficulty: a.difficulty,
        durationMin: a.durationMin || undefined,
        participantCount: a.participantCount,
        completionCount: a.completionCount,
        avgRating: Number(a.avgRating),
        isCompleted: completedActivityIds.has(a.id),
      })),
      total,
    };
  }

  // ══════════════════════════════════════════════
  //  兴趣成长记录
  // ══════════════════════════════════════════════

  /**
   * 获取用户所有兴趣的成长记录
   */
  async getGrowthRecords(
    userId: string,
    query: InterestGrowthQueryDto,
  ): Promise<InterestGrowthResponseDto[]> {
    const { year, month, startDate, endDate } = query;

    // 计算日期范围
    let dateFrom: string | undefined;
    let dateTo: string | undefined;

    if (year && month) {
      dateFrom = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      dateTo = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    } else if (startDate && endDate) {
      dateFrom = startDate;
      dateTo = endDate;
    } else {
      // 默认最近 30 天
      const now = new Date();
      dateTo = this.formatDate(now);
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFrom = this.formatDate(past);
    }

    // 获取用户兴趣
    const userInterests = await this.userInterestRepo.find({
      where: { userId },
      relations: { interest: true },
      order: { createdAt: 'ASC' },
    });

    if (userInterests.length === 0) {
      return [];
    }

    // 统计每个兴趣在时间范围内的数据
    const results: InterestGrowthResponseDto[] = [];

    for (const ui of userInterests) {
      const interestId = ui.interestId;

      // 查询该时间段内的打卡记录
      const checkins = await this.checkinRepo.find({
        where: {
          userId,
          activityId: In(
            (await this.activityRepo.find({ where: { interestId } })).map(
              (a) => a.id,
            ),
          ),
          createdAt: Between(
            new Date(`${dateFrom}T00:00:00Z`),
            new Date(`${dateTo}T23:59:59Z`),
          ),
        },
      });

      // 计算周/月活动数
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weeklyActivities = this.countCheckinsAfter(
        checkins,
        weekAgo,
      );
      const monthlyActivities = this.countCheckinsAfter(
        checkins,
        new Date(now.getFullYear(), now.getMonth(), 1),
      );

      // 计算累计数据（全量）
      const allCheckins = await this.checkinRepo.find({
        where: {
          userId,
          activityId: In(
            (await this.activityRepo.find({ where: { interestId } })).map(
              (a) => a.id,
            ),
          ),
          status: 'completed',
        },
      });

      const totalDuration = allCheckins.reduce(
        (sum, c) => sum + (c.durationSpent || 0),
        0,
      );
      const streakDays = this.calcStreakDays(allCheckins);

      const interestDetail = ui.interest
        ? {
            id: ui.interest.id,
            name: ui.interest.name,
            icon: ui.interest.icon || undefined,
            category: ui.interest.category || undefined,
            description: ui.interest.description || undefined,
            color: ui.interest.color || undefined,
            sortOrder: ui.interest.sortOrder,
          }
        : ({
            id: '',
            name: '未知',
            sortOrder: 0,
          } as InterestResponseDto);

      results.push({
        userInterestId: ui.id,
        interest: interestDetail,
        currentLevel: ui.level,
        totalActivities: allCheckins.filter((c) => c.status === 'completed')
          .length,
        totalDurationMin: totalDuration,
        streakDays,
        weeklyActivities,
        monthlyActivities,
        lastActivityAt:
          allCheckins.length > 0
            ? allCheckins[allCheckins.length - 1].createdAt
            : undefined,
      });
    }

    // 按活动数降序
    results.sort((a, b) => b.totalActivities - a.totalActivities);

    return results;
  }

  /**
   * 获取月度兴趣活跃度汇总
   */
  async getMonthlySummary(
    userId: string,
    year?: number,
    month?: number,
  ): Promise<InterestMonthlySummaryDto> {
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;

    const growthRecords = await this.getGrowthRecords(userId, {
      year: y,
      month: m,
    });

    const totalActivities = growthRecords.reduce(
      (sum, r) => sum + r.monthlyActivities,
      0,
    );
    const totalDurationMin = growthRecords.reduce(
      (sum, r) => sum + r.totalDurationMin,
      0,
    );
    const lastDay = new Date(y, m, 0).getDate();
    const dailyAvgMin =
      lastDay > 0
        ? Math.round((totalDurationMin / lastDay) * 10) / 10
        : 0;

    // 取 Top 5
    const topInterests = [...growthRecords]
      .sort((a, b) => b.monthlyActivities - a.monthlyActivities)
      .slice(0, 5);

    return {
      year: y,
      month: m,
      totalInterests: growthRecords.length,
      totalActivities,
      totalDurationMin,
      dailyAvgMin,
      topInterests,
    };
  }

  // ══════════════════════════════════════════════
  //  内部辅助
  // ══════════════════════════════════════════════

  private toInterestResponse(e: InterestEntity): InterestResponseDto {
    return {
      id: e.id,
      name: e.name,
      icon: e.icon || undefined,
      category: e.category || undefined,
      description: e.description || undefined,
      color: e.color || undefined,
      sortOrder: e.sortOrder,
    };
  }

  private toUserInterestResponse(
    ui: UserInterestEntity,
  ): UserInterestResponseDto {
    return {
      id: ui.id,
      interestId: ui.interestId,
      interest: ui.interest
        ? this.toInterestResponse(ui.interest)
        : ({} as InterestResponseDto),
      level: ui.level,
      totalActivities: ui.totalActivities,
      totalDurationMin: ui.totalDurationMin,
      streakDays: ui.streakDays,
      lastActivityAt: ui.lastActivityAt || undefined,
    };
  }

  /**
   * 获取用户已完成活动的 ID Set
   */
  private async getCompletedActivityIds(
    userId: string,
  ): Promise<Set<string>> {
    const checkins = await this.checkinRepo.find({
      where: { userId, status: 'completed' },
      select: { activityId: true },
    });
    return new Set(checkins.map((c) => c.activityId));
  }

  /**
   * 统计某个时间点之后的打卡数
   */
  private countCheckinsAfter(
    checkins: ActivityCheckinEntity[],
    after: Date,
  ): number {
    return checkins.filter(
      (c) => c.createdAt >= after && c.status === 'completed',
    ).length;
  }

  /**
   * 计算连续天数
   */
  private calcStreakDays(
    checkins: ActivityCheckinEntity[],
  ): number {
    if (checkins.length === 0) return 0;

    const completed = checkins
      .filter((c) => c.status === 'completed')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    if (completed.length === 0) return 0;

    let streak = 1;
    for (let i = completed.length - 1; i > 0; i--) {
      const curr = completed[i].createdAt;
      const prev = completed[i - 1].createdAt;
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

  private formatDate(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().split('T')[0];
  }
}
