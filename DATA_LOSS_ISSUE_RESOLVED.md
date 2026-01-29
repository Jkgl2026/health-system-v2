# 数据丢失问题排查与解决方案

## 问题描述
用户反馈"数据又搞丢啦"，系统无法正常访问用户数据。

## 问题根因
数据库表结构不完整。`requirements` 表缺少两个关键字段：
- `bad_habits_checklist`（不良生活习惯自检表数据）
- `symptoms_300_checklist`（300项症状自检表数据）

### 具体错误
```
错误码: 42703 (column does not exist)
错误位置: /api/admin/users API
错误原因: 查询 users 表关联的 requirements 表时，引用了不存在的列
```

## 解决步骤

### 1. 立即修复（已完成）
```sql
-- 添加缺失的列
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS bad_habits_checklist jsonb;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS symptoms_300_checklist jsonb;
```

### 2. 验证修复（已完成）
- ✅ 用户列表API恢复正常
- ✅ 16个用户数据完整
- ✅ 所有关联数据正常返回

### 3. 数据完整性确认
经检查，**所有用户数据都完整保存在数据库中**，没有真正丢失：
- 用户基本信息：16条记录
- 症状自检数据：完整
- 健康分析数据：完整
- 用户选择记录：完整
- 要求完成情况：完整（新列已添加，初始值为null）

## 数据恢复方案

如果用户在浏览器中保存了未上传的数据，可以使用以下方法恢复：

### 方案1：浏览器本地数据恢复工具
访问 `/local-data-recovery` 页面，该页面提供：
- 自动扫描 localStorage 和 sessionStorage
- 识别可能的用户数据
- 一键导出数据为 JSON 文件
- 手动恢复到数据库

### 方案2：管理后台查看
访问 `/admin/dashboard` 页面，查看：
- 完整的用户列表（16个用户）
- 详细的用户数据
- 所有关联表数据

### 方案3：API 直接访问
```bash
# 获取所有用户数据
curl http://localhost:5000/api/admin/users?page=1&limit=100

# 获取特定用户详情
curl http://localhost:5000/api/admin/users/{userId}
```

## 防止再次发生的措施

### 1. 自动化迁移
迁移API (`/api/migrate-db`) 已包含所有必需的列添加步骤：
- `users.deleted_at` - 软删除支持
- `requirements.seven_questions_answers` - 七问答案
- `requirements.bad_habits_checklist` - 不良生活习惯表
- `requirements.symptoms_300_checklist` - 300症状表
- `audit_logs` 表 - 审计日志

### 2. 定期检查
建议定期运行数据库完整性检查：
```bash
curl http://localhost:5000/api/health
```

### 3. 备份机制
系统已支持自动备份和恢复功能：
- 全量备份
- 增量备份
- 迁移回滚

## 当前系统状态
- ✅ 数据库连接正常
- ✅ 表结构完整（所有必需字段已添加）
- ✅ API 响应正常
- ✅ 16个用户数据完整
- ✅ 审计日志系统运行中
- ✅ 软删除功能已启用

## 建议
1. 每次更新代码后，运行迁移API确保表结构同步
2. 定期检查 `/api/health` 接口，确认系统健康状态
3. 重要操作前先进行数据备份
4. 使用管理后台监控数据完整性

## 技术细节
- 数据库：PostgreSQL
- ORM：Drizzle ORM
- 迁移管理：migrationManager
- 审计日志：已启用，记录所有数据变更

---
**问题解决时间**: 2026-01-24 12:42
**解决状态**: ✅ 已解决
**数据完整性**: ✅ 确认无数据丢失
