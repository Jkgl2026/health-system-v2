# 数据存储策略说明

## 问题解答

### 1. 这个项目的数据可以保存多长时间？

**答案：永久保存，无时间限制**

#### 详细说明

本项目使用 **PostgreSQL 云数据库** 作为主数据存储，数据保存策略如下：

**✅ 用户数据永久保留**
- 所有用户记录永久存储在数据库中
- 无自动删除或过期机制
- 支持软删除（`deleted_at` 字段），被"删除"的数据仍然保留在数据库中
- 历史记录完整保存，支持多版本数据对比

**✅ 备份数据永久保留**
- 所有备份文件存储在 **S3 对象存储**中
- 备份文件无自动过期或删除机制
- 支持全量备份和增量备份
- 每次备份都会生成新的备份文件，不会覆盖旧备份

**✅ 审计日志永久保留**
- 所有数据变更操作都记录在 `audit_logs` 表中
- 审计日志永久保存，支持完整的操作追溯
- 记录内容包括：操作时间、操作者、操作类型、变更前后数据

**⚠️ 需要注意的限制**
1. **服务级别限制**：由云服务提供商（Coze平台）决定
   - 可能存在数据库实例的最大运行时间限制
   - 如果项目停止运行超过一定时间，数据库实例可能被回收

2. **存储空间限制**：由云服务提供商决定
   - PostgreSQL 数据库可能有存储空间上限（通常为GB级别）
   - S3 对象存储可能有存储空间上限（通常为TB级别）

3. **建议**：
   - 定期导出数据备份（CSV格式）
   - 使用 `/api/backup` 接口定期创建备份
   - 将重要数据备份到本地或其他安全位置

---

### 2. 这个项目的数据可以保存多少数据？

**答案：取决于数据库和对象存储的容量限制**

#### 详细说明

本项目使用两种存储方式，容量限制如下：

**1. PostgreSQL 数据库（用户数据）**

**当前数据结构**：
```sql
- users（用户表）：每条记录约 1-2 KB
- symptomChecks（症状自检）：每条记录约 2-5 KB
- healthAnalysis（健康分析）：每条记录约 1 KB
- userChoices（用户选择）：每条记录约 1-2 KB
- requirements（完成情况）：每条记录约 5-10 KB（包含JSON数据）
- admins（管理员）：每条记录约 1 KB
- auditLogs（审计日志）：每条记录约 2-3 KB
```

**典型用户数据量估算**：
```
单个用户完整数据：
  - users: 1条 × 2 KB = 2 KB
  - symptomChecks: 平均5次 × 3 KB = 15 KB
  - healthAnalysis: 平均5次 × 1 KB = 5 KB
  - userChoices: 平均2次 × 1.5 KB = 3 KB
  - requirements: 1条 × 8 KB = 8 KB
  - auditLogs: 平均20条 × 2.5 KB = 50 KB

单个用户总计：约 83 KB
```

**容量估算**（假设数据库可用空间为 10 GB）：
```
10 GB = 10,485,760 KB
可支持用户数：10,485,760 KB ÷ 83 KB ≈ 126,000 用户
```

**实际容量限制因素**：
1. **数据库实例类型**：由云服务提供商决定
2. **存储配置**：可配置的存储空间大小
3. **数据类型**：JSONB 字段存储大量数据会占用更多空间
4. **索引大小**：索引会占用额外的存储空间
5. **WAL 日志**：PostgreSQL 的写前日志会占用空间

**2. S3 对象存储（备份数据）**

**备份文件大小估算**：
```
单个备份文件大小 = 用户数据量 × 压缩比

假设有 1,000 用户，每人 83 KB：
  - 原始数据：1,000 × 83 KB = 83 MB
  - 备份文件（JSON格式）：约 100 MB
  - 压缩后（可选）：约 20-30 MB

每月保留 30 个备份：
  - 总空间需求：30 × 30 MB = 900 MB
```

**容量估算**（假设对象存储可用空间为 1 TB）：
```
1 TB = 1,099,511,627,776 KB
可支持备份数量：1,099,511,627,776 KB ÷ 30,000 KB ≈ 36,650,389 个备份
```

**实际容量限制**：
1. **存储空间限制**：通常为 TB 级别，远大于 PostgreSQL
2. **文件数量限制**：可能有文件数量上限（通常为百万级别）
3. **单文件大小限制**：可能有单文件大小上限（通常为 GB 级别）

---

## 数据库表结构容量分析

### 主要数据表

| 表名 | 每条记录大小 | 索引大小 | 字段说明 |
|-----|------------|---------|---------|
| `users` | ~2 KB | ~0.5 KB | 基本信息、软删除标记、历史记录关联 |
| `symptomChecks` | ~3 KB | ~0.5 KB | 100项症状检查数据（JSONB） |
| `healthAnalysis` | ~1 KB | ~0.3 KB | 7个健康要素评分 |
| `userChoices` | ~1.5 KB | ~0.3 KB | 方案选择和描述 |
| `requirements` | ~8 KB | ~0.5 KB | 252项习惯+300项症状（JSONB） |
| `admins` | ~1 KB | ~0.3 KB | 管理员信息 |
| `auditLogs` | ~2.5 KB | ~0.8 KB | 所有变更操作记录 |

