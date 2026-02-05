-- ============================================
-- 健康自检后台系统 - 真实用户数据备份
-- 文件名：health_check_db_data.sql
-- 创建时间：2025-02-04
-- 数据库类型：PostgreSQL
-- 说明：包含1个默认管理员账号 + 14位真实用户数据
-- ============================================

-- 清空现有数据
TRUNCATE sys_user CASCADE;
TRUNCATE sys_admin CASCADE;

-- ============================================
-- 默认管理员账号
-- 账号：admin
-- 密码：123456
-- ============================================
INSERT INTO sys_admin (admin_id, username, password, create_time, update_time) VALUES
(1, 'admin', '123456', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- 真实用户数据（14位）
-- 说明：根据需求文档，缺失字段留空（NULL或空字符串）
-- ============================================

-- 用户1：ID: d99deac8
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    1, '李四', NULL, 29, '男', 165.0, 64.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-23 22:04:00', '2025-01-23 22:04:00'
);

-- 用户2：ID: e7acde11
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    2, '李四', NULL, 29, '男', 165.0, 64.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-24 17:19:00', '2025-01-24 17:19:00'
);

-- 用户3：ID: 1afd82d7
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    3, '李四', NULL, 29, '男', 165.0, 70.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-26 11:53:00', '2025-01-26 11:53:00'
);

-- 用户4：ID: 760176f7
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    4, '李四', NULL, 29, '男', 165.0, 70.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-26 16:14:00', '2025-01-26 16:14:00'
);

-- 用户5：ID: 92564c96
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    5, '李四', NULL, 39, '男', 165.0, 80.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-27 09:45:00', '2025-01-27 09:45:00'
);

-- 用户6：ID: 241115f4
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    6, '李四', NULL, 29, '男', 165.0, 85.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-27 12:17:00', '2025-01-27 12:17:00'
);

-- 用户7：ID: 47d40287
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    7, '李四', NULL, 29, '男', 165.0, 78.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-27 12:40:00', '2025-01-27 12:40:00'
);

-- 用户8：ID: b3544215
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    8, '李四', NULL, 29, '男', 165.0, 78.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-27 13:01:00', '2025-01-27 13:01:00'
);

-- 用户9：ID: 09996977
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    9, '李四', NULL, 29, '男', 165.0, 78.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-27 19:23:00', '2025-01-27 19:23:00'
);

-- 用户10：ID: f06916a5
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    10, '李四', NULL, 39, '男', 165.0, 80.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-27 19:39:00', '2025-01-27 19:39:00'
);

-- 用户11：ID: 3da965c6
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    11, '小李', NULL, 28, '女', 165.0, 60.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-27 14:06:00', '2025-01-27 14:06:00'
);

-- 用户12：ID: 23f52f0e
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    12, '小雪', NULL, 32, '女', 170.0, 45.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-27 15:25:00', '2025-01-27 15:25:00'
);

-- 用户13：ID: ce422a44
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    13, '小张', NULL, 32, '女', 160.0, 50.0, NULL,
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-27 16:28:00', '2025-01-27 16:28:00'
);

-- 用户14：ID: 932e7f53
INSERT INTO sys_user (
    user_id, name, phone, age, gender, height, weight, job,
    sleep, drink_smoke, exercise, diet, pressure_state,
    allergy, sickness, family_sickness, symptom,
    complete, health_status, health_score,
    score_life, score_sleep, score_stress, score_body, score_risk,
    done_self_check, done_require,
    answer_content, analysis,
    create_time, update_time
) VALUES (
    14, '方桂英', '18192326703', 59, '女', 163.0, 60.0, '销售',
    NULL, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL,
    0, '一般', 0, 0, 0, 0, 0, 0,
    FALSE, FALSE,
    NULL, NULL,
    '2025-01-28 12:17:00', '2025-01-28 12:17:00'
);

-- ============================================
-- 数据插入完成
-- ============================================
-- 统计信息：
-- - 管理员账号：1个（admin/123456）
-- - 真实用户：14个
-- - 李四（男，29岁）：10个
-- - 李四（男，39岁）：2个
-- - 小李（女，28岁）：1个
-- - 小雪（女，32岁）：1个
-- - 小张（女，32岁）：1个
-- - 方桂英（女，59岁，有手机号和职业）：1个
-- ============================================
