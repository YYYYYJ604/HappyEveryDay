import {
  Entity,
  Column,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractEntity } from '../../../common/database/abstract.entity';

/**
 * 兴趣活动实体
 *
 * 映射 interest_activities 表。
 * 每个活动属于一个兴趣分类，通过 interestId 关联 interests 表。
 */
@Entity({ name: 'interest_activities' })
export class ActivityEntity extends AbstractEntity {
  @Column({ name: 'interest_id', type: 'uuid' })
  @ApiProperty({ description: '所属兴趣分类 ID', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  interestId: string;

  @Column({ type: 'varchar', length: 200 })
  @ApiProperty({ description: '活动标题', example: '30分钟放松绘画入门' })
  title: string;

  @Column({ type: 'text', nullable: true })
  @ApiPropertyOptional({ description: '活动描述', example: '通过绘画释放日常压力...' })
  description?: string;

  @Column({ type: 'smallint', default: 1 })
  @ApiProperty({ description: '难度等级（1-5）', example: 1 })
  difficulty: number;

  @Column({ name: 'duration_min', type: 'int', nullable: true })
  @ApiPropertyOptional({ description: '预计时长（分钟）', example: 30 })
  durationMin?: number;

  @Column({ name: 'guide_type', type: 'varchar', length: 20, default: 'text' })
  @ApiProperty({ description: '引导类型', example: 'text' })
  guideType: string;

  @Column({ name: 'guide_content', type: 'text', nullable: true })
  @ApiPropertyOptional({ description: '引导内容（Markdown 格式）', example: '### 第一步\n深呼吸...' })
  guideContent?: string;

  @Column({ name: 'guide_url', type: 'varchar', length: 500, nullable: true })
  @ApiPropertyOptional({ description: '引导外部链接', example: 'https://example.com/guide' })
  guideUrl?: string;

  @Column({ name: 'participant_count', type: 'int', default: 0 })
  @ApiProperty({ description: '参与人数', example: 128 })
  participantCount: number;

  @Column({ name: 'completion_count', type: 'int', default: 0 })
  @ApiProperty({ description: '完成人数', example: 96 })
  completionCount: number;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 2, scale: 1, default: 0 })
  @ApiProperty({ description: '平均评分', example: 4.5 })
  avgRating: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: '是否启用', example: true })
  isActive: boolean;
}
