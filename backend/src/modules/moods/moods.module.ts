import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodsController } from './moods.controller';
import { MoodsService } from './moods.service';
import { MoodEntity } from './entities/mood.entity';

/**
 * 心情模块
 *
 * 功能：
 * - 记录心情（简化 4 级 → 数据库 10 种 mood_type 映射）
 * - 历史心情查询（分页 + 等级/日期筛选）
 * - 月度统计（分布、趋势、连续打卡）
 *
 * 涉及表：mood_records
 */
@Module({
  imports: [TypeOrmModule.forFeature([MoodEntity])],
  controllers: [MoodsController],
  providers: [MoodsService],
  exports: [MoodsService, TypeOrmModule],
})
export class MoodsModule {}
