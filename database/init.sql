-- ============================================================
-- Happy Every Day - 生产环境 PostgreSQL 建表脚本
-- ============================================================
-- 数据库版本: PostgreSQL 15
-- 字符集: UTF8
-- 时区: UTC
--
-- 执行方式:
--   psql -h localhost -U postgres -d happy_every_day -f database/init.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 0. 扩展安装
-- ============================================================
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 0.1 公共函数: 自动更新 updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 LANGUAGE plpgsql;



-- ============================================================
-- 1. users - 用户主表
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20) NOT NULL,
    email           VARCHAR(255),
    nickname        VARCHAR(50) NOT NULL,
    avatar_url      VARCHAR(500),
    bio             VARCHAR(500) DEFAULT '',
    gender          SMALLINT DEFAULT 0 CHECK (gender IN (0, 1, 2)),
    birthday        DATE,
    occupation      VARCHAR(100),
    region          VARCHAR(100),
    zodiac_sign     VARCHAR(10),
    password_hash   VARCHAR(255) NOT NULL,
    refresh_token   VARCHAR(500),
    role            VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'mentor')),
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

-- 索引
CREATE UNIQUE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_nickname ON users(nickname);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 触发器
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. user_profiles - 用户档案/设置 (1:1)
-- ============================================================
CREATE TABLE user_profiles (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    notify_like             BOOLEAN DEFAULT true,
    notify_comment          BOOLEAN DEFAULT true,
    notify_follow           BOOLEAN DEFAULT true,
    notify_system           BOOLEAN DEFAULT true,
    notify_daily_reminder   BOOLEAN DEFAULT true,
    daily_reminder_time     TIME DEFAULT '09:00',
    mood_reminder_enabled   BOOLEAN DEFAULT false,
    mood_reminder_time      TIME,
    privacy_show_plans      VARCHAR(10) DEFAULT 'public'
                            CHECK (privacy_show_plans IN ('public', 'followers', 'private')),
    privacy_show_mood       VARCHAR(10) DEFAULT 'private'
                            CHECK (privacy_show_mood IN ('public', 'followers', 'private')),
    privacy_show_journal    VARCHAR(10) DEFAULT 'private'
                            CHECK (privacy_show_journal IN ('public', 'followers', 'private')),
    theme_mode              VARCHAR(10) DEFAULT 'light'
                            CHECK (theme_mode IN ('light', 'dark', 'system')),
    language                VARCHAR(10) DEFAULT 'zh-CN',
    plan_streak_days        INT DEFAULT 0,
    mood_streak_days        INT DEFAULT 0,
    longest_plan_streak     INT DEFAULT 0,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS '用户档案与个性化设置，与 users 1:1 关联';

CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- ============================================================
-- 3. daily_plans - 今日开心计划表
-- ============================================================
CREATE TABLE daily_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(100) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'completed', 'abandoned', 'archived')),
    priority        SMALLINT DEFAULT 0 CHECK (priority BETWEEN 0 AND 2),
    difficulty      SMALLINT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    plan_date       DATE NOT NULL,
    target_time     TIME,
    is_recurring    BOOLEAN DEFAULT false,
    recurring_type  VARCHAR(20) CHECK (recurring_type IN ('daily', 'weekly', 'monthly', 'custom')),
    progress        SMALLINT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    total_steps     INT DEFAULT 0,
    completed_steps INT DEFAULT 0,
    visibility      VARCHAR(20) DEFAULT 'private'
                    CHECK (visibility IN ('public', 'followers', 'private')),
    view_count      INT DEFAULT 0,
    like_count      INT DEFAULT 0,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE daily_plans IS '今日开心计划';
COMMENT ON COLUMN daily_plans.plan_date IS '计划执行的日期';

-- 索引
CREATE INDEX idx_daily_plans_user_date ON daily_plans(user_id, plan_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_daily_plans_status ON daily_plans(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_daily_plans_date ON daily_plans(plan_date);
CREATE INDEX idx_daily_plans_created ON daily_plans(created_at DESC);

-- 触发器
CREATE TRIGGER trg_daily_plans_updated_at
    BEFORE UPDATE ON daily_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. interests - 兴趣标签库
-- ============================================================
CREATE TABLE interests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE,
    icon            VARCHAR(100),
    category        VARCHAR(30) CHECK (category IN (
                        'sports', 'arts', 'music', 'tech', 'nature', 'food',
                        'travel', 'reading', 'game', 'social', 'handcraft', 'other'
                    )),
    description     VARCHAR(200),
    color           VARCHAR(7),
    is_active       BOOLEAN DEFAULT true,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE interests IS '兴趣标签库，支持后台动态维护';

-- 索引
CREATE UNIQUE INDEX idx_interests_name ON interests(name);
CREATE INDEX idx_interests_category ON interests(category) WHERE is_active = true;

-- ============================================================
-- 5. user_interests - 用户兴趣关联表
-- ============================================================
CREATE TABLE user_interests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_id     UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    level           VARCHAR(10) DEFAULT 'beginner'
                    CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, interest_id)
);

