import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractEntity } from '../../../common/database/abstract.entity';

/**
 * 兴趣标签实体
 *
 * 映射 interests 表（DDL 第 14 号表）。
 * 后台维护的兴趣标签库，供用户选择。
 */
@Entity({ name: 'interests' })
export class InterestEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty({ description: '兴趣名称', example: '绘画' })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiPropertyOptional({ description: '图标 URL/名称', example: 'palette' })
  icon?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  @ApiPropertyOptional({
    description: '兴趣分类',
    example: 'arts',
    enum: ['sports', 'arts', 'music', 'tech', 'nature', 'food', 'travel', 'reading', 'game', 'social', 'handcraft', 'other'],
  })
  category?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiPropertyOptional({ description: '兴趣描述', example: '用画笔表达内心的情感' })
  description?: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  @ApiPropertyOptional({ description: '主题色（HEX）', example: '#FF6B6B' })
  color?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  @ApiProperty({ description: '是否启用', example: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  @ApiProperty({ description: '排序权重（越小越靠前）', example: 0 })
  sortOrder: number;
}
