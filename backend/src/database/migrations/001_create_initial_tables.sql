-- src/database/migrations/001_create_initial_tables.sql
-- 创建模型表
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name TEXT NOT NULL,
    original_file_path TEXT,
    converted_file_path TEXT,
    file_size_bytes BIGINT NOT NULL,
    original_format TEXT DEFAULT 'skp',
    converted_format TEXT DEFAULT 'gltf+dr',
    conversion_status TEXT DEFAULT 'pending',
    conversion_error TEXT,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    user_id UUID, -- 预留用户ID字段
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 索引
    CONSTRAINT valid_conversion_status CHECK (conversion_status IN ('pending', 'processing', 'completed', 'failed'))
);

-- 创建分享链接表
CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    expires_at TIMESTAMPTZ,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 索引
    INDEX idx_share_links_token (token),
    INDEX idx_share_links_model_id (model_id),
    INDEX idx_share_links_expires_at (expires_at)
);

-- 创建热点数据表
CREATE TABLE IF NOT EXISTS hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    position JSONB NOT NULL,
    rotation JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}',
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 索引
    INDEX idx_hotspots_model_id (model_id)
);

-- 创建场景预设表
CREATE TABLE IF NOT EXISTS scene_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    camera_position JSONB NOT NULL,
    camera_target JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- 约束和索引
    CONSTRAINT valid_camera_position CHECK (jsonb_typeof(camera_position) = 'array'),
    CONSTRAINT valid_camera_target CHECK (jsonb_typeof(camera_target) = 'array'),
    INDEX idx_scene_presets_model_id (model_id)
);

-- 创建updated_at触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为模型表添加触发器
CREATE TRIGGER update_models_updated_at
    BEFORE UPDATE ON models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();