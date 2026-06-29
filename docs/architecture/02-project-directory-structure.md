# 天天开心 (Happy Every Day) — 项目目录结构

> 版本：v1.0  
> 说明：本文档定义前后端项目的完整目录结构与职责

---

## 目录

1. [后端 NestJS 目录结构](#1-后端-nestjs-目录结构)
2. [前端 Flutter 目录结构](#2-前端-flutter-目录结构)
3. [目录结构设计原则](#3-目录结构设计原则)
4. [命名规范与约束](#4-命名规范与约束)

---

## 1. 后端 NestJS 目录结构

### 1.1 整体结构

```
happy-every-day-server/
│
├── .github/                              # GitHub CI/CD 配置
│   └── workflows/
│       ├── ci.yml                        # 持续集成流水线
│       └── deploy.yml                    # 自动部署流水线
│
├── .husky/                               # Git Hooks
│   ├── pre-commit                        # 代码检查钩子
│   └── commit-msg                        # 提交信息规范
│
├── docker/
│   ├── Dockerfile                        # 生产环境 Docker 镜像
│   ├── Dockerfile.dev                    # 开发环境 Docker 镜像
│   ├── docker-compose.yml                # 生产编排
│   ├── docker-compose.dev.yml            # 开发编排
│   └── postgres/
│       ├── init.sql                      # 数据库初始化脚本
│       └── postgis-init.sql              # PostGIS 扩展初始化
│
├── scripts/
│   ├── migrate.sh                        # 数据库迁移
│   ├── seed.sh                           # 种子数据填充
│   ├── backup.sh                         # 数据库备份
│   └── healthcheck.sh                    # 健康检查脚本
│
├── docs/
│   ├── api-spec.md                       # API 接口文档
│   ├── architecture.md                   # 架构文档
│   └── changelog.md                      # 变更日志
│
├── test/
│   ├── unit/                             # 单元测试
│   │   ├── modules/
│   │   │   ├── auth.service.spec.ts
│   │   │   ├── plan.service.spec.ts
│   │   │   └── ...
│   │   └── common/
│   │       └── validators.spec.ts
│   ├── e2e/                              # 端到端测试
│   │   ├── auth.e2e-spec.ts
│   │   ├── plan.e2e-spec.ts
│   │   └── ...
│   └── integration/                      # 集成测试
│       ├── database/
│       ├── redis/
│       └── external-api/
│
├── src/                                  # 源代码主目录
│   ├── main.ts                           # 应用入口
│   ├── app.module.ts                     # 根模块
│   │
│   ├── config/                           # 配置模块
│   │   ├── index.ts                      # 配置导出
│   │   ├── database.config.ts            # TypeORM 数据库配置
│   │   ├── redis.config.ts               # Redis 配置
│   │   ├── deepseek.config.ts            # DeepSeek API 配置
│   │   ├── jwt.config.ts                 # JWT 配置
│   │   ├── storage.config.ts             # MinIO/S3 存储配置
│   │   ├── notification.config.ts        # 推送通知配置
│   │   ├── throttle.config.ts            # 限流配置
│   │   └── app.config.ts                 # 通用应用配置
│   │
│   ├── common/                           # 公共层
│   │   ├── constants/                    # 常量定义
│   │   │   ├── error-codes.constant.ts   # 统一错误码
│   │   │   ├── app.constant.ts           # 应用常量
│   │   │   └── cache-keys.constant.ts    # Redis 缓存键常量
│   │   │
│   │   ├── decorators/                   # 自定义装饰器
│   │   │   ├── current-user.decorator.ts # 获取当前用户
│   │   │   ├── public.decorator.ts       # 公开接口标记
│   │   │   ├── roles.decorator.ts        # 角色权限标记
│   │   │   ├── throttle.decorator.ts     # 接口限流
│   │   │   └── api-response.decorator.ts # API响应包装
│   │   │
│   │   ├── guards/                       # 守卫
│   │   │   ├── jwt-auth.guard.ts         # JWT 认证守卫
│   │   │   ├── roles.guard.ts            # 角色守卫
│   │   │   └── throttle.guard.ts         # 限流守卫
│   │   │
│   │   ├── interceptors/                 # 拦截器
│   │   │   ├── transform.interceptor.ts  # 统一响应格式
│   │   │   ├── logging.interceptor.ts    # 请求日志记录
│   │   │   ├── cache.interceptor.ts      # 缓存拦截器
│   │   │   └── timeout.interceptor.ts    # 超时控制
│   │   │
│   │   ├── filters/                      # 异常过滤器
│   │   │   ├── all-exceptions.filter.ts  # 全局异常过滤
│   │   │   ├── http-exception.filter.ts  # HTTP异常过滤
│   │   │   ├── ws-exception.filter.ts    # WebSocket异常过滤
│   │   │   └── validation.filter.ts      # 校验异常过滤
│   │   │
│   │   ├── pipes/                        # 管道
│   │   │   ├── validation.pipe.ts        # DTO校验
│   │   │   ├── parse-geo.pipe.ts         # 地理坐标解析
│   │   │   └── parse-uuid.pipe.ts        # UUID解析
│   │   │
│   │   ├── dto/                          # 通用DTO
│   │   │   ├── pagination.dto.ts         # 分页请求
│   │   │   ├── pagination-response.dto.ts# 分页响应
│   │   │   └── api-response.dto.ts       # 统一响应
│   │   │
│   │   ├── interfaces/                   # 通用接口
│   │   │   ├── api-response.interface.ts # API响应接口
│   │   │   └── pagination.interface.ts   # 分页接口
│   │   │
│   │   ├── enums/                        # 公共枚举
│   │   │   ├── status.enum.ts
│   │   │   ├── gender.enum.ts
│   │   │   └── role.enum.ts
│   │   │
│   │   ├── utils/                        # 工具函数
│   │   │   ├── crypto.util.ts            # 加密工具
│   │   │   ├── date.util.ts              # 日期工具
│   │   │   ├── geo.util.ts               # 地理工具
│   │   │   └── slug.util.ts              # URL友好化
│   │   │
│   │   └── helpers/                      # 辅助函数
│   │       ├── response.helper.ts        # 响应构建
│   │       └── pagination.helper.ts      # 分页构建
│   │
│   ├── modules/                          # 业务模块
│   │   │
│   │   ├── auth/                         # ── 认证模块 ──
│   │   │   ├── auth.module.ts            #   模块定义
│   │   │   ├── auth.controller.ts        #   控制器
│   │   │   ├── auth.service.ts           #   业务逻辑
│   │   │   ├── __test__/                 #   模块测试
│   │   │   │   └── auth.service.spec.ts
│   │   │   ├── strategies/               #   策略
│   │   │   │   ├── jwt.strategy.ts       #     JWT策略
│   │   │   │   ├── jwt-refresh.strategy.ts#    Refresh策略
│   │   │   │   └── local.strategy.ts     #     本地策略
│   │   │   ├── dto/                      #   数据传输对象
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── refresh-token.dto.ts
│   │   │   │   ├── forgot-password.dto.ts
│   │   │   │   ├── reset-password.dto.ts
│   │   │   │   └── verify-code.dto.ts
│   │   │   └── entities/                 #   实体
│   │   │       └── user.entity.ts
│   │   │
│   │   ├── user/                         # ── 用户模块 ──
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── __test__/
│   │   │   ├── dto/
│   │   │   │   ├── update-profile.dto.ts
│   │   │   │   ├── update-settings.dto.ts
│   │   │   │   ├── upload-avatar.dto.ts
│   │   │   │   ├── bind-phone.dto.ts
│   │   │   │   └── bind-email.dto.ts
│   │   │   └── entities/
│   │   │       ├── user-profile.entity.ts
│   │   │       └── user-settings.entity.ts
│   │   │
│   │   ├── plan/                         # ── 今日开心计划 ──
│   │   │   ├── plan.module.ts
│   │   │   ├── plan.controller.ts
│   │   │   ├── plan.service.ts
│   │   │   ├── __test__/
│   │   │   ├── dto/
│   │   │   │   ├── create-plan.dto.ts
│   │   │   │   ├── update-plan.dto.ts
│   │   │   │   ├── complete-task.dto.ts
│   │   │   │   ├── reorder-task.dto.ts
│   │   │   │   └── generate-plan.dto.ts # AI生成计划
│   │   │   └── entities/
│   │   │       ├── daily-plan.entity.ts
│   │   │       └── plan-task.entity.ts
│   │   │
│   │   ├── anxiety/                      # ── 反焦虑中心 ──
│   │   │   ├── anxiety.module.ts
│   │   │   ├── anxiety.controller.ts
│   │   │   ├── anxiety.service.ts
│   │   │   ├── __test__/
│   │   │   ├── dto/
│   │   │   │   ├── create-post.dto.ts
│   │   │   │   ├── update-post.dto.ts
│   │   │   │   ├── create-comment.dto.ts
│   │   │   │   ├── query-posts.dto.ts
│   │   │   │   └── trigger-ai-advice.dto.ts
│   │   │   └── entities/
│   │   │       ├── anxiety-post.entity.ts
│   │   │       ├── anxiety-tag.entity.ts
│   │   │       ├── post-like.entity.ts
│   │   │       ├── post-comment.entity.ts
│   │   │       └── breathing-exercise.entity.ts
│   │   │
│   │   ├── interest/                     # ── 兴趣重启中心 ──
│   │   │   ├── interest.module.ts
│   │   │   ├── interest.controller.ts
│   │   │   ├── interest.service.ts
│   │   │   ├── __test__/
│   │   │   ├── dto/
│   │   │   │   ├── create-activity.dto.ts
│   │   │   │   ├── join-activity.dto.ts
│   │   │   │   ├── quit-activity.dto.ts
│   │   │   │   ├── create-checkin.dto.ts
│   │   │   │   └── list-recommendations.dto.ts
│   │   │   └── entities/
│   │   │       ├── interest-category.entity.ts
│   │   │       ├── interest-activity.entity.ts
│   │   │       ├── activity-participant.entity.ts
│   │   │       └── interest-checkin.entity.ts
│   │   │
│   │   ├── ai/                           # ── AI陪伴助手 ──
│   │   │   ├── ai.module.ts
│   │   │   ├── ai.controller.ts          # REST API (获取历史)
│   │   │   ├── ai.service.ts
│   │   │   ├── ai-chat.gateway.ts        # WebSocket 实时对话
│   │   │   ├── __test__/
│   │   │   ├── dto/
│   │   │   │   ├── send-message.dto.ts
│   │   │   │   └── mood-analysis.dto.ts
│   │   │   ├── prompts/                  # AI提示词模板
│   │   │   │   ├── companion.prompt.ts   #   陪伴助手
│   │   │   │   ├── mood-analysis.prompt.ts#   情绪分析
│   │   │   │   ├── plan-generator.prompt.ts#  计划生成
│   │   │   │   ├── anxiety-advice.prompt.ts#  焦虑建议
│   │   │   │   └── interest-recommend.prompt.ts # 兴趣推荐
│   │   │   └── entities/
│   │   │       └── chat-message.entity.ts
│   │   │
│   │   ├── mood/                         # ── 心情记录 ──
│   │   │   ├── mood.module.ts
│   │   │   ├── mood.controller.ts
│   │   │   ├── mood.service.ts
│   │   │   ├── __test__/
│   │   │   ├── dto/
│   │   │   │   ├── create-mood-record.dto.ts
│   │   │   │   ├── update-mood-record.dto.ts
│   │   │   │   └── query-mood-range.dto.ts
│   │   │   └── entities/
│   │   │       ├── mood-record.entity.ts
│   │   │       └── mood-tag.entity.ts
│   │   │
│   │   ├── notification/                 # ── 通知模块 ──
│   │   │   ├── notification.module.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.gateway.ts   # SSE 推送
│   │   │   ├── __test__/
│   │   │   ├── dto/
│   │   │   │   ├── push-notification.dto.ts
│   │   │   │   └── update-notification.dto.ts
│   │   │   └── entities/
│   │   │       └── notification.entity.ts
│   │   │
│   │   ├── achievement/                  # ── 成就系统 ──
│   │   │   ├── achievement.module.ts
│   │   │   ├── achievement.controller.ts
│   │   │   ├── achievement.service.ts
│   │   │   ├── __test__/
│   │   │   ├── dto/
│   │   │   └── entities/
│   │   │       ├── achievement.entity.ts
│   │   │       └── user-achievement.entity.ts
│   │   │
│   │   └── analytics/                    # ── 数据分析 ──
│   │       ├── analytics.module.ts
│   │       ├── analytics.controller.ts   # 内部管理接口
│   │       ├── analytics.service.ts
│   │       ├── __test__/
│   │       └── events/
│   │           └── analytics.event.ts    # 埋点事件定义
│   │
│   ├── websocket/                        # WebSocket 基础设施
│   │   ├── ws.gateway.ts                 # 通用WebSocket网关
│   │   ├── ws.auth-middleware.ts         # WebSocket鉴权中间件
│   │   └── ws.adapter.ts                 # Redis适配器（多实例）
│   │
│   ├── database/                         # 数据库基础设施
│   │   ├── database.module.ts
│   │   ├── migrations/                   # TypeORM迁移文件
│   │   │   ├── 1700000000000-CreateUsers.ts
│   │   │   ├── 1700000000001-CreatePlans.ts
│   │   │   └── ...
│   │   ├── seeds/                        # 种子数据
│   │   │   ├── user.seed.ts
│   │   │   ├── interest-category.seed.ts
│   │   │   ├── anxiety-tag.seed.ts
│   │   │   └── achievement.seed.ts
│   │   └── subscribers/                  # 数据库事件订阅
│   │       └── entity.subscriber.ts
│   │
│   ├── queue/                            # 队列模块
│   │   ├── queue.module.ts
│   │   ├── queue.service.ts
│   │   └── processors/
│   │       ├── notification.processor.ts
│   │       └── analytics.processor.ts
│   │
│   └── health/                           # 健康检查
│       ├── health.module.ts
│       └── health.controller.ts
│
├── .env.example                          # 环境变量模板
├── .env.development                      # 开发环境变量
├── .env.production                       # 生产环境变量
├── .eslintrc.js                          # ESLint 配置
├── .prettierrc                           # Prettier 配置
├── .gitignore                            # Git 忽略规则
├── jest.config.ts                        # Jest 测试配置
├── tsconfig.json                         # TypeScript 配置
├── tsconfig.build.json                   # 构建 TypeScript 配置
├── nest-cli.json                         # NestJS CLI 配置
└── package.json                          # 依赖管理
```

### 1.2 NestJS 模块内部规范

每个业务模块遵循统一的内聚结构：

```
modules/xxx/
├── xxx.module.ts          # 模块定义：导入、导出、提供者注册
├── xxx.controller.ts      # 路由控制器：路由声明、参数校验
├── xxx.service.ts         # 业务服务：核心逻辑、事务管理
├── xxx.resolver.ts        # (可选) GraphQL 解析器
├── __test__/              # 模块级测试
│   ├── xxx.service.spec.ts
│   └── xxx.controller.spec.ts
├── dto/                   # 数据传输对象：请求/响应结构
│   ├── create-xxx.dto.ts
│   ├── update-xxx.dto.ts
│   └── query-xxx.dto.ts
├── entities/              # TypeORM实体：数据库表映射
│   └── xxx.entity.ts
├── interfaces/            # 内部接口
│   └── xxx-service.interface.ts
├── guards/                # 模块级守卫（可选）
├── pipes/                 # 模块级管道（可选）
└── filters/               # 模块级过滤器（可选）
```

---

## 2. 前端 Flutter 目录结构

### 2.1 整体结构

```
happy-every-day-app/
│
├── android/                              # Android 原生配置
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── res/
│   │       └── kotlin/
│   └── build.gradle
│
├── ios/                                  # iOS 原生配置
│   ├── Runner/
│   │   ├── Info.plist
│   │   └── AppDelegate.swift
│   └── Podfile
│
├── web/                                  # Web 平台配置
│   ├── index.html
│   ├── manifest.json
│   └── service_worker.js
│
├── assets/                               # 静态资源
│   ├── images/
│   │   ├── illustrations/                # 插画（反焦虑系列）
│   │   ├── icons/                        # 自定义图标
│   │   ├── backgrounds/                  # 背景图
│   │   └── emojis/                       # 心情表情
│   ├── fonts/                            # 自定义字体
│   │   ├── NotoSansSC/                   # 中文字体
│   │   └── Inter/                        # 英文字体
│   ├── animations/                       # Lottie动画
│   │   ├── happy/                        # 开心主题动画
│   │   ├── relax/                        # 放松主题动画
│   │   ├── loading/                      # 加载动画
│   │   ├── breathing/                    # 呼吸引导动画
│   │   └── celebration/                  # 庆祝动画
│   ├── l10n/                             # 本地化资源
│   │   ├── app_zh.arb                    # 中文
│   │   └── app_en.arb                    # 英文
│   └── json/                             # 静态JSON数据
│       ├── interest_categories.json      # 兴趣分类
│       └── breathing_exercises.json      # 呼吸练习
│
├── scripts/                              # 工具脚本
│   ├── gen_models.sh                     # 模型代码生成
│   ├── gen_routes.sh                     # 路由代码生成
│   └── gen_localizations.sh              # 本地化生成
│
├── test/                                 # 测试
│   ├── unit/                             # 单元测试
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── plan/
│   │   │   ├── ai/
│   │   │   └── ...
│   │   └── shared/
│   ├── widget_test/                      # Widget测试
│   │   ├── shared/
│   │   └── features/
│   └── integration_test/                 # 集成测试
│       └── app_test.dart
│
├── lib/                                  # 源代码主目录
│   ├── main.dart                         # 应用入口
│   ├── app.dart                          # MaterialApp + 路由配置
│   │
│   ├── core/                             # 核心基础设施
│   │   ├── config/                       #   配置
│   │   │   ├── app_config.dart           #     应用配置（环境）
│   │   │   ├── api_config.dart           #     API地址配置
│   │   │   ├── theme_config.dart         #     主题配置
│   │   │   └── feature_flags.dart        #     功能开关
│   │   │
│   │   ├── constants/                    #   常量
│   │   │   ├── app_colors.dart           #     配色体系
│   │   │   ├── app_text_styles.dart      #     文字样式
│   │   │   ├── app_spacing.dart          #     间距/尺寸常量
│   │   │   ├── app_durations.dart        #     动画时长
│   │   │   └── asset_paths.dart          #     资源路径
│   │   │
│   │   ├── theme/                        #   主题系统
│   │   │   ├── app_theme.dart            #     主主题（浅色）
│   │   │   ├── dark_theme.dart           #     暗黑模式
│   │   │   ├── app_colors.g.dart         #     颜色生成（自动化）
│   │   │   └── component_themes/         #     组件级主题
│   │   │       ├── card_theme.dart
│   │   │       ├── button_theme.dart
│   │   │       ├── input_theme.dart
│   │   │       └── chip_theme.dart
│   │   │
│   │   ├── network/                      #   网络层
│   │   │   ├── dio_client.dart           #     Dio实例创建
│   │   │   ├── api_interceptor.dart      #     请求/响应拦截
│   │   │   ├── auth_interceptor.dart     #     Token自动刷新
│   │   │   ├── retry_interceptor.dart    #     自动重试
│   │   │   ├── log_interceptor.dart      #     日志打印
│   │   │   ├── error_handler.dart        #     统一错误处理
│   │   │   ├── connectivity_handler.dart #     网络状态监听
│   │   │   └── api_response.dart         #     统一响应模型
│   │   │
│   │   ├── router/                       #   路由系统
│   │   │   ├── app_router.dart           #     GoRouter配置
│   │   │   ├── route_names.dart          #     路由名称常量
│   │   │   ├── route_paths.dart          #     路由路径常量
│   │   │   └── auth_guard.dart           #     路由鉴权守卫
│   │   │
│   │   ├── providers/                    #   全局Provider
│   │   │   ├── core_providers.dart       #     核心Provider集合
│   │   │   ├── dio_provider.dart         #     Dio实例Provider
│   │   │   ├── locale_provider.dart      #     国际化Provider
│   │   │   └── theme_provider.dart       #     主题状态Provider
│   │   │
│   │   ├── database/                     #   本地数据库
│   │   │   ├── local_database.dart       #     Hive/SQLite初始化
│   │   │   └── boxes/                    #     Hive Boxes
│   │   │       ├── auth_box.dart
│   │   │       ├── cache_box.dart
│   │   │       └── settings_box.dart
│   │   │
│   │   ├── services/                     #   平台服务
│   │   │   ├── push_service.dart         #     推送服务
│   │   │   ├── location_service.dart     #     定位服务
│   │   │   ├── storage_service.dart      #     本地存储
│   │   │   └── haptic_service.dart       #     触感反馈
│   │   │
│   │   ├── utils/                        #   工具函数
│   │   │   ├── date_utils.dart
│   │   │   ├── geo_utils.dart
│   │   │   ├── validators.dart
│   │   │   ├── debouncer.dart
│   │   │   ├── permission_utils.dart
│   │   │   ├── image_utils.dart
│   │   │   └── haptic_utils.dart
│   │   │
│   │   └── extensions/                   #   扩展方法
│   │       ├── context_ext.dart
│   │       ├── string_ext.dart
│   │       ├── datetime_ext.dart
│   │       └── num_ext.dart
│   │
│   ├── shared/                           # 共享层（通用组件）
│   │   ├── widgets/                      #   通用UI组件
│   │   │   ├── app_scaffold.dart         #     页面骨架
│   │   │   ├── app_bar.dart              #     顶部导航栏
│   │   │   ├── app_bottom_sheet.dart     #     底部弹窗
│   │   │   ├── app_card.dart             #     卡片组件
│   │   │   ├── app_button.dart           #     按钮体系
│   │   │   ├── app_text_field.dart       #     输入框
│   │   │   ├── app_avatar.dart           #     头像
│   │   │   ├── app_badge.dart            #     徽标
│   │   │   ├── app_dialog.dart           #     对话框
│   │   │   ├── app_snackbar.dart         #     提示条
│   │   │   ├── app_loading.dart          #     加载状态
│   │   │   ├── app_skeleton.dart         #     骨架屏
│   │   │   ├── app_empty_state.dart      #     空状态
│   │   │   ├── app_error_widget.dart     #     错误状态
│   │   │   ├── app_refresh_wrapper.dart  #     下拉刷新+加载更多
│   │   │   ├── app_chip.dart             #     标签
│   │   │   ├── app_tag.dart              #     标签（不可点击）
│   │   │   ├── app_divider.dart          #     分割线
│   │   │   ├── app_progress_bar.dart     #     进度条
│   │   │   ├── animated_transition.dart  #     页面过渡动画
│   │   │   ├── emotion_picker.dart       #     心情选择器
│   │   │   ├── gesture_tip.dart          #     手势提示
│   │   │   ├── safe_image.dart           #     安全图片加载
│   │   │   └── cached_network_image.dart #     缓存网络图片
│   │   │
│   │   └── animations/                   #   动画组件
│   │       ├── fade_slide_route.dart     #     页面切换动画
│   │       ├── lottie_widget.dart        #     Lottie封装
│   │       ├── shimmer_effect.dart       #     闪烁效果
│   │       ├── scale_on_tap.dart         #     点击缩放
│   │       └── confetti_effect.dart      #     彩纸庆祝
│   │
│   ├── features/                         # 业务功能模块
│   │   │
│   │   ├── splash/                       # ── 启动/引导页 ──
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── splash_page.dart
│   │   │   │   │   └── onboarding_page.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── onboarding_card.dart
│   │   │   │       ├── page_indicator.dart
│   │   │   │       └── interest_selector.dart  # 兴趣初始选择
│   │   │   └── providers/
│   │   │       └── splash_provider.dart
│   │   │
│   │   ├── auth/                         # ── 登录注册 ──
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── auth_remote_source.dart   # 远程数据源
│   │   │   │   │   └── auth_local_source.dart    # 本地Token存储
│   │   │   │   ├── models/
│   │   │   │   │   ├── user_model.dart
│   │   │   │   │   ├── login_request.dart
│   │   │   │   │   ├── register_request.dart
│   │   │   │   │   └── token_response.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart  # 抽象接口
│   │   │   │   └── usecases/
│   │   │   │       ├── login_usecase.dart
│   │   │   │       ├── register_usecase.dart
│   │   │   │       └── logout_usecase.dart
│   │   │   └── presentation/
│   │   │       ├── pages/
│   │   │       │   ├── login_page.dart
│   │   │       │   ├── register_page.dart
│   │   │       │   └── forgot_password_page.dart
│   │   │       ├── widgets/
│   │   │       │   ├── login_form.dart
│   │   │       │   ├── register_form.dart
│   │   │       │   ├── social_login_buttons.dart
│   │   │       │   └── auth_divider.dart
│   │   │       └── providers/
│   │   │           ├── auth_provider.dart
│   │   │           └── auth_state.dart
│   │   │
│   │   ├── home/                         # ── 首页（今日开心计划） ──
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   └── plan_remote_source.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── daily_plan_model.dart
│   │   │   │   │   └── plan_task_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── plan_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── daily_plan.dart
│   │   │   │   │   └── plan_task.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── plan_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── get_daily_plan.dart
│   │   │   │       ├── complete_task.dart
│   │   │   │       ├── generate_ai_plan.dart
│   │   │   │       └── reorder_tasks.dart
│   │   │   └── presentation/
│   │   │       ├── pages/
│   │   │       │   ├── home_page.dart
│   │   │       │   ├── plan_detail_page.dart
│   │   │       │   └── plan_generate_page.dart
│   │   │       ├── widgets/
│   │   │       │   ├── daily_greeting.dart
│   │   │       │   ├