/**
 * 环境变量枚举定义
 *
 * 集中管理所有环境变量名称，避免 magic string 散落在代码中。
 * 所有环境变量的读取统一走 ConfigService，通过此处定义的 key 取值。
 */
export const ENV = {
  // ─── 应用基础 ───
  APP_PORT: 'APP_PORT',

  // ─── 数据库 (TypeORM/PostgreSQL) ───
  /** 数据库连接字符串 postgresql://user:password@host:port/database */
  DATABASE_URL: 'DATABASE_URL',
  /** 数据库主机（独立字段，与 DATABASE_URL 二选一） */
  DB_HOST: 'DB_HOST',
  /** 数据库端口 */
  DB_PORT: 'DB_PORT',
  /** 数据库用户名 */
  DB_USERNAME: 'DB_USERNAME',
  /** 数据库密码 */
  DB_PASSWORD: 'DB_PASSWORD',
  /** 数据库名 */
  DB_DATABASE: 'DB_DATABASE',
  /** 是否启用 SSL 连接 */
  DB_SSL: 'DB_SSL',
  /** 应用启动时自动执行迁移 */
  DB_MIGRATIONS_RUN: 'DB_MIGRATIONS_RUN',

  // ─── JWT ───
  JWT_SECRET: 'JWT_SECRET',
  JWT_ACCESS_EXPIRES_IN: 'JWT_ACCESS_EXPIRES_IN',
  JWT_REFRESH_EXPIRES_IN: 'JWT_REFRESH_EXPIRES_IN',

  // ─── DeepSeek AI ───
  DEEPSEEK_API_KEY: 'DEEPSEEK_API_KEY',
  DEEPSEEK_BASE_URL: 'DEEPSEEK_BASE_URL',

  // ─── Redis ───
  REDIS_URL: 'REDIS_URL',

  // ─── 环境 ───
  NODE_ENV: 'NODE_ENV',
} as const;

export type EnvKey = (typeof ENV)[keyof typeof ENV];

