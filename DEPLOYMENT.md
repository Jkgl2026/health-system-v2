# 部署说明文档

## 🎯 项目架构

本健康自检系统采用以下架构：
- **前端**: Next.js 14 (SSR 模式) - 部署到 Cloudflare Pages
- **后端 API**: Supabase Edge Functions - 部署到 Supabase
- **数据库**: PostgreSQL - 部署到 Supabase
- **访问方式**: Cloudflare Pages 域名（中国可访问）

---

## 📦 部署步骤

### 第一步：部署 Supabase Edge Functions

1. **安装 Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **登录 Supabase**
   ```bash
   supabase login
   ```

3. **连接到 Supabase 项目**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. **部署所有 Edge Functions**
   ```bash
   supabase functions deploy init-db
   supabase functions deploy admin-login
   supabase functions deploy admin-users
   supabase functions deploy user-history
   supabase functions deploy admin-compare
   supabase functions deploy admin-export
   supabase functions deploy save-health-record
   ```

5. **配置环境变量**
   ```bash
   supabase secrets set SUPABASE_URL=your_supabase_url
   supabase secrets set SUPABASE_ANON_KEY=your_supabase_anon_key
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

---

### 第二步：初始化数据库

1. **访问初始化 API**
   ```
   https://YOUR_SUPABASE_URL/functions/v1/init-db?key=init-health-system-2025
   ```

2. **预期响应**
   ```json
   {
     "success": true,
     "message": "Database initialized successfully",
     "tables": ["users", "health_records", "admins"]
   }
   ```

---

### 第三步：配置环境变量

1. **更新 `.env.local` 文件**
   ```env
   # Supabase 配置
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # 应用 URL
   NEXT_PUBLIC_APP_URL=https://health-system-v2.pages.dev
   NEXT_PUBLIC_API_URL=https://your-project.supabase.co/functions/v1
   ```

2. **更新 Cloudflare Pages 环境变量**
   - 在 Cloudflare Pages 项目设置中
   - 添加以下环境变量：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_APP_URL`
     - `NEXT_PUBLIC_API_URL`

---

### 第四步：构建和部署前端

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署到 Cloudflare Pages**
   ```bash
   # 方法 1：通过 Cloudflare Dashboard
   # 1. 登录 Cloudflare Dashboard
   # 2. 进入 Pages 项目
   # 3. 上传构建输出目录 (.next)

   # 方法 2：使用 Wrangler CLI
   npm install -g wrangler
   wrangler pages deploy .next
   ```

---

## 🔐 默认账号

- **用户名**: `admin`
- **密码**: `admin123`

---

## 🚀 访问地址

- **前端页面**: `https://health-system-v2.pages.dev`
- **后台管理**: `https://health-system-v2.pages.dev/admin/dashboard`
- **后台登录**: `https://health-system-v2.pages.dev/admin/login`

---

## 📊 API 端点列表

| 功能 | 端点 | 方法 |
|------|------|------|
| 初始化数据库 | `/functions/v1/init-db` | GET |
| 管理员登录 | `/functions/v1/admin-login` | POST |
| 用户列表 | `/functions/v1/admin-users` | GET |
| 用户历史 | `/functions/v1/user-history` | GET |
| 数据对比 | `/functions/v1/admin-compare` | POST |
| 数据导出 | `/functions/v1/admin-export` | GET |
| 保存记录 | `/functions/v1/save-health-record` | POST |

---

## 🧪 测试步骤

1. **初始化数据库**
   ```bash
   curl "https://YOUR_SUPABASE_URL/functions/v1/init-db?key=init-health-system-2025"
   ```

2. **测试登录**
   ```bash
   curl -X POST https://YOUR_SUPABASE_URL/functions/v1/admin-login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

3. **测试用户列表**
   ```bash
   curl https://YOUR_SUPABASE_URL/functions/v1/admin-users?page=1&pageSize=10
   ```

---

## 🔧 故障排除

### 问题 1：Edge Functions 部署失败

**解决方案：**
- 检查 Supabase CLI 版本：`supabase --version`
- 确保已登录：`supabase login`
- 检查项目连接：`supabase status`

### 问题 2：API 返回 401

**解决方案：**
- 检查环境变量是否正确配置
- 确认 SUPABASE_ANON_KEY 是否有效
- 检查 Edge Functions 的环境变量

### 问题 3：数据库初始化失败

**解决方案：**
- 检查 API Key 是否正确
- 确认 Supabase 项目有足够的权限
- 检查 SUPABASE_SERVICE_ROLE_KEY

### 问题 4：Cloudflare Pages 无法访问

**解决方案：**
- 确认部署成功
- 检查构建日志
- 等待 DNS 解析（可能需要几分钟）

---

## 📝 注意事项

1. **安全性**
   - 不要在前端代码中暴露 SUPABASE_SERVICE_ROLE_KEY
   - 使用环境变量管理敏感信息
   - 定期更换管理员密码

2. **性能优化**
   - Cloudflare Pages 自动 CDN 加速
   - Supabase Edge Functions 全球分布
   - 数据库索引优化

3. **备份**
   - 定期备份 Supabase 数据库
   - 导出重要数据
   - 记录配置变更

---

## 🎉 部署完成

部署完成后，您可以：
1. 访问后台管理页面
2. 查看用户列表和历史记录
3. 导出数据进行分析
4. 对比不同时间段的健康数据

---

## 📞 技术支持

如有问题，请查看：
- Supabase 文档：https://supabase.com/docs
- Cloudflare Pages 文档：https://developers.cloudflare.com/pages
- Next.js 文档：https://nextjs.org/docs
