# NestJS 后端项目目录结构

> 框架：NestJS 11.x + TypeScript 5.x  
> 数据库：PostgreSQL (TypeORM)  
> 缓存：Redis (ioredis)  
> 消息队列：BullMQ (Redis)  
> API 风格：RESTful + WebSocket (Socket.IO)

---

## 根目录概览

```
happy-every-day-api/                   # 后端项目根目录
├── src/                               # TypeScript 源码
├── test/                              # 测试代码
├── dist/                              # 编译产物
├── prisma/                            # Prisma 数据库方案
├── uploads/                           # 用户上传文件存储
├── logs/                              # 日志文件
├── docker/                            # Docker 配置文件
├── scripts/                           # 脚本工具
├── .env                               # 环境变量
├── .env.example                       # 环境变量模板
├── .eslintrc.js                       # ESLint 配置
├── .prettierrc                        # Prettier 配置
├── nest-cli.json                      # NestJS CLI 配置
├── tsconfig.json                      # TypeScript 配置
├── tsconfig.build.json                # 构建 TypeScript 配置
├── package.json                       # 依赖管理
├── pnpm-lock.yaml                     # 依赖锁定 (pnpm)
├── Dockerfile                         # 生产容器构建
├── docker-compose.yml                 # 本地开发编排
└── README.md                          # 项目说明
```

---

## `src/` 源码核心目录结构

