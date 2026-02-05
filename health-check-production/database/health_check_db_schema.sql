-- ============================================================================
-- 健康自检后台系统 - 数据库结构备份文件
-- 生成时间：2025-02-05
-- 数据库：PostgreSQL 14+
-- 说明：本文件包含数据库表结构定义，用于生产环境初始化
-- ============================================================================

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS sys_user CASCADE;
DROP TABLE IF EXISTS sys_admin CASCADE;

-- ============================================================================
-- 表1：sys_admin - 管理员表
-- ============================================================================
CREATE TABLE sys_admin (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    create_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建管理员表索引
CREATE INDEX idx_admin_username ON sys_admin(username);

-- ============================================================================
-- 表2：sys_user - 用户表
-- ============================================================================
CREATE TABLE sys_user (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    gender VARCHAR(10),
    age INTEGER,
    height NUMERIC(5,2),
    weight NUMERIC(5,2),
    waistline NUMERIC(5,2),
    hipline NUMERIC(5,2),
    blood_pressure_high VARCHAR(10),
    blood_pressure_low VARCHAR(10),
    blood_sugar VARCHAR(10),
    blood_fat VARCHAR(10),
    heart_rate VARCHAR(10),
    sleep_hours NUMERIC(3,1),
    exercise_hours NUMERIC(3,1),
    smoking VARCHAR(10),
    drinking VARCHAR(10),
    diet VARCHAR(50),
    chronic_disease VARCHAR(200),
    medication VARCHAR(200),
    family_history VARCHAR(200),
    symptoms VARCHAR(500),
    answer_content TEXT,
    analysis TEXT,
    health_status VARCHAR(20),
    health_score INTEGER DEFAULT 0,
    self_check_completed BOOLEAN DEFAULT FALSE,
    self_check_time TIMESTAMP WITHOUT TIME ZONE,
    create_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户表索引
CREATE INDEX idx_user_phone ON sys_user(phone);
CREATE INDEX idx_user_health_status ON sys_user(health_status);
CREATE INDEX idx_user_self_check ON sys_user(self_check_completed);
CREATE INDEX idx_user_create_time ON sys_user(create_time);

-- ============================================================================
-- 添加注释
-- ============================================================================
COMMENT ON TABLE sys_admin IS '管理员表';
COMMENT ON COLUMN sys_admin.admin_id IS '管理员ID';
COMMENT ON COLUMN sys_admin.username IS '用户名';
COMMENT ON COLUMN sys_admin.password IS '密码（加密存储）';
COMMENT ON COLUMN sys_admin.create_time IS '创建时间';
COMMENT ON COLUMN sys_admin.update_time IS '更新时间';

COMMENT ON TABLE sys_user IS '用户表';
COMMENT ON COLUMN sys_user.user_id IS '用户ID';
COMMENT ON COLUMN sys_user.name IS '姓名';
COMMENT ON COLUMN sys_user.phone IS '手机号';
COMMENT ON COLUMN sys_user.gender IS '性别';
COMMENT ON COLUMN sys_user.age IS '年龄';
COMMENT ON COLUMN sys_user.height IS '身高（cm）';
COMMENT ON COLUMN sys_user.weight IS '体重（kg）';
COMMENT ON COLUMN sys_user.waistline IS '腰围（cm）';
COMMENT ON COLUMN sys_user.hipline IS '臀围（cm）';
COMMENT ON COLUMN sys_user.blood_pressure_high IS '收缩压';
COMMENT ON COLUMN sys_user.blood_pressure_low IS '舒张压';
COMMENT ON COLUMN sys_user.blood_sugar IS '血糖';
COMMENT ON COLUMN sys_user.blood_fat IS '血脂';
COMMENT ON COLUMN sys_user.heart_rate IS '心率';
COMMENT ON COLUMN sys_user.sleep_hours IS '睡眠时长（小时）';
COMMENT ON COLUMN sys_user.exercise_hours IS '运动时长（小时）';
COMMENT ON COLUMN sys_user.smoking IS '吸烟情况';
COMMENT ON COLUMN sys_user.drinking IS '饮酒情况';
COMMENT ON COLUMN sys_user.diet IS '饮食习惯';
COMMENT ON COLUMN sys_user.chronic_disease IS '慢性病史';
COMMENT ON COLUMN sys_user.medication IS '用药情况';
COMMENT ON COLUMN sys_user.family_history IS '家族病史';
COMMENT ON COLUMN sys_user.symptoms IS '症状描述';
COMMENT ON COLUMN sys_user.answer_content IS '答题内容（JSON格式）';
COMMENT ON COLUMN sys_user.analysis IS '健康分析报告';
COMMENT ON COLUMN sys_user.health_status IS '健康状态（优秀/良好/一般/异常）';
COMMENT ON COLUMN sys_user.health_score IS '健康评分（0-100）';
COMMENT ON COLUMN sys_user.self_check_completed IS '是否完成自检';
COMMENT ON COLUMN sys_user.self_check_time IS '自检时间';
COMMENT ON COLUMN sys_user.create_time IS '创建时间';
COMMENT ON COLUMN sys_user.update_time IS '更新时间';

-- ============================================================================
-- 完成数据库结构创建
-- ============================================================================
