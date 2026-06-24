# 数据表设计与表关系

> 本文档包含完整 SQL DDL、主键设计、外键设计

---

## 1. 完整 SQL DDL（20张表）

### 1.1 扩展与基础函数

`sql
-- ========================================
-- 扩展安装
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID 生成
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- 加密函数
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- 模糊搜索
CREATE EXTENSION IF NOT EXISTS "postgis";        -- 地理空间

-- ========================================
-- 公共函数：自动更新 updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- ========================================
-- 公共函数：自动更新帖子计数
-- ========================================
CREATE OR REPLACE FUNCTION update_post_counter()
RETURNS TRIGGER AS \$\$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'post_likes' THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'post_comments' THEN
            UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'post_likes' THEN
            UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'post_comments' THEN
            UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
        END IF;
    END IF;
    RETURN NULL;
END;
\$\$ language 'plpgsql';
`

---

### 1.2 用户系统

``sql
-- ========================================
-- 1. users - 用户主表
-- ========================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    nickname        VARCHAR(50) NOT NULL,
    avatar_url      VARCHAR(500),
    bio             VARCHAR(500) DEFAULT '',
    gender          SMALLINT DEFAULT 0 CHECK (gender IN (0,1,2)),
    birthday        DATE,
    occupation      VARCHAR(100),
    region          VARCHAR(100),
    zodiac_sign     VARCHAR(10),
    password_hash   VARCHAR(255) NOT NULL,
    refresh_token   VARCHAR(500),
    role            VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','admin','mentor')),
    is_active       BOOLEAN DEFAULT true,
    is_onboarded    BOOLEAN DEFAULT false,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE users IS '用户主表';
COMMENT ON COLUMN users.occupation IS '职业，用于兴趣推荐画像';
COMMENT ON COLUMN users.zodiac_sign IS '星座，社区互动标签';

-- 触发器
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 2. user_profiles - 用户档案/设置
-- ========================================
CREATE TABLE user_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    -- 通知设置
    notify_like             BOOLEAN DEFAULT true,
    notify_comment          BOOLEAN DEFAULT true,
    notify_follow           BOOLEAN DEFAULT true,
    notify_system           BOOLEAN DEFAULT true,
    notify_daily_reminder   BOOLEAN DEFAULT true,
    daily_reminder_time     TIME DEFAULT '09:00',
    mood_reminder_enabled   BOOLEAN DEFAULT false,
    mood_reminder_time      TIME,
    -- 隐私设置
    privacy_show_plans      VARCHAR(10) DEFAULT 'public' 
                            CHECK (privacy_show_plans IN ('public','followers','private')),
    privacy_show_mood       VARCHAR(10) DEFAULT 'private'
                            CHECK (privacy_show_mood IN ('public','followers','private')),
    privacy_show_journal    VARCHAR(10) DEFAULT 'private'
                            CHECK (privacy_show_journal IN ('public','followers','private')),
    -- 偏好
    theme_mode              VARCHAR(10) DEFAULT 'light'
                            CHECK (theme_mode IN ('light','dark','system')),
    language                VARCHAR(10) DEFAULT 'zh-CN',
    -- 连续打卡统计
    plan_streak_days        INT DEFAULT 0,
    mood_streak_days        INT DEFAULT 0,
    longest_plan_streak     INT DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS '用户档案与个性化设置（1:1 关联 users）';

CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 3. user_follows - 用户关注关系
-- ========================================
CREATE TABLE user_follows (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id <> following_id)
);

COMMENT ON TABLE user_follows IS '用户关注关系表（不能关注自己）';

