import { PartialType } from '@nestjs/mapped-types';

// 使用 mapped-types 前需安装: npm install @nestjs/mapped-types
// 如果不想安装，可以直接手写接口

/**
 * 更新用户资料 DTO
 *
 * 所有字段可选，只传需要修改的字段。
 */
export class UpdateProfileDto {
  /** 昵称 2-20 字 */
  nickname?: string;

  /** 简介最多 500 字 */
  bio?: string;

  /** 性别 0-未知 1-男 2-女 */
  gender?: number;

  /** 生日 YYYY-MM-DD */
  birthday?: string;

  /** 职业 */
  occupation?: string;

  /** 地区 */
  region?: string;

  /** 星座 */
  zodiacSign?: string;

  /** 头像 URL */
  avatarUrl?: string;

  // ─── 通知设置 ───

  notifyLike?: boolean;
  notifyComment?: boolean;
  notifyFollow?: boolean;
  notifySystem?: boolean;
  notifyDailyReminder?: boolean;
  dailyReminderTime?: string;
  moodReminderEnabled?: boolean;
  moodReminderTime?: string;

  // ─── 隐私设置 ───

  privacyShowPlans?: string;
  privacyShowMood?: string;
  privacyShowJournal?: string;

  // ─── 主题偏好 ───

  themeMode?: string;
  language?: string;
}
