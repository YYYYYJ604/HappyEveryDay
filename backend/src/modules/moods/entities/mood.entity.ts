import {
  Entity,
  Column,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractEntity } from '../../../common/database/abstract.entity';

/**
 * 心情记录实体
 *
 * 映射 mood_records 表（DDL 第 20 号表）。
 * 用户每日的心情记录，支持简化心情等级映射。
 */
@Entity({ name: 'mood_records' })
@Index(['userId', 'recordDate'])
@Index(['userId', 'recordDate', 'recordTime'])
export class MoodEntity extends AbstractEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @ApiProperty({ description: '用户 ID', example: 'user-uuid' })
  userId: string;

  @Column({ name: 'mood_type', type: 'varchar', length: 20 })
  @ApiProperty({
    description: '心情类型',
    example: 'happy',
    enum: ['happy', 'sad', 'anxious', 'calm', 'angry', 'excited', 'tired', 'neutral', 'lonely', 'grateful'],
  })
  moodType: string;

  @Column({ type: 'smallint' })
  @ApiProperty({ description: '心情强度 1-10', example: 7 })
  intensity: number;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: '心情日记/备注', example: '今天天气很好，心情不错' })
  journal?: string;

  @Column({ type: 'text', array: true, nullable: true })
  @ApiPropertyOptional({ description: '自定义标签', example: ['工作', '健康'] })
  tags?: string[];

  @Column({ type: 'text', array: true, nullable: true })
  @ApiPropertyOptional({ description: '影响因素', example: ['天气', '社交'] })
  factors?: string[];

  @Column({ name: 'energy_level', type: 'smallint', nullable: true })
  @ApiPropertyOptional({ description: '精力水平 1-10', example: 8 })
  energyLevel?: number;

  @Column({ name: 'sleep_hours', type: 'decimal', precision: 3, scale: 1, nullable: true })
  @ApiPropertyOptional({ description: '睡眠时长（小时）', example: 7.5 })
  sleepHours?: number;

  @Column({ name: 'record_date', type: 'date' })
  @ApiProperty({ description: '记录日期 YYYY-MM-DD', example: '2026-06-25' })
  recordDate: string;

  @Column({ name: 'record_time', type: 'time' })
  @ApiProperty({ description: '记录时间 HH:mm:ss', example: '14:30:00' })
  recordTime: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @ApiPropertyOptional({ description: '记录时的天气', example: 'sunny' })
  weather?: string;
}
