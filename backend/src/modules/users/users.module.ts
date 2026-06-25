import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { UserProfileEntity } from './entities/user-profile.entity';
import { UserInterestEntity } from './entities/user-interest.entity';
import { InterestEntity } from './entities/interest.entity';

/**
 * 用户模块
 *
 * 功能：
 * - 用户信息查询（单用户 / 分页列表）
 * - 修改用户资料（users + user_profiles 两表联动）
 * - 兴趣标签管理（查询 / 全量替换关联）
 *
 * 注册 4 个 TypeORM 实体。
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserProfileEntity,
      UserInterestEntity,
      InterestEntity,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
