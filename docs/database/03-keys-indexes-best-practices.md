# 主键设计 · 外键设计 · 索引设计 · PostgreSQL 最佳实践

---

## 1. 主键设计

### 1.1 主键策略选择

| 策略 | 选择 | 理由 |
|-----|-----|-----|
| 类型 | UUID v4（随机UUID） | 分布式友好，避免自增ID暴露业务量 |
| 生成 | gen_random_uuid() | PostgreSQL 内置高性能 UUID 生成 |
| 存储 | 16 bytes (UUID 类型) | 比 VARCHAR(36) 省一半空间 |

### 1.2 所有表主键定义

| 表名 | 主键字段 | 类型 | 默认值 |
|-----|---------|-----|-------|
| users | id | UUID | gen_random_uuid() |
| user_profiles | id | UUID | gen_random_uuid() |
| user_follows | id | UUID | gen_random_uuid() |
| user_onboarding | id | UUID | gen_random_uuid() |
| plan_categories | id | UUID | gen_random_uuid() |
| plans | id | UUID | gen_random_uuid() |
| plan_steps | id | UUID | gen_random_uuid() |
| plan_daily_logs | id | UUID | gen_random_uuid() |
| posts | id | UUID | gen_random_uuid() |
| post_comments | id | UUID | gen_random_uuid() |
| post_likes | id | UUID | gen_random_uuid() |
| tags | id | UUID | gen_random_uuid() |
| post_tags | (post_id, tag_id) | 复合主键 | - |
| interests | id | UUID | gen_random_uuid() |
| user_interests | id | UUID | gen_random_uuid() |
| interest_activities | id | UUID | gen_random_uuid() |
| activity_checkins | id | UUID | gen_random_uuid() |
| chat_sessions | id | UUID | gen_random_uuid() |
| chat_messages | id | UUID | gen_random_uuid() |
| mood_records | id | UUID | gen_random_uuid() |
| journals | id | UUID | gen_random_uuid() |
| journal_media | id | UUID | gen_random_uuid() |
| bookmarks | id | UUID | gen_random_uuid() |

> **复合主键**：仅 post_tags 使用 (post_id, tag_id) 复合主键


---

## 2. 外键设计

### 2.1 外键策略

| 策略 | 规则 |
|-----|-----|
| 更新规则 | ON UPDATE CASCADE（UUID不变无需级联更新） |
| 删除规则 | 见下方表格 |
| 索引 | 所有外键字段自动创建索引 |

### 2.2 完整外键关系矩阵

| 子表 | 外键字段 | 父表 | 删除策略 | 说明 |
|-----|---------|-----|---------|-----|
| user_profiles | user_id | users | CASCADE | 删用户时删除配置 |
| user_onboarding | user_id | users | CASCADE | 删用户时删除引导记录 |
| user_follows | follower_id | users | CASCADE | 关注者注销时删除关注 |
| user_follows | following_id | users | CASCADE | 被关注者注销时删除被关注 |
| user_interests | user_id | users | CASCADE | 删用户时删除兴趣关联 |
| user_interests | interest_id | interests | CASCADE | 删兴趣标签时删除关联 |
| plans | user_id | users | CASCADE | 删用户时删除计划 |
| plans | category_id | plan_categories | SET NULL | 删分类时保留计划，分类置空 |
| plan_steps | plan_id | plans | CASCADE | 删计划时删除步骤 |
| plan_daily_logs | plan_id | plans | CASCADE | 删计划时删除打卡日志 |
| plan_daily_logs | user_id | users | CASCADE | 删用户时删除打卡 |
| posts | user_id | users | CASCADE | 删用户时删除帖子 |
| post_comments | post_id | posts | CASCADE | 删帖子时删除评论 |
| post_comments | user_id | users | CASCADE | 删用户时删除评论 |
| post_comments | parent_id | post_comments | CASCADE | 删父评论时删除回复 |
| post_likes | user_id | users | CASCADE | 删用户时删除点赞 |
| post_likes | post_id | posts | CASCADE | 删帖子时删除点赞 |
| post_tags | post_id | posts | CASCADE | 删帖子时删除标签关联 |
| post_tags | tag_id | tags | CASCADE | 删标签时删除关联 |
| interest_activities | interest_id | interests | CASCADE | 删兴趣时删除活动 |
| activity_checkins | activity_id | interest_activities | CASCADE | 删活动时删除打卡 |
| activity_checkins | user_id | users | CASCADE | 删用户时删除打卡 |
| chat_sessions | user_id | users | CASCADE | 删用户时删除会话 |
| chat_messages | session_id | chat_sessions | CASCADE | 删会话时删除消息 |
| mood_records | user_id | users | CASCADE | 删用户时删除情绪记录 |
| journals | user_id | users | CASCADE | 删用户时删除手账 |
| journals | related_plan_id | plans | SET NULL | 删计划时保留手账，关联置空 |
| journal_media | journal_id | journals | CASCADE | 删手账时删除附件 |
| bookmarks | user_id | users | CASCADE | 删用户时删除收藏 |


