# 数据库架构设计

> 数据库：PostgreSQL 16 + pgvector  
> ORM：Prisma (TypeScript) / TypeORM  
> 缓存：Redis 7  

---

## 1. 数据库总览 E-R 关系图

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│    User     │───▶│  Plan        │◀───│ PlanCategory │
└─────────────┘    └──────┬───────┘    └─────────────┘
       │                  │
       │                  ▼
       │           ┌──────────────┐
       ├──────────▶│  PlanStep    │
       │           └──────────────┘
       │
       │           ┌──────────────┐
       ├──────────▶│  MoodRecord  │
       │           └──────────────┘
       │
       │           ┌──────────────┐
       ├──────────▶│  Post        │────▶ PostTag
       │           └──────┬───────┘
       │                  │
       │           ┌──────▼───────┐
       │           │  PostComment │
       │           └──────────────┘
       │
       │           ┌──────────────┐
       ├──────────▶│  ChatSession │────▶ ChatMessage
       │           └──────────────┘
       │
       │           ┌──────────────┐
       ├──────────▶│  Notification│
       │           └──────────────┘
       │
       │           ┌──────────────┐
       └──────────▶│  UserAchieve │
                    └──────────────┘
```

---

## 2. 核心数据表设计

### 2.1 用户表 (users)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 用户 ID |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | 手机号 |
| nickname | VARCHAR(50) | NOT NULL | 昵称 |
| avatar_url | VARCHAR(500) | NULL | 头像 URL |
| bio | VARCHAR(200) | DEFAULT '' | 个人简介 |
| gender | SMALLINT | DEFAULT 0 | 性别: 0=保密, 1=男, 2=女 |
| birthday | DATE | NULL | 生日 |
| role | VARCHAR(20) | DEFAULT 'user' | 角色: user/admin |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| refresh_token | VARCHAR(500) | NULL | 刷新令牌 |
| last_login_at | TIMESTAMPTZ | NULL | 最后登录时间 |
| is_active | BOOLEAN | DEFAULT true | 是否激活 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |
| deleted_at | TIMESTAMPTZ | NULL | 软删除时间 |

**索引**:
- `idx_users_phone` ON phone (UNIQUE)
- `idx_users_nickname` ON nickname
- `idx_users_created_at` ON created_at DESC

---

### 2.2 用户档案表 (user_profiles)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 档案 ID |
| user_id | UUID | FK → users.id, UNIQUE | 关联用户 |
| mood_reminder_time | TIME | NULL | 情绪打卡提醒时间 |
| daily_plan_limit | INT | DEFAULT 5 | 每日计划上限 |
| theme_preference | VARCHAR(20) | DEFAULT 'light' | 主题偏好 |
| language | VARCHAR(10) | DEFAULT 'zh' | 语言偏好 |
| notification_enabled | BOOLEAN | DEFAULT true | 通知开关 |
| privacy_level | SMALLINT | DEFAULT 1 | 隐私等级: 1=公开, 2=好友, 3=私密 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

---

### 2.3 计划分类表 (plan_categories)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 分类 ID |
| name | VARCHAR(50) | NOT NULL | 分类名称 |
| icon | VARCHAR(100) | NULL | 图标标识 |
| color | VARCHAR(7) | NULL | 颜色 (#RRGGBB) |
| sort_order | INT | DEFAULT 0 | 排序顺序 |
| is_system | BOOLEAN | DEFAULT false | 是否系统预设 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**初始数据**: 运动健身、学习成长、社交连接、自我关怀、创意表达、户外自然、心灵修行、生活习惯

---

### 2.4 开心计划表 (plans)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 计划 ID |
| user_id | UUID | FK → users.id, NOT NULL | 创建者 |
| category_id | UUID | FK → plan_categories.id | 分类 |
| title | VARCHAR(100) | NOT NULL | 计划标题 |
| description | TEXT | NULL | 计划描述 |
| status | VARCHAR(20) | DEFAULT 'active' | 状态: active/completed/archived |
| priority | SMALLINT | DEFAULT 0 | 优先级: 0=普通, 1=重要, 2=紧急 |
| start_date | DATE | NOT NULL | 开始日期 |
| end_date | DATE | NULL | 目标完成日期 |
| is_recurring | BOOLEAN | DEFAULT false | 是否循环 |
| recurring_rule | VARCHAR(50) | NULL | 循环规则 (cron 表达式) |
| progress | SMALLINT | DEFAULT 0 | 进度百分比 0-100 |
| is_public | BOOLEAN | DEFAULT false | 是否公开 |
| view_count | INT | DEFAULT 0 | 浏览次数 |
| completed_at | TIMESTAMPTZ | NULL | 完成时间 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |
| deleted_at | TIMESTAMPTZ | NULL | 软删除时间 |

**索引**:
- `idx_plans_user_id` ON user_id
- `idx_plans_status` ON status
- `idx_plans_category` ON category_id
- `idx_plans_date` ON start_date, end_date

---

### 2.5 计划步骤表 (plan_steps)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 步骤 ID |
| plan_id | UUID | FK → plans.id, NOT NULL | 所属计划 |
| title | VARCHAR(200) | NOT NULL | 步骤内容 |
| sort_order | INT | NOT NULL | 排序序号 |
| is_completed | BOOLEAN | DEFAULT false | 是否完成 |
| completed_at | TIMESTAMPTZ | NULL | 完成时间 |
| estimated_duration | INT | NULL | 预计耗时(分钟) |
| notes | TEXT | NULL | 备注 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_plan_steps_plan_id` ON plan_id
- `idx_plan_steps_sort` ON plan_id, sort_order

