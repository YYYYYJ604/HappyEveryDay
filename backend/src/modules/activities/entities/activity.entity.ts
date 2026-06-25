import {
  Entity,
  Column,
} from 'typeorm';
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
  interestId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'smallint', default: 1 })
  difficulty: number;

  @Column({ name: 'duration_min', type: 'int', nullable: true })
  durationMin?: number;

  @Column({ name: 'guide_type', type: 'varchar', length: 20, default: 'text' })
  guideType: string;

  @Column({ name: 'guide_content', type: 'text', nullable: true })
  guideContent?: string;

  @Column({ name: 'guide_url', type: 'varchar', length: 500, nullable: true })
  guideUrl?: string;

  @Column({ name: 'participant_count', type: 'int', default: 0 })
  participantCount: number;

  @Column({ name: 'completion_count', type: 'int', default: 0 })
  completionCount: number;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 2, scale: 1, default: 0 })
  avgRating: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
