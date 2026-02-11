-- ============================================================================
-- 健康自检后台系统 - 数据库数据备份文件
-- 生成时间：2025-02-05
-- 数据库：PostgreSQL 14+
-- 说明：本文件包含数据库初始数据，用于生产环境数据恢复
-- 注意：恢复前请先执行 health_check_db_schema.sql 创建表结构
-- ============================================================================

-- ============================================================================
-- 插入管理员数据
-- 默认管理员账号：admin / 123456
-- 生产环境部署后请立即修改密码！
-- ============================================================================
INSERT INTO sys_admin (admin_id, username, password, create_time, update_time)
VALUES (1, 'admin', '123456', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================================
-- 插入测试用户数据
-- 说明：以下为测试用户数据，生产环境可根据需要保留或删除
-- ============================================================================
INSERT INTO sys_user (user_id, name, phone, gender, age, height, weight, waistline, hipline, blood_pressure_high, blood_pressure_low, blood_sugar, blood_fat, heart_rate, sleep_hours, exercise_hours, smoking, drinking, diet, chronic_disease, medication, family_history, symptoms, answer_content, analysis, health_status, health_score, self_check_completed, self_check_time, create_time, update_time)
VALUES
(
    1, '测试用户', '13800138001', '男', 30, 170.00, 65.00, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, '{"question1":"answer1"}', '测试分析', NULL, 0, false, NULL,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    2, '李四', '13800138002', '女', 28, 165.00, 55.00, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, '良好', 78, true, CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    3, '王五', '13800138003', '男', 35, 180.00, 80.00, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, '一般', 65, false, NULL,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    4, '赵六', '13800138004', '女', 25, 160.00, 50.00, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, '优秀', 90, true, CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),
(
    5, '孙七', '13800138005', '男', 40, 172.00, 75.00, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, '异常', 45, false, NULL,
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- ============================================================================
-- 重置自增序列
-- ============================================================================
SELECT setval('sys_admin_admin_id_seq', (SELECT MAX(admin_id) FROM sys_admin));
SELECT setval('sys_user_user_id_seq', (SELECT MAX(user_id) FROM sys_user));

-- ============================================================================
-- 完成数据导入
-- ============================================================================
-- 说明：本文件包含1个管理员账号和5个测试用户数据
-- 生产环境部署后请：
-- 1. 立即修改管理员密码（admin/123456）
-- 2. 根据需要保留或删除测试用户数据
-- 3. 配置正确的数据库连接信息
-- 4. 验证系统功能是否正常
-- ============================================================================
