import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ErrorCode, type ErrorCodeEntry } from '../filters/error-codes';

/**
 * 统一 API 响应体
 *
 * 所有接口返回格式：
 * ```json
 * {
 *   "code": "A00000",
 *   "message": "操作成功",
 *   "data": { ... },
 *   "meta": { "page": 1, "limit": 20, "total": 42 }
 * }
 * ```
 */
export class ApiResponse<T = unknown> {
  @ApiProperty({
    description: '业务状态码',
    example: 'A00000',
  })
  code: string;

  @ApiProperty({
    description: '提示信息',
    example: '操作成功',
  })
  message: string;

  @ApiPropertyOptional({
    description: '响应数据',
  })
  data?: T;

  @ApiPropertyOptional({
    description: '元数据（分页等信息）',
    example: { page: 1, limit: 20, total: 42 },
  })
  meta?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: '请求追踪 ID',
    example: 'req-abc123',
  })
  requestId?: string;

  @ApiPropertyOptional({
    description: '错误详情（开发环境显示）',
  })
  details?: string;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
  }

  /**
   * 成功响应（无数据）
   */
  static ok(): ApiResponse<void> {
    return new ApiResponse({
      code: ErrorCode.SUCCESS.code,
      message: ErrorCode.SUCCESS.message,
    });
  }

  /**
   * 成功响应（含数据）
   */
  static success<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
    return new ApiResponse({
      code: ErrorCode.SUCCESS.code,
      message: ErrorCode.SUCCESS.message,
      data,
      meta,
    });
  }

  /**
   * 创建成功（201）
   */
  static created<T>(data: T): ApiResponse<T> {
    return new ApiResponse({
      code: ErrorCode.SUCCESS.code,
      message: '创建成功',
      data,
    });
  }

  /**
   * 失败响应
   */
  static error(
    errorCode: ErrorCodeEntry,
    details?: string,
    requestId?: string,
  ): ApiResponse<null> {
    return new ApiResponse({
      code: errorCode.code,
      message: errorCode.message,
      data: null,
      details,
      requestId,
    });
  }

  /**
   * 失败响应（自定义消息）
   */
  static fail(
    code: string,
    message: string,
    details?: string,
  ): ApiResponse<null> {
    return new ApiResponse({
      code,
      message,
      data: null,
      details,
    });
  }
}

/**
 * 分页元数据
 */
export class PaginationMeta {
  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页条数', example: 20 })
  limit: number;

  @ApiProperty({ description: '总记录数', example: 42 })
  total: number;

  @ApiProperty({ description: '总页数', example: 3 })
  totalPages: number;

  @ApiProperty({ description: '是否有上一页', example: false })
  hasPrev: boolean;

  @ApiProperty({ description: '是否有下一页', example: true })
  hasNext: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit) || 0;
    this.hasPrev = page > 1;
    this.hasNext = page < this.totalPages;
  }
}
