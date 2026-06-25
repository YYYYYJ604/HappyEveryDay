/**
 * 兴趣标签查询 DTO
 */
export class InterestQueryDto {
  /** 按分类筛选 */
  category?: string;

  /** 搜索关键词 */
  keyword?: string;

  /** 是否只返回活跃的（默认 true） */
  isActive?: boolean;
}

/**
 * 用户兴趣操作 DTO
 */
export class UpdateUserInterestsDto {
  /** 兴趣 ID 列表 [{ interestId, level }] */
  interests: {
    interestId: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
  }[];
}