COMMENT ON TABLE user_interests IS '用户选择的兴趣及熟练度';

-- 索引
CREATE INDEX idx_user_interests_user ON user_interests(user_id);
CREATE INDEX idx_user_interests_interest ON user_interests(interest_id);



-- ============================================================
-- 6. activities - 兴趣重启活动表
-- ============================================================
CREATE TABLE activities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interest_id     UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    difficulty      SMALLINT DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
    duration_min    INT,
    guide_type      VARCHAR(20) DEFAULT 'text'
                    CHECK (guide_type IN ('text', 'video', 'audio', 'external_link')),
    guide_content   TEXT,
    guide_url       VARCHAR(500),
    participant_count INT DEFAULT 0,
    completion_count  INT DEFAULT 0,
    avg_rating      DECIMAL(2,1) DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE activities IS '兴趣重启活动（微任务形式帮助用户重启兴趣）';

-- 索引
CREATE INDEX idx_activities_interest ON activities(interest_id) WHERE is_active = true;
CREATE INDEX idx_activities_difficulty ON activities(difficulty);

-- 触发器
CREATE TRIGGER trg_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 7. mood_logs - 心情记录表
-- ============================================================
CREATE TABLE mood_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood_type       VARCHAR(20) NOT NULL
                    CHECK (mood_type IN (
                        'happy', 'sad', 'anxious', 'calm', 'angry',
                        'excited', 'tired', 'neutral', 'lonely', 'grateful'
                    )),
    intensity       SMALLINT NOT NULL CHECK (intensity BETWEEN 1 AND 10),
    journal         TEXT,
    tags            TEXT[],
    factors         TEXT[],
    energy_level    SMALLINT CHECK (energy_level BETWEEN 1 AND 10),
    sleep_hours     DECIMAL(3,1),
    record_date     DATE NOT NULL,
    record_time     TIME NOT NULL,
    weather         VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE mood_logs IS '心情/情绪记录表';

-- 索引
CREATE INDEX idx_mood_logs_user_date ON mood_logs(user_id, record_date DESC);
CREATE INDEX idx_mood_logs_type ON mood_logs(mood_type);
CREATE INDEX idx_mood_logs_user_month ON mood_logs(user_id, record_date);

-- 触发器
CREATE TRIGGER trg_mood_logs_updated_at
    BEFORE UPDATE ON mood_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



-- ============================================================
-- 8. journals - 快乐手账表
-- ============================================================
CREATE TABLE journals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    content         TEXT,
    mood_type       VARCHAR(20),
    mood_intensity  SMALLINT CHECK (mood_intensity BETWEEN 1 AND 10),
    template        VARCHAR(30) DEFAULT 'free'
                    CHECK (template IN ('free', 'timeline', 'grid', 'mood_diary', 'goal_tracker')),
    cover_color     VARCHAR(7) DEFAULT '#FFFFFF',
    tags            TEXT[],
    visibility      VARCHAR(20) DEFAULT 'private'
                    CHECK (visibility IN ('public', 'followers', 'private')),
    like_count      INT DEFAULT 0,
    view_count      INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE journals IS '快乐手账/日记';

-- 索引
CREATE INDEX idx_journals_user ON journals(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_journals_public ON journals(created_at DESC)
    WHERE visibility = 'public' AND deleted_at IS NULL;

-- 触发器
CREATE TRIGGER trg_journals_updated_at
    BEFORE UPDATE ON journals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 9. favorites - 收藏功能表（多态关联）
-- ============================================================
CREATE TABLE favorites (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type     VARCHAR(30) NOT NULL CHECK (target_type IN (
                        'daily_plan', 'activity', 'journal', 'mood_log', 'article'
                    )),
    target_id       UUID NOT NULL,
    note            VARCHAR(200),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

COMMENT ON TABLE favorites IS '统一收藏表（多态关联5种内容类型）';
COMMENT ON COLUMN favorites.target_id IS '根据 target_type 指向不同业务表的主键';

-- 索引
CREATE INDEX idx_favorites_user ON favorites(user_id, target_type, created_at DESC);
CREATE INDEX idx_favorites_target ON favorites(target_type, target_id);

-- ============================================================
-- 提交事务
-- ============================================================
COMMIT;