---

### 2.6 情绪记录表 (mood_records)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 记录 ID |
| user_id | UUID | FK → users.id, NOT NULL | 用户 ID |
| mood_type | VARCHAR(20) | NOT NULL | 情绪类型: happy/sad/anxious/calm/angry/excited/tired/neutral |
| intensity | SMALLINT | NOT NULL, CHECK(1-10) | 情绪强度 1-10 |
| journal | TEXT | NULL | 情绪日记内容 |
| tags | TEXT[] | NULL | 情绪标签数组 |
| factors | TEXT[] | NULL | 影响因素数组 |
| energy_level | SMALLINT | NULL, CHECK(1-10) | 精力水平 |
| sleep_hours | DECIMAL(3,1) | NULL | 睡眠时长 |
| record_date | DATE | NOT NULL | 记录日期 |
| record_time | TIME | NOT NULL | 记录时间点 |
| latitude | DECIMAL(10,7) | NULL | 记录位置纬度 |
| longitude | DECIMAL(10,7) | NULL | 记录位置经度 |
| weather | VARCHAR(20) | NULL | 天气状况 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**索引**:
- `idx_mood_user_date` ON user_id, record_date DESC
- `idx_mood_type` ON mood_type
- `idx_mood_created` ON created_at DESC
- **复合索引**: `idx_mood_user_time` ON user_id, record_date, record_time

---

### 2.7 帖子表 (posts) — 反焦虑中心

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 帖子 ID |
| user_id | UUID | FK → users.id, NOT NULL | 发帖人 |
| title | VARCHAR(200) | NULL | 帖子标题 |
| content | TEXT | NOT NULL | 帖子内容 |
| type | VARCHAR(20) | DEFAULT 'vent' | 类型: vent/success/advice/question/share |
| is_anonymous | BOOLEAN | DEFAULT false | 是否匿名 |
| tags | TEXT[] | NULL | 标签数组 |
| images | TEXT[] | NULL | 图片 URL 数组 |
| like_count | INT | DEFAULT 0 | 点赞数 |
| comment_count | INT | DEFAULT 0 | 评论数 |
| bookmark_count | INT | DEFAULT 0 | 收藏数 |
| view_count | INT | DEFAULT 0 | 浏览数 |
| is_pinned | BOOLEAN | DEFAULT false | 是否置顶 |
| is_essence | BOOLEAN | DEFAULT false | 是否精华 |
| status | VARCHAR(20) | DEFAULT 'published' | 状态: draft/published/reported/blocked |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |
| deleted_at | TIMESTAMPTZ | NULL | 软删除时间 |

**索引**:
- `idx_posts_user_id` ON user_id
- `idx_posts_type` ON type
- `idx_posts_created` ON created_at DESC
- `idx_posts_hot` ON like_count DESC, comment_count DESC
- **全文索引**: `idx_posts_search` ON content (GIN tsvector)