-- ========================================
-- 4. user_onboarding - 新用户引导记录
-- ========================================
CREATE TABLE user_onboarding (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    step_profile        BOOLEAN DEFAULT false,
    step_interest       BOOLEAN DEFAULT false,
    step_first_plan     BOOLEAN DEFAULT false,
    step_mood_checkin   BOOLEAN DEFAULT false,
    step_ai_chat        BOOLEAN DEFAULT false,
    step_explore        BOOLEAN DEFAULT false,
    completed           BOOLEAN DEFAULT false,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_onboarding IS '新用户引导步骤完成记录';

CREATE TRIGGER trg_user_onboarding_updated_at
    BEFORE UPDATE ON user_onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
``

---

### 1.3 今日开心计划

``sql
-- ========================================
-- 5. plan_categories - 计划分类
-- ========================================
CREATE TABLE plan_categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL,
    icon            VARCHAR(100),
    color           VARCHAR(7),
    description     VARCHAR(200),
    sort_order      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE plan_categories IS '计划分类（8个系统分类 + 用户自定义）';

-- ========================================
-- 6. plans - 开心计划主表
-- ========================================
CREATE TABLE plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES plan_categories(id) ON DELETE SET NULL,
    title           VARCHAR(100) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'active'
                    CHECK (status IN ('active','paused','completed','abandoned','archived')),
    priority        SMALLINT DEFAULT 0 CHECK (priority BETWEEN 0 AND 2),
    difficulty      SMALLINT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    -- 时间
    start_date      DATE NOT NULL,
    target_date     DATE,
    is_recurring    BOOLEAN DEFAULT false,
    recurring_type  VARCHAR(20) CHECK (recurring_type IN ('daily','weekly','monthly','custom')),
    recurring_days  SMALLINT[],
    -- 进度
    total_steps     INT DEFAULT 0,
    completed_steps INT DEFAULT 0,
    progress        SMALLINT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    -- 可见性
    visibility      VARCHAR(20) DEFAULT 'private'
                    CHECK (visibility IN ('public','followers','private')),
    view_count      INT DEFAULT 0,
    like_count      INT DEFAULT 0,
    -- 完成
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE plans IS '今日开心计划';
COMMENT ON COLUMN plans.recurring_days IS '每周重复的天数 [1,3,5] 表示周一三五';

CREATE TRIGGER trg_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 7. plan_steps - 计划步骤
-- ========================================
CREATE TABLE plan_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    sort_order      INT NOT NULL,
    duration_min    INT,
    is_completed    BOOLEAN DEFAULT false,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE plan_steps IS '计划的步骤/子任务';

CREATE TRIGGER trg_plan_steps_updated_at
    BEFORE UPDATE ON plan_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 8. plan_daily_logs - 每日打卡日志
-- ========================================
CREATE TABLE plan_daily_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id         UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date        DATE NOT NULL,
    status          VARCHAR(20) DEFAULT 'done' CHECK (status IN ('done','skip','miss')),
    note            TEXT,
    mood_before     SMALLINT CHECK (mood_before BETWEEN 1 AND 10),
    mood_after      SMALLINT CHECK (mood_after BETWEEN 1 AND 10),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(plan_id, log_date)
);

COMMENT ON TABLE plan_daily_logs IS '计划每日打卡日志（含心情前后对比）';
``

---

### 1.4 反焦虑中心

