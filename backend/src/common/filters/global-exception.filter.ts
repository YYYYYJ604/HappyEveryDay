import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { ApiResponse } from '../interceptors/api-response';
import {
  ErrorCode,
  getErrorCodeByHttpStatus,
  type ErrorCodeEntry,
} from './error-codes';

/**
 * 全局异常过滤器
 *
 * 捕获所有未处理的异常，转换为统一响应格式。
 *
 * 处理优先级：
 * 1. HttpException（NestJS 原生）
 * 2. QueryFailedError（TypeORM 数据库）
 * 3. EntityNotFoundError（TypeORM 未找到）
 * 4. 兜底: 未知异常
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const requestId = request.headers['x-request-id'] as string || `req-${Date.now()}`;

    // 解析异常 → 状态码 + 错误码 + 消息
    const result = this.resolveException(exception, request);

    const { httpStatus, errorCode, message, details } = result;

    // 记录错误日志
    this.logException(exception, request, httpStatus, errorCode.code);

    // 构建响应
    const body = ApiResponse.error(
      { code: errorCode.code, message } as ErrorCodeEntry,
      details,
      requestId,
    );

    response.status(httpStatus).json(body);
  }

  /**
   * 解析异常，提取状态码、错误码、消息
   */
  private resolveException(
    exception: unknown,
    request: Request,
  ): {
    httpStatus: number;
    errorCode: { code: string; message: string };
    message: string;
    details?: string;
  } {
    // ─── 1. TypeORM 数据库错误 ───
    if (exception instanceof QueryFailedError) {
      const pgError = exception as any;
      // 唯一约束冲突 (PostgreSQL error code 23505)
      if (pgError.code === '23505') {
        return {
          httpStatus: HttpStatus.CONFLICT,
          errorCode: ErrorCode.RESOURCE_CONFLICT,
          message: '数据已存在',
          details: pgError.detail || pgError.message,
        };
      }
      // 外键约束冲突
      if (pgError.code === '23503') {
        return {
          httpStatus: HttpStatus.BAD_REQUEST,
          errorCode: ErrorCode.INVALID_PARAMETER,
          message: '关联数据不存在',
          details: pgError.detail || pgError.message,
        };
      }
      // 其他数据库错误
      return {
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        errorCode: ErrorCode.DATABASE_ERROR,
        message: '数据库异常',
        details: process.env.NODE_ENV === 'development' ? pgError.message : undefined,
      };
    }

    // ─── 2. TypeORM Entity Not Found ───
    if (exception instanceof EntityNotFoundError) {
      return {
        httpStatus: HttpStatus.NOT_FOUND,
        errorCode: ErrorCode.RESOURCE_NOT_FOUND,
        message: '资源不存在',
      };
    }

    // ─── 3. NestJS HttpException ───
    if (exception instanceof HttpException) {
      return this.resolveHttpException(exception);
    }

    // ─── 4. 兜底: 未知错误 ───
    const err = exception instanceof Error ? exception : new Error(String(exception));
    return {
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: ErrorCode.INTERNAL_ERROR,
      message: '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    };
  }

  /**
   * 解析 HttpException
   */
  private resolveHttpException(exception: HttpException): {
    httpStatus: number;
    errorCode: { code: string; message: string };
    message: string;
    details?: string;
  } {
    const httpStatus = exception.getStatus();
    const response = exception.getResponse();
    const defaultError = getErrorCodeByHttpStatus(httpStatus);

    // class-validator 校验失败（BadRequestException 且 response 是对象）
    if (
      exception instanceof BadRequestException &&
      typeof response === 'object' &&
      response !== null &&
      Array.isArray((response as any).message)
    ) {
      const messages = (response as any).message as string[];
      return {
        httpStatus,
        errorCode: { code: ErrorCode.VALIDATION_FAILED.code, message: ErrorCode.VALIDATION_FAILED.message },
        message: messages.length > 0 ? messages[0] : '参数校验失败',
        details: process.env.NODE_ENV === 'development' ? messages.join('; ') : undefined,
      };
    }

    // 自定义消息
    let message: string = defaultError.message;
    let errCode: { code: string; message: string } = { code: defaultError.code, message: defaultError.message };

    if (typeof response === 'string') {
      message = response;
    } else if (typeof response === 'object' && response !== null) {
      const respObj = response as any;
      message = respObj.message || respObj.error || defaultError.message;

      // 如果 NestJS 提供了自定义业务码，优先使用
      if (respObj.code && typeof respObj.code === 'string') {
        errCode = { code: respObj.code, message };
      }
    }

    // 特定异常类型映射
    if (exception instanceof NotFoundException) {
      errCode = { code: ErrorCode.RESOURCE_NOT_FOUND.code, message };
    } else if (exception instanceof ConflictException) {
      errCode = { code: ErrorCode.RESOURCE_CONFLICT.code, message };
    } else if (exception instanceof UnauthorizedException) {
      errCode = { code: ErrorCode.UNAUTHORIZED.code, message };
    } else if (exception instanceof ForbiddenException) {
      errCode = { code: ErrorCode.FORBIDDEN.code, message };
    }

    return { httpStatus, errorCode: errCode, message };
  }

  /**
   * 记录异常日志
   */
  private logException(
    exception: unknown,
    request: Request,
    httpStatus: number,
    code: string,
  ): void {
    // 4xx 错误只记录 warning
    if (httpStatus < 500) {
      this.logger.warn(
        `[${code}] ${request.method} ${request.url} → ${httpStatus}`,
      );
      return;
    }

    // 5xx 错误记录完整 error
    const err = exception instanceof Error ? exception : new Error(String(exception));
    this.logger.error(
      `[${code}] ${request.method} ${request.url} → ${httpStatus}: ${err.message}`,
      err.stack,
    );
  }
}
