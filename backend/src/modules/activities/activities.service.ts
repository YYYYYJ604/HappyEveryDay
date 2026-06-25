import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityCheckinEntity } from './entities/activity-checkin.entity';
import { ActivityBookmarkEntity } from './entities/activity-bookmark.entity';
import { ActivityQueryDto, CheckinQueryDto, BookmarkQueryDto } from './dto/activity-query.dto';
import { CreateCheckinDto, BookmarkActivityDto } from './dto/checkin.dto';

/**
 * 活动模块服务
 *
 * 职责：
 * - 活动列表 / 详情 / 分类 / 搜索
 * - 活动打卡（开始 / 完成 / 评价）
 * - 活动收藏（添加 / 取消 / 列表）
 */
@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepo: Repository<ActivityEntity>,

    @InjectRepository(ActivityCheckinEntity)
    private readonly checkinRepo: Repository<ActivityCheckinEntity>,

    @InjectRepository(ActivityBookmarkEntity)
    private readonly bookmarkRepo: Repository<ActivityBookmarkEntity>,
  ) {}

  // ──────────────────────────────────────────────
  //  活动列表 & 搜索
  // ──────────────────────────────────────────────

  /**
   * 分页查询活动列表（支持搜索、筛选、排序）
   */
  async findAll(query: ActivityQueryDto): Promise<{
    items: ActivityEntity[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 20,
      interestId,
      keyword,
      difficulty,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.activityRepo.createQueryBuilder('activity')
      .where('activity.isActive = :isActive', { isActive: true });

    if (interestId) {
      qb.andWhere('activity.interestId = :interestId', { interestId });
    }

    if (keyword) {
      qb.andWhere('activity.title LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    if (difficulty) {
      qb.andWhere('activity.difficulty = :difficulty', { difficulty });
    }

    // 允许的排序字段白名单
    const allowedSortFields = [
      'createdAt', 'difficulty', 'durationMin',
      'participantCount', 'completionCount', 'avgRating',
    ];
    const orderField = allowedSortFields.includes(sortBy)
      ? `activity.${sortBy}`
      : 'activity.createdAt';

    qb.orderBy(orderField, sortOrder);
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /**
   * 根据 ID 查询活动详情
   */
  async findById(id: string): Promise<ActivityEntity> {
    const activity = await this.activityRepo.findOne({
      where: { id, isActive: true },
    });

    if (!activity) {
      throw new NotFoundException(`活动 ${id} 不存在`);
    }

    return activity;
  }

  /**
   * 按分类获取活动列表
   */
  async findByInterest(
    interestId: string,
    query: ActivityQueryDto,
  ): Promise<{ items: ActivityEntity[]; total: number }> {
    return this.findAll({ ...query, interestId });
  }

  // ──────────────────────────────────────────────
  //  活动打卡
  // ──────────────────────────────────────────────

  /**
   * 开始参与活动（创建打卡记录）
   */
  async startCheckin(
    activityId: string,
    userId: string,
  ): Promise<ActivityCheckinEntity> {
    // 检查活动是否存在
    await this.findById(activityId);

    // 检查是否已打卡
    const existing = await this.checkinRepo.findOne({
      where: { activityId, userId },
    });
    if (existing) {
      throw new ConflictException('已参与该活动，请勿重复打卡');
    }

    const checkin = this.checkinRepo.create({
      activityId,
      userId,
      status: 'in_progress',
    });

    // 增加参与计数
    await this.activityRepo.increment({ id: activityId }, 'participantCount', 1);

    return this.checkinRepo.save(checkin);
  }

  /**
   * 完成打卡（更新状态、评分、反馈）
   */
  async completeCheckin(
    activityId: string,
    userId: string,
    dto: CreateCheckinDto,
  ): Promise<ActivityCheckinEntity> {
    const checkin = await this.checkinRepo.findOne({
      where: { activityId, userId },
    });
    if (!checkin) {
      throw new NotFoundException('未找到打卡记录，请先开始活动');
    }
    if (checkin.status === 'completed') {
      throw new ConflictException('该活动已完成打卡');
    }

    checkin.status = dto.status || 'completed';
    checkin.rating = dto.rating;
    checkin.feedback = dto.feedback;
    checkin.durationSpent = dto.durationSpent;

    if (dto.status === 'completed') {
      checkin.completedAt = new Date();
      // 增加完成计数
      await this.activityRepo.increment(
        { id: activityId },
        'completionCount',
        1,
      );

      // 如果有评分，更新平均分
      if (dto.rating) {
        const stats = await this.checkinRepo
          .createQueryBuilder('c')
          .select('AVG(c.rating)', 'avg')
          .where('c.activityId = :activityId', { activityId })
          .andWhere('c.rating IS NOT NULL')
          .getRawOne();

        if (stats?.avg) {
          await this.activityRepo.update(activityId, {
            avgRating: Math.round(parseFloat(stats.avg) * 10) / 10,
          });
        }
      }
    }

    return this.checkinRepo.save(checkin);
  }

  /**
   * 查询用户的打卡记录
   */
  async findUserCheckins(
    userId: string,
    query: CheckinQueryDto,
  ): Promise<{ items: ActivityCheckinEntity[]; total: number }> {
    const { page = 1, limit = 20, status } = query;

    const qb = this.checkinRepo.createQueryBuilder('checkin')
      .where('checkin.userId = :userId', { userId });

    if (status) {
      qb.andWhere('checkin.status = :status', { status });
    }

    qb.orderBy('checkin.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  // ──────────────────────────────────────────────
  //  收藏管理
  // ──────────────────────────────────────────────

  /**
   * 收藏活动
   */
  async bookmarkActivity(
    activityId: string,
    userId: string,
    dto?: BookmarkActivityDto,
  ): Promise<ActivityBookmarkEntity> {
    // 检查活动是否存在
    await this.findById(activityId);

    // 检查是否已收藏
    const existing = await this.bookmarkRepo.findOne({
      where: {
        userId,
        targetType: 'activity',
        targetId: activityId,
      },
    });
    if (existing) {
      throw new ConflictException('已收藏该活动');
    }

    const bookmark = this.bookmarkRepo.create({
      userId,
      targetType: 'activity',
      targetId: activityId,
      note: dto?.note,
    });

    return this.bookmarkRepo.save(bookmark);
  }

  /**
   * 取消收藏活动
   */
  async unbookmarkActivity(
    activityId: string,
    userId: string,
  ): Promise<void> {
    const result = await this.bookmarkRepo.delete({
      userId,
      targetType: 'activity',
      targetId: activityId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('未收藏该活动');
    }
  }

  /**
   * 查询用户收藏的活动列表
   */
  async findUserBookmarks(
    userId: string,
    query: BookmarkQueryDto,
  ): Promise<{ items: ActivityBookmarkEntity[]; total: number }> {
    const { page = 1, limit = 20 } = query;

    const qb = this.bookmarkRepo.createQueryBuilder('bookmark')
      .where('bookmark.userId = :userId', { userId })
      .andWhere('bookmark.targetType = :targetType', { targetType: 'activity' });

    qb.orderBy('bookmark.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  /**
   * 检查用户是否收藏了某活动
   */
  async isBookmarked(activityId: string, userId: string): Promise<boolean> {
    const count = await this.bookmarkRepo.count({
      where: {
        userId,
        targetType: 'activity',
        targetId: activityId,
      },
    });
    return count > 0;
  }
}
