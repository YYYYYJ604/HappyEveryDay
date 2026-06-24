# Flutter 前端项目目录结构

> 框架：Flutter 3.41 + Dart  
> 状态管理：Riverpod 2.x  
> 路由：GoRouter 14.x  

---

## 根目录概览

```
happy-every-day-app/                  # Flutter 前端项目根目录
├── .dart_tool/                       # Dart 工具缓存
├── .idea/                            # IDE 配置
├── android/                          # Android 原生平台代码
├── ios/                              # iOS 原生平台代码
├── web/                              # Web 平台代码
├── assets/                           # 静态资源
├── lib/                              # Dart 源码主目录
├── test/                             # 测试代码
├── .dart_tool/                       # Dart 分析器配置
├── .flutter-plugins                  # Flutter 插件列表
├── .metadata                         # Flutter 元数据
├── analysis_options.yaml             # Dart 静态分析规则
├── pubspec.yaml                      # 依赖管理
├── pubspec.lock                      # 依赖锁定文件
└── README.md                         # 项目说明
```

---

## `lib/` 源码目录结构（核心）

```
lib/
├── main.dart                          # 应用入口
├── app.dart                           # 应用根组件 (MaterialApp.router)
│
├── core/                              # 核心基础设施
│   ├── config/                        # 应用配置
│   │   ├── app_config.dart            # 全局配置常量
│   │   ├── env_config.dart            # 环境配置 (dev/test/prod)
│   │   ├── theme_config.dart          # 主题配置
│   │   └── api_config.dart            # API 地址与密钥配置
│   │
│   ├── constants/                     # 常量定义
│   │   ├── app_constants.dart         # 应用级常量
│   │   ├── api_constants.dart         # API 常量
│   │   ├── ui_constants.dart          # UI 常量 (间距/字号/颜色)
│   │   └── storage_keys.dart          # 本地存储 Key
│   │
│   ├── theme/                         # 主题系统
│   │   ├── app_theme.dart             # 主主题定义
│   │   ├── app_colors.dart            # 色彩系统
│   │   ├── app_typography.dart        # 字体排版
│   │   ├── app_spacing.dart           # 间距系统
│   │   └── app_decoration.dart        # 装饰样式
│   │
│   ├── network/                       # 网络层
│   │   ├── dio_client.dart            # Dio 实例工厂
│   │   ├── api_interceptor.dart       # 拦截器 (鉴权/日志/重试)
│   │   ├── api_exceptions.dart        # 异常定义
│   │   ├── api_response.dart          # 统一响应模型
│   │   └── api_endpoints.dart         # 接口端点枚举
│   │
│   ├── router/                        # 路由系统
│   │   ├── app_router.dart            # GoRouter 路由定义
│   │   ├── route_names.dart           # 路由名称常量
│   │   └── route_guards.dart          # 路由守卫 (鉴权检查)
│   │
│   ├── storage/                       # 本地存储
│   │   ├── secure_storage.dart        # 安全存储 (Token/密码)
│   │   ├── local_storage.dart         # 本地存储封装 (SharedPreferences)
│   │   └── cache_manager.dart         # 缓存管理器
│   │
│   ├── utils/                         # 工具类
│   │   ├── date_utils.dart            # 日期工具
│   │   ├── validator_utils.dart       # 输入校验工具
│   │   ├── format_utils.dart          # 格式化工具
│   │   ├── file_utils.dart            # 文件处理工具
│   │   └── permission_utils.dart      # 权限管理工具
│   │
│   ├── extensions/                    # Dart 扩展方法
│   │   ├── context_extensions.dart    # BuildContext 扩展
│   │   ├── string_extensions.dart     # String 扩展
│   │   ├── datetime_extensions.dart   # DateTime 扩展
│   │   └── num_extensions.dart        # 数字扩展
│   │
│   └── widgets/                       # 全局通用组件
│       ├── app_button.dart            # 按钮组件
│       ├── app_text_field.dart        # 输入框组件
│       ├── app_loading.dart           # 加载指示器
│       ├── app_empty_state.dart       # 空状态占位
│       ├── app_error_widget.dart      # 错误展示组件
│       ├── app_avatar.dart            # 头像组件
│       ├── app_badge.dart             # 徽标组件
│       ├── app_snackbar.dart          # 提示条组件
│       └── app_dialog.dart            # 弹窗组件
│
├── shared/                            # 共享层 (跨模块复用)
│   ├── models/                        # 共享数据模型
│   │   ├── user_model.dart            # 用户模型
│   │   ├── pagination_model.dart      # 分页模型
│   │   └── api_error_model.dart       # 错误模型
│   │
│   ├── providers/                     # 共享状态
│   │   ├── auth_provider.dart         # 认证状态
│   │   ├── theme_provider.dart        # 主题状态
│   │   └── locale_provider.dart       # 语言状态
│   │
│   └── enums/                         # 共享枚举
│       ├── user_role.dart             # 用户角色枚举
│       ├── plan_status.dart           # 计划状态枚举
│       └── mood_type.dart             # 情绪类型枚举
│
├── features/                          # 业务功能模块 (Feature-First)
│   │
│   ├── auth/                          # 1. 认证模块
│   │   ├── data/                      #   数据层
│   │   │   ├── auth_repository.dart   #     认证仓库
│   │   │   └── auth_api.dart          #     认证 API
│   │   ├── domain/                    #   领域层
│   │   │   └── auth_service.dart      #     认证业务逻辑
│   │   ├── presentation/             #   表现层
│   │   │   ├── providers/            #     状态管理
│   │   │   │   └── auth_provider.dart
│   │   │   ├── pages/                #     页面
│   │   │   │   ├── login_page.dart
│   │   │   │   ├── register_page.dart
│   │   │   │   └── phone_verify_page.dart
│   │   │   └── widgets/              #     组件
│   │   │       ├── login_form.dart
│   │   │       ├── register_form.dart
│   │   │       ├── phone_input_field.dart
│   │   │       └── verification_code_field.dart
│   │   └── models/                    #   数据模型
│   │       ├── login_request.dart
│   │       ├── register_request.dart
│   │       └── auth_token_model.dart
│   │
│   ├── home/                          # 2. 首页模块
│   │   ├── data/
│   │   │   └── home_repository.dart
│   │   ├── presentation/
│   │   │   ├── providers/
│   │   │   │   └── home_provider.dart
│   │   │   ├── pages/
│   │   │   │   └── home_page.dart
│   │   │   └── widgets/
│   │   │       ├── daily_quote_card.dart
│   │   │       ├── quick_action_grid.dart
│   │   │       ├── mood_checkin_card.dart
│   │   │       └── recommended_plans.dart
│   │   └── models/
│   │       └── home_data_model.dart
│   │
│   ├── plan/                          # 3. 开心计划模块
│   │   ├── data/
│   │   │   ├── plan_repository.dart
│   │   │   └── plan_api.dart
│   │   ├── domain/
│   │   │   └── plan_service.dart
│   │   ├── presentation/
│   │   │   ├── providers/
│   │   │   │   ├── plan_list_provider.dart
│   │   │   │   ├── plan_detail_provider.dart
│   │   │   │   └── plan_create_provider.dart
│   │   │   ├── pages/
│   │   │   │   ├── plan_list_page.dart
│   │   │   │   ├── plan_detail_page.dart
│   │   │   │   ├── plan_create_page.dart
│   │   │   │   └── plan_edit_page.dart
│   │   │   └── widgets/
│   │   │       ├── plan_card.dart
│   │   │       ├── plan_timeline.dart
│   │   │       ├── plan_progress_bar.dart
│   │   │       ├── plan_check_item.dart
│   │   │       └── plan_category_picker.dart
│   │   └── models/
│   │       ├── plan_model.dart
│   │       ├── plan_step_model.dart
│   │       └── plan_category_model.dart
│   │
│   ├── anxiety_center/               # 4. 反焦虑中心模块
│   │   ├── data/
│   │   │   ├── anxiety_repository.dart
│   │   │   └── anxiety_api.dart
│   │   ├── domain/
│   │   │   └── anxiety_service.dart
│   │   ├── presentation/
│   │   │   ├── providers/
│   │   │   │   ├── anxiety_list_provider.dart
│   │   │   │   └── anxiety_post_provider.dart
│   │   │   ├── pages/
│   │   │   │   ├── anxiety_feed_page.dart
│   │   │   │   ├── anxiety_post_detail_page.dart
│   │   │   │   ├── anxiety_create_post_page.dart
│   │   │   │   └── anxiety_category_page.dart
│   │   │   └── widgets/
│   │   │       ├── anxiety_post_card.dart
│   │   │       ├── anxiety_post_actions.dart
│   │   │       ├── comment_section.dart
│   │   │       └── tag_chips.dart
│   │   └── models/
│   │       ├── post_model.dart
│   │       ├── comment_model.dart
│   │       └── tag_model.dart
│   │
│   ├── mood/                          # 5. 情绪日记模块
│   │   ├── data/
│   │   │   ├── mood_repository.dart
│   │   │   └── mood_api.dart
│   │   ├── domain/
│   │   │   └── mood_service.dart
│   │   ├── presentation/
│   │   │   ├── providers/
│   │   │   │   ├── mood_provider.dart
│   │   │   │   └── mood_chart_provider.dart
│   │   │   ├── pages/
│   │   │   │   ├── mood_checkin_page.dart
│   │   │   │   ├── mood_history_page.dart
│   │   │   │   └── mood_statistics_page.dart
│   │   │   └── widgets/
│   │   │       ├── mood_selector.dart
│   │   │       ├── mood_calendar.dart
│   │   │       ├── mood_chart.dart
│   │   │       └── mood_journal_input.dart
│   │   └── models/
│   │       ├── mood_record_model.dart
│   │       └── mood_statistics_model.dart
│   │
│   ├── ai_chat/                       # 6. AI 陪伴对话模块
│   │   ├── data/
│   │   │   ├── chat_repository.dart
│   │   │   ├── chat_api.dart           # REST API
│   │   │   └── chat_websocket.dart     # WebSocket 连接
│   │   ├── domain/
│   │   │   └── chat_service.dart
│   │   ├── presentation/
│   │   │   ├── providers/
│   │   │   │   ├── chat_provider.dart
│   │   │   │   └── chat_session_provider.dart
│   │   │   ├── pages/
│   │   │   │   ├── chat_list_page.dart
│   │   │   │   └── chat_detail_page.dart
│   │   │   └── widgets/
│   │   │       ├── chat_bubble.dart
│   │   │       ├── chat_input_bar.dart
│   │   │       ├── emotion_indicator.dart
│   │   │       └── typing_indicator.dart
│   │   └── models/
│   │       ├── chat_message_model.dart
│   │       └── chat_session_model.dart
│   │
│   ├── discovery/                     # 7. 发现模块
│   │   ├── data/
│   │   │   └── discovery_repository.dart
│   │   ├── presentation/
│   │   │   ├── providers/
│   │   │   │   └── discovery_provider.dart
│   │   │   ├── pages/
│   │   │   │   ├── discovery_page.dart
│   │   │   │   ├── article_detail_page.dart
│   │   │   │   └── activity_detail_page.dart
│   │   │   └── widgets/
│   │   │       ├── article_card.dart
│   │   │       ├── activity_card.dart
│   │   │       ├── resource_category.dart
│   │   │       └── search_bar.dart
│   │   └── models/
│   │       ├── article_model.dart
│   │       └── activity_model.dart
│   │
│   ├── profile/                       # 8. 个人中心模块
│   │   ├── data/
│   │   │   ├── profile_repository.dart
│   │   │   └── profile_api.dart
│   │   ├── presentation/
│   │   │   ├── providers/
│   │   │   │   ├── profile_provider.dart
│   │   │   │   └── settings_provider.dart
│   │   │   ├── pages/
│   │   │   │   ├── profile_page.dart
│   │   │   │   ├── edit_profile_page.dart
│   │   │   │   ├── settings_page.dart
│   │   │   │   ├── privacy_page.dart
│   │   │   │   └── about_page.dart
│   │   │   └── widgets/
│   │   │       ├── profile_header.dart
│   │   │       ├── stats_card.dart
│   │   │       ├── achievement_list.dart
│   │   │       └── settings_tile.dart
│   │   └── models/
│   │       ├── profile_model.dart
│   │       ├── achievement_model.dart
│   │       └── stats_model.dart
│   │
│   └── notification/                 # 9. 通知模块
│       ├── data/
│       │   ├── notification_repository.dart
│       │   └── notification_api.dart
│       ├── presentation/
│       │   ├── providers/
│       │   │   └── notification_provider.dart
│       │   ├── pages/
│       │   │   └── notification_page.dart
│       │   └── widgets/
│       │       ├── notification_card.dart
│       │       └── notification_badge.dart
│       └── models/
│           └── notification_model.dart
│
└── l10n/                              # 国际化
    ├── app_zh.arb                     # 中文资源
    ├── app_en.arb                     # 英文资源
    └── l10n.dart                      # 生成的本地化类
```

