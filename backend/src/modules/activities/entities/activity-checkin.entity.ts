import {
  Entity,
  Column,
  Unique,
} from 'typeorm';
import { AbstractEntity } from '../../../common/database/abstract.entity';

/**
 * 活动打卡记录实体
 *
 * 映射 activity_checkins 表。
 * 用户参与活动的打卡/完成记录，一个用户对一个活动只有一条记录。
 */
@Entity({ name: 'activity_checkins' })
@Unique(['activityId', 'userId'])
export class ActivityCheckinEntity extends AbstractEntity {
  @Column({ name: 'activity_id', type: 'uuid' })
  activityId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status: string;

  @Column({ type: 'smallint', nullable: true })
  rating?: number;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @Column({ name: 'duration_spent', type: 'int', nullable: true })
  durationSpent?: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;
}
