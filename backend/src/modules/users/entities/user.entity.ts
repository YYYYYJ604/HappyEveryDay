import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../../common/database/abstract.entity';
import { UserProfileEntity } from './user-profile.entity';
import { UserInterestEntity } from './user-interest.entity';

/**
 * 用户实体
 *
 * 映射 users 表。
 * 与 user_profiles 1:1，与 user_interests 1:N。
 */
@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 50 })
  nickname: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  bio: string;

  @Column({ type: 'smallint', default: 0 })
  gender: number;

  @Column({ type: 'date', nullable: true })
  birthday?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  zodiacSign?: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'refresh_token', type: 'varchar', length: 500, nullable: true })
  refreshToken?: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_onboarded', type: 'boolean', default: false })
  isOnboarded: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  // ─── 关联 ───

  @OneToOne(() => UserProfileEntity, (profile) => profile.user)
  profile?: UserProfileEntity;

  @OneToMany(() => UserInterestEntity, (interest) => interest.user)
  interests?: UserInterestEntity[];
}