```
src/
├── main.ts                            # 应用启动入口
├── app.module.ts                      # 根模块（导入所有模块）
├── app.controller.ts                  # 根控制器
├── app.service.ts                     # 根服务
│
├── common/                            # 通用基础设施
│   ├── config/                        # 配置模块
│   │   ├── config.module.ts
│   │   ├── config.service.ts          # 配置服务 (env 解析)
│   │   ├── database.config.ts         # 数据库配置
│   │   ├── redis.config.ts            # Redis 配置
│   │   ├── jwt.config.ts              # JWT 配置
│   │   ├── minio.config.ts            # 文件存储配置
│   │   └── openai.config.ts           # AI 配置
│   │
│   ├── database/                      # 数据库基础
│   │   ├── database.module.ts         # 全局数据库模块
│   │   ├── database.service.ts        # TypeORM 数据源
│   │   ├── migrations/                # 数据库迁移文件
│   │   │   ├── 001_init_schema.sql
│   │   │   ├── 002_add_mood_tables.sql
│   │   │   └── 003_add_chat_tables.sql
│   │   └── seeds/                     # 种子数据
│   │       ├── seed.module.ts
│   │       ├── seed.service.ts
│   │       └── data/                  # 种子数据文件
│   │           ├── plan_categories.json
│   │           └── encouragement_quotes.json
│   │
│   ├── redis/                         # Redis 模块
│   │   ├── redis.module.ts
│   │   ├── redis.service.ts           # Redis 操作封装
│   │   └── redis-cache.service.ts     # 缓存服务
│   │
│   ├── queue/                         # 消息队列
│   │   ├── queue.module.ts
│   │   ├── queue.service.ts           # BullMQ 队列服务
│   │   └── consumers/                 # 消费者
│   │       ├── notification.consumer.ts
│   │       ├── ai-response.consumer.ts
│   │       └── data-cleanup.consumer.ts
│   │
│   ├── websocket/                     # WebSocket 网关
│   │   ├── websocket.module.ts
│   │   ├── websocket.gateway.ts       # 主网关
│   │   ├── websocket.adapter.ts       # Socket.IO 适配器
│   │   └── websocket-auth.guard.ts    # WS 鉴权守卫
│   │
│   ├── middlewares/                   # 中间件
│   │   ├── logging.middleware.ts      # 请求日志
│   │   ├── rate-limit.middleware.ts   # 速率限制
│   │   └── cors.middleware.ts         # CORS 配置
│   │
│   ├── guards/                        # 权限守卫
│   │   ├── jwt-auth.guard.ts          # JWT 鉴权
│   │   ├── roles.guard.ts             # 角色鉴权
│   │   └── throttle.guard.ts          # 节流守卫
│   │
│   ├── interceptors/                  # 拦截器
│   │   ├── transform.interceptor.ts   # 响应转换
│   │   ├── logging.interceptor.ts     # 日志拦截
│   │   └── cache.interceptor.ts       # 缓存拦截
│   │
│   ├── filters/                       # 异常过滤器
│   │   ├── http-exception.filter.ts   # HTTP 异常格式
│   │   ├── ws-exception.filter.ts     # WebSocket 异常
│   │   └── all-exceptions.filter.ts   # 全局兜底异常
│   │
│   ├── pipes/                         # 管道/校验
│   │   ├── validation.pipe.ts         # DTO 校验
│   │   ├── parse-id.pipe.ts           # ID 参数解析
│   │   └── parse-pagination.pipe.ts   # 分页参数解析
│   │
│   ├── decorators/                    # 自定义装饰器
│   │   ├── current-user.decorator.ts  # 获取当前用户
│   │   ├── roles.decorator.ts         # 角色标记
│   │   └── public.decorator.ts        # 公开接口标记
│   │
│   ├── dto/                           # 全局 DTO
│   │   ├── pagination.dto.ts          # 分页请求 DTO
│   │   ├── api-response.dto.ts        # 统一响应 DTO
│   │   └── id-param.dto.ts            # ID 参数 DTO
│   │
│   ├── enums/                         # 全局枚举
│   │   ├── user-role.enum.ts
│   │   ├── plan-status.enum.ts
│   │   └── notification-type.enum.ts
│   │
│   ├── types/                         # 全局类型定义
│   │   ├── express.d.ts               # Express 扩展
│   │   ├── jwt-payload.interface.ts
│   │   └── pagination.interface.ts
│   │
│   └── utils/                         # 工具函数
│       ├── crypto.util.ts             # 加密工具
│       ├── date.util.ts               # 日期工具
│       ├── file.util.ts               # 文件处理
│       └── logger.util.ts             # 日志工具
│
├── modules/                           # 业务模块
│   │
│   ├── auth/                          # 1. 认证模块
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts         # 登录/注册/刷新 Token
│   │   ├── auth.service.ts            # 认证业务逻辑
│   │   ├── strategies/                # Passport 策略
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-refresh.strategy.ts
│   │   │   └── phone.strategy.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── phone-verify.dto.ts
│   │   └── tests/
│   │       ├── auth.controller.spec.ts
│   │       └── auth.service.spec.ts
│   │
│   ├── users/                         # 2. 用户模块
│   │   ├── users.module.ts
│   │   ├── users.controller.ts        # 用户 CRUD
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   ├── user.entity.ts         # 用户实体
│   │   │   └── user-profile.entity.ts # 用户档案
│   │   ├── repositories/
│   │   │   └── users.repository.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-profile.dto.ts
│   │   │   └── user-query.dto.ts
│   │   └── tests/
│   │       ├── users.controller.spec.ts
│   │       └── users.service.spec.ts
│   │
│   ├── plans/                         # 3. 开心计划模块
│   │   ├── plans.module.ts
│   │   ├── plans.controller.ts        # 计划 CRUD
│   │   ├── plans.service.ts
│   │   ├── entities/
│   │   │   ├── plan.entity.ts         # 计划
│   │   │   ├── plan-step.entity.ts    # 计划步骤
│   │   │   └── plan-category.entity.ts # 计划分类
│   │   ├── repositories/
│   │   │   ├── plans.repository.ts
│   │   │   ├── plan-steps.repository.ts
│   │   │   └── plan-categories.repository.ts
│   │   ├── dto/
│   │   │   ├── create-plan.dto.ts
│   │   │   ├── update-plan.dto.ts
│   │   │   ├── plan-query.dto.ts
│   │   │   └── plan-progress.dto.ts
│   │   └── tests/
│   │       ├── plans.controller.spec.ts
│   │       └── plans.service.spec.ts
│   │
│   ├── moods/                         # 4. 情绪日记模块
│   │   ├── moods.module.ts
│   │   ├── moods.controller.ts        # 情绪记录 CRUD
│   │   ├── moods.service.ts
│   │   ├── entities/
│   │   │   ├── mood-record.entity.ts  # 情绪记录
│   │   │   └── mood-tag.entity.ts     # 情绪标签
│   │   ├── repositories/
│   │   │   ├── moods.repository.ts
│   │   │   └── mood-tags.repository.ts
│   │   ├── dto/
│   │   │   ├── create-mood.dto.ts
│   │   │   ├── mood-query.dto.ts
│   │   │   └── mood-statistics.dto.ts
│   │   └── tests/
│   │       ├── moods.controller.spec.ts
│   │       └── moods.service.spec.ts
│   │
│   ├── posts/                         # 5. 反焦虑中心模块
│   │   ├── posts.module.ts
│   │   ├── posts.controller.ts        # 帖子 CRUD + 互动
│   │   ├── posts.service.ts
│   │   ├── entities/
│   │   │   ├── post.entity.ts         # 帖子
│   │   │   ├── post-tag.entity.ts     # 帖子标签
│   │   │   ├── post-comment.entity.ts # 评论
│   │   │   ├── post-like.entity.ts    # 点赞
│   │   │   └── post-bookmark.entity.ts# 收藏
│   │   ├── repositories/
│   │   │   ├── posts.repository.ts
│   │   │   ├── post-comments.repository.ts
│   │   │   └── post-likes.repository.ts
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts
│   │   │   ├── update-post.dto.ts
│   │   │   ├── post-query.dto.ts
│   │   │   ├── create-comment.dto.ts
│   │   │   └── post-interaction.dto.ts
│   │   └── tests/
│   │       ├── posts.controller.spec.ts
│   │       └── posts.service.spec.ts
│   │
│   ├── chat/                          # 6. AI 对话模块
│   │   ├── chat.module.ts
│   │   ├── chat.controller.ts         # 对话历史/管理
│   │   ├── chat.gateway.ts            # WebSocket 实时对话
│   │   ├── chat.service.ts
│   │   ├── entities/
│   │   │   ├── chat-session.entity.ts # 对话会话
│   │   │   └── chat-message.entity.ts # 对话消息
│   │   ├── repositories/
│   │   │   ├── chat-sessions.repository.ts
│   │   │   └── chat-messages.repository.ts
│   │   ├── services/
│   │   │   ├── openai.service.ts      # OpenAI API 调用
│   │   │   ├── chat-context.service.ts# 上下文管理
│   │   │   └── emotion-analyzer.service.ts # 情绪分析
│   │   ├── dto/
│   │   │   ├── send-message.dto.ts
│   │   │   ├── chat-session.dto.ts
│   │   │   └── chat-history-query.dto.ts
│   │   └── tests/
│   │       ├── chat.controller.spec.ts
│   │       ├── chat.gateway.spec.ts
│   │       └── chat.service.spec.ts
│   │
│   ├── content/                       # 7. 内容管理模块
│   │   ├── content.module.ts
│   │   ├── content.controller.ts      # 文章/活动/资源
│   │   ├── content.service.ts
│   │   ├── entities/
│   │   │   ├── article.entity.ts      # 文章
│   │   │   ├── activity.entity.ts     # 活动
│   │   │   ├── resource.entity.ts     # 资源
│   │   │   └── daily-quote.entity.ts  # 每日语录
│   │   ├── repositories/
│   │   │   ├── articles.repository.ts
│   │   │   ├── activities.repository.ts
│   │   │   └── daily-quotes.repository.ts
│   │   ├── dto/
│   │   │   ├── article-query.dto.ts
│   │   │   ├── activity-query.dto.ts
│   │   │   └── content-admin.dto.ts
│   │   └── tests/
│   │       ├── content.controller.spec.ts
│   │       └── content.service.spec.ts
│   │
│   ├── notifications/                 # 8. 通知模块
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── entities/
│   │   │   ├── notification.entity.ts # 通知
│   │   │   └── notification-setting.entity.ts # 通知设置
│   │   ├── repositories/
│   │   │   └── notifications.repository.ts
│   │   ├── dto/
│   │   │   ├── notification-query.dto.ts
│   │   │   └── notification-setting.dto.ts
│   │   └── tests/
│   │       ├── notifications.controller.spec.ts
│   │       └── notifications.service.spec.ts
│   │
│   ├── analytics/                     # 9. 数据统计模块
│   │   ├── analytics.module.ts
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   ├── services/
│   │   │   ├── mood-analytics.service.ts     # 情绪趋势分析
│   │   │   ├── user-analytics.service.ts     # 用户行为分析
│   │   │   └── plan-analytics.service.ts     # 计划完成分析
│   │   ├── dto/
│   │   │   ├── mood-trend-query.dto.ts
│   │   │   └── dashboard-stats.dto.ts
│   │   └── tests/
│   │       ├── analytics.controller.spec.ts
│   │       └── analytics.service.spec.ts
│   │
│   ├── uploads/                       # 10. 文件上传模块
│   │   ├── uploads.module.ts
│   │   ├── uploads.controller.ts      # 文件上传/删除
│   │   ├── uploads.service.ts
│   │   ├── providers/
│   │   │   ├── local-storage.provider.ts   # 本地存储
│   │   │   ├── minio-storage.provider.ts   # MinIO 对象存储
│   │   │   └── storage.interface.ts        # 存储接口抽象
│   │   ├── dto/
│   │   │   ├── upload-file.dto.ts
│   │   │   └── upload-result.dto.ts
│   │   └── tests/
│   │       └── uploads.service.spec.ts
│   │
│   └── admin/                         # 11. 管理后台模块
│       ├── admin.module.ts
│       ├── admin.controller.ts        # 管理接口
│       ├── admin.service.ts
│       ├── guards/
│       │   └── admin.guard.ts         # 管理员权限守卫
│       ├── dto/
│       │   ├── user-management.dto.ts
│       │   ├── content-management.dto.ts
│       │   └── system-settings.dto.ts
│       └── tests/
│           └── admin.controller.spec.ts
│
└── tasks/                             # 定时任务
    ├── tasks.module.ts
    ├── tasks.service.ts
    └── schedulers/
        ├── daily-quote.scheduler.ts       # 每日语录推送
        ├── weekly-report.scheduler.ts     # 每周报告生成
        ├── data-cleanup.scheduler.ts      # 数据清理
        ├── mood-reminder.scheduler.ts     # 情绪打卡提醒
        └── session-cleanup.scheduler.ts   # 过期对话清理
```

