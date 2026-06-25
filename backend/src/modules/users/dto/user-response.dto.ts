import { Exclude, Expose, Type } from 'class-transformer';

/**
 * 兴趣标签（用户关联后）
 */
class UserInterestItemDto {
  id: string;
  name: string;
  icon?: string;
  category?: string;
  level: string;
}

/**
 * 用户配置（公开部分）
 */
class UserProfileDto {
  notifyLike: boolean;
  notifyComment: boolean;
  notifyFollow: boolean;
  notifySystem: boolean;
  notifyDailyReminder: boolean;
  dailyReminderTime: string;
  moodReminderEnabled: boolean;
  moodReminderTime?: string;
  privacyShowPlans: string;
  privacyShowMood: string;
  privacyShowJournal: string;
  themeMode: string;
  language: string;
  planStreakDays: number;
  moodStreakDays: number;
  longestPlanStreak: number;
}

/**
 * 用户响应 DTO
 *
 * 排除敏感字段（passwordHash, refreshToken），
 * 对日期做格式处理。
 */
@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  phone: string;

  @Expose()
  email?: string;

  @Expose()
  nickname: string;

  @Expose()
  avatarUrl?: string;

  @Expose()
  bio: string;

  @Expose()
  gender: number;

  @Expose()
  birthday?: string;

  @Expose()
  occupation?: string;

  @Expose()
  region?: string;

  @Expose()
  zodiacSign?: string;

  @Expose()
  role: string;

  @Expose()
  isActive: boolean;

  @Expose()
  isOnboarded: boolean;

  @Expose()
  lastLoginAt?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserProfileDto)
  profile?: UserProfileDto;

  @Expose()
  @Type(() => UserInterestItemDto)
  interests?: UserInterestItemDto[];
}
