import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// 在 CLI 环境下（migration:run 等）手动加载 .env
config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
config({ path: '.env' });

/**
 * TypeORM DataSource 配置
 *
 * 同时服务于：
 * 1. NestJS 运行时的 TypeOrmModule.forRootAsync
 * 2. CLI 工具 npx typeorm migration:run -d data-source.ts
 *
 * 注意：module 使用 nodenext 时，不能用 `import DefaultExport from` 的语法，
 * 所以这里用 export default dataSource 供 CLI 使用。
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',

  // 从 DATABASE_URL 解析连接信息（优先）或逐字段配置
  url: process.env.DATABASE_URL,

  // 也可通过独立字段覆盖
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  // Entity 与 Migration 路径
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/common/database/migrations/*.js'],

  // TypeORM 用于记录已执行迁移的表名
  migrationsTableName: 'migrations_typeorm',

  // 连接池配置
  extra: {
    max: 20,                    // 最大连接数
    idleTimeoutMillis: 30000,   // 空闲连接超时 (ms)
    connectionTimeoutMillis: 5000, // 连接超时 (ms)
  },

  // 生产环境 SSL
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,

  // 日志
  logging: process.env.NODE_ENV === 'development'
    ? ['error', 'warn']
    : ['error'],

  // 实体命名策略：数据库字段用下划线
  namingStrategy: undefined, // 使用 TypeORM 默认策略
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