---

## `test/` 测试目录结构

```
test/
├── unit/                              # 单元测试
│   ├── auth/
│   │   ├── auth.service.spec.ts
│   │   └── jwt.strategy.spec.ts
│   ├── plans/
│   │   └── plans.service.spec.ts
│   ├── moods/
│   │   └── moods.service.spec.ts
│   └── chat/
│       └── openai.service.spec.ts
│
├── integration/                       # 集成测试
│   ├── auth.e2e-spec.ts
│   ├── plans.e2e-spec.ts
│   ├── moods.e2e-spec.ts
│   └── chat.e2e-spec.ts
│
├── mocks/                             # Mock 工厂
│   ├── repositories/
│   │   ├── user-repository.mock.ts
│   │   ├── plan-repository.mock.ts
│   │   └── mood-repository.mock.ts
│   └── services/
│       ├── openai.mock.ts
│       └── notification.mock.ts
│
└── fixtures/                          # 测试固定数据
    ├── user.fixture.ts
    ├── plan.fixture.ts
    ├── mood.fixture.ts
    └── chat.fixture.ts
```

---

## `prisma/` 数据库方案目录

```
prisma/
├── schema.prisma                      # 主 Schema
├── migrations/                        # 迁移历史
│   ├── 20240101000001_init/
│   ├── 20240102000002_add_mood/
│   └── 20240103000003_add_chat/
├── seed.ts                            # 种子脚本
└── client.ts                          # Prisma Client 实例
```