### 2.3 多态关联处理 (bookmarks)

bookmarks 表的 target_type + target_id 指向多个业务表。PostgreSQL 不支持多态外键，方案如下：

**推荐方案：应用层保证 + 定期校验**

定期执行 CHECK 脚本检测孤立收藏数据，记录到日志并清理。

> 为什么不用触发器+动态 SQL？动态 SQL 在触发器中有性能风险，且增加维护复杂度。

---

## 3. 索引设计

### 3.1 索引命名规范

| 前缀 | 用途 | 示例 |
|-----|-----|-----|
| idx_ | 普通索引 | idx_users_phone |
| uniq_ | 唯一索引 | uniq_users_phone |
| gin_ | GIN索引 | gin_posts_tags |
| fts_ | 全文搜索 | fts_posts_content |

### 3.2 完整索引清单

#### 用户系统

| 表 | 索引名 | 字段 | 类型 | 加速场景 |
|---|-------|-----|-----|---------|
| users | uniq_users_phone | phone | UNIQUE BTREE | 手机号登录 |
| users | idx_users_nickname | nickname | BTREE | 昵称搜索 |
| users | idx_users_created_at | created_at DESC | BTREE | 用户列表排序 |
| user_follows | idx_follows_follower | (follower_id, created_at DESC) | BTREE | 关注列表 |
| user_follows | idx_follows_following | (following_id, created_at DESC) | BTREE | 粉丝列表 |

#### 今日开心计划

| 表 | 索引名 | 字段 | 类型 | 加速场景 |
|---|-------|-----|-----|---------|
| plans | idx_plans_user_status | (user_id, status) WHERE deleted_at IS NULL | BTREE | 用户计划列表 |
| plans | idx_plans_created | created_at DESC | BTREE | 最新计划排序 |
| plans | idx_plans_date | start_date | BTREE | 日期筛选 |
| plan_steps | idx_plan_steps_plan | (plan_id, sort_order) | BTREE | 步骤列表 |
| plan_daily_logs | idx_daily_logs_user_date | (user_id, log_date DESC) | BTREE | 打卡日历 |
| plan_daily_logs | uniq_daily_logs_plan_date | (plan_id, log_date) | UNIQUE | 一天一次打卡 |

#### 反焦虑中心

| 表 | 索引名 | 字段 | 类型 | 加速场景 |
|---|-------|-----|-----|---------|
| posts | idx_posts_created | created_at DESC WHERE deleted_at IS NULL | BTREE | 最新帖子 |
| posts | idx_posts_type | (type, created_at DESC) | BTREE | 分类筛选 |
| posts | idx_posts_hot | (like_count DESC, comment_count DESC) | BTREE | 热门排序 |
| posts | fts_posts_content | to_tsvector('simple', content) | GIN | 全文搜索 |
| post_comments | idx_comments_post | (post_id, created_at ASC) | BTREE | 评论列表 |
| post_likes | uniq_post_likes_user_post | (user_id, post_id) | UNIQUE | 防重复点赞 |

