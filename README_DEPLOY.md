# 健康管理系统 - 快速开始指南

## 🚀 在线访问地址（推荐）

> **重要**：本应用已部署到 Cloudflare Pages，全球可访问，无需本地安装。

### 主页面
```
https://health-system-v2.pages.dev/
```

### 管理后台
- **登录页面**：https://health-system-v2.pages.dev/admin/login
- **管理后台**：https://health-system-v2.pages.dev/admin/dashboard（登录后自动跳转）

### 测试页面
```
https://health-system-v2.pages.dev/test
```

---

## 🔐 管理后台登录信息

```
用户名：admin
密码：admin123
```

> **提示**：这是默认账号，登录成功后会跳转到管理后台。

---

## ✅ 功能清单

### 用户端功能
- ✅ 健康自检问卷
- ✅ 健康报告生成
- ✅ PWA 桌面安装支持

### 管理后台功能
- ✅ 登录验证（admin/admin123）
- ✅ 用户统计卡片（总用户数、男性用户、女性用户、系统状态）
- ✅ 用户列表表格
- ✅ 退出登录
- ⏳ 用户详情查看
- ⏳ 历史记录对比
- ⏳ 数据导出功能
- ⏳ 用户搜索筛选

> **注**：当前显示的是模拟数据（张三、李四、王五），真实数据功能需要配置数据库。

---

## 📋 技术栈

- **框架**：Next.js 14.2.18
- **UI**：shadcn/ui（部分页面使用纯内联样式）
- **样式**：Tailwind CSS 3.4.1
- **部署**：Cloudflare Pages
- **数据库**：Supabase PostgreSQL（已创建表结构）

---

## 🔧 开发说明

### 本地开发

> **警告**：本地开发需要配置环境变量和数据库，仅适用于开发者。

1. **安装依赖**
```bash
pnpm install
```

2. **配置环境变量**
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

3. **启动开发服务器**
```bash
pnpm dev
```

4. **访问地址**
- 主页面：http://localhost:3000
- 管理后台：http://localhost:3000/admin

### 构建生产版本

```bash
pnpm build
pnpm start
```

---

## 📦 部署说明

### Cloudflare Pages 部署（推荐）

应用已自动部署到 Cloudflare Pages，每次推送到 GitHub main 分支会自动触发部署。

**部署地址**：https://health-system-v2.pages.dev/

### 手动触发部署

1. 在 GitHub 仓库中创建一个空提交：
```bash
git commit --allow-empty -m "触发部署"
git push origin main
```

2. 等待 1-2 分钟，访问 Cloudflare Pages 部署页面查看状态。

---

## 🗄️ 数据库表结构

应用已创建以下数据库表（通过 Supabase SQL Editor 执行）：

### users 表
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  gender VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### health_records 表
```sql
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  check_date TIMESTAMP DEFAULT NOW(),
  score INTEGER,
  health_level VARCHAR(20),
  details JSONB
);
```

### admins 表
```sql
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🐛 问题排查

### 问题1：登录页面显示"网络错误"

**原因**：Cloudflare Pages 缓存未更新。

**解决方案**：
1. 按 `Ctrl + Shift + R`（Windows）或 `Cmd + Shift + R`（Mac）强制刷新页面
2. 清除浏览器缓存
3. 访问测试页面确认部署状态：https://health-system-v2.pages.dev/test

### 问题2：登录后无法跳转到后台

**原因**：LocalStorage 未正确设置或被浏览器阻止。

**解决方案**：
1. 检查浏览器是否允许使用 LocalStorage
2. 尝试使用隐私模式（无痕模式）登录
3. 直接访问后台页面：https://health-system-v2.pages.dev/admin/dashboard

### 问题3：页面样式错乱

**原因**：浏览器缓存了旧版本的 CSS。

**解决方案**：
1. 强制刷新页面（Ctrl + Shift + R）
2. 清除浏览器缓存
3. 等待 Cloudflare Pages 完成最新部署（约 1-2 分钟）

---

## 📞 支持

如果遇到其他问题，请：
1. 访问测试页面确认部署状态：https://health-system-v2.pages.dev/test
2. 检查浏览器控制台是否有错误信息
3. 强制刷新页面清除缓存

---

## 📝 更新日志

### 2025-02-03
- ✅ 完全重写登录页面，使用最简单的代码
- ✅ 完全重写后台管理页面，使用最简单的代码
- ✅ 移除所有 React Hooks 依赖，确保 Cloudflare Pages 兼容性
- ✅ 创建测试页面用于验证部署状态
- ✅ 修复网络错误问题

---

**立即开始使用**：https://health-system-v2.pages.dev/admin/login
