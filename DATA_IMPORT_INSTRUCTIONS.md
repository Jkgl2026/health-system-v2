# 数据导入到 Coze 平台 - 操作指南

## 📊 准备工作

### 已完成
- ✅ 数据已导出：`assets/export-data-20260203-220409.json`
- ✅ 导入 API 已创建：`/api/data/import`
- ✅ 包含59个用户、1个管理员、72个课程数据

---

## 🔧 方法1：通过 Coze 平台配置导入 ⭐ 推荐

### 步骤1：配置环境变量

1. **登录 Coze 平台**
   - 访问：https://www.coze.com/
   - 登录你的账号

2. **进入项目设置**
   - 找到你的健康自检系统项目
   - 进入项目详情页面
   - 找到"环境变量"或"配置"选项

3. **添加数据库环境变量**
   ```
   # PostgreSQL 数据库连接
   PGDATABASE_URL=postgresql://user:password@host:port/database

   # 或者分别配置
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   ```

4. **获取连接信息**
   - 从 Coze 平台的数据库配置中获取连接信息
   - 或者从 Supabase Dashboard 获取

### 步骤2：导入数据

1. **读取导出文件**
   ```bash
   cat assets/export-data-20260203-220409.json
   ```

2. **发送导入请求**
   ```bash
   curl -X POST https://cd776816-213e-4c84-af60-dbe5b397d82e.dev.coze.site/api/data/import \
     -H "Content-Type: application/json" \
     -d @assets/export-data-20260203-220409.json
   ```

3. **查看导入结果**
   - 如果成功，会返回导入成功的信息
   - 如果失败，会返回错误信息

### 步骤3：验证数据

1. **检查用户数量**
   ```
   https://cd776816-213e-4c84-af60-dbe5b397d82e.dev.coze.site/api/data/count
   ```

2. **登录后台**
   ```
   https://cd776816-213e-4c84-af60-dbe5b397d82e.dev.coze.site/admin/login
   ```

3. **查看用户列表**
   - 使用管理员账号登录
   - 进入 Dashboard 查看用户列表

---

## 🔧 方法2：通过本地 API 导入

### 步骤1：配置 Coze 数据库连接

1. **创建 `.env.local` 文件**
   ```env
   PGDATABASE_URL=postgresql://user:password@host:port/database
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   ```

2. **替换为实际的连接信息**

### 步骤2：执行导入

```bash
# 方法 A：使用 curl
curl -X POST http://localhost:5000/api/data/import \
  -H "Content-Type: application/json" \
  -d @assets/export-data-20260203-220409.json

# 方法 B：使用 Node.js 脚本
node scripts/import-data.js
```

### 步骤3：验证数据

```bash
curl http://localhost:5000/api/data/count
```

---

## 🔧 方法3：通过 Supabase Dashboard 导入

### 前提条件
- Coze 平台使用 Supabase 数据库
- 你有 Supabase 项目访问权限

### 步骤1：登录 Supabase

1. **访问 Supabase Dashboard**
   - 登录：https://supabase.com/dashboard
   - 使用你的账号登录

2. **选择项目**
   - 找到 Coze 平台使用的 Supabase 项目
   - 点击进入

### 步骤2：打开 SQL Editor

1. **导航到 SQL Editor**
   - 在左侧菜单中找到 "SQL Editor"
   - 点击 "New Query"

### 步骤3：执行插入语句

```sql
-- 插入用户数据
INSERT INTO users (id, name, phone, email, age, gender, weight, height, blood_pressure, occupation, address, bmi, created_at, updated_at, deleted_at, phone_group_id, is_latest_version)
VALUES
  ('user-id-1', '用户1', 'phone1', 'email1', 30, '男', 70, 175, NULL, NULL, NULL, '22.9', '2026-01-28T04:17:23.870Z', NULL, NULL, NULL, true),
  ('user-id-2', '用户2', 'phone2', 'email2', 30, '女', 60, 165, NULL, NULL, NULL, '22.0', '2026-01-28T03:53:38.864Z', NULL, NULL, NULL, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  age = EXCLUDED.age,
  gender = EXCLUDED.gender;
```

### 步骤4：验证数据

```sql
-- 检查用户数量
SELECT COUNT(*) FROM users;

-- 查看用户列表
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

---

## ❓ 需要你提供的信息

为了完成导入，请提供以下任一信息：

### 选项1：Coze 平台数据库连接信息

```
PGDATABASE_URL=postgresql://user:password@host:port/database
```

或分别提供：
- DB_HOST: 数据库主机
- DB_PORT: 数据库端口（通常是5432）
- DB_NAME: 数据库名称
- DB_USER: 数据库用户名
- DB_PASSWORD: 数据库密码

### 选项2：Supabase 项目信息

- Supabase 项目 URL
- Supabase 项目密码
- 或 Supabase 服务角色密钥

### 选项3：让我帮你查找

告诉我：
- 你能否访问 Coze 平台的配置页面？
- 你是否有 Supabase 账号？
- Coze 平台使用的是什么数据库？

---

## 🚀 快速开始

### 最简单的方法

1. **访问 Coze 平台配置**
   - 登录：https://www.coze.com/
   - 进入项目设置
   - 找到数据库连接信息

2. **复制连接信息**
   - 找到 `PGDATABASE_URL` 或数据库配置
   - 复制连接字符串

3. **告诉我连接信息**
   - 回复连接信息
   - 我将帮你完成导入

---

## 📞 需要帮助？

如果你不确定如何获取数据库连接信息，可以：

1. **查看 Coze 平台文档**
   - 项目设置中可能有文档

2. **联系 Coze 技术支持**
   - 询问数据库连接配置

3. **使用本地环境**
   - 继续使用 localhost:5000
   - 数据已保留在本地

---

**请告诉我你能否提供数据库连接信息，我将帮你完成导入！** 🚀
