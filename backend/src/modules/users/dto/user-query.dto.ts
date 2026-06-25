import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 用户列表查询 DTO
 */
export class UserQueryDto {
  @ApiPropertyOptional({ description: '页码（从 1 开始）', example: 1, default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '每页条数', example: 20, default: 20 })
  limit?: number;

  @ApiPropertyOptional({ description: '搜索关键词（匹配昵称/手机号）', example: '小明' })
  keyword?: string;

  @ApiPropertyOptional({ description: '按角色筛选', example: 'user' })
  role?: string;

  @ApiPropertyOptional({ description: '是否只查活跃用户', example: true })
  isActive?: boolean;
}