---

## `assets/` 资源目录结构

```
assets/
├── images/                            # 图片资源
│   ├── logo/                          # 品牌 Logo
│   │   ├── logo.png
│   │   ├── logo_dark.png
│   │   └── logo_light.png
│   ├── icons/                         # 自定义图标
│   │   ├── emotion/                   # 情绪图标系列
│   │   ├── plan_category/             # 计划分类图标
│   │   └── tab_bar/                   # 底部导航图标
│   ├── illustrations/                 # 插画
│   │   ├── empty_state/               # 空状态插画
│   │   ├── onboarding/               # 引导页插画
│   │   └── celebration/              # 庆祝动画插画
│   └── backgrounds/                   # 背景图
│       ├── splash_bg.png
│       └── chat_bg.png
│
├── fonts/                             # 自定义字体
│   ├── NotoSansSC-Regular.ttf
│   ├── NotoSansSC-Medium.ttf
│   └── NotoSansSC-Bold.ttf
│
├── animations/                        # Lottie 动画
│   ├── loading.json
│   ├── celebrate.json
│   ├── mood_happy.json
│   ├── mood_sad.json
│   └── breathing.json
│
├── sounds/                            # 音效
│   ├── notification.mp3
│   ├── chat_send.mp3
│   └── timer_alarm.mp3
│
├── json/                              # 本地 JSON 数据
│   ├── quotes.json                    # 每日语录
│   ├── encouragement.json             # 鼓励语库
│   └── onboarding.json               # 引导页数据
│
└── certificates/                      # 证书文件
    └── lets_encrypt_ca.pem
```