#### 兴趣重启中心

| 表 | 索引名 | 字段 | 类型 | 加速场景 |
|---|-------|-----|-----|---------|
| interests | uniq_interests_name | name | UNIQUE | 名称唯一 |
| user_interests | idx_user_interests_user | user_id | BTREE | 用户兴趣列表 |
| interest_activities | idx_activities_interest | interest_id | BTREE | 某兴趣的活动 |
| activity_checkins | idx_checkins_user | (user_id, created_at DESC) | BTREE | 用户打卡历史 |

#### AI陪伴助手

| 表 | 索引名 | 字段 | 类型 | 加速场景 |
|---|-------|-----|-----|---------|
| chat_sessions | idx_sessions_user | (user_id, last_message_at DESC) | BTREE | 会话列表 |
| chat_messages | idx_messages_session | (session_id, created_at ASC) | BTREE | 消息流 |

#### 心情记录

| 表 | 索引名 | 字段 | 类型 | 加速场景 |
|---|-------|-----|-----|---------|
| mood_records | idx_mood_user_date | (user_id, record_date DESC) | BTREE | 心情日历 |
| mood_records | idx_mood_user_month | (user_id, record_date) | BTREE | 月度报表 |
| mood_records | idx_mood_location | location | GIST | 位置查询 |

#### 快乐手账 + 收藏

| 表 | 索引名 | 字段 | 类型 | 加速场景 |
|---|-------|-----|-----|---------|
| journals | idx_journals_user | (user_id, created_at DESC) | BTREE | 手账列表 |
| journals | idx_journals_public | (created_at DESC) WHERE visibility='public' | BTREE | 公开手账发现页 |
| journal_media | idx_journal_media_journal | (journal_id, sort_order) | BTREE | 媒体附件 |
| bookmarks | idx_bookmarks_user | (user_id, target_type, created_at DESC) | BTREE | 收藏列表 |
| bookmarks | idx_bookmarks_target | (target_type, target_id) | BTREE | 查是否已收藏 |

### 3.3 索引使用原则

查询频率阈值：预计 QPS > 10 或 数据量 > 10万行 -> 建立索引
复合索引原则：等值条件字段放前面，范围查询字段放后面
部分索引：只索引活跃/未删除数据，缩小索引体积
覆盖索引：通过 INCLUDE 子句存储额外字段，避免回表

---

## 4. 自增序列设计

UUID 替代 SERIAL 的原因：

| 对比维度 | UUID | SERIAL (自增) |
|---------|-----|-------------|
| 分布支持 | 多服务同时生成无冲突 | 依赖中心化序列 |
| 安全 | 不暴露用户量和增长趋势 | ID 推断业务量 |
| 合并数据 | 不同库合并无冲突 | 需要重新映射 ID |
| 存储大小 | 16 bytes | 4~8 bytes |

**结论**：选择 UUID，权衡存储空间换取分布式友好和数据安全。

---

## 5. PostgreSQL 最佳实践

### 5.1 配置优化 (16GB RAM 参考)

max_connections = 200
shared_buffers = 4GB              # 总内存 25%
effective_cache_size = 12GB       # 总内存 75%
work_mem = 32MB                   # 排序内存
maintenance_work_mem = 1GB        # VACUUM/INDEX
wal_buffers = 16MB
wal_level = replica
synchronous_commit = on
checkpoint_completion_target = 0.9
random_page_cost = 1.1            # SSD 优化
effective_io_concurrency = 200    # SSD 并发
default_statistics_target = 500

### 5.2 反范式化设计

| 场景 | 反范式化字段 | 理由 |
|-----|-----------|-----|
| posts.like_count | 冗余计数 | 避免 COUNT(*) JOIN 开销 |
| posts.comment_count | 冗余计数 | 同上 |
| posts.bookmark_count | 冗余计数 | 同上 |
| plans.progress | 计算值 (completed/total)*100 | 省去前端计算 |
| user_profiles.plan_streak_days | 聚合缓存 | 避免全表扫描算 streak |

