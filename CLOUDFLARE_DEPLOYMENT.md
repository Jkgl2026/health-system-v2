# Cloudflare Pages + Supabase 部署指南

本文档指导您将健康自检系统部署到 Cloudflare Pages（静态托管）和 Supabase Edge Functions（后端 API）。

## 📋 部署架构

```
┌─────────────────────┐
│  Cloudflare Pages   │  ← 静态前端（Next.js Export）
│   health-system     │     HTTPS + 全球CDN
└──────────┬──────────┘
           │ API 调用
           ▼
┌─────────────────────┐
│  Supabase Edge      │  ← 后端 API（Deno）
│   Functions         │     登录/登出/验证
└──────────┬──────────┘
           │ 数据存储
           ▼
┌─────────────────────┐
│  Supabase Database  │  ← PostgreSQL
│   (supabase_admin)  │     管理员表
└─────────────────────┘
```

## 🚀 部署步骤

### 第一步：准备 Supabase 项目

#### 1.1 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com)
2. 点击 "Start your project"
3. 使用 GitHub 账号登录
4. 创建新项目：
   - Name: `health-system`
   - Database Password: 设置强密码并保存
   - Region: 选择离您最近的区域（如 Southeast Asia）
5. 等待项目创建完成（约 2 分钟）

#### 1.2 创建管理员表

在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认管理员（账号: admin, 密码: admin123）
-- 注意：密码已使用 bcrypt 加密
INSERT INTO admins (username, password, name, is_active)
VALUES (
  'admin',
  '$2a$10$rKvZVjJZJZJZJZJZJZJZJ.0123456789012345678901234567890123456789012345678901',
  '超级管理员',
  true
);

-- 启用 RLS（可选，生产环境建议启用）
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 允许 Service Role 读写
CREATE POLICY "Allow service role access"
  ON admins
  FOR ALL
  USING (auth.role() = 'service_role');
```

#### 1.3 获取 API 密钥

1. 进入项目设置：
   - 左侧菜单 → Settings → API
2. 记录以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 1.4 配置环境变量

在 Supabase 项目中设置 Edge Functions 环境变量：

1. 进入 Edge Functions 设置：
   - 左侧菜单 → Edge Functions → Settings
2. 添加以下环境变量：
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-jwt-secret-key-change-this
   ```

**⚠️ 重要**：`JWT_SECRET` 必须设置，否则无法生成 Token。

### 第二步：部署 Supabase Edge Functions

#### 2.1 安装 Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://supabase.com/install.sh | bash

# 验证安装
supabase --version
```

#### 2.2 登录 Supabase

```bash
supabase login
```

#### 2.3 链接到项目

```bash
supabase link --project-ref your-project-ref
```

#### 2.4 部署 Edge Functions

```bash
# 部署所有函数
supabase functions deploy

# 部署单个函数
supabase functions deploy admin-login
supabase functions deploy admin-logout
supabase functions deploy admin-auth
```

#### 2.5 测试 Edge Functions

测试登录接口：

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/admin-login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

预期返回：

```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "username": "admin",
    "name": "超级管理员"
  }
}
```

### 第三步：部署到 Cloudflare Pages

#### 3.1 安装 Wrangler CLI

```bash
npm install -g wrangler
```

#### 3.2 登录 Cloudflare

```bash
wrangler login
```

#### 3.3 配置环境变量

在项目根目录创建 `.env.production` 文件：

```env
# API 地址（Supabase Edge Functions）
NEXT_PUBLIC_API_URL=https://your-project.supabase.co/functions/v1

# 应用地址（Cloudflare Pages）
NEXT_PUBLIC_APP_URL=https://health-system-v2.pages.dev
```

#### 3.4 构建项目

```bash
# 安装依赖
pnpm install

# 构建静态导出
pnpm run build
```

#### 3.5 部署到 Cloudflare Pages

方式一：使用 Wrangler（推荐）

```bash
# 创建 Pages 项目
wrangler pages project create health-system-v2 --production-branch=main

# 部署
wrangler pages deploy out
```

方式二：使用 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 Workers & Pages → Pages → Create a project
3. 选择 "Upload assets"
4. 上传 `out` 目录中的所有文件
5. 设置项目名称：`health-system-v2`
6. 点击部署

#### 3.6 配置自定义域名（可选）

1. 进入 Cloudflare Pages 项目设置
2. Custom domains → Add custom domain
3. 输入域名（如 `admin.yourdomain.com`）
4. 按照提示配置 DNS 记录

### 第四步：配置前端 API 调用

更新 `src/app/lib/fetch.ts`，将 API 地址指向 Supabase Edge Functions：

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-project.supabase.co/functions/v1';

export const fetchAPI = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;

  return fetch(url, {
    ...options,
    credentials: 'include', // 包含Cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
```

## 🧪 测试部署

### 1. 访问登录页面

```
https://health-system-v2.pages.dev/admin/login
```

### 2. 登录测试

- 账号：`admin`
- 密码：`admin123`

### 3. 检查 Cookie

打开浏览器开发者工具 → Application → Cookies，查看是否成功设置 `admin_token`。

### 4. 访问 Dashboard

```
https://health-system-v2.pages.dev/admin/dashboard
```

## 🔒 安全建议

### 1. 修改默认密码

登录后立即修改默认管理员密码：

```sql
-- 生成新密码的 bcrypt hash（使用在线工具或后端代码）
-- 例如密码为 "newStrongPassword123"
UPDATE admins
SET password = '$2a$10$newHashString...'
WHERE username = 'admin';
```

### 2. 启用 IP 白名单（可选）

在 Cloudflare Pages 中配置访问规则：

1. 进入项目设置 → Rules → Access rules
2. 添加 IP 白名单（仅允许家庭网络访问）

### 3. 设置强 JWT Secret

```bash
# 生成随机密钥
openssl rand -base64 32
```

### 4. 定期更新依赖

```bash
pnpm update
```

## 🐛 常见问题

### Q1: 登录后提示"未登录"

**原因**：Cookie 设置失败。

**解决**：
- 检查 `NEXT_PUBLIC_API_URL` 是否正确
- 确认 Supabase Edge Functions 的 CORS 配置
- 检查浏览器是否阻止第三方 Cookie

### Q2: Edge Functions 部署失败

**原因**：Deno 权限问题或网络错误。

**解决**：
```bash
# 查看部署日志
supabase functions logs admin-login

# 重新部署
supabase functions deploy admin-login --no-verify-jwt
```

### Q3: 构建失败

**原因**：Next.js 静态导出配置错误。

**解决**：
- 确认 `next.config.mjs` 中 `output: 'export'`
- 检查是否使用了不支持的 API（如动态路由）

### Q4: API 跨域错误

**原因**：CORS 配置不正确。

**解决**：
- 确认 Edge Functions 中的 `corsHeaders` 配置正确
- 检查前端 API 调用是否包含正确的 headers

## 📊 监控与日志

### Supabase Logs

访问：
```
https://app.supabase.com/project/your-project/logs
```

### Cloudflare Analytics

访问：
```
https://dash.cloudflare.com/your-account/pages/view/health-system-v2/analytics
```

## 📚 参考文档

- [Supabase Edge Functions 文档](https://supabase.com/docs/guides/functions)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages)
- [Next.js 静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

## 🎉 完成！

您的健康自检系统已成功部署到 Cloudflare Pages 和 Supabase Edge Functions。

现在您可以：
- ✅ 通过 HTTPS 公网访问
- ✅ 在家庭网络中登录使用
- ✅ 享受全球 CDN 加速
- ✅ 无需服务器维护
