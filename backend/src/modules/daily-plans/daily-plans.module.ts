import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyPlansController } from './daily-plans.controller';
import { DailyPlansService } from './daily-plans.service';
import { DailyPlanEntity } from './entities/daily-plan.entity';

/**
 * 每日计划模块
 *
 * 功能：
 * - AI 根据用户兴趣 + 天气 + 时间段自动生成 3 层计划
 * - 今日计划 / 指定日期 / 历史查询
 * - 标记完成 / 跳过
 *
 * 涉及表：daily_plans
 *
 *  外部依赖:
 *   - ConfigService（天气 API 配置）
 *   - UsersModule 的 InterestRepository（待注入）
 *   - 天气 API（外部服务）
 */
@Module({
  imports: [TypeOrmModule.forFeature([DailyPlanEntity])],
  controllers: [DailyPlansController],
  providers: [DailyPlansService],
  exports: [DailyPlansService, TypeOrmModule],
})
export class DailyPlansModule {}
