-- ============================================
-- 健康自检后台系统 - 数据库结构备份
-- 文件名：health_check_db_schema.sql
-- 创建时间：2025-02-04
-- 数据库类型：PostgreSQL
-- ============================================

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS sys_user CASCADE;
DROP TABLE IF EXISTS sys_admin CASCADE;

-- ============================================
-- 管理员表 (sys_admin)
-- ============================================
CREATE TABLE sys_admin (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_admin_username ON sys_admin(username);

-- ============================================
-- 用户表 (sys_user)
-- ============================================
CREATE TABLE sys_user (
    user_id SERIAL PRIMARY KEY,
    
    -- 基础信息
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    age INTEGER,
    gender VARCHAR(10),
    height DECIMAL(5, 2),
    weight DECIMAL(5, 2),
    job VARCHAR(100),
    
    -- 生活信息
    sleep TEXT,
    drink_smoke TEXT,
    exercise TEXT,
    diet TEXT,
    pressure_state TEXT,
    
    -- 病史信息
    allergy TEXT,
    sickness TEXT,
    family_sickness TEXT,
    symptom TEXT,
    
    -- 健康评估
    complete INTEGER DEFAULT 0,
    health_status VARCHAR(10) NOT NULL,
    health_score INTEGER,
    score_life INTEGER,
    score_sleep INTEGER,
    score_stress INTEGER,
    score_body INTEGER,
    score_risk INTEGER,
    
    -- 完成状态
    done_self_check BOOLEAN DEFAULT FALSE,
    done_require BOOLEAN DEFAULT FALSE,
    
    -- 原始内容
    answer_content TEXT,
    analysis TEXT,
    
    -- 时间戳
    create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_user_phone ON sys_user(phone);
CREATE INDEX idx_user_name ON sys_user(name);
CREATE INDEX idx_user_gender ON sys_user(gender);
CREATE INDEX idx_user_health_status ON sys_user(health_status);
CREATE INDEX idx_user_create_time ON sys_user(create_time);

-- 添加注释
COMMENT ON TABLE sys_admin IS '管理员表';
COMMENT ON COLUMN sys_admin.admin_id IS '管理员ID';
COMMENT ON COLUMN sys_admin.username IS '用户名';
COMMENT ON COLUMN sys_admin.password IS '密码';
COMMENT ON COLUMN sys_admin.create_time IS '创建时间';
COMMENT ON COLUMN sys_admin.update_time IS '更新时间';

COMMENT ON TABLE sys_user IS '用户表';
COMMENT ON COLUMN sys_user.user_id IS '用户ID';
COMMENT ON COLUMN sys_user.name IS '姓名';
COMMENT ON COLUMN sys_user.phone IS '手机号';
COMMENT ON COLUMN sys_user.age IS '年龄';
COMMENT ON COLUMN sys_user.gender IS '性别';
COMMENT ON COLUMN sys_user.height IS '身高(cm)';
COMMENT ON COLUMN sys_user.weight IS '体重(kg)';
COMMENT ON COLUMN sys_user.job IS '职业';
COMMENT ON COLUMN sys_user.sleep IS '作息情况';
COMMENT ON COLUMN sys_user.drink_smoke IS '烟酒习惯';
COMMENT ON COLUMN sys_user.exercise IS '运动习惯';
COMMENT ON COLUMN sys_user.diet IS '饮食习惯';
COMMENT ON COLUMN sys_user.pressure_state IS '压力状态';
COMMENT ON COLUMN sys_user.allergy IS '过敏史';
COMMENT ON COLUMN sys_user.sickness IS '既往病史';
COMMENT ON COLUMN sys_user.family_sickness IS '家族病史';
COMMENT ON COLUMN sys_user.symptom IS '当前症状';
COMMENT ON COLUMN sys_user.complete IS '完成度(%)';
COMMENT ON COLUMN sys_user.health_status IS '健康状态(优秀/良好/一般/异常)';
COMMENT ON COLUMN sys_user.health_score IS '综合健康分数';
COMMENT ON COLUMN sys_user.score_life IS '生活方式得分';
COMMENT ON COLUMN sys_user.score_sleep IS '睡眠质量得分';
COMMENT ON COLUMN sys_user.score_stress IS '压力状态得分';
COMMENT ON COLUMN sys_user.score_body IS '体质指数得分';
COMMENT ON COLUMN sys_user.score_risk IS '健康风险得分';
COMMENT ON COLUMN sys_user.done_self_check IS '是否已完成自检';
COMMENT ON COLUMN sys_user.done_require IS '是否已完成要求';
COMMENT ON COLUMN sys_user.answer_content IS '自检原始内容(JSON格式)';
COMMENT ON COLUMN sys_user.analysis IS '健康分析报告';
COMMENT ON COLUMN sys_user.create_time IS '创建时间';
COMMENT ON COLUMN sys_user.update_time IS '更新时间';

-- ============================================
-- 创建触发器函数（自动更新update_time）
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_time = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为sys_admin表创建触发器
CREATE TRIGGER trigger_admin_update_timestamp
    BEFORE UPDATE ON sys_admin
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- 为sys_user表创建触发器
CREATE TRIGGER trigger_user_update_timestamp
    BEFORE UPDATE ON sys_user
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ============================================
-- 备份完成
-- ============================================
-- 使用说明：
-- 1. 创建数据库：createdb health_check_db
-- 2. 恢复结构：psql health_check_db < health_check_db_schema.sql
-- 3. 恢复数据：psql health_check_db < health_check_db_data.sql
-- ============================================
