import {
  Entity,
  Column,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractEntity } from '../../../common/database/abstract.entity';

/**
 * 收藏记录实体
 *
 * 映射 bookmarks 表，属于统一收藏系统。
 * 仅处理 target_type = 'activity' 的记录。
 */
@Entity({ name: 'bookmarks' })
@Unique(['userId', 'targetType', 'targetId'])
@Index(['userId', 'targetType', 'createdAt'])
@Index(['targetType', 'targetId'])
export class ActivityBookmarkEntity extends AbstractEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  @ApiProperty({ description: '用户 ID', example: 'user-uuid' })
  userId: string;

  @Column({ name: 'target_type', type: 'varchar', length: 30 })
  @ApiProperty({ description: '收藏目标类型', example: 'activity' })
  targetType: string;

  @Column({ name: 'target_id', type: 'uuid' })
  @ApiProperty({ description: '收藏目标 ID（活动 UUID）', example: 'activity-uuid' })
  targetId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  @ApiPropertyOptional({ description: '收藏备注', example: '下次再试试' })
  note?: string;
}
