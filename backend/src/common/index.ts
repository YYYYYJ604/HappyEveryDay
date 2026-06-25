/**
 * common 模块统一导出
 *
 * 基础设施层组件索引
 */

// ─── 配置 ───
export { AppConfigModule, ENV, configValidationSchema } from './config';
export type { EnvKey } from './config';

// ─── 数据库 ───
export { DatabaseModule, AbstractEntity } from './database';

// ─── 错误码 ───
export { ErrorCode, getErrorCodeByHttpStatus } from './filters/error-codes';
export type { ErrorCodeEntry } from './filters/error-codes';

// ─── 异常过滤器 ───
export { GlobalExceptionFilter } from './filters/global-exception.filter';

// ─── 统一响应 ───
export { ApiResponse, PaginationMeta } from './interceptors/api-response';

// ─── 响应拦截器 ───
export { ResponseInterceptor } from './interceptors/response.interceptor';

// ─── Swagger ───
export { setupSwagger } from './swagger/swagger.setup';