---

## `docker/` 容器化配置

```
docker/
├── Dockerfile                         # 生产环境镜像构建 (多阶段)
├── Dockerfile.dev                     # 开发环境镜像
├── docker-compose.yml                 # 本地开发编排
├── docker-compose.prod.yml            # 生产环境编排
└── nginx/
    ├── nginx.conf                     # Nginx 反向代理配置
    └── ssl/                           # SSL 证书
        └── certs/
```

---

## `scripts/` 脚本工具

```
scripts/
├── setup.sh                           # 环境初始化
├── seed.sh                            # 种子数据导入
├── migrate.sh                         # 数据库迁移
├── backup.sh                          # 数据库备份
├── deploy.sh                          # 部署脚本
└── healthcheck.sh                     # 健康检查
```

---

## 关键文件说明

| 文件 | 作用 |
|------|------|
| `src/main.ts` | 应用启动，配置 Swagger、CORS、全局管道/过滤器/拦截器 |
| `src/app.module.ts` | 根模块，导入所有业务模块和通用模块 |
| `src/common/config/` | 集中配置管理，通过 `@nestjs/config` 加载 `.env` |
| `src/common/websocket/websocket.gateway.ts` | Socket.IO 网关，处理 AI 对话实时通信 |
| `src/common/queue/` | BullMQ 队列，处理异步任务（推送/AI响应/清理） |

---

## 架构模式说明

```
src/
├── common/          → 通用基础设施（配置/数据库/Redis/队列/WS/中间件）
├── modules/         → 按业务域拆分的功能模块（NestJS Module）
│   └── [module]/
│       ├── *.module.ts       → 模块定义
│       ├── *.controller.ts   → HTTP 路由处理器
│       ├── *.service.ts      → 业务逻辑层
│       ├── *.gateway.ts      → WebSocket 事件处理器
│       ├── entities/         → TypeORM 实体
│       ├── repositories/     → 数据访问层（可选）
│       ├── dto/              → 请求/响应数据传输对象
│       └── tests/            → 单元测试
└── tasks/           → 定时任务/调度器
```

**依赖规则**: `Controller → Service → Repository → Entity`  
**模块间通信**: 通过 Service 导出 + Module 导入，避免循环依赖
