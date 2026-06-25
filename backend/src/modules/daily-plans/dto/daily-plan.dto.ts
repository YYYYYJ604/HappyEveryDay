import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 生成每日计划请求 DTO
 */
export class GeneratePlanDto {
  @ApiPropertyOptional({
    description: '目标日期（默认今天）',
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

  @ApiProperty({ description: '状态', example: 'pending' })
  status: string;

  @ApiProperty({ description: '是否 AI 生成', example: true })
  isAiGenerated: boolean;
}

/**
 * 生成计划响应
 */
export class GeneratePlanResponseDto {
  @ApiProperty({ description: '计划日期', example: '2026-06-25' })
  planDate: string;

  @ApiProperty({ description: '时间段', example: 'morning' })
  timeSlot: string;

  @ApiPropertyOptional({ description: '当前天气', example: 'sunny' })
  weather?: string;

  @ApiProperty({ type: [PlanItemDto], description: '5 分钟计划' })
  plan5min: PlanItemDto;

  @ApiProperty({ type: [PlanItemDto], description: '30 分钟计划' })
  plan30min: PlanItemDto;

  @ApiProperty({ type: [PlanItemDto], description: '2 小时计划' })
  plan2h: PlanItemDto;
}

/**
 * 每日计划查询 DTO
 */
export class DailyPlanQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  limit?: number;

  @ApiPropertyOptional({ description: '按状态筛选', example: 'pending' })
  status?: string;

  @ApiPropertyOptional({ description: '开始日期', example: '2026-06-01' })
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期', example: '2026-06-30' })
  endDate?: string;
}
