import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AbstractEntity } from '../../../common/database/abstract.entity';
import { UserEntity } from './user.entity';
import { InterestEntity } from './interest.entity';

/**
 * 用户兴趣关联实体
 *
 * 映射 user_interests 表。
 * 用户与兴趣的多对多关联，附带用户的熟练等级。
 */
@Entity({ name: 'user_interests' })
export class UserInterestEntity extends AbstractEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'interest_id', type: 'uuid' })
  interestId: string;

  @Column({ type: 'varchar', length: 10, default: 'beginner' })
  level: string;

  // ─── 关联 ───

  @ManyToOne(() => UserEntity, (user) => user.interests)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => InterestEntity)
  @JoinColumn({ name: 'interest_id' })
  interest: InterestEntity;
}
