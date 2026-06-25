import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';
import { InterestEntity } from './entities/interest.entity';
import { UserInterestEntity } from './entities/user-interest.entity';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { ActivityCheckinEntity } from '../activities/entities/activity-checkin.entity';

/**
 * 兴趣模块
 *
 * 功能：
 * - 兴趣列表（系统预设标签库）
 * - 用户兴趣选择（批量选择/取消/等级更新）
 * - 兴趣任务推荐（按兴趣推荐活动）
 * - 兴趣成长记录（活动统计/连续打卡/月度汇总）
 *
 * 涉及表：
 * - interests（第 14 号表）
 * - user_interests（第 15 号表）
 * - interest_activities（第 16 号表，跨模块引用）
 * - activity_checkins（第 17 号表，跨模块引用）
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterestEntity,
      UserInterestEntity,
      ActivityEntity,
      ActivityCheckinEntity,
    ]),
  ],
  controllers: [InterestsController],
  providers: [InterestsService],
  exports: [InterestsService, TypeOrmModule],
})
export class InterestsModule {}
