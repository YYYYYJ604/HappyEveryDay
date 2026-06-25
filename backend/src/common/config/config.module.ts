import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config.schema';

/**
 * 配置模块
 *
 * 封装 @nestjs/config，提供全局统一的配置加载能力。
 * - 加载 .env 文件（根据 NODE_ENV 自动选择）
 * - Joi 校验所有必需变量
 * - 设为 global，各模块无需重复 imports
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      /**
       * 根据 NODE_ENV 加载对应的 .env 文件
       * development -> .env.development
       * production  -> .env.production
       * 兜底         -> .env
       */
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],

      /**
       * 是否忽略 .env 文件加载
       * 生产环境通过容器环境变量注入，设为 true 可跳过文件读取
       */
      ignoreEnvFile: process.env.NODE_ENV === 'production' ? false : false,

      /**
       * Joi 校验 schema
       * 校验失败时应用会抛出异常，阻止启动
       */
      validationSchema: configValidationSchema,

      /**
       * 校验选项：允许未知的环境变量
       */
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },

      /**
       * 设为 true 后全局可用，无需在模块中重复 imports
       */
      isGlobal: true,

      /**
       * 缓存加载结果，提升性能
       */
      cache: true,
    }),
  ],
  exports: [],
})
export class AppConfigModule {}
