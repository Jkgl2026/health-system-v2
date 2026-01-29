# 健康管理系统 - Vercel 部署指南

## 🚀 5 分钟快速部署到 Vercel

### 前置条件

1. **GitHub 账号**
   - 用于代码托管和自动部署

2. **Vercel 账号**
   - 访问 https://vercel.com/signup
   - 可以使用 GitHub 账号直接登录

3. **PostgreSQL 数据库（免费）**
   - 推荐方案 A：Vercel Postgres（最简单）
   - 推荐方案 B：Neon（免费，功能强大）

---

## 📋 部署步骤

### 步骤 1：准备代码仓库

#### 选项 A：如果代码在本地沙箱

1. **导出代码**
   ```bash
   # 在沙箱中执行
   cd /workspace/projects
   tar -czf health-system.tar.gz --exclude='.next' --exclude='node_modules' .
   ```

2. **下载代码到本地电脑**
   - 下载 `health-system.tar.gz` 文件
   - 解压到本地文件夹

3. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 创建新仓库，命名为 `health-system`
   - 不要初始化 README

4. **上传代码**
   ```bash
   # 在本地电脑执行
   cd health-system
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/health-system.git
   git push -u origin main
   ```

#### 选项 B：直接使用当前代码（推荐）

如果代码已经在 GitHub 仓库，直接跳到步骤 2。

---

### 步骤 2：设置免费 PostgreSQL 数据库

#### 方案 A：Vercel Postgres（最简单）⭐⭐⭐⭐⭐

1. **创建 Vercel Postgres**
   - 访问 Vercel 控制台：https://vercel.com/dashboard
   - 点击"Storage" → "Create Database"
   - 选择"Postgres" → "Hobby"计划（免费）
   - 数据库名称：`health-system-db`

2. **获取连接信息**
   - 创建后会显示：
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
   - 复制这些信息，稍后需要配置

#### 方案 B：Neon（免费，功能强大）⭐⭐⭐⭐⭐

1. **创建 Neon 数据库**
   - 访问：https://neon.tech/
   - 使用 GitHub 账号登录
   - 点击"Create a project"
   - 项目名称：`health-system`
   - 选择免费计划（Free）

2. **获取连接字符串**
   - 创建后会显示连接字符串
   - 格式：`postgresql://用户名:密码@主机地址/数据库名?sslmode=require`
   - 复制这个连接字符串

---

### 步骤 3：部署到 Vercel

#### 方法 A：通过 Vercel 控制台（推荐）⭐⭐⭐⭐⭐

1. **导入项目**
   - 访问：https://vercel.com/new
   - 点击"Import Git Repository"
   - 选择你的 `health-system` GitHub 仓库
   - 点击"Continue"

2. **配置项目**

   **Framework Preset:**
   - 选择：`Next.js`

   **Environment Variables:**
   ```
   # 数据库 URL（使用步骤 2 中获取的）
   DATABASE_URL=postgresql://user:password@host:5432/database

   # JWT 密钥（生成一个随机密钥）
   JWT_SECRET=你生成的随机字符串

   # 站点 URL（Vercel 会自动生成，可以先填个临时值）
   NEXT_PUBLIC_SITE_URL=https://health-system.vercel.app
   ```

   **Root Directory:**
   - 留空（根目录）

   **Build Command:**
   - `pnpm run build`

   **Output Directory:**
   - `.next`

3. **部署**
   - 点击"Deploy"
   - 等待 3-5 分钟
   - 部署成功后会显示 URL，例如：`https://health-system-xxxxx.vercel.app`

#### 方法 B：使用 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel --prod
   ```

---

### 步骤 4：初始化数据库

部署成功后，需要初始化数据库表结构：

#### 方法 A：通过 API 端点

1. **访问初始化 API**
   ```
   https://你的应用.vercel.app/api/init-db
   ```

2. **等待完成**
   - 会显示数据库初始化成功的消息

3. **初始化管理员账号**
   ```
   https://你的应用.vercel.app/api/init-admin
   ```

#### 方法 B：通过本地连接数据库

如果你需要手动执行 SQL：

1. **安装 PostgreSQL 客户端**
   - Windows: 下载 pgAdmin
   - Mac: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql-client`

