import {
  Entity,
  Column,
  Unique,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractEntity } from '../../../common/database/abstract.entity';
import { InterestEntity } from './interest.entity';

/**
 * 用户兴趣关联实体
 *
 * 映射 user_interests 表（DDL 第 15 号表）。
 * 用户选择的兴趣及熟练等级，一个用户可多选，每种只选一次。
 */
@Entity({ name: 'user_interests' })
@Unique(['userId', 'interestId'])
@Index(['userId'])
export class UserInterestEntity extends AbstractEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @ApiProperty({ description: '用户 ID' })
  userId: string;

  @Column({ name: 'interest_id', type: 'uuid' })
  @ApiProperty({ description: '兴趣 ID' })
  interestId: string;

  @Column({ type: 'varchar', length: 10, default: 'beginner' })
  @ApiProperty({
    description: '熟练等级',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  level: string;

  @Column({ name: 'total_activities', type: 'int', default: 0 })
  @ApiProperty({ description: '累计参与活动数', example: 5 })
  totalActivities: number;

  @Column({ name: 'total_duration_min', type: 'int', default: 0 })
  @ApiProperty({ description: '累计投入分钟数', example: 180 })
  totalDurationMin: number;

  @Column({ name: 'streak_days', type: 'int', default: 0 })
  @ApiProperty({ description: '连续天数', example: 3 })
  streakDays: number;

  @Column({ name: 'last_activity_at', type: 'timestamptz', nullable: true })
  @ApiPropertyOptional({ description: '最近一次活动时间' })
  lastActivityAt?: Date;

  @ManyToOne(() => InterestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'interest_id' })
  interest?: InterestEntity;
}
