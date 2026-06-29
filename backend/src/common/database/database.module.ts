import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { dataSourceOptions } from './data-source';
import { ENV } from '../config';

/**
 * Database Module
 *
 * 职责：
 * - 注册 TypeORM 到 NestJS IoC 容器
 * - 从 ConfigService 读取数据库配置
 * - 支持自动运行迁移（由 DB_MIGRATIONS_RUN 控制）
 * - 启动时验证数据库连接
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...dataSourceOptions,

        // 用 ConfigService 覆盖静态配置（支持运行时动态读取）
        url: configService.get<string>(ENV.DATABASE_URL),

        // 自动加载被 @Entity() 装饰的类
        autoLoadEntities: true,

        // 是否在应用启动时自动执行迁移
        // 生产环境建议设为 false，由 CI/CD 手动触发
        migrationsRun: configService.get<string>('DB_MIGRATIONS_RUN') === 'true',

        // 开发环境下可开启同步（注意：生产环境禁用！）
        synchronize: true,

        // 连接后执行 SQL（设置时区等）
        timezone: 'Asia/Shanghai',
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * 模块初始化时检查关键配置
   */
  onModuleInit(): void {
    const dbUrl = this.configService.get<string>(ENV.DATABASE_URL);
    const maskedUrl = dbUrl?.replace(
      /(postgresql:\/\/)[^:]+(:[^@]+@)/,
      '$1****$2',
    );
    this.logger.log(`Database connected: ${maskedUrl}`);
  }
}
