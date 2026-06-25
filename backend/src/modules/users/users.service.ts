import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UserInterestEntity } from './entities/user-interest.entity';
import { InterestEntity } from './entities/interest.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserInterestsDto } from './dto/interest-query.dto';

/**
 * 用户模块服务
 *
 * 职责：
 * - 用户信息查询与资料修改
 * - 兴趣标签管理（增删改用户关联的兴趣）
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(UserProfileEntity)
    private readonly profileRepo: Repository<UserProfileEntity>,

    @InjectRepository(UserInterestEntity)
    private readonly userInterestRepo: Repository<UserInterestEntity>,

    @InjectRepository(InterestEntity)
    private readonly interestRepo: Repository<InterestEntity>,
  ) {}

  // ──────────────────────────────────────────────
  //  用户信息查询
  // ──────────────────────────────────────────────

  /**
   * 根据 ID 查询用户详情（含 profile 和 interests）
   */
  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        profile: true,
        interests: { interest: true },
      },
    });

    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }

    return user;
  }

  /**
   * 根据手机号查询用户（登录/注册用）
   */
  async findByPhone(phone: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { phone, deletedAt: IsNull() },
    });
  }

  /**
   * 分页查询用户列表（管理后台用）
   */
  async findAll(query: {
    page: number;
    limit: number;
    keyword?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<{ items: UserEntity[]; total: number }> {
    const { page = 1, limit = 20, keyword, role, isActive } = query;

    const qb = this.userRepo.createQueryBuilder('user')
      .where('user.deletedAt IS NULL');

    if (keyword) {
      qb.andWhere(
        '(user.nickname LIKE :keyword OR user.phone LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      qb.andWhere('user.isActive = :isActive', { isActive });
    }

    qb.skip((page - 1) * limit).take(limit);
    qb.orderBy('user.createdAt', 'DESC');

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  // ──────────────────────────────────────────────
  //  修改资料
  // ──────────────────────────────────────────────

  /**
   * 更新用户基础资料
   *
   * 同时支持更新 users 表和 user_profiles 表。
   * 只传非空字段，不修改未传入的字段。
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserEntity> {
    const user = await this.findById(userId);

    // ── 更新 users 表字段 ──
    const userFields: (keyof UpdateProfileDto)[] = [
      'nickname', 'bio', 'gender', 'birthday',
      'occupation', 'region', 'zodiacSign', 'avatarUrl',
    ];

    for (const field of userFields) {
      if (dto[field] !== undefined) {
        (user as any)[field] = dto[field];
      }
    }

    await this.userRepo.save(user);

    // ── 更新 user_profiles 表字段 ──
    const profileFields: (keyof UpdateProfileDto)[] = [
      'notifyLike', 'notifyComment', 'notifyFollow', 'notifySystem',
      'notifyDailyReminder', 'dailyReminderTime',
      'moodReminderEnabled', 'moodReminderTime',
      'privacyShowPlans', 'privacyShowMood', 'privacyShowJournal',
      'themeMode', 'language',
    ];

    const hasProfileChanges = profileFields.some(
      (f) => dto[f] !== undefined,
    );

    if (hasProfileChanges) {
      let profile = await this.profileRepo.findOne({
        where: { userId },
      });

      // 首次更新时创建 profile
      if (!profile) {
        profile = this.profileRepo.create({ userId });
      }

      for (const field of profileFields) {
        if (dto[field] !== undefined) {
          (profile as any)[field] = dto[field];
        }
      }

      await this.profileRepo.save(profile);
    }

    return this.findById(userId);
  }

  // ──────────────────────────────────────────────
  //  兴趣标签管理
  // ──────────────────────────────────────────────

  /**
   * 获取所有可用的兴趣标签列表
   */
  async findAllInterests(query?: {
    category?: string;
    keyword?: string;
  }): Promise<InterestEntity[]> {
    const qb = this.interestRepo.createQueryBuilder('interest')
      .where('interest.isActive = :isActive', { isActive: true })
      .orderBy('interest.sortOrder', 'ASC')
      .addOrderBy('interest.name', 'ASC');

    if (query?.category) {
      qb.andWhere('interest.category = :category', { category: query.category });
    }

    if (query?.keyword) {
      qb.andWhere('interest.name LIKE :keyword', {
        keyword: `%${query.keyword}%`,
      });
    }

    return qb.getMany();
  }

  /**
   * 获取指定用户已关联的兴趣标签
   */
  async findUserInterests(userId: string): Promise<UserInterestEntity[]> {
    return this.userInterestRepo.find({
      where: { userId },
      relations: { interest: true },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 更新用户的兴趣标签（全量替换）
   *
   * 删除旧的关联 → 创建新的关联。
   */
  async updateUserInterests(
    userId: string,
    dto: UpdateUserInterestsDto,
  ): Promise<UserInterestEntity[]> {
    const user = await this.findById(userId);

    // 验证所有 interestId 是否存在
    const ids = dto.interests.map((i) => i.interestId);
    const existingInterests = await this.interestRepo.find({
      where: { id: In(ids), isActive: true },
    });

    if (existingInterests.length !== ids.length) {
      const foundIds = existingInterests.map((i) => i.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `以下兴趣标签不存在或已禁用: ${missingIds.join(', ')}`,
      );
    }

    // 在事务中全量替换
    await this.userInterestRepo.manager.transaction(
      async (entityManager) => {
        // 删除旧关联
        await entityManager.delete(UserInterestEntity, { userId });

        // 创建新关联
        const entities = dto.interests.map((item) =>
          entityManager.create(UserInterestEntity, {
            userId,
            interestId: item.interestId,
            level: item.level || 'beginner',
          }),
        );

        await entityManager.save(entities);
      },
    );

    return this.findUserInterests(userId);
  }
}
