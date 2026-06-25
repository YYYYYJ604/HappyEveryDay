import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { AbstractEntity } from '../../../common/database/abstract.entity';
import { UserEntity } from './user.entity';

/**
 * 用户配置/档案实体
 *
 * 映射 user_profiles 表。
 * 与 users 1:1 关系，存储通知偏好、隐私设置、主题偏好、打卡统计。
 */
@Entity({ name: 'user_profiles' })
export class UserProfileEntity extends AbstractEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // ─── 通知设置 ───

  @Column({ name: 'notify_like', type: 'boolean', default: true })
  notifyLike: boolean;

  @Column({ name: 'notify_comment', type: 'boolean', default: true })
  notifyComment: boolean;

  @Column({ name: 'notify_follow', type: 'boolean', default: true })
  notifyFollow: boolean;

  @Column({ name: 'notify_system', type: 'boolean', default: true })
  notifySystem: boolean;

  @Column({ name: 'notify_daily_reminder', type: 'boolean', default: true })
  notifyDailyReminder: boolean;

  @Column({ name: 'daily_reminder_time', type: 'time', default: '09:00' })
  dailyReminderTime: string;

  @Column({ name: 'mood_reminder_enabled', type: 'boolean', default: false })
  moodReminderEnabled: boolean;

  @Column({ name: 'mood_reminder_time', type: 'time', nullable: true })
  moodReminderTime?: string;

  // ─── 隐私设置 ───

  @Column({ name: 'privacy_show_plans', type: 'varchar', length: 10, default: 'public' })
  privacyShowPlans: string;

  @Column({ name: 'privacy_show_mood', type: 'varchar', length: 10, default: 'private' })
  privacyShowMood: string;

  @Column({ name: 'privacy_show_journal', type: 'varchar', length: 10, default: 'private' })
  privacyShowJournal: string;

  // ─── 主题偏好 ───

  @Column({ name: 'theme_mode', type: 'varchar', length: 10, default: 'light' })
  themeMode: string;

  @Column({ type: 'varchar', length: 10, default: 'zh-CN' })
  language: string;

  // ─── 打卡统计 ───

  @Column({ name: 'plan_streak_days', type: 'int', default: 0 })
  planStreakDays: number;

  @Column({ name: 'mood_streak_days', type: 'int', default: 0 })
  moodStreakDays: number;

  @Column({ name: 'longest_plan_streak', type: 'int', default: 0 })
  longestPlanStreak: number;

  // ─── 关联 ───

  @OneToOne(() => UserEntity, (user) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
