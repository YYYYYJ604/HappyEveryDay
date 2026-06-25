import {
  Entity,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractEntity } from '../../../common/database/abstract.entity';

/**
 * 每日计划实体
 *
 * 映射 daily_plans 表。
 * 存储 AI 根据用户兴趣+天气+时间段自动生成的每日计划。
 * 同一用户同一天同一时段同一时长只能有一条记录。
 */
@Entity({ name: 'daily_plans' })
@Unique(['userId', 'planDate', 'timeSlot', 'durationType'])
@Index(['userId', 'planDate'])
@Index(['userId', 'status'])
export class DailyPlanEntity extends AbstractEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @ApiProperty({ description: '用户 ID' })
  userId: string;

  @Column({ name: 'plan_date', type: 'date' })
  @ApiProperty({ description: '计划日期', example: '2026-06-25' })
  planDate: string;

  @Column({ name: 'time_slot', type: 'varchar', length: 10 })
  @ApiProperty({ description: '时间段', example: 'morning' })
  timeSlot: string;

  @Column({ name: 'duration_type', type: 'varchar', length: 10 })
  @ApiProperty({ description: '时长类型', example: '30min' })
  durationType: string;

  @Column({ type: 'varchar', length: 200 })
  @ApiProperty({ description: '计划标题', example: '早晨正念冥想' })
  title: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: '计划描述/AI 生成指引', example: '找一个安静的地方...' })
  description?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  @ApiPropertyOptional({ description: '兴趣分类', example: 'arts' })
  category?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @ApiPropertyOptional({ description: '生成时的天气', example: 'sunny' })
  weather?: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  @ApiProperty({ description: '状态', example: 'pending' })
  status: string;

  @Column({ name: 'is_ai_generated', type: 'boolean', default: true })
  @ApiProperty({ description: '是否 AI 生成', example: true })
  isAiGenerated: boolean;

  @Column({ name: 'source_interest_id', type: 'uuid', nullable: true })
  @ApiPropertyOptional({ description: '来源兴趣 ID' })
  sourceInterestId?: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  @ApiPropertyOptional({ description: '完成时间' })
  completedAt?: Date;
}