2. **连接数据库**
   ```bash
   psql DATABASE_URL
   ```

3. **执行初始化脚本**
   - 查看 `src/storage/database/shared/schema.ts` 中的表结构
   - 手动创建表（不推荐，建议使用 API）

---

### 步骤 5：验证部署

1. **访问应用**
   ```
   https://你的应用.vercel.app
   ```

2. **测试 API**
   ```
   https://你的应用.vercel.app/api/health
   ```

3. **测试数据库**
   - 访问 `/api/init-db` 确认数据库正常
   - 创建一个测试用户
   - 检查用户是否保存成功

---

## 🔧 配置自定义域名（可选）

### 步骤 1：购买域名

- 去阿里云、腾讯云、Namecheap 等平台购买域名
- 例如：`health-system.com`

### 步骤 2：配置 DNS

在域名提供商的 DNS 设置中添加：

```
类型: CNAME
名称: @ (或 www)
值: cname.vercel-dns.com
```

### 步骤 3：在 Vercel 中添加域名

1. 进入 Vercel 控制台
2. 选择你的项目
3. 点击"Settings" → "Domains"
4. 添加你的域名
5. Vercel 会自动配置 SSL 证书

---

## 📊 成本估算

### Vercel 免费额度（Hobby 计划）

| 项目 | 免费额度 |
|------|---------|
| 带宽 | 100GB/月 |
| Serverless 执行时间 | 100小时/月 |
| 构建时间 | 6000分钟/月 |
| 数据库 | Vercel Postgres Hobby（512MB 存储）|

**个人使用完全免费！**

### 超出免费额度

如果超出免费额度：
- Hobby 计划：$20/月
- 包含更多执行时间和存储

---

## 🚀 自动部署

### 设置自动部署

当你修改代码并推送到 GitHub 时：

1. **Vercel 会自动：**
   - 检测到代码更新
   - 自动构建项目
   - 自动部署到生产环境
   - 发送通知

2. **无需手动操作！**

---

## 📝 环境变量说明

### 必需的变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT 密钥 | `random-secret-key-123` |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL | `https://your-app.vercel.app` |

### 在 Vercel 中配置

1. 进入 Vercel 控制台
2. 选择你的项目
3. 点击"Settings" → "Environment Variables"
4. 添加上述变量

---

## 🔍 故障排查

### 问题 1：构建失败

**原因：** 数据库连接失败

**解决：**
- 检查 `DATABASE_URL` 是否正确
- 确认数据库服务器可访问
- 检查 SSL 配置

### 问题 2：数据库连接超时

**原因：** Vercel Serverless 函数超时

**解决：**
- 使用连接池
- 优化数据库查询
- 考虑升级到 Pro 计划

### 问题 3：API 404 错误

**原因：** 路由未正确部署

**解决：**
- 检查 API 路由文件是否在 `app/api/` 目录
- 确认文件名正确
- 查看 Vercel 部署日志

---

## 📚 相关资源

- **Vercel 文档**: https://vercel.com/docs
- **Next.js 部署**: https://nextjs.org/docs/deployment
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Neon 文档**: https://neon.tech/docs

---

## 🎉 完成！

部署完成后：

✅ **24 小时可用**  
✅ **全球 CDN 加速**  
✅ **自动 HTTPS**  
✅ **自动部署**  
✅ **完全免费**（个人使用）  

**再也不需要手动打开沙箱了！** 🎉

---

## 💬 需要帮助？

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查环境变量配置
3. 确认数据库连接正常
4. 参考故障排查部分

**祝你部署成功！** 🚀
