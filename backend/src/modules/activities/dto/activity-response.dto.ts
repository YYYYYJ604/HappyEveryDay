import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 活动响应 DTO
 *
 * 明确排除敏感/内部字段，同时转换为前端友好的命名风格。
 */
export class ActivityResponseDto {
  @ApiProperty({ description: '活动 UUID', example: 'a1b2c3d4-...' })
  id: string;

  @ApiProperty({ description: '所属兴趣分类 ID', example: 'interest-uuid' })
  interestId: string;

  @ApiProperty({ description: '活动标题', example: '30分钟放松绘画入门' })
  title: string;

  @ApiPropertyOptional({ description: '活动描述', example: '通过绘画释放压力...' })
  description?: string;

  @ApiProperty({ description: '难度 1-5', example: 1 })
  difficulty: number;

  @ApiPropertyOptional({ description: '预计时长（分钟）', example: 30 })
  durationMin?: number;

  @ApiProperty({ description: '引导类型', example: 'text' })
  guideType: string;

  @ApiPropertyOptional({ description: '引导内容（Markdown）', example: '### 第一步...' })
  guideContent?: string;

  @ApiPropertyOptional({ description: '引导外部链接', example: 'https://example.com/guide' })
  guideUrl?: string;

  @ApiProperty({ description: '参与人数', example: 128 })
  participantCount: number;

  @ApiProperty({ description: '完成人数', example: 96 })
  completionCount: number;

  @ApiProperty({ description: '平均评分', example: 4.5 })
  avgRating: number;

  @ApiProperty({ description: '是否启用', example: true })
  isActive: boolean;

  @ApiProperty({ description: '创建时间', example: '2026-06-25T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2026-06-25T12:00:00Z' })
  updatedAt: Date;
}

/**
 * 打卡记录响应 DTO
 */
export class CheckinResponseDto {
  @ApiProperty({ description: '打卡记录 UUID', example: 'checkin-uuid' })
  id: string;

  @ApiProperty({ description: '活动 ID', example: 'activity-uuid' })
  activityId: string;

  @ApiProperty({ description: '用户 ID', example: 'user-uuid' })
  userId: string;

  @ApiProperty({ description: '打卡状态', example: 'completed' })
  status: string;

  @ApiPropertyOptional({ description: '评分 1-5', example: 4 })
  rating?: number;

  @ApiPropertyOptional({ description: '用户反馈', example: '非常有收获！' })
  feedback?: string;

  @ApiPropertyOptional({ description: '实际花费分钟数', example: 35 })
  durationSpent?: number;

  @ApiPropertyOptional({ description: '完成时间' })
  completedAt?: Date;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * 收藏记录响应 DTO
 */
export class BookmarkResponseDto {
  @ApiProperty({ description: '收藏记录 UUID' })
  id: string;

  @ApiProperty({ description: '用户 ID' })
  userId: string;

  @ApiProperty({ description: '目标类型', example: 'activity' })
  targetType: string;

  @ApiProperty({ description: '目标 ID（活动 ID）' })
  targetId: string;

  @ApiPropertyOptional({ description: '收藏备注', example: '下次再试' })
  note?: string;

  @ApiProperty({ description: '收藏时间' })
  createdAt: Date;
}

/**
 * 分页响应包装
 */
export class PaginatedResponse<T> {
  @ApiProperty({ description: '数据列表', isArray: true })
  data: T[];

  @ApiProperty({ description: '总数', example: 42 })
  total: number;
}
