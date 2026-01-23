# 数据库迁移指南

## ⚠️ 重要原则

**绝对禁止在生产环境或已有数据的数据库上使用 `/api/init-db`！**

该API会**删除所有表和数据**，仅用于开发环境的首次初始化。

## ✅ 正确的迁移方式

当需要修改数据库schema（添加列、修改字段类型等）时，**必须使用数据库迁移**。

### 1. 修改schema定义

首先在 `src/storage/database/shared/schema.ts` 中更新表定义：

```typescript
// 示例：添加新字段
export const requirements = pgTable(
  "requirements",
  {
    // ... 现有字段
    newField: jsonb("new_field"), // 添加新字段
  }
);

// 同时更新Zod schema
export const insertRequirementSchema = createCoercedInsertSchema(requirements).pick({
  // ... 现有字段
  newField: true, // 添加新字段
});
```

### 2. 创建迁移脚本

在 `src/app/api/migrate-db/route.ts` 中添加迁移逻辑：

```typescript
// 检查列是否存在
const columnCheck = await db.execute(`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'requirements' 
  AND column_name = 'new_field';
`);

if (!columnCheck.rows || columnCheck.rows.length === 0) {
  // 列不存在，添加列（不删除数据！）
  await db.execute(`
    ALTER TABLE requirements 
    ADD COLUMN new_field JSONB;
  `);
  migrationLog.push('✓ 已添加 requirements.new_field 列');
} else {
  migrationLog.push('ℹ requirements.new_field 列已存在，跳过');
}
```

### 3. 应用迁移

```bash
curl -X POST http://localhost:5000/api/migrate-db
```

### 4. 验证迁移

```bash
# 诊断数据库状态
curl http://localhost:5000/api/diagnose-db

# 检查特定用户的数据
curl "http://localhost:5000/api/check-user-seven-questions?userId=xxx"
```

## 可用的迁移和诊断API

### `/api/migrate-db` (POST)
安全地添加缺失的数据库列，不删除现有数据。
- 添加 `users.deleted_at` 列（软删除支持）
- 添加 `requirements.seven_questions_answers` 列
- 创建 `audit_logs` 表（审计日志支持）

### `/api/diagnose-db` (GET)
诊断数据库状态，包括：
- 表结构
- 数据数量
- 示例数据

### `/api/check-user-seven-questions` (GET)
检查特定用户的七问数据。

### `/api/check-data-integrity` (GET)
检查数据完整性，包括：
- 孤立记录检测（没有关联用户的记录）
- 必填字段缺失检测
- 数据一致性检查（重复数据）
- 已删除用户数据检查
- 数据统计

### `/api/get-audit-logs` (GET)
获取审计日志，支持过滤：
- `limit`: 返回数量
- `tableName`: 按表名过滤
- `recordId`: 按记录ID过滤

## 新增功能说明

### 1. 审计日志系统
自动记录所有数据变更操作，包括创建、更新、删除和恢复。

**审计日志记录内容**：
- 操作类型（CREATE/UPDATE/DELETE/RESTORE）
- 表名和记录ID
- 操作人信息（ID、名称、类型）
- 操作前后的数据（oldData/newData）
- 操作时间、IP、UserAgent
- 操作描述

**使用方法**：
```typescript
// 创建用户时自动记录审计日志
const user = await healthDataManager.createUser(userData, {
  operatorId: adminId,
  operatorName: adminName,
  operatorType: 'ADMIN',
  description: '创建用户',
});

// 获取审计日志
const logs = await healthDataManager.getAuditLogs({
  tableName: 'users',
  recordId: userId,
  limit: 10,
});
```

### 2. 软删除功能
使用标记删除而非物理删除，数据可恢复。

**软删除特点**：
- 设置 `deleted_at` 时间戳标记删除
- 普通查询自动过滤已删除数据
- 可查询包含已删除的数据
- 支持恢复已删除的数据

**使用方法**：
```typescript
// 软删除用户
await healthDataManager.softDeleteUser(userId, {
  operatorId: adminId,
  operatorName: adminName,
  operatorType: 'ADMIN',
  description: '软删除用户',
});

// 恢复已删除的用户
const restoredUser = await healthDataManager.restoreUser(userId, {
  operatorId: adminId,
  operatorName: adminName,
  operatorType: 'ADMIN',
  description: '恢复用户',
});

// 获取所有用户（不包括已删除）
const activeUsers = await healthDataManager.getAllUsers();

// 获取所有用户（包括已删除）
const allUsers = await healthDataManager.getAllUsers({ includeDeleted: true });
```

### 3. 数据完整性检查
定期检查数据完整性和一致性。

**检查项目**：
- 孤立记录检测（没有关联用户的数据）
- 必填字段缺失检测
- 重复数据检测（如重复手机号）
- 已删除用户的数据残留检查

**使用方法**：
```bash
# 运行数据完整性检查
curl http://localhost:5000/api/check-data-integrity
```

**响应示例**：
```json
{
  "success": true,
  "summary": {
    "activeUsers": 14,
    "deletedUsers": 1,
    "requirementsCount": 13,
    "auditLogsCount": 3
  },
  "issues": {
    "total": 0,
    "critical": 0,
    "warning": 0,
    "details": []
  },
  "status": "HEALTHY"
}
```

1. **先在测试环境验证**：在开发或测试环境先应用迁移，确保没有问题
2. **保持向后兼容**：添加新字段时使用可为空（nullable）或默认值
3. **记录迁移历史**：在代码注释中记录每个迁移的目的和日期
4. **备份重要数据**：在应用迁移前，如果有重要数据，建议先备份
5. **幂等性**：迁移脚本应该是幂等的（可以多次执行，不会产生副作用）

## 示例：添加seven_questions_answers字段

### 问题
管理后台无法显示七问数据，发现requirements表缺少`seven_questions_answers`列。

### 解决方案
1. 在schema.ts中确认字段已定义
2. 创建`/api/migrate-db` API
3. 运行迁移：`curl -X POST http://localhost:5000/api/migrate-db`
4. 创建测试数据：`curl -X POST http://localhost:5000/api/add-test-seven-questions`
5. 验证数据：`curl "http://localhost:5000/api/check-user-seven-questions?userId=xxx"`

### 结果
- ✓ 所有现有数据保留
- ✓ 新字段成功添加
- ✓ 新用户可以正常保存七问数据
- ✓ 管理后台可以正确显示七问数据

## 常见迁移场景

### 添加新列
```sql
ALTER TABLE table_name ADD COLUMN column_name data_type;
```

### 添加索引
```sql
CREATE INDEX index_name ON table_name(column_name);
```

### 修改列类型（需要谨慎）
```sql
ALTER TABLE table_name ALTER COLUMN column_name TYPE new_type;
```

## 禁止的操作

❌ **不要使用 DROP TABLE 或 TRUNCATE** - 会删除数据
❌ **不要手动修改生产数据库** - 应该通过代码和迁移脚本
❌ **不要在高峰期进行大规模迁移** - 可能导致服务不可用

## 应急恢复

如果迁移出现错误：
1. 立即停止相关服务
2. 回滚代码更改
3. 如果有备份，从备份恢复
4. 修复迁移脚本
5. 在测试环境验证
6. 重新应用迁移

---

**记住：数据是无价的，迁移必须谨慎！**
