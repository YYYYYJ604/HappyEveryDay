/**
 * 统一错误码枚举
 *
 * 规范：
 * - A-xxxxx 格式，前缀 + 5 位数字
 * - 前缀约定: A(App), U(User), B(Business), S(System), V(Validation)
 * - 10000-19999: 通用/系统
 * - 20000-29999: 用户/认证
 * - 30000-39999: 业务（兴趣/计划/心情...）
 * - 40000-49999: 数据校验
 * - 50000-59999: 外部服务
 */
export const ErrorCode = {
  // ─── 通用 10000-19999 ───
  SUCCESS: { code: 'A00000', message: '操作成功' },
  UNKNOWN_ERROR: { code: 'A10000', message: '未知错误' },
  INTERNAL_ERROR: { code: 'A10001', message: '服务器内部错误' },
  SERVICE_UNAVAILABLE: { code: 'A10002', message: '服务暂不可用' },
  METHOD_NOT_ALLOWED: { code: 'A10003', message: '请求方法不允许' },
  TOO_MANY_REQUESTS: { code: 'A10004', message: '请求过于频繁' },
  INVALID_PARAMETER: { code: 'A10005', message: '请求参数无效' },
  RESOURCE_NOT_FOUND: { code: 'A10006', message: '资源不存在' },
  RESOURCE_CONFLICT: { code: 'A10007', message: '资源冲突' },
  RATE_LIMIT_EXCEEDED: { code: 'A10008', message: '频率限制超限' },

  // ─── 用户/认证 20000-29999 ───
  UNAUTHORIZED: { code: 'U20000', message: '未登录或登录已过期' },
  FORBIDDEN: { code: 'U20001', message: '无权限访问' },
  USER_NOT_FOUND: { code: 'U20002', message: '用户不存在' },
  USER_DISABLED: { code: 'U20003', message: '用户已被禁用' },
  INVALID_CREDENTIALS: { code: 'U20004', message: '账号或密码错误' },
  TOKEN_EXPIRED: { code: 'U20005', message: '令牌已过期' },
  TOKEN_INVALID: { code: 'U20006', message: '令牌无效' },
  PHONE_EXISTS: { code: 'U20007', message: '手机号已注册' },
  EMAIL_EXISTS: { code: 'U20008', message: '邮箱已注册' },
  SMS_CODE_INVALID: { code: 'U20009', message: '验证码错误' },
  SMS_CODE_EXPIRED: { code: 'U20010', message: '验证码已过期' },
  REFRESH_TOKEN_INVALID: { code: 'U20011', message: '刷新令牌无效' },

  // ─── 业务 30000-39999 ───
  // 兴趣
  INTEREST_NOT_FOUND: { code: 'B30000', message: '兴趣标签不存在' },
  INTEREST_LIMIT_EXCEEDED: { code: 'B30001', message: '兴趣选择数量超过上限' },
  INTEREST_ALREADY_SELECTED: { code: 'B30002', message: '已选择该兴趣' },
  INTEREST_NOT_SELECTED: { code: 'B30003', message: '未选择该兴趣' },
  // 计划
  PLAN_NOT_FOUND: { code: 'B30100', message: '计划不存在' },
  PLAN_ALREADY_COMPLETED: { code: 'B30101', message: '计划已完成' },
  PLAN_CANNOT_SKIP: { code: 'B30102', message: '已完成计划不可跳过' },
  PLAN_DATE_INVALID: { code: 'B30103', message: '计划日期格式错误' },
  // 心情
  MOOD_LEVEL_INVALID: { code: 'B30200', message: '无效的心情等级' },
  MOOD_RECORD_NOT_FOUND: { code: 'B30201', message: '心情记录不存在' },
  // 活动
  ACTIVITY_NOT_FOUND: { code: 'B30300', message: '活动不存在' },
  ACTIVITY_ALREADY_CHECKED_IN: { code: 'B30301', message: '已打卡该活动' },
  // 日常
  DAILY_PLAN_NOT_FOUND: { code: 'B30400', message: '每日计划不存在' },
  DAILY_PLAN_ALREADY_COMPLETED: { code: 'B30401', message: '该计划已完成' },

  // ─── 校验 40000-49999 ───
  VALIDATION_FAILED: { code: 'V40000', message: '参数校验失败' },
  DATE_FORMAT_INVALID: { code: 'V40001', message: '日期格式无效（预期 YYYY-MM-DD）' },
  UUID_INVALID: { code: 'V40002', message: 'UUID 格式无效' },
  EMAIL_INVALID: { code: 'V40003', message: '邮箱格式无效' },
  PHONE_INVALID: { code: 'V40004', message: '手机号格式无效' },
  PASSWORD_TOO_WEAK: { code: 'V40005', message: '密码强度不足' },
  ENUM_INVALID: { code: 'V40006', message: '枚举值无效' },
  PAGINATION_INVALID: { code: 'V40007', message: '分页参数无效' },

  // ─── 外部服务 50000-59999 ───
  EXTERNAL_API_ERROR: { code: 'S50000', message: '外部服务调用失败' },
  AI_SERVICE_ERROR: { code: 'S50100', message: 'AI 服务异常' },
  WEATHER_API_ERROR: { code: 'S50200', message: '天气服务异常' },
  SMS_SERVICE_ERROR: { code: 'S50300', message: '短信服务异常' },
  DATABASE_ERROR: { code: 'S50400', message: '数据库操作异常' },
  FILE_UPLOAD_FAILED: { code: 'S50500', message: '文件上传失败' },
} as const;

export type ErrorCodeEntry = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * 根据 Http 状态码获取对应的错误码
 */
export function getErrorCodeByHttpStatus(httpStatus: number): ErrorCodeEntry {
  switch (httpStatus) {
    case 400:
      return ErrorCode.INVALID_PARAMETER;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.RESOURCE_NOT_FOUND;
    case 409:
      return ErrorCode.RESOURCE_CONFLICT;
    case 429:
      return ErrorCode.TOO_MANY_REQUESTS;
    case 500:
      return ErrorCode.INTERNAL_ERROR;
    case 503:
      return ErrorCode.SERVICE_UNAVAILABLE;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
}