---

### 2.8 帖子弹幕/评论表 (post_comments)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 评论 ID |
| post_id | UUID | FK → posts.id, NOT NULL | 所属帖子 |
| user_id | UUID | FK → users.id, NOT NULL | 评论者 |
| parent_id | UUID | FK → post_comments.id, NULL | 父评论（回复） |
| content | TEXT | NOT NULL | 评论内容 |
| like_count | INT | DEFAULT 0 | 点赞数 |
| is_anonymous | BOOLEAN | DEFAULT false | 是否匿名 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| deleted_at | TIMESTAMPTZ | NULL | 软删除时间 |

**索引**:
- `idx_comments_post_id` ON post_id, created_at
- `idx_comments_user_id` ON user_id

---

### 2.9 帖子互动表

**post_likes** (点赞)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | 点赞者 |
| post_id | UUID | FK → posts.id | 被点赞帖子 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| **UNIQUE(user_id, post_id)** | | | 防止重复点赞 |

**post_bookmarks** (收藏)
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| post_id | UUID | FK → posts.id | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| **UNIQUE(user_id, post_id)** | | | |

---

### 2.10 帖子标签表 (tags)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 标签名 |
| color | VARCHAR(7) | NULL | 标签颜色 |
| usage_count | INT | DEFAULT 0 | 使用次数 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**多对多关联表**: `post_tags`
| 字段名 | 类型 | 约束 |
|--------|------|------|
| post_id | UUID | FK → posts.id |
| tag_id | UUID | FK → tags.id |
| **PRIMARY KEY(post_id, tag_id)** | | |

---

### 2.11 AI 对话会话表 (chat_sessions)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 会话 ID |
| user_id | UUID | FK → users.id, NOT NULL | 用户 |
| title | VARCHAR(100) | NULL | 会话标题 |
| topic | VARCHAR(50) | NULL | 会话主题 |
| mood_summary | VARCHAR(100) | NULL | 情绪摘要 |
| message_count | INT | DEFAULT 0 | 消息数 |
| is_active | BOOLEAN | DEFAULT true | 是否活跃 |
| last_message_at | TIMESTAMPTZ | NULL | 最后消息时间 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |
| deleted_at | TIMESTAMPTZ | NULL | 软删除时间 |

**索引**:
- `idx_chat_sessions_user` ON user_id, last_message_at DESC

---

### 2.12 对话消息表 (chat_messages)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 消息 ID |
| session_id | UUID | FK → chat_sessions.id, NOT NULL | 所属会话 |
| role | VARCHAR(20) | NOT NULL | 角色: user/assistant/system |
| content | TEXT | NOT NULL | 消息内容 |
| content_type | VARCHAR(20) | DEFAULT 'text' | 内容类型: text/image/audio |
| metadata | JSONB | NULL | 额外元数据（情绪分析等） |
| emotion_detected | VARCHAR(20) | NULL | AI 检测到的情绪 |
| tokens_used | INT | NULL | Token 消耗数 |
| model | VARCHAR(50) | NULL | AI 模型名称 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**索引**:
- `idx_chat_messages_session` ON session_id, created_at ASC
- `idx_chat_messages_created` ON created_at DESC

---

### 2.13 通知表 (notifications)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id, NOT NULL | 接收用户 |
| type | VARCHAR(30) | NOT NULL | 类型: like/comment/follow/system/reminder/achievement |
| title | VARCHAR(100) | NOT NULL | 通知标题 |
| body | TEXT | NULL | 通知内容 |
| data | JSONB | NULL | 附加数据 |
| reference_id | UUID | NULL | 关联业务 ID |
| reference_type | VARCHAR(30) | NULL | 关联类型 |
| is_read | BOOLEAN | DEFAULT false | 是否已读 |
| is_clicked | BOOLEAN | DEFAULT false | 是否已点击 |
| push_sent | BOOLEAN | DEFAULT false | 推送是否发送 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

**索引**:
- `idx_notifications_user` ON user_id, is_read, created_at DESC
- `idx_notifications_type` ON type

---

