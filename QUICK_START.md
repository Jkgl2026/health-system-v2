# 快速开始指南

## 🚀 5 分钟快速部署

### 前提条件

- 已有 Supabase 账户
- 已有 Cloudflare 账户
- 已安装 Node.js 和 pnpm

---

## 步骤 1: 准备 Supabase

1. **创建 Supabase 项目**
   - 访问 https://supabase.com/dashboard
   - 点击 "New Project"
   - 选择区域：Singapore（新加坡）
   - 等待项目创建完成

2. **获取凭证**
   - 进入 Project Settings -> API
   - 复制以下信息：
     - Project URL（SUPABASE_URL）
     - anon public key（SUPABASE_ANON_KEY）
     - service_role key（SUPABASE_SERVICE_ROLE_KEY）

3. **获取 Project Reference**
   - 进入 Project Settings -> General
   - 复制 Project Reference

---

## 步骤 2: 部署 Edge Functions

**方法 1: 使用部署脚本（推荐）**

```bash
# 设置环境变量
export SUPABASE_ACCESS_TOKEN=your_access_token
export SUPABASE_PROJECT_REF=your_project_ref
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your_anon_key
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 运行部署脚本
./deploy.sh
```

**方法 2: 手动部署**

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 连接项目
supabase link --project-ref YOUR_PROJECT_REF

# 部署函数
supabase functions deploy init-db
supabase functions deploy admin-login
supabase functions deploy admin-users
supabase functions deploy user-history
supabase functions deploy admin-compare
supabase functions deploy admin-export
supabase functions deploy save-health-record

# 设置环境变量
supabase secrets set SUPABASE_URL=YOUR_SUPABASE_URL
supabase secrets set SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

---

## 步骤 3: 初始化数据库

**在浏览器中访问：**
```
https://YOUR_SUPABASE_URL/functions/v1/init-db?key=init-health-system-2025
```

**或使用 curl：**
```bash
curl "https://YOUR_SUPABASE_URL/functions/v1/init-db?key=init-health-system-2025"
```

**预期响应：**
```json
{
  "success": true,
  "message": "Database initialized successfully",
  "tables": ["users", "health_records", "admins"]
}
```

---

## 步骤 4: 配置 Cloudflare Pages

1. **进入 Cloudflare Pages 项目**
   - 访问 https://dash.cloudflare.com
   - 进入 Pages -> health-system-v2
   - 进入 Settings -> Environment variables

2. **添加环境变量**
   - `NEXT_PUBLIC_SUPABASE_URL`: https://your-project.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your_anon_key
   - `NEXT_PUBLIC_APP_URL`: https://health-system-v2.pages.dev
   - `NEXT_PUBLIC_API_URL`: https://your-project.supabase.co/functions/v1

3. **重新部署**
   - 点击 "Retry deployment"
   - 等待部署完成

---

## 步骤 5: 测试应用

1. **访问后台**
   ```
   https://health-system-v2.pages.dev/admin/dashboard
   ```

2. **登录**
   - 用户名: `admin`
   - 密码: `admin123`

3. **测试功能**
   - 查看用户列表
   - 搜索用户
   - 查看历史记录
   - 导出数据

---

## 🎉 完成！

您的健康自检系统现在已经成功部署！

---

## 🔧 常见问题

### Q1: Edge Functions 部署失败

**A:** 检查以下几点：
- Supabase CLI 是否已安装
- 是否已正确登录
- Project Reference 是否正确
- 是否有足够的权限

### Q2: 数据库初始化失败

**A:** 确认：
- API Key 是否正确
- 是否有足够的权限（需要 service_role key）
- Supabase 项目是否正常

### Q3: Cloudflare Pages 无法访问

**A:**
- 检查部署是否成功
- 等待 DNS 解析（可能需要几分钟）
- 检查环境变量是否正确配置

### Q4: API 调用失败

**A:**
- 检查环境变量是否正确
- 确认 Edge Functions 已部署
- 检查网络连接

---

## 📚 更多文档

- 详细部署指南: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Supabase 文档: https://supabase.com/docs
- Cloudflare Pages 文档: https://developers.cloudflare.com/pages

---

## 💡 提示

- 首次部署建议使用 Singapore 区域（访问速度最快）
- 定期备份数据库
- 修改默认管理员密码
- 监控 Edge Functions 的使用情况

---

## 🆘 需要帮助？

如果遇到问题，请：
1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 故障排除部分
2. 检查 Supabase Dashboard 日志
3. 检查 Cloudflare Pages 构建日志
