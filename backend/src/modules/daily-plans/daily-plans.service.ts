import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DailyPlanEntity } from './entities/daily-plan.entity';
import { ENV } from '../../common/config/env.config';
import {
  GeneratePlanDto,
  GeneratePlanResponseDto,
  PlanItemDto,
  DailyPlanQueryDto,
} from './dto/daily-plan.dto';

// ─── 类型定义 ───

/** 时间段 */
type TimeSlot = 'morning' | 'afternoon' | 'evening';

/** 时长类型 */
type DurationType = '5min' | '30min' | '2h';

/** 兴趣分类 */
interface InterestInfo {
  id: string;
  name: string;
  category: string;
  level: string;
}

// ─── 常量 ───

/** 时段定义 */
const TIME_SLOTS: { slot: TimeSlot; label: string; start: number; end: number }[] = [
  { slot: 'morning', label: '早晨', start: 5, end: 12 },
  { slot: 'afternoon', label: '下午', start: 12, end: 18 },
  { slot: 'evening', label: '晚上', start: 18, end: 24 },
];

/** 天气 → 室内/户外倾向 */
const WEATHER_INDOOR = ['rainy', 'stormy', 'snowy', 'cloudy', 'foggy'];
const WEATHER_OUTDOOR = ['sunny', 'clear', 'partly_cloudy'];

/** 不同时长对应的推荐活动关键词模板 */
const ACTIVITY_TEMPLATES: Record<DurationType, { desc: string; indoorOnly?: boolean }[]> = {
  '5min': [
    { desc: '深呼吸练习 - 4-7-8 呼吸法，快速平静下来' },
    { desc: '正念冥想 - 专注当下 5 分钟' },
    { desc: '拉伸放松 - 肩颈放松 5 分钟' },
    { desc: '感恩三件事 - 写下今天的三件感恩小事' },
    { desc: '情绪记录 - 快速记录当前心情和原因' },
    { desc: '喝水提醒 - 喝一杯温水，补充水分' },
    { desc: '微笑练习 - 对着镜子微笑 1 分钟' },
    { desc: '眼部放松 - 20-20-20 法则缓解眼疲劳' },
  ],
  '30min': [
    { desc: '轻运动 - 30 分钟瑜伽 / 拉伸 / 快走' },
    { desc: '阅读时光 - 读一本喜欢的书 30 页' },
    { desc: '创意绘画 - 用画笔表达今天的心情' },
    { desc: '音乐欣赏 - 听一首专辑，感受旋律' },
    { desc: '烹饪体验 - 做一道简单的料理' },
    { desc: '整理收纳 - 整理一个角落，获得成就感' },
    { desc: '户外散步 - 去公园走一走，感受自然' },
    { desc: '写作练习 - 自由写作 30 分钟，不设限' },
    { desc: '手工制作 - 折纸 / 编织 / 拼图' },
    { desc: '语言学习 - 学 10 个新单词' },
  ],
  '2h': [
    { desc: '深度阅读 - 读一本书的一个完整章节' },
    { desc: '技能学习 - 在线课程学习一个新技能' },
    { desc: '创作项目 - 完成一个小作品（画/文章/代码）' },
    { desc: '户外探险 - 去一个新地方探索' },
    { desc: '社交活动 - 约朋友聊天 / 参加活动' },
    { desc: '电影时光 - 看一部治愈系电影' },
    { desc: '健身训练 - 去健身房或做完整的训练计划' },
    { desc: '烹饪大餐 - 学做一道新菜' },
    { desc: '手账整理 - 整理相册 / 写周记' },
    { desc: '园艺种植 - 照料植物 / 整理阳台' },
  ],
};

/**
 * 每日计划服务
 *
 * 根据用户兴趣 + 天气 + 时间段自动生成 3 个层级的计划。
 * 天气数据通过外部 API 获取（需配置 DEEPSEEK_BASE_URL 或第三方天气 API）。
 */
@Injectable()
export class DailyPlansService {
  private readonly logger = new Logger(DailyPlansService.name);

  constructor(
    @InjectRepository(DailyPlanEntity)
    private readonly planRepo: Repository<DailyPlanEntity>,
    private readonly configService: ConfigService,
  ) {}

  // ══════════════════════════════════════════════
  //  生成计划
  // ══════════════════════════════════════════════

