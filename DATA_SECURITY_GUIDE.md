# 数据安全功能使用指南

## 概述

本项目实现了完整的数据安全机制，包括审计日志、软删除和数据完整性检查，确保数据安全、可追溯、可恢复。

---

## 1. 审计日志系统

### 功能说明
自动记录所有对数据库的变更操作，包括创建、更新、删除和恢复。每条审计日志包含完整的操作信息。

### 审计日志包含的信息
- **操作类型**：CREATE、UPDATE、DELETE、RESTORE
- **表名和记录ID**：精确定位被操作的数据
- **操作人信息**：ID、名称、类型（ADMIN/SYSTEM/USER）
- **操作前后数据**：oldData和newData（完整JSON）
- **元数据**：IP地址、User-Agent、操作时间
- **操作描述**：自定义描述信息

### 使用示例

#### 1.1 记录审计日志
审计日志会自动记录，无需手动调用。只需在数据操作时传入审计选项：

```typescript
import { healthDataManager } from '@/storage/database';

// 创建用户
const user = await healthDataManager.createUser(userData, {
  operatorId: adminId,
  operatorName: adminName,
  operatorType: 'ADMIN',
  description: '创建新用户',
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
});

// 更新用户
const updatedUser = await healthDataManager.updateUser(
  userId,
  updateData,
  {
    operatorId: adminId,
    operatorName: adminName,
    operatorType: 'ADMIN',
    description: '更新用户信息',
  }
);

// 软删除用户
await healthDataManager.softDeleteUser(userId, {
  operatorId: adminId,
  operatorName: adminName,
  operatorType: 'ADMIN',
  description: '删除用户账号',
});
```

#### 1.2 查询审计日志

```typescript
// 获取所有审计日志
const logs = await healthDataManager.getAuditLogs({ limit: 100 });

// 获取特定记录的审计日志
const userLogs = await healthDataManager.getRecordAuditLogs('users', userId);

// 获取操作者的审计日志
const operatorLogs = await healthDataManager.getOperatorAuditLogs(adminId);

// 获取特定表的审计日志
const userLogs = await healthDataManager.getAuditLogs({
  tableName: 'users',
  limit: 50,
});

// 获取特定操作的审计日志
const deleteLogs = await healthDataManager.getAuditLogs({
  action: 'DELETE',
  limit: 50,
});
```

#### 1.3 使用API查询审计日志

```bash
# 获取最近的20条审计日志
curl http://localhost:5000/api/get-audit-logs?limit=20

# 获取特定用户的审计日志
curl "http://localhost:5000/api/get-audit-logs?tableName=users&recordId=xxx"

# 获取所有删除操作
curl "http://localhost:5000/api/get-audit-logs?action=DELETE&limit=50"
```

### 审计日志应用场景

1. **数据恢复**：误删除数据时，查看oldData进行恢复
2. **安全审计**：追踪所有敏感操作
3. **问题排查**：查看数据变更历史
4. **合规要求**：满足数据可追溯性要求

---

## 2. 软删除功能

### 功能说明
使用标记删除（设置`deleted_at`时间戳）而非物理删除，数据可随时恢复。

### 软删除的优势
- **数据可恢复**：误删除后可以恢复
- **保留操作历史**：审计日志不会被删除
- **支持数据分析**：可以分析已删除数据
- **符合数据合规**：某些场景需要保留数据
- **灵活清理**：可以定时清理过期数据

### 使用示例

#### 2.1 软删除用户

```typescript
import { healthDataManager } from '@/storage/database';

// 软删除用户
const result = await healthDataManager.softDeleteUser(userId, {
  operatorId: adminId,
  operatorName: adminName,
  operatorType: 'ADMIN',
  description: '软删除用户',
});

console.log('软删除成功:', result);
```

#### 2.2 恢复已删除的用户

```typescript
// 恢复用户
const restoredUser = await healthDataManager.restoreUser(userId, {
  operatorId: adminId,
  operatorName: adminName,
  operatorType: 'ADMIN',
  description: '恢复已删除的用户',
});

console.log('恢复成功:', restoredUser);
```

#### 2.3 查询用户（自动过滤已删除）

```typescript
// 默认只返回未删除的用户
const activeUsers = await healthDataManager.getAllUsers();

// 包含已删除的用户
const allUsers = await healthDataManager.getAllUsers({
  includeDeleted: true,
});
```

#### 2.4 获取特定用户（自动过滤已删除）

```typescript
// 只返回未删除的用户
const user = await healthDataManager.getUserById(userId);
// 如果用户已删除，返回null
```

### 软删除应用场景

1. **误删除恢复**：用户误操作可以快速恢复
2. **数据归档**：删除旧数据但保留用于分析
3. **审计要求**：某些操作需要保留记录
4. **临时禁用**：临时禁用用户但不删除数据

