# 如何获取 Coze 平台数据库连接信息

## 🎯 方法1：从 Coze 平台获取（推荐）

### 步骤1：登录 Coze 平台

1. **访问 Coze 平台**
   - 网址：https://www.coze.com/
   - 使用你的账号登录

2. **进入项目列表**
   - 登录后会看到你的项目列表
   - 找到"健康自检系统"项目

### 步骤2：进入项目设置

1. **点击项目卡片**
   - 进入项目详情页面

2. **查找设置选项**
   - 在左侧或顶部菜单中找到：
     - "设置"（Settings）
     - 或 "配置"（Configuration）
     - 或 "环境变量"（Environment Variables）

### 步骤3：查看数据库配置

在设置页面中查找以下信息：

#### 选项A：数据库连接字符串
```
PGDATABASE_URL=postgresql://user:password@host:port/database
```

#### 选项B：分别的数据库配置
```
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
```

#### 选项C：Supabase 配置
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 步骤4：复制连接信息

**找到以下任一信息即可：**

1. **完整的连接字符串**（最简单）
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

2. **分别的信息**
   - 数据库主机（DB_HOST）
   - 数据库端口（DB_PORT）
   - 数据库名称（DB_NAME）
   - 数据库用户名（DB_USER）
   - 数据库密码（DB_PASSWORD）

---

## 🎯 方法2：从 Supabase Dashboard 获取

### 步骤1：登录 Supabase

1. **访问 Supabase**
   - 网址：https://supabase.com/dashboard
   - 使用邮箱和密码登录

2. **选择项目**
   - 找到 Coze 平台使用的 Supabase 项目
   - 点击进入

### 步骤2：获取连接信息

1. **进入 Settings**
   - 在左侧菜单中找到 "Settings"
   - 点击进入

2. **进入 Database**
   - 点击 "Database" 标签

3. **查看 Connection Info**
   - 找到 "Connection String" 部分
   - 选择 "URI" 或 "Pooling" 格式

4. **复制连接字符串**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### 步骤3：获取密码

1. **在 Database 设置中**
   - 找到 "Database Password"
   - 点击 "Reset Password" 或 "View Password"

2. **或创建新密码**
   - 如果没有密码，创建一个新的密码
   - 保存密码

---

## 🎯 方法3：查看项目配置文件

### 步骤1：检查本地配置文件

1. **查看 `.env.production` 文件**
   ```bash
   cat .env.production
   ```

2. **查看 `.env.production.example` 文件**
   ```bash
   cat .env.production.example
   ```

3. **查找数据库配置**
   ```
   PGDATABASE_URL=postgresql://...
   DB_HOST=...
   DB_PORT=...
   DB_NAME=...
   DB_USER=...
   DB_PASSWORD=...
   ```

### 步骤2：检查 Coze 平台配置

1. **在 Coze 平台项目页面**
   - 查找 "Config" 或 "Settings"
   - 查看已配置的环境变量

2. **记录数据库信息**

---

## 🎯 方法4：联系 Coze 技术支持

### 如果上述方法都无法获取

1. **访问 Coze 帮助中心**
   - 网址：https://help.coze.com/

2. **提交工单**
   - 询问数据库连接信息
   - 说明你的项目名称
   - 说明你需要导入数据

3. **或联系客服**
   - 通过在线聊天联系
   - 询问如何获取数据库连接信息

---

## 📋 需要获取的信息

### 最少需要的信息（任选一种）

#### 选项1：完整的连接字符串（最简单）
```
postgresql://user:password@host:port/database
```

#### 选项2：分别的信息
```
DB_HOST: 数据库主机地址
DB_PORT: 数据库端口（通常是5432）
DB_NAME: 数据库名称
DB_USER: 数据库用户名
DB_PASSWORD: 数据库密码
```

#### 选项3：Supabase 项目信息
```
Supabase 项目 URL: https://your-project.supabase.co
Supabase 密码: your-database-password
```

---

## 🔍 如何识别数据库类型？

### 检查使用的是哪个数据库

#### 方法1：查看配置文件
```bash
cat .env.production
```

#### 方法2：查看项目依赖
```bash
cat package.json | grep -i database
```

#### 方法3：查看环境变量
在 Coze 平台查看已配置的环境变量

### 常见的数据库类型

1. **Supabase PostgreSQL** ⭐ 最常见
   - URL 格式：`postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`

2. **原生 PostgreSQL**
   - URL 格式：`postgresql://user:password@host:port/database`

3. **其他 PostgreSQL**
   - URL 格式：`postgresql://user:password@custom-host:port/database`

---

## ✅ 获取成功后

### 告诉我获取到的信息

你可以告诉我以下任一格式：

#### 格式1：完整连接字符串
```
postgresql://postgres:your_password@db.your-project.supabase.co:5432/postgres
```

#### 格式2：分别的信息
```
DB_HOST: db.your-project.supabase.co
DB_PORT: 5432
DB_NAME: postgres
DB_USER: postgres
DB_PASSWORD: your_password
```

#### 格式3：Supabase 信息
```
Project URL: https://your-project.supabase.co
Password: your_password
```

---

## 🚨 注意事项

### 安全提示
1. ⚠️ **不要在公开场合分享密码**
2. ⚠️ **密码是敏感信息，请妥善保管**
3. ⚠️ **只在可信的环境中输入密码**

### 如果找不到数据库信息
1. 确认项目是否配置了数据库
2. 确认你是否有项目访问权限
3. 联系 Coze 技术支持

---

## 📞 需要帮助？

### 如果遇到问题

1. **查看 Coze 文档**
   - 访问：https://help.coze.com/

2. **联系 Coze 支持**
   - 提交工单
   - 或在线聊天

3. **查看项目文档**
   - Coze 平台可能有数据库配置文档

---

## 🎯 快速检查清单

获取数据库连接信息时，请确认：

- [ ] 数据库主机地址（DB_HOST）
- [ ] 数据库端口（DB_PORT）
- [ ] 数据库名称（DB_NAME）
- [ ] 数据库用户名（DB_USER）
- [ ] 数据库密码（DB_PASSWORD）

**或**
- [ ] 完整的数据库连接字符串（PGDATABASE_URL）

---

**请尝试上述方法，告诉我你获取到的数据库连接信息，我将帮你完成数据导入！** 🚀