### 2.14 用户成就表 (user_achievements)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | |
| user_id | UUID | FK → users.id | |
| achievement_key | VARCHAR(50) | NOT NULL | 成就标识 |
| title | VARCHAR(100) | NOT NULL | 成就名称 |
| description | TEXT | NULL | 成就描述 |
| icon_url | VARCHAR(500) | NULL | 图标 |
| unlocked_at | TIMESTAMPTZ | DEFAULT NOW() | 解锁时间 |
| **UNIQUE(user_id, achievement_key)** | | | |

**成就示例**: `first_plan_completed`, `mood_30_days`, `first_post`, `chat_100_messages`

---

### 2.15 内容管理表

**articles** （文章）
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | |
| title | VARCHAR(200) | NOT NULL | 文章标题 |
| summary | VARCHAR(500) | NULL | 摘要 |
| content | TEXT | NOT NULL | Markdown 内容 |
| cover_image | VARCHAR(500) | NULL | 封面图 |
| category | VARCHAR(50) | NOT NULL | 分类 |
| tags | TEXT[] | NULL | 标签 |
| author | VARCHAR(100) | NULL | 作者 |
| read_count | INT | DEFAULT 0 | 阅读数 |
| is_published | BOOLEAN | DEFAULT false | 是否发布 |
| published_at | TIMESTAMPTZ | NULL | 发布时间 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

**daily_quotes** （每日语录）
| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | |
| content | TEXT | NOT NULL | 语录内容 |
| author | VARCHAR(100) | NULL | 作者 |
| source | VARCHAR(100) | NULL | 来源 |
| category | VARCHAR(30) | NULL | 分类 |
| is_active | BOOLEAN | DEFAULT true | |
| display_date | DATE | NULL | 指定展示日期 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## 3. Redis 缓存设计

### 3.1 缓存键命名规范

```
happy:              # 应用前缀
├── session:{id}    # 用户会话
├── token:blacklist:{jti}  # Token 黑名单
├── cache:          # 数据缓存
│   ├── user:{id}
│   ├── plan:{id}
│   ├── post:{id}
│   └── mood:stats:{userId}:{date}
├── rate:limit:{ip} # 速率限制
├── queue:          # BullMQ 队列前缀
├── ws:connections  # WebSocket 连接状态
└── lock:{resource} # 分布式锁
```

### 3.2 缓存策略

| 数据 | TTL | 策略 |
|------|-----|------|
| 用户信息 | 1h | 写入时更新 |
| 计划详情 | 30min | 修改时失效 |
| 帖子列表 | 5min | 发布时失效 |
| 情绪统计 | 10min | 记录时失效 |
| 每日语录 | 24h | 零点刷新 |
| 热门帖子 | 1min | 定时刷新 |
| 验证码 | 5min | 一次性消费 |

---

## 4. 数据归档与清理策略

| 表名 | 保留期限 | 清理策略 |
|------|----------|----------|
| mood_records | 永久 | 保留所有历史记录 |
| chat_messages | 1年 | 超过1年的消息归档到冷存储 |
| notifications | 3个月 | 已读超过3个月自动删除 |
| chat_sessions | 6个月 | 非活跃会话软删除后清理 |
| logs | 30天 | 定期轮转清理 |
| soft_deleted 数据 | 30天 | 软删除后30天物理删除 |

---

## 5. 数据库索引优化方向

1. **复合索引优先**: 按查询模式建立联合索引（如 `user_id + created_at`）
2. **部分索引**: `WHERE deleted_at IS NULL` 过滤软删除数据
3. **覆盖索引**: 高频查询字段全部包含在索引中，避免回表
4. **GIN 索引**: tags/jsonb 字段使用 GIN 索引
5. **全文搜索**: 帖子内容字段建立 `tsvector` 索引
6. **pgvector**: 后续如果需要 AI 语义搜索，启用 pgvector 扩展

---

## 6. 数据库初始化 SQL 脚本结构

```sql
-- 001_init_tables.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ... 所有 CREATE TABLE 语句

-- 002_create_indexes.sql
-- ... 所有 CREATE INDEX 语句

-- 003_seed_data.sql
-- ... 初始数据插入

-- 004_create_triggers.sql
-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;$$ language 'plpgsql';

-- 为所有有 updated_at 的表创建触发器
```
