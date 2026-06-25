import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
  OpenAPIObject,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import {
  ApiResponse,
  PaginationMeta,
} from '../interceptors/api-response';
import {
  ErrorCode,
} from '../filters/error-codes';

/**
 * 获取统一 Swagger 文档配置
 *
 * 包含：
 * - 统一响应体 schema
 * - Bearer Token 安全定义
 * - 公共标签排序
 * - 全局响应 DTO
 */
export function setupSwagger(
  app: INestApplication,
  options?: {
    title?: string;
    description?: string;
    version?: string;
    serverUrl?: string;
    tags?: { name: string; description: string }[];
  },
): void {
  const {
    title = 'Happy Every Day API',
    description = '天天开心 - 反焦虑生活陪伴平台后端接口文档',
    version = '1.0',
    serverUrl,
    tags = [
      { name: '用户管理', description: '注册 / 登录 / 信息管理' },
      { name: '兴趣管理', description: '兴趣标签 / 选择 / 任务推荐 / 成长记录' },
      { name: '每日计划', description: 'AI 生成计划 / 查询 / 状态变更' },
      { name: '心情记录', description: '心情打卡 / 历史查询 / 月度统计' },
      { name: '活动管理', description: '兴趣活动 / 打卡 / 评分' },
    ],
  } = options || {};

  // ─── 构建文档配置 ───
  const swaggerConfig = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .setContact('Happy Every Day Team', '', 'support@happy-everyday.app')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer(serverUrl || 'http://localhost:3000', '本地开发环境')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: '输入 JWT Access Token（登录后获取）',
      },
      'JWT-auth',
    );

  // 添加标签
  for (const tag of tags) {
    swaggerConfig.addTag(tag.name, tag.description);
  }

  const config = swaggerConfig.build();

  // ─── 创建文档（注入全局 DTO） ───
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiResponse, PaginationMeta],
  });

  // ─── 为所有 API 附加全局响应 schema ───
  addGlobalResponseSchema(document);

  // ─── 自定义 Swagger UI 选项 ───
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      displayRequestDuration: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    customSiteTitle: 'Happy Every Day - API 文档',
    customfavIcon: '/favicon.ico',
  };

  SwaggerModule.setup('api/docs', app, document, customOptions);
}

/**
 * 为所有 API 路径注入全局响应包装器
 *
 * 使 Swagger UI 中每个端点显示统一响应格式：
 * ```json
 * { "code": "A00000", "message": "ok", "data": {...}, "meta": {...} }
 * ```
 */
function addGlobalResponseSchema(document: OpenAPIObject): void {
  const paths = document.paths;

  for (const pathKey of Object.keys(paths)) {
    const path = paths[pathKey];
    for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
      const operation = path[method];
      if (!operation) continue;

      const responses = operation.responses;
      if (responses?.['204']) continue;

      // 为 200/201 响应包装统一格式
      for (const statusCode of ['200', '201']) {
        const respRef = responses?.[statusCode] as any;
        if (!respRef) continue;

        const content = respRef.content;
        if (!content || !content['application/json']) continue;

        const originalSchema = content['application/json'].schema;

        if (
          originalSchema &&
          originalSchema.properties &&
          !originalSchema.properties.code
        ) {
          content['application/json'].schema = {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'A00000',
                description: '业务状态码',
              },
              message: {
                type: 'string',
                example: '操作成功',
                description: '提示信息',
              },
              data: originalSchema,
              meta: {
                type: 'object',
                description: '元数据（分页信息等）',
                nullable: true,
              },
              requestId: {
                type: 'string',
                description: '请求追踪 ID',
                nullable: true,
              },
            },
          };
        }
      }

      // 为 4xx/5xx 错误响应添加统一错误格式
      for (const statusCode of ['400', '401', '403', '404', '409', '429', '500']) {
        const respRef = responses?.[statusCode] as any;
        if (!respRef) continue;

        const content = respRef.content;
        if (!content || !content['application/json']) continue;

        content['application/json'].schema = {
          type: 'object',
          properties: {
            code: {
              type: 'string',
              example: getExampleErrorCode(statusCode),
              description: '业务错误码',
            },
            message: {
              type: 'string',
              example: getExampleErrorMessage(statusCode),
              description: '错误提示信息',
            },
            data: {
              type: 'null',
              example: null,
            },
            details: {
              type: 'string',
              description: '错误详情（开发环境）',
              nullable: true,
            },
            requestId: {
              type: 'string',
              description: '请求追踪 ID',
              nullable: true,
            },
          },
        };
      }
    }
  }
}

function getExampleErrorCode(statusCode: string): string {
  const map: Record<string, string> = {
    '400': 'V40000',
    '401': 'U20000',
    '403': 'U20001',
    '404': 'A10006',
    '409': 'A10007',
    '429': 'A10004',
    '500': 'A10001',
  };
  return map[statusCode] || 'A10000';
}

function getExampleErrorMessage(statusCode: string): string {
  const map: Record<string, string> = {
    '400': '参数校验失败',
    '401': '未登录或登录已过期',
    '403': '无权限访问',
    '404': '资源不存在',
    '409': '资源冲突',
    '429': '请求过于频繁',
    '500': '服务器内部错误',
  };
  return map[statusCode] || '未知错误';
}