  /**
   * 生成每日计划（3 个时长层级）
   *
   * 流程：
   * 1. 判断当前时间段
   * 2. 获取用户兴趣
   * 3. 获取当前天气（模拟/外部 API）
   * 4. 从模板匹配活动
   * 5. 存入数据库
   */
  async generate(
    userId: string,
    dto: GeneratePlanDto,
  ): Promise<{
    plans: DailyPlanEntity[];
  }> {
    const planDate = dto.planDate || this.getTodayDate();
    const timeSlot = this.getCurrentTimeSlot();

    // 检查是否已有计划
    if (!dto.force) {
      const existing = await this.planRepo.find({
        where: { userId, planDate, timeSlot },
      });
      if (existing.length > 0) {
        // 如果已存在且不强制重新生成，直接返回已有数据
        return { plans: existing };
      }
    }

    // 获取用户兴趣（模拟，实际从 UserInterestEntity + InterestEntity 获取）
    const userInterests = await this.getUserInterests(userId);

    // 获取天气
    const weather = this.getSimulatedWeather();

    // 生成 3 个层级的计划
    const durationTypes: DurationType[] = ['5min', '30min', '2h'];
    const plans: DailyPlanEntity[] = [];

    for (const durationType of durationTypes) {
      const recommendation = this.recommendActivity(
        userInterests,
        weather,
        timeSlot,
        durationType,
      );

      // 如果 force=true，先删除旧记录再插入
      if (dto.force) {
        await this.planRepo.delete({
          userId,
          planDate,
          timeSlot,
          durationType,
        });
      }

      const plan = this.planRepo.create({
        userId,
        planDate,
        timeSlot,
        durationType,
        title: recommendation.title,
        description: recommendation.description,
        category: recommendation.category,
        weather,
        status: 'pending',
        isAiGenerated: true,
        sourceInterestId: recommendation.sourceInterestId || undefined,
      });

      const saved = await this.planRepo.save(plan);
      plans.push(saved);
    }

    this.logger.log(
      `为用户 ${userId} 生成了 ${planDate} ${timeSlot} 的 3 个计划`,
    );

    return { plans };
  }

  // ══════════════════════════════════════════════
  //  查询
  // ══════════════════════════════════════════════

  /**
   * 获取今日计划
   */
  async findToday(userId: string): Promise<DailyPlanEntity[]> {
    const today = this.getTodayDate();
    return this.planRepo.find({
      where: { userId, planDate: today },
      order: { durationType: 'ASC' },
    });
  }

  /**
   * 获取指定日期的计划
   */
  async findByDate(
    userId: string,
    date: string,
  ): Promise<DailyPlanEntity[]> {
    return this.planRepo.find({
      where: { userId, planDate: date },
      order: { durationType: 'ASC' },
    });
  }

