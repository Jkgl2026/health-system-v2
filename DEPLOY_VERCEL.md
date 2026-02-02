# Vercel 部署指南

## ✅ 代码已准备就绪

- ✅ 代码已推送到 GitHub: https://github.com/Jkgl2026/health-system-v2
- ✅ Vercel 配置文件已创建
- ✅ 所有依赖已配置

---

## 🚀 部署步骤（5 分钟）

### 第一步：注册/登录 Vercel

1. **访问 Vercel 官网**
   - 网址: https://vercel.com
   - 点击 "Sign Up" 或 "Log In"

2. **选择登录方式**
   - 推荐: 使用 GitHub 账号登录
   - 其他选项: GitLab、Bitbucket

---

### 第二步：导入项目

1. **进入 Vercel Dashboard**
   - 登录后进入 Dashboard

2. **点击 "Add New" → "Project"**
   - 在左上角找到 "Add New" 按钮
   - 选择 "Project"

3. **导入 GitHub 仓库**
   - 找到 `health-system-v2` 仓库
   - 点击 "Import" 按钮

---

### 第三步：配置项目

1. **项目设置**
   - **Project Name**: `health-system-v2`（或自定义）
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（自动填充）
   - **Output Directory**: `.next`（自动填充）

2. **环境变量**（重要！）

   需要添加以下环境变量：

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `DATABASE_URL` | 你的 PostgreSQL 数据库连接字符串 | 必填 |
   | `POSTGRES_URL` | 你的 PostgreSQL 数据库连接字符串 | 必填 |

   **获取 PostgreSQL 数据库连接字符串：**
   - 方式 1: 使用 Supabase（免费）
   - 方式 2: 使用 Neon（免费）
   - 方式 3: 使用 Railway（免费）

---

### 第四步：选择 PostgreSQL 数据库

我推荐使用 **Supabase**（完全免费）：

#### Supabase 设置步骤：

1. **访问 Supabase**
   - 网址: https://supabase.com
   - 点击 "Start your project"

2. **创建项目**
   - Project Name: `health-system-v2`
   - Database Password: 设置一个强密码（记住它！）
   - Region: 选择离你最近的区域
   - 点击 "Create new project"

3. **获取数据库连接字符串**
   - 项目创建后，进入 "Settings" → "Database"
   - 找到 "Connection String"
   - 选择 "URI"
   - 复制连接字符串
   - 替换 `[YOUR-PASSWORD]` 为你设置的密码

4. **配置环境变量**
   - 回到 Vercel 项目设置
   - 添加环境变量:
     - `DATABASE_URL`: 粘贴 Supabase 连接字符串
     - `POSTGRES_URL`: 粘贴 Supabase 连接字符串（和上面一样）

---

### 第五步：部署

1. **点击 "Deploy"**
   - 配置完成后，点击 "Deploy" 按钮

2. **等待构建**
   - Vercel 会自动构建和部署
   - 通常需要 2-3 分钟

3. **部署完成**
   - 看到 "Congratulations!" 页面
   - 你的网站已上线！

---

## 🌐 访问你的网站

部署完成后，你会获得：

### 默认域名
```
https://health-system-v2.vercel.app
```

### 访问后台
```
https://health-system-v2.vercel.app/admin/login
```

**登录账号:**
- 用户名: `admin`
- 密码: `admin123`

---

## 🎯 自定义域名（可选）

### 添加自定义域名：

1. **进入项目设置**
   - Vercel Dashboard → 选择项目
   - 点击 "Settings" → "Domains"

2. **添加域名**
   - 点击 "Add Domain"
   - 输入你的域名（如 `health.yourdomain.com`）

3. **配置 DNS**
   - Vercel 会提供 DNS 记录
   - 在你的域名服务商添加这些记录
   - 等待 DNS 生效（通常 10-30 分钟）

---

## 🔧 数据库迁移（重要！）

**注意：** 部署后，Supabase 数据库是空的，需要迁移现有数据。

### 方式 1: 使用 Supabase Dashboard（推荐）

1. **进入 Supabase Dashboard**
   - 选择你的项目
   - 点击 "SQL Editor"

2. **运行以下 SQL**（在 `db/schema.sql` 文件中）
   - 复制 `db/schema.sql` 的内容
   - 粘贴到 SQL Editor
   - 点击 "Run" 执行

3. **导入现有数据**
   - 如果需要从旧数据库迁移数据
   - 导出旧数据库的 SQL 文件
   - 在 Supabase 中导入

### 方式 2: 使用 Drizzle CLI

1. **安装 Drizzle CLI**
   ```bash
   npm install -g drizzle-kit
   ```

2. **运行迁移**
   ```bash
   drizzle-kit push
   ```

---

## 📊 部署后检查清单

- [ ] 访问首页，确认网站正常运行
- [ ] 访问 `/admin/login`，确认可以登录
- [ ] 查看用户列表，确认数据正常显示
- [ ] 测试历史记录功能
- [ ] 测试数据对比功能
- [ ] 测试导出功能
- [ ] 测试搜索功能
- [ ] 检查所有 API 是否正常工作

---

## 🔍 常见问题

### Q1: 部署失败怎么办？
**A:** 检查以下几点：
- 环境变量是否正确配置
- 数据库连接字符串是否有效
- 查看部署日志，找到错误信息

### Q2: 数据库连接失败？
**A:** 确认：
- Supabase 项目已创建
- 数据库密码正确
- 连接字符串中的密码已替换
- Supabase 项目状态为 "Active"

### Q3: 如何查看部署日志？
**A:**
- Vercel Dashboard → 选择项目
- 点击 "Deployments"
- 点击最新的部署记录
- 查看 "Build Log" 和 "Function Log"

### Q4: 如何自动部署？
**A:** 已配置！
- 代码推送到 GitHub main 分支
- Vercel 会自动触发部署
- 通常 2-3 分钟完成

### Q5: 如何回滚？
**A:**
- Vercel Dashboard → Deployments
- 找到之前的版本
- 点击 "..." → "Promote to Production"

---

## 💰 成本说明

### Vercel（免费额度）
- ✅ 100GB 带宽/月
- ✅ 无限构建
- ✅ 无限部署
- ✅ 全球 CDN
- ✅ 自动 HTTPS
- ✅ 自定义域名

### Supabase（免费额度）
- ✅ 500MB 数据库存储
- ✅ 1GB 文件存储
- ✅ 2GB 带宽/月
- ✅ 50,000 API 请求/月
- ✅ 无限项目

**总成本: 完全免费！**

---

## 🎉 部署完成！

**恭喜！你的健康管理系统已成功部署到 Vercel！**

### 访问地址
- **网站首页**: https://health-system-v2.vercel.app
- **管理后台**: https://health-system-v2.vercel.app/admin/login

### 下一步
1. 测试所有功能
2. 如有需要，告诉我，我可以帮你调整功能
3. 享受稳定、快速的后台管理系统！

---

**需要帮助？随时告诉我！** 🚀
