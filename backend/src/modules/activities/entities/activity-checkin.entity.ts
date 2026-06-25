import {
  Entity,
  Column,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ description: '活动 ID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  activityId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @ApiProperty({ description: '用户 ID', example: 'a1b2c3d4-...' })
  userId: string;

  @Column({ type: 'varchar', length: 20, default: 'completed' })
  @ApiProperty({ description: '打卡状态', example: 'completed' })
  status: string;

  @Column({ type: 'smallint', nullable: true })
  @ApiPropertyOptional({ description: '评分（1-5）', example: 4 })
  rating?: number;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: '用户反馈', example: '非常有收获！' })
  feedback?: string;

  @Column({ name: 'duration_spent', type: 'int', nullable: true })
  @ApiPropertyOptional({ description: '实际花费时间（分钟）', example: 35 })
  durationSpent?: number;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  @ApiPropertyOptional({ description: '完成时间' })
  completedAt?: Date;
}
