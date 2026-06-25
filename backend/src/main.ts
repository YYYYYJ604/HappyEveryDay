import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  GlobalExceptionFilter,
  ResponseInterceptor,
  setupSwagger,
} from './common';
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    // 开启日志级别
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    // 允许跨域
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    },
  });

  // ─── 全局前缀 ───
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'api/docs'],
  });

  // ─── 全局管道：参数校验 ───
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // 剥离未装饰器声明的字段
      forbidNonWhitelisted: true, // 传入未声明字段时抛异常
      transform: true,           // 自动类型转换（string → number 等）
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── 全局异常过滤器 ───
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ─── 全局响应拦截器 ───
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ─── Swagger 文档 ───
  setupSwagger(app, {
    title: 'Happy Every Day API',
    description: '天天开心 - 反焦虑生活陪伴平台后端接口文档',
    version: '1.0.0',
    serverUrl: process.env.API_SERVER_URL || 'http://localhost:3000',
    tags: [
      { name: '用户管理', description: '注册 / 登录 / 个人信息管理' },
      { name: '兴趣管理', description: '兴趣标签、用户选择、任务推荐、成长记录' },
      { name: '每日计划', description: 'AI 根据兴趣+天气自动生成计划、查询、状态变更' },
      { name: '心情记录', description: '心情打卡（4 级映射）、历史查询、月度统计' },
      { name: '活动管理', description: '兴趣活动浏览、参与打卡、评分反馈' },
    ],
  });

  // ─── 启动服务 ───
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  logger.log(`🚀 服务已启动: http://${host}:${port}`);
  logger.log(`📚 Swagger 文档: http://localhost:${port}/api/docs`);
  logger.log(`🏥 健康检查: http://localhost:${port}/health`);
  logger.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();

