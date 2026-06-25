import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建打卡记录 DTO
 */
export class CreateCheckinDto {
  @ApiProperty({ description: '完成状态', example: 'completed' })
  status: 'in_progress' | 'completed' | 'abandoned';

  @ApiPropertyOptional({ description: '评分 1-5', example: 4 })
  rating?: number;

  @ApiPropertyOptional({ description: '反馈内容', example: '非常有收获！' })
  feedback?: string;

  @ApiPropertyOptional({ description: '花费时间（分钟）', example: 30 })
  durationSpent?: number;
}

/**
 * 收藏活动 DTO
 */
export class BookmarkActivityDto {
  @ApiProperty({ description: '收藏备注', example: '下次再试', required: false })
  note?: string;
}
