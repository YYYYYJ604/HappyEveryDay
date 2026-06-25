import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';

/**
 * 生成每日计划请求 DTO
 */
export class GeneratePlanDto {
  @ApiPropertyOptional({
    description: '目标日期 YYYY-MM-DD（默认今天）',
    example: '2026-06-25',
  })
  planDate?: string;

  @ApiPropertyOptional({
    description: '强制重新生成（默认 false，true 会覆盖已有记录）',
    example: false,
    default: false,
  })
  force?: boolean;
}

/**
 * 单个计划项响应
 */
export class PlanItemDto {
  @ApiProperty({ description: '计划 UUID' })
  id: string;

  @ApiProperty({ description: '时长类型', example: '5min' })
  durationType: string;

  @ApiProperty({ description: '计划标题', example: '深呼吸放松' })
  title: string;

  @ApiPropertyOptional({ description: '计划描述' })
  description?: string;

  @ApiPropertyOptional({ description: '兴趣分类', example: 'arts' })
  category?: string;

  @ApiProperty({
    description: '状态',
    example: 'pending',
    enum: ['pending', 'completed', 'skipped'],
  })
  status: string;

  @ApiProperty({ description: '是否 AI 生成', example: true })
  isAiGenerated: boolean;

  @ApiPropertyOptional({ description: '来源兴趣 ID' })
  sourceInterestId?: string;

  @ApiPropertyOptional({ description: '生成时的天气', example: 'sunny' })
  weather?: string;

  @ApiPropertyOptional({ description: '完成时间' })
  completedAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * 生成计划响应
 */
export class GeneratePlanResponseDto {
  @ApiProperty({
    type: 'array',
    items: { $ref: getSchemaPath(PlanItemDto) },
    description: '3 个时长的计划列表（5min / 30min / 2h）',
  })
  plans: PlanItemDto[];
}

/**
 * 今日进度响应
 */
export class TodayProgressDto {
  @ApiProperty({ description: '总计划数', example: 3 })
  total: number;

  @ApiProperty({ description: '已完成数', example: 1 })
  completed: number;

  @ApiProperty({ description: '已跳过数', example: 0 })
  skipped: number;

  @ApiProperty({ description: '待完成数', example: 2 })
  pending: number;
}

/**
 * 每日计划查询 DTO
 */
export class DailyPlanQueryDto {
  @ApiPropertyOptional({ description: '页码（从 1 开始）', example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  limit?: number;

  @ApiPropertyOptional({
    description: '按状态筛选',
    example: 'pending',
    enum: ['pending', 'completed', 'skipped'],
  })
  status?: string;

  @ApiPropertyOptional({ description: '开始日期 YYYY-MM-DD', example: '2026-06-01' })
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期 YYYY-MM-DD', example: '2026-06-30' })
  endDate?: string;
}
