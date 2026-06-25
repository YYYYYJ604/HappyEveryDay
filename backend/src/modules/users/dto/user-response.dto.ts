import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 兴趣标签（用户关联后）
 */
class UserInterestItemDto {
  @ApiProperty({ description: '关联记录 ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '兴趣名称', example: '绘画' })
  name: string;

  @ApiPropertyOptional({ description: '图标 URL', example: 'https://example.com/icon.png' })
  icon?: string;

  @ApiPropertyOptional({ description: '分类', example: 'arts' })
  category?: string;

  @ApiProperty({ description: '熟练等级', example: 'beginner' })
  level: string;
}

/**
 * 用户配置（公开部分）
 */
class UserProfileDto {
  @ApiProperty({ description: '点赞通知', example: true })
  notifyLike: boolean;

  @ApiProperty({ description: '评论通知', example: true })
  notifyComment: boolean;

  @ApiProperty({ description: '关注通知', example: true })
  notifyFollow: boolean;

  @ApiProperty({ description: '系统通知', example: true })
  notifySystem: boolean;

  @ApiProperty({ description: '每日提醒', example: true })
  notifyDailyReminder: boolean;

  @ApiProperty({ description: '每日提醒时间', example: '09:00' })
  dailyReminderTime: string;

  @ApiProperty({ description: '心情打卡提醒', example: false })
  moodReminderEnabled: boolean;

  @ApiPropertyOptional({ description: '心情提醒时间', example: '20:00' })
  moodReminderTime?: string;

  @ApiProperty({ description: '计划可见性', example: 'public' })
  privacyShowPlans: string;

  @ApiProperty({ description: '心情可见性', example: 'private' })
  privacyShowMood: string;

  @ApiProperty({ description: '手账可见性', example: 'private' })
  privacyShowJournal: string;

  @ApiProperty({ description: '主题模式', example: 'light' })
  themeMode: string;

  @ApiProperty({ description: '语言', example: 'zh-CN' })
  language: string;

  @ApiProperty({ description: '计划连续打卡天数', example: 0 })
  planStreakDays: number;

  @ApiProperty({ description: '心情连续打卡天数', example: 0 })
  moodStreakDays: number;

  @ApiProperty({ description: '最长计划连续打卡', example: 0 })
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
  @ApiProperty({ description: '用户 UUID', example: 'a1b2c3d4-...' })
  id: string;

  @Expose()
  @ApiProperty({ description: '手机号', example: '13800138000' })
  phone: string;

  @Expose()
  @ApiPropertyOptional({ description: '邮箱', example: 'user@example.com' })
  email?: string;

  @Expose()
  @ApiProperty({ description: '昵称', example: '小明' })
  nickname: string;

  @Expose()
  @ApiPropertyOptional({ description: '头像 URL', example: 'https://example.com/avatar.png' })
  avatarUrl?: string;

  @Expose()
  @ApiProperty({ description: '个人简介', example: '热爱生活' })
  bio: string;

  @Expose()
  @ApiProperty({ description: '性别 0-未知 1-男 2-女', example: 1 })
  gender: number;

  @Expose()
  @ApiPropertyOptional({ description: '生日', example: '2000-01-01' })
  birthday?: string;

  @Expose()
  @ApiPropertyOptional({ description: '职业', example: '设计师' })
  occupation?: string;

  @Expose()
  @ApiPropertyOptional({ description: '地区', example: '北京' })
  region?: string;

  @Expose()
  @ApiPropertyOptional({ description: '星座', example: '摩羯座' })
  zodiacSign?: string;

  @Expose()
  @ApiProperty({ description: '角色', example: 'user' })
  role: string;

  @Expose()
  @ApiProperty({ description: '是否激活', example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ description: '是否完成引导', example: false })
  isOnboarded: boolean;

  @Expose()
  @ApiPropertyOptional({ description: '最后登录时间' })
  lastLoginAt?: Date;

  @Expose()
  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;

  @Expose()
  @Type(() => UserProfileDto)
  @ApiPropertyOptional({ description: '用户配置', type: UserProfileDto })
  profile?: UserProfileDto;

  @Expose()
  @Type(() => UserInterestItemDto)
  @ApiPropertyOptional({ description: '用户兴趣列表', type: [UserInterestItemDto] })
  interests?: UserInterestItemDto[];
}
