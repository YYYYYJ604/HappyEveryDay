import {
  Entity,
  Column,
} from 'typeorm';
import { AbstractEntity } from '../../../common/database/abstract.entity';

/**
 * 兴趣标签实体
 *
 * 映射 interests 表。
 * 由后台维护的只读兴趣标签库，用户通过 user_interests 关联选择。
 */
@Entity({ name: 'interests' })
export class InterestEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
