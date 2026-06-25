import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 更新用户资料 DTO
 *
 * 所有字段可选，只传需要修改的字段。
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({ description: '昵称 2-20 字', example: '小明', minLength: 2, maxLength: 20 })
  nickname?: string;

  @ApiPropertyOptional({ description: '简介最多 500 字', example: '热爱生活，天天开心' })
  bio?: string;

  @ApiPropertyOptional({ description: '性别 0-未知 1-男 2-女', example: 1 })
  gender?: number;

  @ApiPropertyOptional({ description: '生日 YYYY-MM-DD', example: '2000-01-01' })
  birthday?: string;

  @ApiPropertyOptional({ description: '职业', example: '设计师' })
  occupation?: string;

  @ApiPropertyOptional({ description: '地区', example: '北京' })
  region?: string;

  @ApiPropertyOptional({ description: '星座', example: '摩羯座' })
  zodiacSign?: string;

  @ApiPropertyOptional({ description: '头像 URL', example: 'https://example.com/avatar.png' })
  avatarUrl?: string;

  // ─── 通知设置 ───

  @ApiPropertyOptional({ description: '点赞通知', example: true })
  notifyLike?: boolean;

  @ApiPropertyOptional({ description: '评论通知', example: true })
  notifyComment?: boolean;

  @ApiPropertyOptional({ description: '关注通知', example: true })
  notifyFollow?: boolean;

  @ApiPropertyOptional({ description: '系统通知', example: true })
  notifySystem?: boolean;

  @ApiPropertyOptional({ description: '每日提醒', example: true })
  notifyDailyReminder?: boolean;

  @ApiPropertyOptional({ description: '每日提醒时间', example: '09:00' })
  dailyReminderTime?: string;

  @ApiPropertyOptional({ description: '心情打卡提醒', example: false })
  moodReminderEnabled?: boolean;

  @ApiPropertyOptional({ description: '心情提醒时间', example: '20:00' })
  moodReminderTime?: string;

  // ─── 隐私设置 ───

  @ApiPropertyOptional({ description: '计划可见性', example: 'public' })
  privacyShowPlans?: string;

  @ApiPropertyOptional({ description: '心情可见性', example: 'private' })
  privacyShowMood?: string;

  @ApiPropertyOptional({ description: '手账可见性', example: 'private' })
  privacyShowJournal?: string;

  // ─── 主题偏好 ───

  @ApiPropertyOptional({ description: '主题模式 light/dark/system', example: 'light' })
  themeMode?: string;

  @ApiPropertyOptional({ description: '语言', example: 'zh-CN' })
  language?: string;
}