  /**
   * 历史计划（分页）
   */
  async findHistory(
    userId: string,
    query: DailyPlanQueryDto,
  ): Promise<{ items: DailyPlanEntity[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
    } = query;

    const qb = this.planRepo
      .createQueryBuilder('plan')
      .where('plan.userId = :userId', { userId });

    if (status) {
      qb.andWhere('plan.status = :status', { status });
    }

    if (startDate) {
      qb.andWhere('plan.planDate >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('plan.planDate <= :endDate', { endDate });
    }

    qb.orderBy('plan.planDate', 'DESC')
      .addOrderBy('plan.durationType', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  // ══════════════════════════════════════════════
  //  状态变更
  // ══════════════════════════════════════════════

  /**
   * 标记完成
   */
  async complete(userId: string, planId: string): Promise<DailyPlanEntity> {
    const plan = await this.planRepo.findOne({
      where: { id: planId, userId },
    });
    if (!plan) {
      throw new NotFoundException('计划不存在');
    }
    if (plan.status === 'completed') {
      throw new ConflictException('该计划已完成');
    }

    plan.status = 'completed';
    plan.completedAt = new Date();
    return this.planRepo.save(plan);
  }

  /**
   * 标记跳过
   */
  async skip(userId: string, planId: string): Promise<DailyPlanEntity> {
    const plan = await this.planRepo.findOne({
      where: { id: planId, userId },
    });
    if (!plan) {
      throw new NotFoundException('计划不存在');
    }
    if (plan.status === 'completed') {
      throw new ConflictException('已完成计划不可跳过');
    }

    plan.status = 'skipped';
    return this.planRepo.save(plan);
  }

  // ══════════════════════════════════════════════
  //  内部辅助方法
  // ══════════════════════════════════════════════

  /**
   * 获取今天的日期字符串 YYYY-MM-DD
   */
  private getTodayDate(): string {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().split('T')[0];
  }

  /**
   * 根据当前时间判断时间段
   */
  private getCurrentTimeSlot(): TimeSlot {
    const hour = new Date().getHours();
    for (const ts of TIME_SLOTS) {
      if (hour >= ts.start && hour < ts.end) {
        return ts.slot;
      }
    }
    return 'morning'; // fallback
  }

  /**
   * 获取用户兴趣列表
   *
   * 实际场景应从 UserInterestEntity + InterestEntity 查询，
   * 此处模拟返回，待 User 模块注入后替换。
   */
  private async getUserInterests(userId: string): Promise<InterestInfo[]> {
    // TODO: 注入 UsersService 或 InterestRepository 查询真实数据
    // 模拟返回
    return [
      { id: 'default', name: '通用', category: 'other', level: 'beginner' },
    ];
  }

  /**
   * 获取天气（模拟版本）
   *
   * 生产环境应接入天气 API（如和风天气 / OpenWeatherMap）。
   * 天气数据建议缓存 30 分钟。
   */
  private getSimulatedWeather(): string {
    // 模拟：根据当前时间随机
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 9) return 'sunny';
    if (hour >= 9 && hour < 12) return 'partly_cloudy';
    if (hour >= 12 && hour < 15) return 'sunny';
    if (hour >= 15 && hour < 18) return 'cloudy';
    return 'clear';
  }

  /**
   * 核心推荐引擎
   *
   * 根据 用户兴趣 × 天气 × 时间段 × 时长 匹配最优活动。
   */
  private recommendActivity(
    interests: InterestInfo[],
    weather: string,
    timeSlot: TimeSlot,
    durationType: DurationType,
  ): {
    title: string;
    description: string;
    category: string;
    sourceInterestId?: string;
  } {
    const isIndoor =
      WEATHER_INDOOR.includes(weather) || timeSlot === 'evening';
    const templates = ACTIVITY_TEMPLATES[durationType];

    // 按兴趣倾向选择
    const interest = interests[0]; // 简化：取第一个兴趣
    const category = interest.category;

    // 根据天气和时段调整推荐
    let filteredTemplates = [...templates];

    // 雨天/晚上 → 偏向室内活动
    if (isIndoor) {
      // 户外活动排在后面
      filteredTemplates.sort((a, b) => {
        const aIndoor = a.indoorOnly ? 0 : 1;
        const bIndoor = b.indoorOnly ? 0 : 1;
        return aIndoor - bIndoor;
      });
    }

    // 按时长关键词匹配
    const durationKeywords: Record<DurationType, string[]> = {
      '5min': ['呼吸', '冥想', '拉伸', '放松', '记录', '喝水', '微笑', '眼部'],
      '30min': [
        '运动', '瑜伽', '阅读', '绘画', '音乐', '烹饪',
        '整理', '散步', '写作', '手工', '语言',
      ],
      '2h': [
        '深度', '技能', '创作', '探险', '社交', '电影',
        '健身', '烹饪', '手账', '园艺',
      ],
    };

    // 匹配兴趣分类的关键词映射
    const interestCategoryKeywords: Record<string, string[]> = {
      sports: ['运动', '健身', '瑜伽', '散步', '拉伸'],
      arts: ['绘画', '手工', '创作', '写作', '音乐'],
      music: ['音乐', '欣赏', '乐器'],
      reading: ['阅读', '深度', '写作'],
      food: ['烹饪', '烘焙'],
      nature: ['户外', '散步', '园艺', '探险'],
      tech: ['技能', '学习', '课程'],
      social: ['社交', '活动'],
      handcraft: ['手工', '制作', '创作'],
      game: ['游戏', '益智'],
      travel: ['探险', '探索', '户外'],
    };

    // 按兴趣分类匹配
    const matchedKeywords = interestCategoryKeywords[category] || [];
    let bestMatch = filteredTemplates[0];
    let bestScore = 0;

    for (const template of filteredTemplates) {
      let score = 0;
      for (const keyword of matchedKeywords) {
        if (template.desc.includes(keyword)) {
          score += 2;
        }
      }
      // 时长关键词加分
      for (const kw of durationKeywords[durationType]) {
        if (template.desc.includes(kw)) {
          score += 1;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = template;
      }
    }

    // 生成标题（取描述前半部分）
    const [titlePart, ...descParts] = bestMatch.desc.split(' - ');
    const title = titlePart.trim();
    const description =
      descParts.length > 0
        ? descParts.join(' - ').trim()
        : `根据您的兴趣「${interest.name}」推荐。${isIndoor ? ' 适合在室内完成。' : ' 天气不错，可以尝试户外活动。'}`;

    return {
      title,
      description,
      category,
      sourceInterestId: interest.id,
    };
  }
}
