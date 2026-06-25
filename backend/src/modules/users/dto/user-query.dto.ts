/**
 * 用户列表查询 DTO
 */
export class UserQueryDto {
  /** 页码（从 1 开始） */
  page?: number;

  /** 每页条数 */
  limit?: number;

  /** 搜索关键词（匹配昵称/手机号） */
  keyword?: string;

  /** 按角色筛选 */
  role?: string;

  /** 是否只查活跃用户 */
  isActive?: boolean;
}
