import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityCheckinEntity } from './entities/activity-checkin.entity';
import { ActivityBookmarkEntity } from './entities/activity-bookmark.entity';

/**
 * 活动模块
 *
 * 功能：
 * - 活动列表 / 详情 / 分类查询 / 搜索
 * - 活动打卡（开始 / 完成 / 评价）
 * - 活动收藏（添加 / 取消 / 列表）
 *
 * 涉及表：interest_activities, activity_checkins, bookmarks
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityEntity,
      ActivityCheckinEntity,
      ActivityBookmarkEntity,
    ]),
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService, TypeOrmModule],
})
export class ActivitiesModule {}