``sql
-- ========================================
-- 9. posts - 帖子表
-- ========================================
CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200),
    content         TEXT NOT NULL,
    type            VARCHAR(20) DEFAULT 'vent'
                    CHECK (type IN ('vent','success','advice','question','share','poem')),
    is_anonymous    BOOLEAN DEFAULT false,
    images          TEXT[],
    -- 社交计数
    like_count      INT DEFAULT 0,
    comment_count   INT DEFAULT 0,
    bookmark_count  INT DEFAULT 0,
    view_count      INT DEFAULT 0,
    share_count     INT DEFAULT 0,
    -- 运营
    is_pinned       BOOLEAN DEFAULT false,
    is_essence      BOOLEAN DEFAULT false,
    status          VARCHAR(20) DEFAULT 'published'
                    CHECK (status IN ('draft','published','reviewing','blocked','deleted')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE posts IS '反焦虑中心帖子';

CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. post_comments - 评论/弹幕表
-- ========================================
CREATE TABLE post_comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES post_comments(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    is_anonymous    BOOLEAN DEFAULT false,
    like_count      INT DEFAULT 0,
    reply_count     INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE post_comments IS '帖子评论，支持楼中楼回复（parent_id）';

-- 计数器触发器：评论数
CREATE TRIGGER trg_post_comments_counter
    AFTER INSERT OR DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counter();

-- ========================================
-- 11. post_likes - 点赞表
-- ========================================
CREATE TABLE post_likes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

COMMENT ON TABLE post_likes IS '帖子点赞（唯一约束防重复赞）';

-- 计数器触发器：点赞数
CREATE TRIGGER trg_post_likes_counter
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_counter();

-- ========================================
-- 12. tags - 标签表
-- ========================================
CREATE TABLE tags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE,
    type            VARCHAR(20) DEFAULT 'post' CHECK (type IN ('post','interest','mood','plan')),
    color           VARCHAR(7),
    usage_count     INT DEFAULT 0,
    is_recommended  BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tags IS '统一标签库（帖子/兴趣/情绪/计划共用）';

-- ========================================
-- 13. post_tags - 帖子-标签关联
-- ========================================
CREATE TABLE post_tags (
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

COMMENT ON TABLE post_tags IS '帖子与标签的多对多关联';
``

---

### 1.5 兴趣重启中心

``sql
-- ========================================
-- 14. interests - 兴趣库
-- ========================================
CREATE TABLE interests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE,
    icon            VARCHAR(100),
    category        VARCHAR(30) CHECK (category IN (
                        'sports','arts','music','tech','nature','food',
                        'travel','reading','game','social','handcraft','other'
                    )),
    description     VARCHAR(200),
    color           VARCHAR(7),
    is_active       BOOLEAN DEFAULT true,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE interests IS '兴趣标签库（后台可维护）';

-- ========================================
-- 15. user_interests - 用户兴趣关联
-- ========================================
CREATE TABLE user_interests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_id     UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    level           VARCHAR(10) DEFAULT 'beginner'
                    CHECK (level IN ('beginner','intermediate','advanced')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, interest_id)
);

COMMENT ON TABLE user_interests IS '用户选择的兴趣及熟练度';

-- ========================================
-- 16. interest_activities - 兴趣重启活动
-- ========================================
CREATE TABLE interest_activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interest_id     UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    difficulty      SMALLINT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    duration_min    INT,
    guide_type      VARCHAR(20) DEFAULT 'text'
                    CHECK (guide_type IN ('text','video','audio','external_link')),
    guide_content   TEXT,
    guide_url       VARCHAR(500),
    participant_count INT DEFAULT 0,
    completion_count  INT DEFAULT 0,
    avg_rating         DECIMAL(2,1) DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE interest_activities IS '针对每个兴趣的微任务/重启引导活动';

CREATE TRIGGER trg_interest_activities_updated_at
    BEFORE UPDATE ON interest_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 17. activity_checkins - 活动打卡记录
-- ========================================
CREATE TABLE activity_checkins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id     UUID NOT NULL REFERENCES interest_activities(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'completed'
                    CHECK (status IN ('in_progress','completed','abandoned')),
    rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
    feedback        TEXT,
    duration_spent  INT,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(activity_id, user_id)
);

COMMENT ON TABLE activity_checkins IS '用户对兴趣活动的打卡/反馈记录';
``

---

### 1.6 AI陪伴助手

``sql
-- ========================================
-- 18. chat_sessions - AI对话会话
-- ========================================
CREATE TABLE chat_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(100),
    topic           VARCHAR(50),
    mood_summary    VARCHAR(100),
    message_count   INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE chat_sessions IS 'AI陪伴对话会话';

CREATE TRIGGER trg_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 19. chat_messages - 对话消息
-- ========================================
CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant','system')),
    content         TEXT NOT NULL,
    content_type    VARCHAR(20) DEFAULT 'text'
                    CHECK (content_type IN ('text','image','audio','card')),
    metadata        JSONB,
    emotion_detected VARCHAR(20),
    tokens_used     INT,
    model           VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE chat_messages IS '对话消息记录';
COMMENT ON COLUMN chat_messages.metadata IS 'AI情绪分析等附加数据';
COMMENT ON COLUMN chat_messages.emotion_detected IS 'AI检测的用户情绪';
``

---

### 1.7 心情记录

``sql
-- ========================================
-- 20. mood_records - 情绪记录
-- ========================================
CREATE TABLE mood_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- 情绪核心
    mood_type       VARCHAR(20) NOT NULL
                    CHECK (mood_type IN (
                        'happy','sad','anxious','calm','angry',
                        'excited','tired','neutral','lonely','grateful'
                    )),
    intensity       SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 10),
    journal         TEXT,
    tags            TEXT[],                 -- 自定义标签
    factors         TEXT[],                 -- 影响因素 ["工作","天气","社交"]
    -- 生理数据
    energy_level    SMALLINT CHECK (energy_level BETWEEN 1 AND 10),
    sleep_hours     DECIMAL(3,1),
    -- 时空
    record_date     DATE NOT NULL,
    record_time     TIME NOT NULL,
    -- PostGIS 地理空间位置
    location        GEOGRAPHY(Point, 4326), -- PostGIS 空间字段
    weather         VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE mood_records IS '情绪/心情记录';
COMMENT ON COLUMN mood_records.location IS 'PostGIS 空间位置（POINT(lng lat)）';

CREATE TRIGGER trg_mood_records_updated_at
    BEFORE UPDATE ON mood_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
``

---

### 1.8 快乐手账

``sql
-- ========================================
-- 21. journals - 快乐手账
-- ========================================
CREATE TABLE journals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    content         TEXT,
    mood_type       VARCHAR(20),            -- 手账关联的情绪
    mood_intensity  SMALLINT CHECK (mood_intensity BETWEEN 1 AND 10),
    -- 布局模板
    template        VARCHAR(30) DEFAULT 'free'
                    CHECK (template IN ('free','timeline','grid','mood_diary','goal_tracker')),
    cover_color     VARCHAR(7) DEFAULT '#FFFFFF',
    -- 关联
    related_plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    tags            TEXT[],
    -- 社交
    visibility      VARCHAR(20) DEFAULT 'private'
                    CHECK (visibility IN ('public','followers','private')),
    like_count      INT DEFAULT 0,
    view_count      INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE journals IS '快乐手账/日记';
COMMENT ON COLUMN journals.template IS '手账排版模板';

CREATE TRIGGER trg_journals_updated_at
    BEFORE UPDATE ON journals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 22. journal_media - 手账媒体附件
-- ========================================
CREATE TABLE journal_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id      UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    url             VARCHAR(500) NOT NULL,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('image','video','audio','sticker')),
    width           INT,
    height          INT,
    duration_sec    INT,                    -- 音视频时长
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE journal_media IS '手账的图片/视频/音频/贴纸附件';
CREATE INDEX idx_journal_media_journal ON journal_media(journal_id, sort_order);
``

---

### 1.9 收藏功能

``sql
-- ========================================
-- 23. bookmarks - 统一收藏表（多态关联）
-- ========================================
CREATE TABLE bookmarks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type     VARCHAR(30) NOT NULL CHECK (target_type IN (
                        'post','plan','journal','activity','chat_session','article','mood'
                    )),
    target_id       UUID NOT NULL,
    note            VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

COMMENT ON TABLE bookmarks IS '统一收藏表（多态关联7种内容类型）';
COMMENT ON COLUMN bookmarks.target_id IS '根据 target_type 指向不同业务表的主键';

-- 注意：多态关联无法声明 FOREIGN KEY，需要应用层或触发器保证引用完整性
-- 但可以创建部分索引提升查询效率
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id, target_type, created_at DESC);
CREATE INDEX idx_bookmarks_target ON bookmarks(target_type, target_id);
``
