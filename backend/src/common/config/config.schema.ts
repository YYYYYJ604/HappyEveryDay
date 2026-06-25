import * as Joi from 'joi';

/**
 * Joi 校验 schema
 *
 * 应用启动时校验所有必需的环境变量，缺失或格式错误会阻止启动。
 * 可选变量提供默认值兜底。
 */
export const configValidationSchema = Joi.object({
  // ─── 应用基础 ───
  APP_PORT: Joi.number().default(3000),

  // ─── 数据库 ───
  DATABASE_URL: Joi.string()
    .pattern(/^postgresql:\/\/.+:.+@.+:\d+\/.+$/)
    .required()
    .messages({
      'string.pattern.base':
        'DATABASE_URL 格式错误，应为 postgresql://user:pass@host:port/db',
      'any.required': 'DATABASE_URL 是必需的',
    }),

  // ─── JWT ───
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'JWT_SECRET 长度至少 32 个字符',
      'any.required': 'JWT_SECRET 是必需的',
    }),
  JWT_ACCESS_EXPIRES_IN: Joi.number().default(900),
  JWT_REFRESH_EXPIRES_IN: Joi.number().default(604800),

  // ─── DeepSeek ───
  DEEPSEEK_API_KEY: Joi.string().required().messages({
    'any.required': 'DEEPSEEK_API_KEY 是必需的',
  }),
  DEEPSEEK_BASE_URL: Joi.string()
    .uri()
    .default('https://api.deepseek.com'),

  // ─── Redis ───
  REDIS_URL: Joi.string()
    .pattern(/^redis:\/\/.+/)
    .optional()
    .messages({
      'string.pattern.base': 'REDIS_URL 格式错误，应为 redis://host:port',
    }),

  // ─── 环境 ───
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
});
