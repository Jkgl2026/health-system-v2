# 🚀 健康自检系统 - Cloudflare Pages 部署方案

> 将本地 Next.js 后台管理系统部署到 Cloudflare Pages，实现 HTTPS 公网访问

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

## 🎯 核心特性

### ✅ 已实现

- [x] **静态导出配置**：Next.js 配置为 `output: 'export'`，适配 Cloudflare Pages
- [x] **Supabase Edge Functions**：
  - 登录接口 (`admin-login`)
  - 登出接口 (`admin-logout`)
  - 验证接口 (`admin-auth`)
- [x] **JWT 认证**：基于 Cookie 的 Token 管理
- [x] **前端适配**：fetch 封装支持 Supabase API
- [x] **PWA 支持**：支持桌面安装
- [x] **CORS 配置**：跨域请求支持

### 🎨 UI 组件

- 登录页面：`src/app/admin/login/page.tsx`
- 仪表盘：`src/app/admin/dashboard/page.tsx`
- shadcn/ui 组件库

## 📂 项目结构

```
health-system/
├── supabase/                    # Supabase Edge Functions
│   └── functions/
│       ├── admin-login/         # 登录接口
│       ├── admin-logout/        # 登出接口
│       └── admin-auth/          # 验证接口
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/           # 登录页面
│   │   │   └── dashboard/       # 仪表盘
│   │   └── lib/
│   │       └── fetch.ts         # API 封装
│   └── components/
│       └── ui/                  # shadcn/ui 组件
├── scripts/
│   └── deploy-cloudflare.sh     # Cloudflare 部署脚本
├── next.config.mjs              # Next.js 配置（已配置静态导出）
├── .env.production              # 生产环境变量
└── CLOUDFLARE_DEPLOYMENT.md     # 详细部署文档
```

## 🚀 快速开始

### 前置要求

1. **Cloudflare 账户**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)

2. **Supabase 项目**
   - 访问 [Supabase 官网](https://supabase.com)
   - 创建免费项目

3. **本地开发环境**
   - Node.js 24+
   - pnpm

### 部署步骤

#### 1. 创建 Supabase 项目

详细步骤请参考：[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md)

#### 2. 配置环境变量

创建 `.env.production` 文件：

```env
# API 地址（Supabase Edge Functions）
NEXT_PUBLIC_API_URL=https://your-project.supabase.co/functions/v1

# 应用地址（Cloudflare Pages）
NEXT_PUBLIC_APP_URL=https://health-system-v2.pages.dev
```

#### 3. 部署 Supabase Edge Functions

```bash
# 安装 Supabase CLI
brew install supabase/tap/supabase  # macOS

# 登录
supabase login

# 链接项目
supabase link --project-ref your-project-ref

# 部署函数
supabase functions deploy
```

#### 4. 部署到 Cloudflare Pages

**方式一：使用部署脚本（推荐）**

```bash
# 赋予执行权限
chmod +x scripts/deploy-cloudflare.sh

# 执行部署
./scripts/deploy-cloudflare.sh
```

**方式二：手动部署**

```bash
# 安装依赖
pnpm install

# 构建
pnpm run build

# 部署
wrangler pages deploy out --project-name=health-system-v2
```

#### 5. 访问系统

- 登录页面：`https://health-system-v2.pages.dev/admin/login`
- 仪表盘：`https://health-system-v2.pages.dev/admin/dashboard`

### 默认账号

- **账号**：`admin`
- **密码**：`admin123`

⚠️ **重要**：部署后请立即修改默认密码！

## 🔧 配置说明

### Next.js 配置

`next.config.mjs` 已配置静态导出：

```javascript
const nextConfig = {
  output: 'export',  // 静态导出
  images: {
    remotePatterns: [...],
  },
};
```

### PWA 配置

```javascript
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});
```

### CORS 配置

所有 Edge Functions 已配置 CORS：

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

## 🔒 安全建议

1. **修改默认密码**
2. **设置强 JWT Secret**
3. **启用 IP 白名单**（可选）
4. **定期更新依赖**

详细安全配置请参考：[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md#-安全建议)

## 🧪 测试部署

### 1. 测试登录

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/admin-login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. 测试验证

```bash
curl -X GET \
  https://your-project.supabase.co/functions/v1/admin-auth \
  -H 'Cookie: admin_token=your-token'
```

### 3. 检查 Cookie

打开浏览器开发者工具 → Application → Cookies，查看 `admin_token`。

## 📊 监控与日志

- **Supabase Logs**: https://app.supabase.com/project/your-project/logs
- **Cloudflare Analytics**: https://dash.cloudflare.com/pages/view/health-system-v2/analytics

## 🐛 常见问题

### Q1: 登录后提示"未登录"

**原因**：Cookie 设置失败

**解决**：
- 检查 `NEXT_PUBLIC_API_URL` 是否正确
- 确认 Supabase Edge Functions 的 CORS 配置
- 检查浏览器是否阻止第三方 Cookie

### Q2: Edge Functions 部署失败

**解决**：
```bash
supabase functions logs admin-login
supabase functions deploy admin-login --no-verify-jwt
```

### Q3: 构建失败

**检查**：
- 确认 `next.config.mjs` 中 `output: 'export'`
- 检查是否使用了不支持的 API

更多问题请参考：[CLOUDFLARE_DEPLOYMENT.md](./CLOUDFLARE_DEPLOYMENT.md#-常见问题)

## 📚 参考文档

- [Supabase Edge Functions 文档](https://supabase.com/docs/guides/functions)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages)
- [Next.js 静态导出](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [shadcn/ui 文档](https://ui.shadcn.com)

## 🎉 完成！

您的健康自检系统已成功部署到 Cloudflare Pages 和 Supabase Edge Functions。

现在您可以：
- ✅ 通过 HTTPS 公网访问
- ✅ 在家庭网络中登录使用
- ✅ 享受全球 CDN 加速
- ✅ 无需服务器维护

## 📞 支持

如有问题，请查看：
- [部署文档](./CLOUDFLARE_DEPLOYMENT.md)
- [WiFi访问修复文档](./WIFI_ACCESS_FIX.md)
- [GitHub Issues](https://github.com/your-repo/issues)

---

**部署日期**：2025-01-15
**版本**：v2.0
**部署平台**：Cloudflare Pages + Supabase Edge Functions