---

## `test/` 测试目录结构

```
test/
├── unit/                              # 单元测试
│   ├── core/                          # 核心层测试
│   │   ├── utils/
│   │   │   ├── date_utils_test.dart
│   │   │   └── validator_utils_test.dart
│   │   └── network/
│   │       └── api_interceptor_test.dart
│   │
│   └── features/                      # 功能模块测试
│       ├── auth/
│       │   └── auth_provider_test.dart
│       ├── plan/
│       │   └── plan_service_test.dart
│       └── mood/
│           └── mood_service_test.dart
│
├── widget/                            # Widget 测试
│   ├── core/
│   │   ├── app_button_test.dart
│   │   └── app_text_field_test.dart
│   └── features/
│       ├── auth/
│       │   └── login_form_test.dart
│       ├── plan/
│       │   └── plan_card_test.dart
│       └── chat/
│           └── chat_bubble_test.dart
│
├── integration/                       # 集成测试
│   ├── auth_flow_test.dart
│   ├── plan_creation_flow_test.dart
│   └── chat_session_flow_test.dart
│
├── mocks/                             # Mock 数据
│   ├── mock_auth.dart
│   ├── mock_plan.dart
│   ├── mock_mood.dart
│   └── mock_chat.dart
│
└── test_helper.dart                   # 测试辅助工具
```

---

## 关键文件说明

| 文件 | 作用 |
|------|------|
| `main.dart` | 应用入口，初始化 Flutter Binding、ProviderScope、路由 |
| `app.dart` | 根 Widget，配置 MultiProvider、MaterialApp.router、主题 |
| `core/network/dio_client.dart` | Dio 单例工厂，配置超时/拦截器/BaseURL |
| `core/router/app_router.dart` | GoRouter 声明式路由，定义 ShellRoute 实现底部导航嵌套 |
| `shared/providers/auth_provider.dart` | 全局认证状态，控制登录/未登录路由切换 |

---

## 架构模式说明 (Feature-First)

```
lib/
├── core/          → 通用基础设施（主题/网络/路由/工具）
├── shared/        → 跨模块共享（模型/状态/枚举）
└── features/      → 按业务域拆分的功能模块
    └── [feature]/
        ├── data/         → 数据源（API/仓储实现）
        ├── domain/       → 业务逻辑（Service）
        ├── presentation/ → UI（Page/Widget/Provider）
        └── models/       → 该模块的数据模型
```

**依赖规则**: `presentation → domain → data`  
**禁止**: 跨模块直接引用另一个模块的具体实现（可通过 shared 层共享）
