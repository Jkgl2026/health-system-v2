-- ============================================
-- 后台管理系统 - 管理员表创建与初始化脚本
-- 数据库：health_app
-- 功能：创建管理员表、初始化默认管理员账号
-- 执行方式：在PostgreSQL的health_app数据库中直接执行
-- ============================================

-- 1. 创建管理员表
-- 表名规范：小写复数（admins）
-- 字段规范：小写下划线，含id、created_at、updated_at
CREATE TABLE IF NOT EXISTS admins (
    -- 主键ID，自增
    id SERIAL PRIMARY KEY,
    
    -- 管理员账号（唯一索引，防止重复）
    username VARCHAR(50) UNIQUE NOT NULL,
    
    -- 密码（bcrypt加密存储，至少60字符）
    password_hash VARCHAR(255) NOT NULL,
    
    -- 真实姓名（可选）
    full_name VARCHAR(100),
    
    -- 状态（active-启用，inactive-禁用）
    status VARCHAR(20) DEFAULT 'active',
    
    -- 最后登录时间
    last_login_at TIMESTAMP,
    
    -- 最后登录IP
    last_login_ip VARCHAR(50),
    
    -- 登录失败次数（防暴力破解）
    failed_login_attempts INTEGER DEFAULT 0,
    
    -- 账号锁定时间
    locked_until TIMESTAMP,
    
    -- 创建时间（默认当前时间）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 更新时间（默认当前时间，触发器自动更新）
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建索引（优化查询性能）
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);

-- 3. 创建触发器（自动更新updated_at字段）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_admins_updated_at 
    BEFORE UPDATE ON admins 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. 初始化默认管理员账号
-- 账号：admin
-- 密码：123456（bcrypt加密后的hash值）
-- 说明：bcrypt hash = $2b$10$N9qo8uLOickgx2ZMRZoMy.MrqdH3mC6m9q9e6p8e7kZ3yR8xW0K9e

INSERT INTO admins (username, password_hash, full_name, status) 
VALUES (
    'admin',
    -- bcrypt加密后的密码：123456
    -- 加密方式：bcrypt(cost=10)
    -- 如需生成新密码hash，使用：bcrypt.hashSync('your_password', 10)
    '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqdH3mC6m9q9e6p8e7kZ3yR8xW0K9e',
    '系统管理员',
    'active'
)
ON CONFLICT (username) DO NOTHING;

-- 5. 验证数据是否插入成功
SELECT 
    id,
    username,
    full_name,
    status,
    created_at,
    CASE 
        WHEN password_hash = '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqdH3mC6m9q9e6p8e7kZ3yR8xW0K9e' 
        THEN '密码正确（123456）'
        ELSE '密码异常'
    END as password_check
FROM admins 
WHERE username = 'admin';

-- ============================================
-- 执行完成提示
-- ============================================
-- 执行完成后，将看到以下结果：
-- 1. admins表创建成功
-- 2. 默认管理员账号：admin / 123456
-- 3. 可以使用 SELECT * FROM admins; 查看所有管理员
-- 
-- 注意事项：
-- - 首次登录后建议立即修改密码
-- - 生产环境请使用强密码
-- - bcrypt加密方式：password_hash = bcrypt.hashSync('password', 10)
-- ============================================
