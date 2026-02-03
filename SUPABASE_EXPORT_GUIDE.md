# 导出 Supabase 数据库的 SQL 查询

由于沙箱环境无法直接访问 Supabase 数据库，请使用以下方法导出数据：

## 方法1：使用 Supabase Dashboard Table Editor（最简单）

1. 访问：https://supabase.com/dashboard
2. 找到项目：`rtccwmuryojxgxyuktjk`
3. 进入 Table Editor
4. 选择每个表（users, symptom_checks 等）
5. 点击右上角的 "Export" 按钮
6. 选择 CSV 格式下载

## 方法2：使用 SQL Query

在 Supabase SQL Editor 中执行以下查询，然后导出结果：

### 导出所有表的结构和记录数

```sql
-- 查看所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 导出 users 表

```sql
SELECT * FROM users
ORDER BY created_at DESC;
```

### 导出 symptom_checks 表

```sql
SELECT * FROM symptom_checks
ORDER BY checked_at DESC;
```

### 导出 health_analysis 表

```sql
SELECT * FROM health_analysis
ORDER BY created_at DESC;
```

### 统计各表记录数

```sql
SELECT
  'users' as table_name,
  COUNT(*) as record_count
FROM users
UNION ALL
SELECT
  'admins' as table_name,
  COUNT(*) as record_count
FROM admins
UNION ALL
SELECT
  'symptom_checks' as table_name,
  COUNT(*) as record_count
FROM symptom_checks
UNION ALL
SELECT
  'health_analysis' as table_name,
  COUNT(*) as record_count
FROM health_analysis
UNION ALL
SELECT
  'user_choices' as table_name,
  COUNT(*) as record_count
FROM user_choices
UNION ALL
SELECT
  'requirements' as table_name,
  COUNT(*) as record_count
FROM requirements
UNION ALL
SELECT
  'courses' as table_name,
  COUNT(*) as record_count
FROM courses;
```

## 方法3：使用 Supabase Backup 功能

1. 访问：https://supabase.com/dashboard/project/rtccwmuryojxgxyuktjk/database/backups
2. 点击 "Create backup"
3. 下载备份文件
4. 将备份文件的内容发给我

## 下一步

导出数据后，请将以下信息提供给我：

1. **数据统计**：各表有多少条记录
2. **最新数据**：最近添加的用户和自检记录
3. **CSV 文件**：如果有导出的 CSV 文件

这样我就可以帮你将数据导入到 Coze 平台数据库中了！
