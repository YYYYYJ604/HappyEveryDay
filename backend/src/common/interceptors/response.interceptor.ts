import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponse, PaginationMeta } from './api-response';

/**
 * 全局响应拦截器
 *
 * 统一包裹所有正常响应：
 * - 非流式返回 → 统一 { code, message, data, meta } 格式
 * - GET 含分页参数 → 自动生成 PaginationMeta
 * - 记录请求耗时
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    return next.handle().pipe(
      // 记录请求耗时
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `${request.method} ${request.url} ${response.statusCode} (${duration}ms)`,
        );
      }),
      // 统一包裹响应数据
      map((data) => {
        return this.wrapResponse(request, response, data);
      }),
    );
  }

  private wrapResponse(
    request: Request,
    response: Response,
    data: any,
  ): ApiResponse<T> {
    // 如果返回体已经是 ApiResponse 格式，直接返回
    if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
      return data as ApiResponse<T>;
    }

    // 如果 data 是 null 或 undefined，返回无数据成功
    if (data === null || data === undefined) {
      // 204 No Content 不返回 body
      if (response.statusCode === 204) {
        return undefined as unknown as ApiResponse<T>;
      }
      return ApiResponse.ok() as ApiResponse<T>;
    }

    // 检查是否包含分页信息（{ data: [...], total: number }）
    if (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'total' in data &&
      Array.isArray(data.data)
    ) {
      const page = parseInt(request.query.page as string, 10) || 1;
      const limit = parseInt(request.query.limit as string, 10) || 20;

      return ApiResponse.success(data.data, {
        ...new PaginationMeta(page, limit, data.total),
      }) as ApiResponse<T>;
    }

    // 普通数据直接包裹
    return ApiResponse.success(data) as ApiResponse<T>;
  }
}
