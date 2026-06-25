import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ══════════════════════════════════════════════
//  心情等级映射
// ══════════════════════════════════════════════

/**
 * 简化心情等级
 */
export enum MoodLevel {
  LOW = 'low',       // 低落
  FAIR = 'fair',     // 一般
  GOOD = 'good',     // 不错
  HAPPY = 'happy',   // 开心
}

/**
 * 心情等级 → 数据库 mood_type + intensity 映射配置
 */
export const MOOD_LEVEL_MAP: Record<MoodLevel, { types: string[]; defaultIntensity: number }> = {
  [MoodLevel.LOW]: {
    types: ['sad', 'tired', 'anxious', 'lonely', 'angry'],
    defaultIntensity: 3,
  },
  [MoodLevel.FAIR]: {
    types: ['neutral'],
    defaultIntensity: 5,
  },
  [MoodLevel.GOOD]: {
    types: ['calm', 'grateful'],
    defaultIntensity: 7,
  },
  [MoodLevel.HAPPY]: {
    types: ['happy', 'excited'],
    defaultIntensity: 9,
  },
};

// ══════════════════════════════════════════════
//  请求 DTO
// ══════════════════════════════════════════════

/**
 * 记录心情请求 DTO
 */
export class CreateMoodDto {
  @ApiProperty({
    description: '心情等级',
    example: 'good',
    enum: MoodLevel,
  })
  level: MoodLevel;

  @ApiPropertyOptional({
    description: '强度 1-10（不传则按等级自动设置默认值）',
    example: 7,
    minimum: 1,
    maximum: 10,
  })
  intensity?: number;

  @ApiPropertyOptional({ description: '心情日记', example: '今天工作顺利' })
  journal?: string;

  @ApiPropertyOptional({
    description: '自定义标签',
    example: ['工作', '社交'],
  })
  tags?: string[];

  @ApiPropertyOptional({
    description: '影响因素',
    example: ['天气', '社交'],
  })
  factors?: string[];

  @ApiPropertyOptional({
    description: '精力水平 1-10',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  energyLevel?: number;

  @ApiPropertyOptional({
    description: '睡眠时长（小时）',
    example: 7.5,
  })
  sleepHours?: number;

  @ApiPropertyOptional({
    description: '记录日期 YYYY-MM-DD（默认今天）',
    example: '2026-06-25',
  })
  recordDate?: string;
}

// ══════════════════════════════════════════════
//  查询 DTO
// ══════════════════════════════════════════════

/**
 * 历史心情查询 DTO
 */
export class MoodQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  limit?: number;

  @ApiPropertyOptional({
    description: '按心情等级筛选',
    example: 'good',
    enum: MoodLevel,
  })
  level?: MoodLevel;

  @ApiPropertyOptional({ description: '开始日期', example: '2026-06-01' })
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期', example: '2026-06-30' })
  endDate?: string;
}

/**
 * 月度统计查询 DTO
 */
export class MonthStatQueryDto {
  @ApiProperty({
    description: '年份',
    example: 2026,
  })
  year: number;

  @ApiProperty({
    description: '月份',
    example: 6,
    minimum: 1,
    maximum: 12,
  })
  month: number;
}

// ══════════════════════════════════════════════
//  响应 DTO
// ══════════════════════════════════════════════

/**
 * 心情记录响应
 */
export class MoodResponseDto {
  @ApiProperty({ description: '记录 UUID' })
  id: string;

  @ApiProperty({ description: '心情等级', example: 'good' })
  level: string;

  @ApiProperty({ description: '心情类型', example: 'calm' })
  moodType: string;

  @ApiProperty({ description: '强度', example: 7 })
  intensity: number;

  @ApiPropertyOptional({ description: '心情日记' })
  journal?: string;

  @ApiPropertyOptional({ description: '标签', example: ['工作'] })
  tags?: string[];

  @ApiPropertyOptional({ description: '影响因素', example: ['天气'] })
  factors?: string[];

  @ApiPropertyOptional({ description: '精力水平', example: 8 })
  energyLevel?: number;

  @ApiPropertyOptional({ description: '睡眠时长', example: 7.5 })
  sleepHours?: number;

  @ApiProperty({ description: '记录日期' })
  recordDate: string;

  @ApiProperty({ description: '记录时间' })
  recordTime: string;

  @ApiPropertyOptional({ description: '天气', example: 'sunny' })
  weather?: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;
}

/**
 * 月度统计响应
 */
export class MonthStatDto {
  @ApiProperty({ description: '年份', example: 2026 })
  year: number;

  @ApiProperty({ description: '月份', example: 6 })
  month: number;

  @ApiProperty({ description: '总记录天数', example: 25 })
  totalDays: number;

  @ApiProperty({ description: '平均心情等级（1-4）', example: 2.8 })
  averageLevel: number;

  @ApiProperty({ description: '平均强度', example: 6.5 })
  averageIntensity: number;

  @ApiProperty({ description: '平均精力', example: 7.2 })
  averageEnergy: number;

  @ApiProperty({ description: '每日心情等级分布', example: { 1: { low: 2, fair: 1, good: 3, happy: 1 } } })
  dailyDistribution: Record<string, Record<string, number>>;

  @ApiProperty({ description: '整体分布', example: { low: 5, fair: 8, good: 10, happy: 7 } })
  distribution: Record<string, number>;

  @ApiProperty({ description: '最高连续打卡天数', example: 7 })
  streakDays: number;
}
