/**
 * 环境变量枚举定义
 *
 * 集中管理所有环境变量名称，避免 magic string 散落在代码中。
 * 所有环境变量的读取统一走 ConfigService，通过此处定义的 key 取值。
 */
export const ENV = {
  /** 应用端口 */
  APP_PORT: 'APP_PORT',

  /** 数据库连接字符串 postgresql://user:password@host:port/database */
  DATABASE_URL: 'DATABASE_URL',

  /** JWT 签名密钥 */
  JWT_SECRET: 'JWT_SECRET',

  /** JWT Access Token 有效期（秒），默认 900（15分钟） */
  JWT_ACCESS_EXPIRES_IN: 'JWT_ACCESS_EXPIRES_IN',

  /** JWT Refresh Token 有效期（秒），默认 604800（7天） */
  JWT_REFRESH_EXPIRES_IN: 'JWT_REFRESH_EXPIRES_IN',

  /** DeepSeek API Key */
  DEEPSEEK_API_KEY: 'DEEPSEEK_API_KEY',

  /** DeepSeek API Base URL */
  DEEPSEEK_BASE_URL: 'DEEPSEEK_BASE_URL',

  /** Redis 连接字符串 redis://host:port */
  REDIS_URL: 'REDIS_URL',

  /** 是否在生产环境运行 */
  NODE_ENV: 'NODE_ENV',
} as const;

export type EnvKey = (typeof ENV)[keyof typeof ENV];
