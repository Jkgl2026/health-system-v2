# 🚀 立即部署 - 只需 5 步！

## ✅ 代码已准备好，现在部署！

---

## 第 1 步：创建 Supabase 项目（2 分钟）

1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写：
   - Name: `health-system`
   - Password: 设置一个强密码
   - Region: `Singapore`（速度最快）
4. 点击创建，等待完成

---

## 第 2 步：获取凭证（1 分钟）

进入 Project Settings -> API，复制以下信息到记事本：

```
SUPABASE_URL = https://xxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

进入 Project Settings -> General，复制：

```
SUPABASE_PROJECT_REF = abc123xyz
```

---

## 第 3 步：部署 Edge Functions（2 分钟）

### 安装 Supabase CLI

**Windows:**
```powershell
winget install Supabase.CLI
```

**Mac:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
npm install -g supabase
```

### 登录并部署

```bash
# 1. 登录
supabase login

# 2. 连接项目（替换 YOUR_PROJECT_REF）
supabase link --project-ref YOUR_PROJECT_REF

# 3. 部署所有函数
supabase functions deploy

# 4. 设置环境变量（替换为你的凭证）
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 第 4 步：初始化数据库（1 分钟）

在浏览器中访问：

```
https://YOUR_SUPABASE_URL/functions/v1/init-db?key=init-health-system-2025
```

应该看到：
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

---

## 第 5 步：配置 Cloudflare Pages（1 分钟）

1. 登录 https://dash.cloudflare.com
2. 进入 Pages -> health-system-v2 -> Settings -> Environment variables
3. 添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 SUPABASE_URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 SUPABASE_ANON_KEY |
| `NEXT_PUBLIC_APP_URL` | `https://health-system-v2.pages.dev` |
| `NEXT_PUBLIC_API_URL` | `https://your-project.supabase.co/functions/v1` |

4. 点击 Deployments -> Retry deployment
5. 等待部署完成

---

## 🎉 完成！测试后台

访问：https://health-system-v2.pages.dev/admin/dashboard

**登录账号：**
- 用户名：`admin`
- 密码：`admin123`

---

## 📚 详细文档

需要更多细节？查看：
- `ULTIMATE_DEPLOYMENT_GUIDE.md` - 完整部署指南（包含故障排除）
- `QUICK_START.md` - 快速开始
- `DEPLOYMENT.md` - 详细文档

---

## ❓ 遇到问题？

1. **Edge Functions 部署失败**
   - 检查：`supabase --version`
   - 确保已登录：`supabase login`
   - 检查网络连接

2. **数据库初始化失败**
   - 检查 API Key 是否正确：`init-health-system-2025`
   - 确保 SUPABASE_SERVICE_ROLE_KEY 正确

3. **后台无法访问**
   - 检查 Cloudflare Pages 环境变量
   - 重新部署 Cloudflare Pages
   - 等待 DNS 解析

---

## 💡 提示

- 使用 Singapore 区域（速度最快）
- 所有服务都是免费的
- 定期备份数据库
- 修改默认管理员密码

---

## 🎯 访问地址

| 页面 | URL |
|------|-----|
| 首页 | https://health-system-v2.pages.dev |
| 后台登录 | https://health-system-v2.pages.dev/admin/login |
| 后台管理 | https://health-system-v2.pages.dev/admin/dashboard |

---

**开始部署吧！只需要 5-10 分钟！** 🚀
