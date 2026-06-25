import {
  Entity,
  Column,
  Index,
  Unique,
} from 'typeorm';
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
  userId: string;

  @Column({ name: 'target_type', type: 'varchar', length: 30 })
  targetType: string;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  note?: string;
}
