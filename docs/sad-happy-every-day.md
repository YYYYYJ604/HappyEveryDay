# Happy Every Day（天天开心）— 系统架构设计文档 (SAD)

> **版本**: v1.0  
> **状态**: 草案  
> **面向用户**: 18-30岁年轻人  
> **定位**: 反焦虑生活陪伴平台  

---

## 目录

1. [系统架构总览](#1-系统架构总览)  
2. [项目目录结构](#2-项目目录结构)  
3. [数据库架构](#3-数据库架构)  
4. [API架构](#4-api架构)  
5. [Flutter架构](#5-flutter架构)  

---

## 1. 系统架构总览

### 1.1 整体架构图

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           客户端层 (Client Layer)                        │
│                                                                          │
│  ┌─────────────────────────┐  ┌────────────────────────────────────┐    │
│  │     Flutter App (iOS)   │  │     Flutter App (Android)          │    │
│  │  ┌───────────────────┐  │  │  ┌────────────────────────────┐   │    │
│  │  │    Riverpod        │  │  │  │      Riverpod             │   │    │
│  │  │    状态管理        │  │  │  │      状态管理             │   │    │
│  │  │   GoRouter 路由   │  │  │  │    GoRouter 路由          │   │    │
│  │  │   Dio 网络层      │  │  │  │    Dio 网络层             │   │    │
│  │  │   Hive 本地缓存   │  │  │  │    Hive 本地缓存          │   │    │
│  │  └───────────────────┘  │  │  └────────────────────────────┘   │    │
│  └────────────┬────────────┘  └────────────────┬───────────────────┘    │
└───────────────┼─────────────────────────────────┼────────────────────────┘
                │             HTTPS / WSS          │
                └─────────────────┬─────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────────────────┐
│                     API 网关层 (API Gateway)                            │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                        Nginx / Kong                                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │  │
│  │  │SSL 终止    │  │ 限流       │  │ 路由转发   │  │ 静态缓存   │  │  │
│  │  │TLS 1.3     │  │Rate Limit  │  │Path-based  │  │CDN 7天     │  │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────────────────┐
│                      应用服务层 (Service Layer)                           │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                   NestJS Backend (Monorepo)                        │  │
│  │                                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │
│  │  │ Auth     │  │ User     │  │ Plan     │  │ Anxiety │         │  │
│  │  │ Module   │  │ Module   │  │ Module   │  │ Module  │         │  │
│  │  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤         │  │
│  │  │ Interest │  │ Mood     │  │ AI Chat  │  │ Notify  │         │  │
│  │  │ Module   │  │ Module   │  │ Module   │  │ Module  │         │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │              Common Layer (公共基础设施层)                  │  │  │
│  │  │  Guards │ Interceptors │ Filters │ Pipes │ DTOs │ Enums    │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                WebSocket 实时通信服务                              │  │
│  │  ┌─────────────────────┐  ┌────────────────────────────────────┐  │  │
│  │  │  AI Chat Gateway    │  │  Notification Gateway              │  │  │
│  │  │  (双向通信/流式响应)  │  │  (单向推送/SSE回退)              │  │  │
│  │  └─────────────────────┘  └────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼────────────────────────────────────────┐
│                     数据层 & 外部服务                                      │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────────┐   │
│  │  PostgreSQL 15 │  │   Redis 7      │  │   MinIO / S3            │   │
│  │  + PostGIS 3.3 │  │   (缓存)      │  │   (对象存储)            │   │
│  │  (主数据库)    │  │   (Session)   │  │   - 头像/图片/语音      │   │
│  │  - 关系数据    │  │   (消息队列)  │  │                          │   │
│  │  - 地理空间数据│  │               │  │                          │   │
│  └────────────────┘  └────────────────┘  └──────────────────────────┘   │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────────┐   │
│  │  DeepSeek API  │  │  极光推送      │  │   Sentry                │   │
│  │  (AI引擎)      │  │  JPush/FCM    │  │   (错误追踪/性能监控)   │   │
│  │  - 陪伴对话    │  │  APNs         │  │                          │   │
│  │  - 情绪分析    │  │  (推送通知)   │  │                          │   │
│  │  - 计划生成    │  │               │  │                          │   │
│  └────────────────┘  └────────────────┘  └──────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.2 架构分层职责矩阵

| 层级 | 技术 | 关键职责 |
|------|------|----------|
| **客户端层** | Flutter 3.41 | UI渲染、用户交互、本地缓存、离线能力 |
| **状态管理层** | Riverpod 2.x | 全局状态管理、依赖注入、异步数据流 |
| **路由层** | GoRouter 14.x | 声明式路由、DeepLink、页面嵌套、鉴权守卫 |
| **网络层** | Dio 5.x | HTTP请求、拦截器链、Token刷新、重试机制 |
| **API网关层** | Nginx/Kong | SSL终止、限流、路由转发、CDN缓存 |
| **应用服务层** | NestJS 10.x | 业务逻辑、鉴权、数据校验、实时通信 |
| **持久化层** | TypeORM + PG | ORM映射、数据迁移、事务管理、复杂查询 |
| **缓存层** | Redis 7.x | Session共享、热点缓存、消息队列、分布式锁 |
| **空间数据层** | PostGIS 3.3 | GEO查询、距离计算、位置服务 |
| **AI层** | DeepSeek API | 对话生成、情绪分析、内容推荐、计划生成 |
| **存储层** | MinIO/S3 | 非结构化文件存储、CDN分发 |
| **监控层** | Sentry | 错误追踪、性能监控、用户行为分析 |

### 1.3 核心数据流

```
┌──────────────────────────────────────────────────────────────────┐
│                      用户请求完整生命周期                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  用户操作                                                          │
│    │                                                              │
│    ▼                                                              │
│  Flutter Action → Riverpod Provider.update                        │
│    │                                                              │
│    ▼                                                              │
│  Repository → API DataSource (Dio)                                │
│    │                                                              │
│    ├── 检查本地缓存 (Hive/本地DB)                                 │
│    │   ├── 命中 → 直接返回                                       │
│    │   └── 未命中 → 发起网络请求                                 │
│    │                                                              │
│    ▼                                                              │
│  Dio → HTTP/HTTPS Request                                         │
│    │  ├── AuthInterceptor (注入Token)                            │
│    │  ├── LoggingInterceptor (日志录制)                           │
│    │  └── ErrorInterceptor (统一错误处理)                        │
│    │                                                              │
│    ▼                                                              │
│  API Gateway                                                      │
│    │  ├── 限流检查                                                │
│    │  ├── JWT Token验证 (前置)                                    │
│    │  └── 路由转发                                                │
│    │                                                              │
│    ▼                                                              │
│  NestJS Controller                                                │
│    │  ├── 参数校验 (ValidationPipe + DTO)                         │
│    │  └── 调用Service                                             │
│    │                                                              │
│    ▼                                                              │
│  NestJS Service (核心业务逻辑)                                     │
│    │                                                              │
│    ├──→ TypeORM Repository → PostgreSQL/PostGIS                   │
│    │   └── 复杂空间查询(GEO)                                      │
│    │                                                              │
│    ├──→ Redis (缓存查询/写入)                                     │
│    │                                                              │
│    ├──→ DeepSeek API (AI推理请求)                                 │
│    │   └── Stream Response (流式返回→WebSocket→Flutter)          │
│    │                                                              │
│    └──→ MinIO (文件上传/下载)                                     │
│    │                                                              │
│    ▼                                                              │
│  TransformInterceptor → 统一响应格式                               │
│    │                                                              │
│    ▼                                                              │
│  Flutter App → Riverpod State更新 → UI重构                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. 项目目录结构

### 2.1 根级目录组织

```
happy-every-day/                          # 项目根目录
├── happy-every-day-server/               # NestJS 后端
│   └── src/                              # (见 2.2)
├── happy-every-day-app/                  # Flutter 前端
│   └── lib/                              # (见 2.3)
├── docs/                                 # 文档
│   ├── sad.md                            # 本文档
│   ├── api-spec/                         # API规范
│   │   ├── openapi.yaml
│   │   └── changelog.md
│   ├── adr/                              # 架构决策记录
│   └── ddl/                              # 数据库设计
├── docker/                               # Docker配置
│   ├── docker-compose.yml               # 生产环境
│   ├── docker-compose.dev.yml           # 开发环境
│   └── docker-compose.test.yml          # 测试环境
├── scripts/                              # 自动化脚本
│   ├── setup-dev.sh
│   ├── migrate.sh
│   └── seed.sh
├── .github/                              # CI/CD
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
├── .gitignore
├── README.md
└── LICENSE
```

### 2.2 后端目录结构 (NestJS)

```
happy-every-day-server/
├── src/
│   ├── main.ts                             # 应用入口
│   │                                       # - 注册全局管道
│   │                                       # - 注册全局过滤器
│   │                                       # - 注册全局拦截器
│   │                                       # - 启动WebSocket
│   │                                       # - 监听端口 3000
│   │
│   ├── app.module.ts                       # 根模块
│   │                                       # - 导入所有功能模块
│   │                                       # - 配置全局中间件
│   │                                       # - 配置数据库连接
│   │                                       # - 配置Redis连接
│   │
│   ├── config/                             # 配置层
│   │   ├── app.config.ts                   # 应用级配置
│   │   ├── database.config.ts              # 数据库连接配置
│   │   ├── redis.config.ts                 # Redis配置
│   │   ├── deepseek.config.ts              # DeepSeek API配置
│   │   ├── jwt.config.ts                   # JWT密钥/过期时间
│   │   ├── storage.config.ts               # MinIO/S3配置
│   │   ├── notification.config.ts          # 推送配置
│   │   └── cors.config.ts                  # 跨域配置
│   │
│   ├── common/                             # 公共基础设施
│   │   ├── constants/                      # 全局常量
│   │   │   ├── error-codes.constant.ts     # 错误码定义
│   │   │   ├── roles.constant.ts           # 角色枚举
│   │   │   └── activity.constant.ts        # 活动类型枚举
│   │   │
│   │   ├── decorators/                     # 自定义装饰器
│   │   │   ├── current-user.decorator.ts   # 获取当前用户
│   │   │   ├── public.decorator.ts         # 标记公开接口
│   │   │   ├── roles.decorator.ts          # 角色注解
│   │   │   └── api-version.decorator.ts    # API版本控制
│   │   │
│   │   ├── guards/                         # 守卫
│   │   │   ├── jwt-auth.guard.ts           # JWT鉴权
│   │   │   ├── roles.guard.ts              # 角色校验
│   │   │   └── throttle.guard.ts           # 接口限流
│   │   │
│   │   ├── interceptors/                   # 拦截器
│   │   │   ├── transform.interceptor.ts    # 统一响应格式
│   │   │   ├── logging.interceptor.ts      # 请求日志
│   │   │   ├── cache.interceptor.ts        # 缓存策略
│   │   │   └── timeout.interceptor.ts      # 超时处理
│   │   │
│   │   ├── filters/                        # 异常过滤器
│   │   │   ├── all-exceptions.filter.ts    # 全局异常捕获
│   │   │   ├── http-exception.filter.ts    # HTTP异常
│   │   │   ├── ws-exception.filter.ts      # WebSocket异常
│   │   │   └── validation.filter.ts        # 校验异常
│   │   │
│   │   ├── pipes/                          # 管道/校验
│   │   │   ├── validation.pipe.ts          # DTO校验
│   │   │   ├── parse-geo.pipe.ts           # 地理坐标解析
│   │   │   └── parse-pagination.pipe.ts    # 分页参数
│   │   │
│   │   ├── dto/                            # 通用DTO
│   │   │   ├── pagination.dto.ts           # 分页请求
│   │   │   ├── date-range.dto.ts           # 日期范围
│   │   │   └── geo-query.dto.ts            # 地理查询
│   │   │
│   │   ├── interfaces/                     # 通用接口
│   │   │   ├── api-response.interface.ts   # 统一响应接口
│   │   │   ├── pagination.interface.ts     # 分页接口
│   │   │   └── base-entity.interface.ts    # 实体基类
│   │   │
│   │   └── helpers/                        # 辅助函数
│   │       ├── crypto.helper.ts            # 加解密
│   │       ├── date.helper.ts              # 日期处理
│   │       ├── geo.helper.ts               # 地理计算
│   │       └── text.helper.ts              # 文本处理
│   │
│   ├── modules/                            # 业务模块
│   │   │
│   │   ├── auth/                           # 认证模块
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts          # POST /auth/login
│   │   │   │                                 # POST /auth/register
│   │   │   │                                 # POST /auth/refresh
│   │   │   │                                 # POST /auth/logout
│   │   │   ├── auth.service.ts             # 登录/注册/Token管理
│   │   │   ├── strategies/                 # Passport策略
│   │   │   │   ├── jwt.strategy.ts         # JWT验证策略
│   │   │   │   └── local.strategy.ts       # 本地验证策略
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts            # { phone/email, password }
│   │   │   │   ├── register.dto.ts         # { nickname, phone, password, ... }
│   │   │   │   ├── refresh-token.dto.ts    # { refreshToken }
│   │   │   │   └── verify-code.dto.ts      # { phone, code }
│   │   │   └── entities/
│   │   │       └── auth.entity.ts          # Token实体
│   │   │
│   │   ├── user/                           # 用户模块
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts          # GET /user/profile
│   │   │   │                                 # PUT /user/profile
│   │   │   │                                 # POST /user/avatar
│   │   │   │                                 # GET /user/settings
│   │   │   ├── user.service.ts             # 用户资料管理
│   │   │   ├── dto/
│   │   │   │   ├── update-profile.dto.ts   # 更新资料
│   │   │   │   ├── update-settings.dto.ts  # 更新设置
│   │   │   │   └── upload-avatar.dto.ts    # 头像上传
│   │   │   └── entities/
│   │   │       ├── user.entity.ts          # 用户主表
│   │   │       ├── user-profile.entity.ts  # 用户扩展
│   │   │       └── user-settings.entity.ts # 用户设置
│   │   │
│   │   ├── plan/                           # 今日开心计划模块
│   │   │   ├── plan.module.ts
│   │   │   ├── plan.controller.ts          # GET /plan/daily
│   │   │   │                                 # POST /plan/generate
│   │   │   │                                 # PUT /plan/:id
│   │   │   │                                 # PATCH /plan/:taskId/complete
│   │   │   ├── plan.service.ts             # 计划CRUD/AI生成
│   │   │   ├── dto/
│   │   │   │   ├── create-plan.dto.ts
│   │   │   │   ├── update-plan.dto.ts
│   │   │   │   ├── complete-task.dto.ts
│   │   │   │   └── generate-plan.dto.ts    # AI生成参数
│   │   │   └── entities/
│   │   │       ├── daily-plan.entity.ts    # 每日计划
│   │   │       └── plan-task.entity.ts     # 计划任务项
│   │   │
│   │   ├── anxiety/                        # 反焦虑中心模块
│   │   │   ├── anxiety.module.ts
│   │   │   ├── anxiety.controller.ts       # GET /anxiety/posts
│   │   │   │                                 # POST /anxiety/posts
│   │   │   │                                 # POST /anxiety/ai-advice
│   │   │   │                                 # GET /anxiety/tags
│   │   │   ├── anxiety.service.ts          # 匿名发帖/AI解忧
│   │   │   ├── dto/
│   │   │   │   ├── create-post.dto.ts
│   │   │   │   ├── create-comment.dto.ts
│   │   │   │   ├── query-posts.dto.ts
│   │   │   │   └── trigger-ai-advice.dto.ts
│   │   │   └── entities/
│   │   │       ├── anxiety-post.entity.ts  # 匿名帖
│   │   │       ├── anxiety-tag.entity.ts   # 焦虑标签
│   │   │       └── post-comment.entity.ts  # 帖子评论
│   │   │
│   │   ├── interest/                       # 兴趣重启中心模块
│   │   │   ├── interest.module.ts
│   │   │   ├── interest.controller.ts      # GET /interest/categories
│   │   │   │                                 # GET /interest/activities
│   │   │   │                                 # POST /interest/activities/:id/join
│   │   │   │                                 # POST /interest/checkin
│   │   │   ├── interest.service.ts         # 兴趣推荐/打卡
│   │   │   ├── dto/
│   │   │   │   ├── join-activity.dto.ts
│   │   │   │   ├── create-checkin.dto.ts
│   │   │   │   └── list-recommendations.dto.ts
│   │   │   └── entities/
│   │   │       ├── interest-category.entity.ts    # 兴趣分类
│   │   │       ├── interest-activity.entity.ts    # 活动
│   │   │       ├── activity-participant.entity.ts # 参与者
│   │   │       └── interest-checkin.entity.ts     # 打卡记录
│   │   │
│   │   ├── ai/                             # AI陪伴助手模块
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.controller.ts            # POST /ai/chat
│   │   │   │                                 # GET /ai/history
│   │   │   ├── ai.service.ts               # DeepSeek API调用
│   │   │   ├── ai-chat.gateway.ts          # WebSocket聊天
│   │   │   ├── dto/
│   │   │   │   ├── send-message.dto.ts
│   │   │   │   └── mood-analysis.dto.ts
│   │   │   ├── prompts/                    # System Prompt
│   │   │   │   ├── companion.prompt.ts     # 陪伴助手人格设定
│   │   │   │   ├── mood-analysis.prompt.ts # 情绪分析模板
│   │   │   │   └── plan-generator.prompt.ts# 计划生成模板
│   │   │   └── entities/
│   │   │       └── chat-message.entity.ts  # 聊天记录
│   │   │
│   │   ├── mood/                           # 心情记录模块
│   │   │   ├── mood.module.ts
│   │   │   ├── mood.controller.ts          # POST /mood/record
│   │   │   │                                 # GET /mood/range
│   │   │   │                                 # GET /mood/analytics
│   │   │   ├── mood.service.ts             # 心情CRUD/统计分析
│   │   │   ├── dto/
│   │   │   │   ├── create-mood-record.dto.ts
│   │   │   │   ├── update-mood-record.dto.ts
│   │   │   │   └── query-mood-range.dto.ts
│   │   │   └── entities/
│   │   │       ├── mood-record.entity.ts   # 心情记录
│   │   │       └── mood-tag.entity.ts      # 心情标签
│   │   │
│   │   ├── notification/                   # 通知模块
│   │   │   ├── notification.module.ts
│   │   │   ├── notification.controller.ts  # GET /notifications
│   │   │   │                                 # PATCH /notifications/:id/read
│   │   │   ├── notification.service.ts     # 推送/站内信
│   │   │   ├── notification.gateway.ts     # 实时推送
│   │   │   ├── dto/
│   │   │   │   └── push-notification.dto.ts
│   │   │   └── entities/
│   │   │       └── notification.entity.ts  # 通知记录
│   │   │
│   │   ├── achievement/                    # 成就系统模块
│   │   │   ├── achievement.module.ts
│   │   │   ├── achievement.controller.ts   # GET /achievements
│   │   │   ├── achievement.service.ts      # 成就判定/解锁
│   │   │   └── entities/
│   │   │       ├── achievement.entity.ts   # 成就定义
│   │   │       └── user-achievement.entity.ts # 用户成就
│   │   │
│   │   └── analytics/                      # 数据分析模块(内部)
│   │       ├── analytics.module.ts
│   │       ├── analytics.service.ts        # 用户行为分析
│   │       └── events/
│   │           ├── analytics.event.ts      # 埋点事件定义
│   │           └── analytics.consumer.ts   # 事件消费者
│   │
│   ├── database/                           # 数据库层
│   │   ├── database.module.ts              # TypeORM动态模块
│   │   ├── migrations/                     # 数据库迁移文件
│   │   │   ├── 1700000000000-CreateUsers.ts
│   │   │   ├── 1700000000001-CreatePlans.ts
│   │   │   └── ...
│   │   └── seeds/                          # 种子数据
│   │       ├── interest-category.seed.ts   # 兴趣分类初始化
│   │       ├── anxiety-tag.seed.ts         # 焦虑标签初始化
│   │       └── achievement.seed.ts         # 成就定义初始化
│   │
│   ├── websocket/                          # WebSocket基础设施
│   │   ├── ws.gateway.ts                   # 通用WebSocket网关
│   │   ├── ws.auth-middleware.ts           # WS鉴权中间件
│   │   └── ws.adapter.ts                   # Redis适配(多实例)
│   │
│   └── tasks/                              # 定时任务
│       ├── daily-plan.task.ts              # 每日自动生成计划
│       ├── streak-check.task.ts            # 连续打卡检测
│       ├── cleanup.task.ts                 # 数据清理
│       └── notification.task.ts            # 定时推送
│
├── test/                                   # 测试
│   ├── unit/                               # 单元测试
│   │   ├── services/
│   │   ├── controllers/
│   │   └── guards/
│   ├── e2e/                                # 端到端测试
│   │   ├── auth.e2e-spec.ts
│   │   ├── plan.e2e-spec.ts
│   │   └── ai.e2e-spec.ts
│   └── integration/                        # 集成测试
│       ├── database/
│       └── redis/
│
├── docker/
│   ├── Dockerfile                          # 多阶段构建
│   ├── Dockerfile.dev                      # 开发镜像
│   └── .dockerignore
│
├── .env.example                            # 环境变量模板
├── .eslintrc.js                            # ESLint配置
├── jest.config.ts                          # Jest测试配置
├── tsconfig.json                           # TypeScript配置
├── tsconfig.build.json                     # 构建配置
├── nest-cli.json                           # NestJS CLI配置
└── package.json                            # 依赖管理
```

### 2.3 前端目录结构 (Flutter)

```
happy-every-day-app/
├── android/                                # Android原生配置
├── ios/                                    # iOS原生配置
├── web/                                    # Web PWA配置
├── assets/                                 # 静态资源
│   ├── images/
│   │   ├── illustrations/                  # 插画(反焦虑系列)
│   │   ├── icons/                          # 自定义图标
│   │   ├── emojis/                         # 心情表情(30+)
│   │   └── backgrounds/                    # 背景图
│   ├── fonts/                              # 自定义字体(圆体/手写体)
│   ├── animations/                         # Lottie动画
│   │   ├── happy/                          # 开心主题
│   │   ├── relax/                          # 放松主题
│   │   ├── breathing/                      # 呼吸引导
│   │   └── loading/                        # 加载动画
│   └── l10n/                               # 国际化
│       ├── app_zh.arb                      # 中文
│       └── app_en.arb                      # 英文
│
├── lib/                                    # 主代码
│   │
│   ├── main.dart                           # 应用入口
│   │                                       # - ProviderScope 包裹
│   │                                       # - 初始化Hive
│   │                                       # - 初始化Dio
│   │                                       # - 运行App
│   │
│   ├── app.dart                            # MaterialApp.router
│   │                                       # - GoRouter 配置
│   │                                       # - 主题配置
│   │                                       # - 本地化配置
│   │
│   ├── core/                               # 核心基础设施
│   │   ├── config/                         # 配置
│   │   │   ├── app_config.dart             # 应用级配置
│   │   │   ├── api_config.dart             # API地址/超时
│   │   │   └── theme_config.dart           # 主题配置
│   │   │
│   │   ├── constants/                      # 常量
│   │   │   ├── app_colors.dart             # 配色体系
│   │   │   ├── app_text_styles.dart        # 文字样式
│   │   │   ├── app_spacing.dart            # 间距系统
│   │   │   ├── app_durations.dart          # 动画时长
│   │   │   └── asset_paths.dart            # 资源路径
│   │   │
│   │   ├── theme/                          # 主题
│   │   │   ├── app_theme.dart              # 浅色主题
│   │   │   ├── dark_theme.dart             # 深色主题
│   │   │   └── component_themes/           # 组件级主题
│   │   │       ├── app_bar_theme.dart
│   │   │       ├── card_theme.dart
│   │   │       ├── chip_theme.dart
│   │   │       ├── input_theme.dart
│   │   │       └── button_theme.dart
│   │   │
│   │   ├── network/                        # 网络层
│   │   │   ├── dio_client.dart             # Dio实例工厂
│   │   │   ├── api_interceptor.dart        # 请求/响应拦截
│   │   │   ├── auth_interceptor.dart       # Token注入/刷新
│   │   │   ├── error_handler.dart          # 统一错误处理
│   │   │   ├── connectivity_service.dart   # 网络状态监听
│   │   │   └── api_response.dart           # 统一响应模型
│   │   │
│   │   ├── router/                         # 路由
│   │   │   ├── app_router.dart             # GoRouter配置
│   │   │   ├── route_names.dart            # 路由名称常量
│   │   │   ├── route_paths.dart            # 路由路径常量
│   │   │   └── auth_guard.dart             # 路由鉴权守卫
│   │   │
│   │   ├── providers/                      # 全局Provider
│   │   │   ├── core_providers.dart         # 核心Provider
│   │   │   ├── dio_provider.dart           # Dio Provider
│   │   │   ├── auth_provider.dart          # 认证状态Provider
│   │   │   └── theme_provider.dart         # 主题Provider
│   │   │
│   │   ├── utils/                          # 工具类
│   │   │   ├── date_utils.dart             # 日期格式化
│   │   │   ├── geo_utils.dart              # 地理工具
│   │   │   ├── validators.dart             # 表单校验
│   │   │   ├── debouncer.dart              # 防抖
│   │   │   ├── haptic_utils.dart           # 触感反馈
│   │   │   └── logger.dart                 # 日志工具
│   │   │
│   │   └── extensions/                     # 扩展方法
│   │       ├── context_ext.dart            # BuildContext扩展
│   │       ├── string_ext.dart             # 字符串扩展
│   │       ├── datetime_ext.dart           # 日期扩展
│   │       └── num_ext.dart                # 数字扩展
│   │
│   ├── shared/                             # 共享UI组件
│   │   ├── widgets/                        # 通用Widget
│   │   │   ├── app_scaffold.dart           # 页面