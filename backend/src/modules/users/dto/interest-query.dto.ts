import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 兴趣标签查询 DTO
 */
export class InterestQueryDto {
  @ApiPropertyOptional({ description: '按分类筛选', example: 'arts' })
  category?: string;

  @ApiPropertyOptional({ description: '搜索关键词', example: '绘画' })
  keyword?: string;

  @ApiPropertyOptional({ description: '是否只返回活跃的', example: true, default: true })
  isActive?: boolean;
}

/**
 * 兴趣关联项
 */
export class UserInterestItemDto {
  @ApiProperty({ description: '兴趣标签 ID', example: 'uuid-string' })
  interestId: string;

  @ApiPropertyOptional({
    description: '熟练等级',
    example: 'beginner',
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  })
  level?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * 用户兴趣操作 DTO
 */
export class UpdateUserInterestsDto {
  @ApiProperty({
    description: '兴趣 ID 列表',
    type: [UserInterestItemDto],
    example: [
      { interestId: 'uuid-1', level: 'beginner' },
      { interestId: 'uuid-2', level: 'intermediate' },
    ],
  })
  interests: UserInterestItemDto[];
}