---

## 3. 数据完整性检查

### 功能说明
定期检查数据完整性，及时发现和修复数据问题。

### 检查项目

#### 3.1 孤立记录检测
检测没有关联用户的数据（高严重性）：
- requirements表中的孤立记录
- symptom_checks表中的孤立记录
- health_analysis表中的孤立记录
- user_choices表中的孤立记录

#### 3.2 必填字段缺失检测
检测缺少必填字段的用户记录（中严重性）：
- name为空或null
- phone为空或null

#### 3.3 数据一致性检查
检测数据一致性问题（中严重性）：
- 重复的手机号

#### 3.4 已删除用户数据检查
检测已删除用户是否有关联数据（低严重性）：
- 已删除用户的requirements数据
- 已删除用户的symptom_checks数据
- 已删除用户的health_analysis数据
- 已删除用户的user_choices数据

### 使用示例

#### 3.1 运行数据完整性检查

```bash
curl http://localhost:5000/api/check-data-integrity
```

#### 3.2 响应示例

**健康状态**：
```json
{
  "success": true,
  "timestamp": "2026-01-23T12:00:00.000Z",
  "summary": {
    "activeUsers": 14,
    "deletedUsers": 1,
    "requirementsCount": 13,
    "symptomChecksCount": 12,
    "healthAnalysisCount": 11,
    "userChoicesCount": 10,
    "auditLogsCount": 25
  },
  "issues": {
    "total": 0,
    "critical": 0,
    "warning": 0,
    "info": 0,
    "details": []
  },
  "status": "HEALTHY"
}
```

**发现问题**：
```json
{
  "success": true,
  "issues": {
    "total": 2,
    "critical": 1,
    "warning": 1,
    "info": 0,
    "details": [
      {
        "type": "ORPHANED_RECORD",
        "severity": "HIGH",
        "table": "requirements",
        "count": 5,
        "description": "5 条 requirements 记录没有关联的用户",
        "data": [...]
      },
      {
        "type": "DUPLICATE_DATA",
        "severity": "MEDIUM",
        "table": "users",
        "field": "phone",
        "count": 2,
        "description": "2 个手机号存在重复",
        "data": [...]
      }
    ]
  },
  "status": "CRITICAL"
}
```

### 数据完整性检查应用场景

1. **定期巡检**：每天或每周运行一次
2. **问题预警**：及时发现数据问题
3. **数据治理**：保持数据质量
4. **合规检查**：满足数据治理要求

---

## 4. 测试功能

### 4.1 测试软删除和审计日志

```bash
# 运行测试
curl -X POST http://localhost:5000/api/test-soft-delete
```

该测试会：
1. 创建测试用户（记录CREATE日志）
2. 更新用户信息（记录UPDATE日志）
3. 软删除用户（记录DELETE日志）
4. 验证软删除效果
5. 返回审计日志

### 4.2 测试数据完整性检查

```bash
# 运行检查
curl http://localhost:5000/api/check-data-integrity
```

---

## 5. 最佳实践

### 5.1 审计日志
- ✅ 所有数据操作都记录审计日志
- ✅ 提供清晰的操作描述
- ✅ 定期查询和分析审计日志
- ✅ 对敏感操作设置告警

### 5.2 软删除
- ✅ 优先使用软删除而非物理删除
- ✅ 定期清理过期的软删除数据
- ✅ 提供恢复功能供管理员使用
- ✅ 在UI上区分已删除和未删除数据

### 5.3 数据完整性检查
- ✅ 每天运行一次完整性检查
- ✅ 设置告警机制（发现问题立即通知）
- ✅ 及时修复发现的问题
- ✅ 保留检查历史记录

### 5.4 数据备份
- ✅ 定期备份完整数据库
- ✅ 备份审计日志
- ✅ 测试备份恢复流程
- ✅ 保留多个备份版本

---

## 6. 常见问题

### Q: 审计日志会占用大量存储空间吗？
A: 会，但这是必要的。可以定期归档或清理旧的审计日志。

### Q: 软删除的数据什么时候清理？
A: 建议保留至少90天，之后可以清理。

### Q: 数据完整性检查会影响性能吗？
A: 影响很小，建议在低峰期运行。

### Q: 如何恢复误删除的数据？
A: 使用restoreUser方法，或通过审计日志查看oldData手动恢复。

### Q: 审计日志可以删除吗？
A: 可以，但不建议。如果必须删除，建议先备份。

---

## 7. 安全建议

1. **访问控制**：审计日志只能由管理员查看
2. **敏感数据**：审计日志中的敏感数据应该脱敏
3. **日志保护**：审计日志本身也应该被保护，防止被篡改
4. **加密存储**：敏感操作的数据可以使用加密存储

---

**记住：数据安全是持续的工作，需要定期检查和维护！**