> 一致性保障：PostgreSQL 触发器 (AFTER INSERT/DELETE) 更新冗余字段

### 5.3 冷热数据分离

-- 聊天消息按月分区
-- CREATE TABLE chat_messages PARTITION BY RANGE (created_at);
-- 每个月一个分区表

### 5.4 维护计划

| 频率 | 任务 | 说明 |
|-----|-----|-----|
| 每天 | VACUUM (VERBOSE, ANALYZE) | 清理死元组 |
| 每周 | REINDEX INDEX CONCURRENTLY | 重建高更新率索引 |
| 每月 | ANALYZE VERBOSE | 完整分析 |
| 按需 | pg_stat_statements | 监控慢查询 |

### 5.5 数据备份

-- 每日全量备份
-- pg_dump -h localhost -U postgres -F c -b -v -f backup_$(date +%Y%m%d).dump happy_every_day
-- WAL 归档
-- archive_mode = on
-- archive_command = 'cp %p /backup/wal/%f'

### 5.6 推荐的扩展

| 扩展 | 用途 |
|-----|-----|
| uuid-ossp | UUID 生成 |
| pgcrypto | 加密函数 |
| pg_trgm | 模糊搜索 |
| postgis | 地理空间查询 |
| pg_stat_statements | SQL 性能监控 |
| btree_gin | 复合 GIN 索引 |

---

## 6. 完整索引 SQL（可执行）

```sql
-- 唯一索引
CREATE UNIQUE INDEX uniq_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uniq_tags_name ON tags(name);
CREATE UNIQUE INDEX uniq_interests_name ON interests(name);
CREATE UNIQUE INDEX uniq_daily_logs_plan_date ON plan_daily_logs(plan_id, log_date);
CREATE UNIQUE INDEX uniq_post_likes_user_post ON post_likes(user_id, post_id);
CREATE UNIQUE INDEX uniq_follows ON user_follows(follower_id, following_id);
CREATE UNIQUE INDEX uniq_bookmarks_user_target ON bookmarks(user_id, target_type, target_id);

-- 复合索引
CREATE INDEX idx_plans_user_status ON plans(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_plans_created ON plans(created_at DESC);
CREATE INDEX idx_plan_steps_plan ON plan_steps(plan_id, sort_order);
CREATE INDEX idx_daily_logs_user_date ON plan_daily_logs(user_id, log_date DESC);
CREATE INDEX idx_posts_created ON posts(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_type ON posts(type, created_at DESC) WHERE status='published' AND deleted_at IS NULL;
CREATE INDEX idx_posts_hot ON posts(like_count DESC, comment_count DESC) WHERE status='published' AND deleted_at IS NULL;
CREATE INDEX idx_comments_post ON post_comments(post_id, created_at ASC);
CREATE INDEX idx_mood_user_date ON mood_records(user_id, record_date DESC);
CREATE INDEX idx_sessions_user ON chat_sessions(user_id, last_message_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_session ON chat_messages(session_id, created_at ASC);
CREATE INDEX idx_journals_user ON journals(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_journals_public ON journals(created_at DESC) WHERE visibility='public' AND deleted_at IS NULL;
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id, target_type, created_at DESC);
CREATE INDEX idx_bookmarks_target ON bookmarks(target_type, target_id);
CREATE INDEX idx_user_interests_user ON user_interests(user_id);
CREATE INDEX idx_checkins_user ON activity_checkins(user_id, created_at DESC);

-- 全文搜索索引
CREATE INDEX fts_posts_content ON posts USING GIN (to_tsvector('simple', content));

-- PostGIS 空间索引
CREATE INDEX idx_mood_location ON mood_records USING GIST (location);
```

---

## 文档目录索引

| 文件名 | 内容 |
|-------|-----|
| 01-full-ER-model.md | 实体关系图 + 模块映射 |
| 02-table-design.md | 完整 SQL DDL (23张表) |
| 03-keys-indexes-best-practices.md | 主键/外键/索引/最佳实践（本文） |
