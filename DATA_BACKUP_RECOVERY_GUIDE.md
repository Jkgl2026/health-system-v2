# 数据安全与备份恢复操作指南

## 📋 目录

1. [数据安全架构概述](#数据安全架构概述)
2. [备份恢复功能说明](#备份恢复功能说明)
3. [备份操作指南](#备份操作指南)
4. [恢复操作指南](#恢复操作指南)
5. [数据导出导入指南](#数据导出导入指南)
6. [数据库迁移与回滚](#数据库迁移与回滚)
7. [应急处理方案](#应急处理方案)
8. [最佳实践](#最佳实践)

---

## 数据安全架构概述

### 多层防护机制

```
┌─────────────────────────────────────────────────────────┐
│                   数据安全防护层                         │
├─────────────────────────────────────────────────────────┤
│  1. 审计日志（实时记录）                                  │
│     └─ 记录所有变更，支持追溯                             │
│                                                         │
│  2. 软删除（删除保护）                                    │
│     └─ 标记删除，可快速恢复                               │
│                                                         │
│  3. 备份系统（安全网）                                    │
│     ├─ 全量备份（完整数据库快照）                          │
│     ├─ 增量备份（变更数据）                               │
│     └─ 自动备份（迁移前自动创建）                         │
│                                                         │
│  4. 导出/导入（便携性）                                   │
│     └─ JSON格式，支持跨环境迁移                           │
│                                                         │
│  5. 迁移回滚（结构变更保护）                              │
│     └─ 提供撤销脚本，恢复表结构                           │
└─────────────────────────────────────────────────────────┘
```

### 核心原则

1. **备份优先原则**：任何修改操作前必须先备份
2. **可回滚原则**：所有操作都必须能够回滚
3. **多重保护原则**：审计日志 + 软删除 + 备份 + 导出
4. **自动化原则**：支持自动定期备份和迁移前自动备份

---

## 备份恢复功能说明

### 1. 数据库备份系统

#### 功能特性
- ✅ **全量备份**：备份所有表的数据
- ✅ **增量备份**：备份变更的数据
- ✅ **自动备份**：迁移前自动创建备份
- ✅ **备份验证**：验证备份完整性
- ✅ **备份管理**：列出、删除、下载备份
- ✅ **对象存储**：备份文件存储到对象存储，安全可靠

#### 备份存储位置
- 存储位置：对象存储（S3兼容）
- 存储路径：`backups/{backupId}.json`
- 文件格式：JSON
- 包含内容：元数据 + 所有表数据

### 2. 数据恢复系统

#### 功能特性
- ✅ **从备份恢复**：选择备份文件恢复数据库
- ✅ **完整性验证**：恢复前验证备份完整性
- ✅ **选择性恢复**：可恢复单个表或全部表
- ✅ **恢复日志**：记录恢复操作

### 3. 数据导出/导入

#### 功能特性
- ✅ **全量导出**：导出所有表数据
- ✅ **JSON格式**：易于阅读和编辑
- ✅ **校验和验证**：确保数据完整性
- ✅ **导入模式**：支持覆盖和追加模式

### 4. 迁移回滚机制

#### 功能特性
- ✅ **自动备份**：迁移前自动创建备份
- ✅ **迁移历史**：记录所有迁移操作
- ✅ **一键回滚**：从备份恢复到迁移前状态
- ✅ **迁移步骤**：支持多步骤迁移和回滚

---

## 备份操作指南

### 创建全量备份

**API：** `POST /api/backup/create`

**请求示例：**
```bash
curl -X POST http://localhost:5000/api/backup/create \
  -H "Content-Type: application/json" \
  -d '{
    "backupType": "FULL",
    "createdBy": "ADMIN",
    "description": "手动全量备份"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "message": "备份创建成功",
  "data": {
    "backupId": "backup-2025-01-15T10-30-00-a1b2c3d4",
    "backupType": "FULL",
    "backupDate": "2025-01-15T10:30:00.000Z",
    "tableCount": 7,
    "totalRecords": 150,
    "fileSize": 102400,
    "fileKey": "backups/backup-2025-01-15T10-30-00-a1b2c3d4.json",
    "checksum": "a1b2c3d4",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "createdBy": "ADMIN"
  }
}
```

### 创建增量备份

**API：** `POST /api/backup/create`

**请求示例：**
```bash
curl -X POST http://localhost:5000/api/backup/create \
  -H "Content-Type: application/json" \
  -d '{
    "backupType": "INCREMENTAL",
    "previousBackupId": "backup-2025-01-15T10-00-00-a1b2c3d4",
    "createdBy": "ADMIN",
    "description": "增量备份"
  }'
```

### 列出所有备份

**API：** `GET /api/backup/list`

**请求示例：**
```bash
curl http://localhost:5000/api/backup/list
```

**响应示例：**
```json
{
  "success": true,
  "message": "获取备份列表成功",
  "data": {
    "count": 5,
    "backups": [
      {
        "backupId": "backup-2025-01-15T10-30-00-a1b2c3d4",
        "backupType": "FULL",
        "backupDate": "2025-01-15T10:30:00.000Z",
        "tableCount": 7,
        "totalRecords": 150,
        "fileSize": "100.00 KB",
        "previousBackupId": null,
        "checksum": "a1b2c3d4",
        "createdBy": "ADMIN"
      }
    ]
  }
}
```

### 验证备份完整性

**API：** `GET /api/backup/verify?backupId=xxx`

**请求示例：**
```bash
curl "http://localhost:5000/api/backup/verify?backupId=backup-2025-01-15T10-30-00-a1b2c3d4"
```

**响应示例：**
```json
{
  "success": true,
  "message": "备份验证通过",
  "data": {
    "valid": true,
    "checksumMatch": true,
    "details": {
      "backupId": "backup-2025-01-15T10-30-00-a1b2c3d4",
      "backupType": "FULL",
      "backupDate": "2025-01-15T10:30:00.000Z",
      "tableCount": 7,
      "totalRecords": 150,
      "recordCounts": {
        "users": 50,
        "symptomChecks": 30,
        "healthAnalysis": 30,
        "userChoices": 20,
        "requirements": 15,
        "admins": 3,
        "auditLogs": 2
      },
      "expectedChecksum": "a1b2c3d4",
      "actualChecksum": "a1b2c3d4",
      "tablesMatch": true
    }
  }
}
```

### 删除备份

**API：** `DELETE /api/backup/delete?backupId=xxx`

**请求示例：**
```bash
curl -X DELETE "http://localhost:5000/api/backup/delete?backupId=backup-2025-01-15T10-30-00-a1b2c3d4"
```

### 下载备份文件

**API：** `GET /api/backup/download?backupId=xxx&expireTime=3600`

**请求示例：**
```bash
curl "http://localhost:5000/api/backup/download?backupId=backup-2025-01-15T10-30-00-a1b2c3d4"
```

**响应示例：**
```json
{
  "success": true,
  "message": "生成下载URL成功",
  "data": {
    "downloadUrl": "https://storage.example.com/backups/backup-2025-01-15T10-30-00-a1b2c3d4.json?signature=xxx",
    "expireTime": 3600,
    "backupId": "backup-2025-01-15T10-30-00-a1b2c3d4"
  }
}
```

---

## 恢复操作指南

### 从备份恢复数据库

**API：** `POST /api/backup/restore`

**⚠️ 重要提醒：**
1. 恢复操作会覆盖现有数据
2. 建议在恢复前先创建当前状态的备份
3. 恢复操作不可逆

**请求示例：**
```bash
# 1. 先创建当前状态的备份
curl -X POST http://localhost:5000/api/backup/create \
  -H "Content-Type: application/json" \
  -d '{
    "backupType": "FULL",
    "createdBy": "ADMIN",
    "description": "恢复前的安全备份"
  }'

# 2. 从备份恢复
curl -X POST http://localhost:5000/api/backup/restore \
  -H "Content-Type: application/json" \
  -d '{
    "backupId": "backup-2025-01-15T10-00-00-a1b2c3d4",
    "createdBy": "ADMIN",
    "description": "恢复到指定备份"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "message": "数据库恢复成功",
  "data": {
    "backupId": "backup-2025-01-15T10-00-00-a1b2c3d4",
    "backupDate": "2025-01-15T10:00:00.000Z",
    "restoredRecords": {
      "users": 50,
      "symptomChecks": 30,
      "healthAnalysis": 30,
      "userChoices": 20,
      "requirements": 15,
      "admins": 3,
      "auditLogs": 2
    }
  }
}
```

### 恢复流程

1. **验证备份**：检查备份完整性和可用性
2. **当前备份**：创建当前状态的备份（可选但推荐）
3. **执行恢复**：从备份恢复数据库
4. **验证恢复**：检查恢复后的数据

---

## 数据导出导入指南

### 导出所有数据

**API：** `POST /api/data/export`

**请求示例：**
```bash
curl -X POST http://localhost:5000/api/data/export \
  -H "Content-Type: application/json" \
  -d '{
    "createdBy": "ADMIN",
    "description": "数据导出"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "message": "数据导出成功",
  "data": {
    "exportId": "export-2025-01-15T10-30-00-a1b2c3d4",
    "fileKey": "exports/export-2025-01-15T10-30-00-a1b2c3d4.json",
    "fileSize": 102400,
    "downloadUrl": "https://storage.example.com/exports/export-2025-01-15T10-30-00-a1b2c3d4.json?signature=xxx"
  }
}
```

### 导入数据

**API：** `POST /api/data/import`

**请求示例：**
```bash
# 方式1：直接提供导出数据
curl -X POST http://localhost:5000/api/data/import \
  -H "Content-Type: application/json" \
  -d '{
    "exportData": {
      "metadata": {
        "exportId": "export-2025-01-15T10-30-00-a1b2c3d4",
        "exportDate": "2025-01-15T10:30:00.000Z",
        "version": "1.0",
        "tables": ["users", "symptomChecks", ...],
        "recordCounts": {...},
        "checksum": "a1b2c3d4"
      },
      "data": {...}
    },
    "overwrite": false,
    "createdBy": "ADMIN"
  }'

# 方式2：从对象存储导入
curl -X POST http://localhost:5000/api/data/import \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "exports/export-2025-01-15T10-30-00-a1b2c3d4.json",
    "overwrite": false,
    "createdBy": "ADMIN"
  }'
```

### 导入模式说明

- **overwrite: false**（默认）：
  - 只插入不存在的记录
  - 保留现有数据
  - 适合数据追加场景

- **overwrite: true**：
  - 插入或更新记录
  - 覆盖现有数据
  - 适合数据同步场景

---

## 数据库迁移与回滚

### 执行数据库迁移

**API：** `POST /api/migrate-db`

**功能特性：**
- ✅ 迁移前自动创建备份
- ✅ 记录迁移历史
- ✅ 支持回滚
- ✅ 幂等操作（可重复执行）

**请求示例：**
```bash
curl -X POST http://localhost:5000/api/migrate-db \
  -H "Content-Type: application/json" \
  -d '{
    "autoBackup": true,
    "createdBy": "ADMIN"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "message": "迁移执行成功",
  "data": {
    "migrationId": "migration-2025-01-15T10-30-00-a1b2c3d4",
    "backupId": "backup-2025-01-15T10-29-59-x1y2z3w4",
    "note": "如果迁移出现问题，可以使用迁移ID进行回滚"
  }
}
```

### 回滚迁移

**API：** `POST /api/migrate-db/rollback`

**请求示例：**
```bash
curl -X POST http://localhost:5000/api/migrate-db/rollback \
  -H "Content-Type: application/json" \
  -d '{
    "migrationId": "migration-2025-01-15T10-30-00-a1b2c3d4",
    "createdBy": "ADMIN"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "message": "迁移回滚成功",
  "data": {
    "migrationId": "migration-2025-01-15T10-30-00-a1b2c3d4",
    "backupId": "backup-2025-01-15T10-29-59-x1y2z3w4"
  }
}
```

### 查看迁移历史

**API：** `GET /api/migrate-db/history`

**请求示例：**
```bash
curl "http://localhost:5000/api/migrate-db/history?limit=50"
```

---

## 应急处理方案

### 场景1：误删除数据

**快速恢复（推荐）：**
```bash
# 1. 查看审计日志，确认删除时间
curl "http://localhost:5000/api/get-audit-logs?tableName=users&limit=10"

# 2. 使用软删除恢复
curl -X POST http://localhost:5000/api/restore-user \
  -H "Content-Type: application/json" \
  -d '{"userId": "xxx"}'
```

**从备份恢复：**
```bash
# 1. 找到最近的备份
curl "http://localhost:5000/api/backup/list"

# 2. 从备份恢复
curl -X POST http://localhost:5000/api/backup/restore \
  -H "Content-Type: application/json" \
  -d '{"backupId": "backup-xxx"}'
```

### 场景2：数据损坏

**恢复流程：**
```bash
# 1. 检查数据完整性
curl "http://localhost:5000/api/check-data-integrity"

# 2. 创建当前状态备份（用于分析）
curl -X POST http://localhost:5000/api/backup/create \
  -H "Content-Type: application/json" \
  -d '{"backupType": "FULL", "createdBy": "ADMIN", "description": "数据损坏时的备份"}'

# 3. 从最近的正常备份恢复
curl -X POST http://localhost:5000/api/backup/restore \
  -H "Content-Type: application/json" \
  -d '{"backupId": "backup-xxx-last-good"}'
```

### 场景3：迁移失败

**回滚流程：**
```bash
# 1. 查看迁移历史
curl "http://localhost:5000/api/migrate-db/history"

# 2. 回滚失败的迁移
curl -X POST http://localhost:5000/api/migrate-db/rollback \
  -H "Content-Type: application/json" \
  -d '{"migrationId": "migration-xxx"}'
```

### 场景4：需要迁移数据到其他环境

**导出导入流程：**
```bash
# 1. 导出数据
curl -X POST http://localhost:5000/api/data/export \
  -H "Content-Type: application/json" \
  -d '{"createdBy": "ADMIN"}'

# 2. 下载导出文件（使用返回的 downloadUrl）

# 3. 在目标环境导入
curl -X POST http://localhost:5000/api/data/import \
  -H "Content-Type: application/json" \
  -d '{"fileKey": "exports/export-xxx.json", "overwrite": true}'
```

---

## 最佳实践

### 1. 定期备份

**建议策略：**
- **全量备份**：每天凌晨2:00自动执行
- **增量备份**：每小时自动执行
- **保留策略**：最近7天 + 每周1个（共4周）

### 2. 重要操作前的备份

**必须备份的场景：**
- ✅ 数据库迁移
- ✅ 批量更新数据
- ✅ 表结构修改
- ✅ 重大功能上线

**操作流程：**
```bash
# 1. 创建备份
curl -X POST http://localhost:5000/api/backup/create \
  -H "Content-Type: application/json" \
  -d '{"backupType": "FULL", "createdBy": "ADMIN", "description": "操作前的安全备份"}'

# 2. 执行操作
# ... 执行你的操作 ...

# 3. 验证结果
# ... 验证操作是否成功 ...

# 4. 如果失败，从备份恢复
curl -X POST http://localhost:5000/api/backup/restore \
  -H "Content-Type: application/json" \
  -d '{"backupId": "backup-xxx"}'
```

### 3. 备份验证

**定期验证备份：**
```bash
# 每周验证最近的备份
curl "http://localhost:5000/api/backup/verify?backupId=backup-latest"
```

### 4. 数据完整性检查

**定期运行检查：**
```bash
# 每天运行数据完整性检查
curl "http://localhost:5000/api/check-data-integrity"
```

### 5. 审计日志查看

**定期查看审计日志：**
```bash
# 查看最近的数据变更
curl "http://localhost:5000/api/get-audit-logs?limit=50"
```

### 6. 备份文件管理

**清理旧备份：**
```bash
# 删除超过30天的备份
curl -X DELETE "http://localhost:5000/api/backup/delete?backupId=backup-xxx-old"
```

### 7. 多重验证

**重要操作的多重验证：**
1. ✅ 操作前备份
2. ✅ 操作后验证
3. ✅ 查看审计日志
4. ✅ 运行数据完整性检查

---

## 安全注意事项

### ⚠️ 重要提醒

1. **禁止在生产环境使用 `/api/init-db`**
   - 使用 `/api/migrate-db` 替代
   - 迁移API支持自动备份和回滚

2. **所有数据操作必须记录审计日志**
   - 系统已自动集成审计日志
   - 可通过 `/api/get-audit-logs` 查看

3. **优先使用软删除而非物理删除**
   - 软删除可快速恢复
   - 避免数据永久丢失

4. **定期备份**
   - 建议每天至少一次全量备份
   - 重要操作前手动备份

5. **备份验证**
   - 定期验证备份完整性
   - 确保备份可用

6. **权限控制**
   - 备份和恢复操作需要管理员权限
   - 记录操作人信息

---

## API 总览

### 备份相关

| API | 方法 | 描述 |
|-----|------|------|
| `/api/backup/create` | POST | 创建备份 |
| `/api/backup/list` | GET | 列出备份 |
| `/api/backup/restore` | POST | 从备份恢复 |
| `/api/backup/verify` | GET | 验证备份 |
| `/api/backup/delete` | DELETE | 删除备份 |
| `/api/backup/download` | GET | 下载备份 |

### 导出导入相关

| API | 方法 | 描述 |
|-----|------|------|
| `/api/data/export` | POST | 导出数据 |
| `/api/data/import` | POST | 导入数据 |

### 迁移相关

| API | 方法 | 描述 |
|-----|------|------|
| `/api/migrate-db` | POST | 执行迁移 |
| `/api/migrate-db/rollback` | POST | 回滚迁移 |
| `/api/migrate-db/history` | GET | 迁移历史 |

### 审计日志

| API | 方法 | 描述 |
|-----|------|------|
| `/api/get-audit-logs` | GET | 获取审计日志 |

### 数据完整性

| API | 方法 | 描述 |
|-----|------|------|
| `/api/check-data-integrity` | GET | 检查数据完整性 |

---

## 总结

本系统提供了完整的备份恢复机制，包括：

✅ **多层防护**：审计日志 + 软删除 + 备份 + 导出
✅ **自动备份**：迁移前自动创建备份
✅ **快速恢复**：支持从备份快速恢复
✅ **数据验证**：备份和数据完整性验证
✅ **迁移回滚**：支持迁移回滚
✅ **便携性**：JSON格式导出导入

**关键原则：**
- 备份优先：任何修改前先备份
- 可回滚：所有操作都能回滚
- 多重保护：多层次的数据安全保障
- 自动化：自动备份和验证

通过遵循本指南，你可以确保数据安全，并在出现问题时快速恢复。
