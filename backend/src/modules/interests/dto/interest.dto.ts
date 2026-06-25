import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ══════════════════════════════════════════════
//  请求 DTO
// ══════════════════════════════════════════════

/**
 * 选择兴趣请求
 */
export class SelectInterestDto {
  @ApiProperty({
    description: '兴趣 ID 列表',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
    type: [String],
  })
  interestIds: string[];
}

/**
 * 更新兴趣等级请求
 */
export class UpdateInterestLevelDto {
  @ApiProperty({
    description: '熟练等级',
    example: 'intermediate',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  level: string;
}

/**
 * 兴趣任务推荐查询
 */
export class InterestTaskQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  limit?: number;

  @ApiPropertyOptional({
    description: '难度筛选 1-5',
    example: 1,
    minimum: 1,
    maximum: 5,
  })
  difficulty?: number;

  @ApiPropertyOptional({
    description: '时长筛选（分钟）',
    example: 30,
  })
  durationMin?: number;
}

/**
 * 兴趣成长记录查询
 */
export class InterestGrowthQueryDto {
  @ApiPropertyOptional({ description: '年份', example: 2026 })
  year?: number;

  @ApiPropertyOptional({ description: '月份 1-12', example: 6 })
  month?: number;

  @ApiPropertyOptional({ description: '开始日期', example: '2026-01-01' })
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期', example: '2026-12-31' })
  endDate?: string;
}

// ══════════════════════════════════════════════
//  响应 DTO
// ══════════════════════════════════════════════

/**
 * 兴趣响应
 */
export class InterestResponseDto {
  @ApiProperty({ description: '兴趣 UUID' })
  id: string;

  @ApiProperty({ description: '兴趣名称', example: '绘画' })
  name: string;

  @ApiPropertyOptional({ description: '图标', example: 'palette' })
  icon?: string;

  @ApiPropertyOptional({
    description: '分类',
    example: 'arts',
    enum: ['sports', 'arts', 'music', 'tech', 'nature', 'food', 'travel', 'reading', 'game', 'social', 'handcraft', 'other'],
  })
  category?: string;

  @ApiPropertyOptional({ description: '描述' })
  description?: string;

  @ApiPropertyOptional({ description: '主题色', example: '#FF6B6B' })
  color?: string;

  @ApiProperty({ description: '排序权重', example: 0 })
  sortOrder: number;
}

/**
 * 用户兴趣响应（含熟练等级和成长数据）
 */
export class UserInterestResponseDto {
  @ApiProperty({ description: '关联 UUID' })
  id: string;

  @ApiProperty({ description: '兴趣 ID' })
  interestId: string;

  @ApiProperty({ type: InterestResponseDto, description: '兴趣详情' })
  interest: InterestResponseDto;

  @ApiProperty({
    description: '熟练等级',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  level: string;

  @ApiProperty({ description: '累计参与活动数', example: 5 })
  totalActivities: number;

  @ApiProperty({ description: '累计投入分钟数', example: 180 })
  totalDurationMin: number;

  @ApiProperty({ description: '连续天数', example: 3 })
  streakDays: number;

  @ApiPropertyOptional({ description: '最近活动时间' })
  lastActivityAt?: Date;
}

/**
 * 兴趣任务推荐响应
 */
export class InterestTaskResponseDto {
  @ApiProperty({ description: '活动 UUID' })
  id: string;

  @ApiProperty({ description: '所属兴趣 ID' })
  interestId: string;

  @ApiProperty({ description: '活动标题', example: '水彩风景画入门' })
  title: string;

  @ApiPropertyOptional({ description: '活动描述' })
  description?: string;

  @ApiProperty({ description: '难度 1-5', example: 1 })
  difficulty: number;

  @ApiPropertyOptional({ description: '预计时长（分钟）', example: 30 })
  durationMin?: number;

  @ApiProperty({ description: '参与人数', example: 128 })
  participantCount: number;

  @ApiProperty({ description: '完成人数', example: 96 })
  completionCount: number;

  @ApiProperty({ description: '平均评分', example: 4.5 })
  avgRating: number;

  @ApiProperty({ description: '是否已完成', example: false })
  isCompleted: boolean;
}

/**
 * 兴趣成长记录响应
 */
export class InterestGrowthResponseDto {
  @ApiProperty({ description: '关联记录 ID' })
  userInterestId: string;

  @ApiProperty({ type: InterestResponseDto })
  interest: InterestResponseDto;

  @ApiProperty({ description: '当前等级', example: 'intermediate' })
  currentLevel: string;

  @ApiProperty({ description: '累计活动数', example: 12 })
  totalActivities: number;

  @ApiProperty({ description: '累计总时长（分钟）', example: 360 })
  totalDurationMin: number;

  @ApiProperty({ description: '连续打卡天数', example: 5 })
  streakDays: number;

  @ApiProperty({ description: '本周活动数', example: 3 })
  weeklyActivities: number;

  @ApiProperty({ description: '本月活动数', example: 8 })
  monthlyActivities: number;

  @ApiPropertyOptional({ description: '最近活动时间' })
  lastActivityAt?: Date;
}

/**
 * 兴趣月度活跃度汇总
 */
export class InterestMonthlySummaryDto {
  @ApiProperty({ description: '年份', example: 2026 })
  year: number;

  @ApiProperty({ description: '月份', example: 6 })
  month: number;

  @ApiProperty({ description: '总活跃兴趣数', example: 3 })
  totalInterests: number;

  @ApiProperty({ description: '总活动次数', example: 15 })
  totalActivities: number;

  @ApiProperty({ description: '总投入分钟数', example: 450 })
  totalDurationMin: number;

  @ApiProperty({ description: '日均投入分钟', example: 15 })
  dailyAvgMin: number;

  @ApiProperty({
    description: '兴趣排行',
    type: [InterestGrowthResponseDto],
  })
  topInterests: InterestGrowthResponseDto[];
}