### 存储热点

**最大存储占用**：
1. **`requirements` 表**：包含两个大型 JSONB 字段
   - `badHabitsChecklist`：252项不良生活习惯数据
   - `symptoms300Checklist`：300项症状数据
   - 建议限制每次填写的记录数量

2. **`auditLogs` 表**：审计日志会持续增长
   - 每次数据变更都会产生日志
   - 建议定期归档或清理历史日志

3. **`symptomChecks` 表**：多次填写会积累大量记录
   - 支持历史数据对比功能
   - 建议限制历史记录保留数量

---

## 优化建议

### 1. 存储优化

**数据压缩**：
```typescript
// 对于大型 JSONB 字段，可以考虑压缩存储
import { deflateSync, inflateSync } from 'zlib';

// 压缩存储
const compressed = deflateSync(JSON.stringify(data));
const base64 = compressed.toString('base64');

// 解压读取
const decompressed = inflateSync(Buffer.from(base64, 'base64'));
const data = JSON.parse(decompressed.toString());
```

**数据归档**：
```sql
-- 将超过 1 年的审计日志归档到单独的表
CREATE TABLE audit_logs_archive AS
SELECT * FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 year';

-- 删除已归档的数据
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '1 year';
```

**数据分表**：
```typescript
// 按时间范围分表存储历史数据
export const symptomChecks2024 = pgTable('symptom_checks_2024', {...});
export const symptomChecks2025 = pgTable('symptom_checks_2025', {...});
```

### 2. 备份策略优化

**定期清理旧备份**：
```typescript
// 只保留最近 30 天的备份
const cleanupOldBackups = async () => {
  const allBackups = await listBackupRecords();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldBackups = allBackups.filter(
    backup => new Date(backup.createdAt) < thirtyDaysAgo
  );

  for (const backup of oldBackups) {
    await deleteBackupFile(backup.fileKey);
    await deleteBackupRecord(backup.id);
  }
};
```

**增量备份优先**：
```typescript
// 每天增量备份，每周全量备份
const backupStrategy = async () => {
  const dayOfWeek = new Date().getDay();

  if (dayOfWeek === 0) { // 周日全量备份
    await createFullBackup();
  } else { // 其他天增量备份
    await createIncrementalBackup();
  }
};
```

### 3. 查询优化

**添加索引**：
```typescript
// 为常用查询字段添加索引
export const users = pgTable('users', {...}, (table) => ({
  phoneIdx: index('users_phone_idx').on(table.phone),
  createdAtIdx: index('users_created_at_idx').on(table.createdAt),
  deletedAtIdx: index('users_deleted_at_idx').on(table.deletedAt),
}));
```

**分页查询**：
```typescript
// 避免一次查询大量数据
const getUsers = async (page: number, pageSize: number) => {
  return db.select()
    .from(users)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
};
```

---

## 监控和维护

### 1. 存储监控

创建存储监控接口：
```typescript
// GET /api/storage/stats
{
  "databaseSize": {
    "total": 1073741824, // 1 GB
    "used": 524288000,   // 500 MB
    "free": 549453824,   // 549 MB
    "usagePercent": 48.8
  },
  "objectStorage": {
    "totalBackupFiles": 30,
    "totalSize": 300000000, // 300 MB
    "oldestBackup": "2024-01-01T00:00:00Z",
    "newestBackup": "2024-01-30T00:00:00Z"
  },
  "tableSizes": {
    "users": 1048576,      // 1 MB
    "symptomChecks": 5242880, // 5 MB
    "requirements": 20971520, // 20 MB
    "auditLogs": 41943040     // 40 MB
  }
}
```

### 2. 自动清理任务

创建定时任务清理旧数据：
```typescript
// 每天凌晨 2 点执行
const scheduledCleanup = async () => {
  // 清理 90 天前的审计日志
  await db.delete(auditLogs)
    .where(lt(auditLogs.createdAt, new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)));

  // 清理 30 天前的备份
  await cleanupOldBackups();

  // 压缩大型 JSONB 字段
  await compressLargeFields();
};
```

---

## 总结

### 数据保存时间
- ✅ **永久保存**：无自动过期或删除机制
- ⚠️ **依赖服务**：受云服务提供商的限制
- 💡 **建议备份**：定期导出数据到本地

### 数据存储容量
- 📊 **数据库**：预计支持 **10万+ 用户**（假设10 GB空间）
- 📊 **对象存储**：预计支持 **百万级备份文件**（假设1 TB空间）
- 💡 **建议监控**：定期检查存储使用情况
- 💡 **建议优化**：数据压缩、归档、清理旧数据

### 实际限制
- ❓ **确切限制**：由云服务提供商（Coze平台）决定
- ❓ **具体数值**：需要咨询技术支持或查看服务配置
- 💡 **最佳实践**：定期备份、监控使用、优化存储

---

**最后更新**：2026-01-25
**版本**：1.0
