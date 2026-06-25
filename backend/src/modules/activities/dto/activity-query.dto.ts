import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 活动列表查询 DTO
 */
export class ActivityQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  limit?: number;

  @ApiPropertyOptional({ description: '兴趣分类 ID', example: 'uuid-string' })
  interestId?: string;

  @ApiPropertyOptional({ description: '搜索关键词（标题）', example: '绘画' })
  keyword?: string;

  @ApiPropertyOptional({ description: '难度 1-5', example: 1 })
  difficulty?: number;

  @ApiPropertyOptional({ description: '排序字段', example: 'createdAt' })
  sortBy?: string;

  @ApiPropertyOptional({ description: '排序方向', example: 'DESC' })
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 打卡记录查询 DTO
 */
export class CheckinQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  limit?: number;

  @ApiPropertyOptional({ description: '打卡状态筛选', example: 'completed' })
  status?: string;
}

/**
 * 收藏列表查询 DTO
 */
export class BookmarkQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  limit?: number;
}
