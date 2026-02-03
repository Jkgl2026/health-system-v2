# 后台登录系统 - 完整整合文档

本文档提供后台登录系统的完整整合、启动、测试步骤。

## 📋 目录

1. [项目目录结构](#项目目录结构)
2. [整合步骤](#整合步骤)
3. [启动步骤](#启动步骤)
4. [测试步骤](#测试步骤)
5. [验证清单](#验证清单)
6. [注意事项](#注意事项)
7. [常见问题](#常见问题)

---

## 📁 项目目录结构

### 新增文件清单

```
项目根目录/
├── DB_ADMIN_SETUP.sql                          # 数据库脚本
├── env.local.example                           # 环境变量示例
├── DEPENDENCIES.md                             # 依赖说明
├── ADMIN_LOGIN_SYSTEM_GUIDE.md                 # 本文档
│
├── src/
│   ├── app/
│   │   ├── lib/
│   │   │   ├── db.ts                           # 数据库连接封装
│   │   │   ├── jwt.ts                          # JWT工具类
│   │   │   ├── fetch.ts                        # 前端fetch封装
│   │   │   └── middleware/
│   │   │       └── auth.ts                     # JWT鉴权中间件
│   │   ├── api/
│   │   │   └── admin/
│   │   │       ├── login/
│   │   │       │   └── route.ts                # 登录API接口
│   │   │       └── logout/
│   │   │           └── route.ts                # 登出API接口
│   │   ├── admin/
│   │   │   └── login/
│   │   │       └── page.tsx                    # 登录页面
│   │   ├── components/
│   │   │   └── LoginForm.tsx                   # 登录表单组件
│   │   └── middleware.ts                       # Next.js全局中间件
│   └── ...
│
├── package.json                                # 需要添加依赖
└── .env.local                                  # 需要创建（从env.local.example复制）
```

### 现有文件修改（仅添加一行代码）

如需保护现有API接口，需要在文件开头添加一行引入：

```typescript
// 所有 /src/app/api/admin/[模块名]/route.ts 文件开头添加
import { authMiddleware, unauthorizedResponse } from '@/app/lib/middleware/auth';

// 在export async函数开头添加鉴权
export async function GET(request: NextRequest) {
  const user = await authMiddleware(request);
  if (!user) {
    return unauthorizedResponse();
  }
  
  // 原有业务逻辑...
}
```

---

## 🔧 整合步骤

### 步骤1：安装依赖

执行以下命令安装新增依赖：

```bash
# 使用 pnpm（推荐）
pnpm add bcryptjs jsonwebtoken pg
pnpm add -D @types/bcryptjs @types/jsonwebtoken

# 或使用 npm
npm install bcryptjs jsonwebtoken pg
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 步骤2：配置环境变量

```bash
# 1. 复制环境变量示例文件
cp env.local.example .env.local

# 2. 编辑 .env.local 文件，修改以下配置：
# - DB_HOST=your_database_host
# - DB_PORT=5432
# - DB_NAME=health_app
# - DB_USER=your_database_user
# - DB_PASSWORD=your_database_password
# - JWT_SECRET=your-strong-jwt-secret-at-least-32-characters
```

**重要提示**：
- `JWT_SECRET` 必须至少32字符，建议使用随机生成：
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

### 步骤3：创建数据库表和初始化账号

```bash
# 1. 连接到PostgreSQL数据库
psql -U postgres -d health_app

# 2. 执行数据库脚本
\i DB_ADMIN_SETUP.sql

# 3. 验证管理员账号是否创建成功
SELECT * FROM admins WHERE username = 'admin';

# 4. 退出数据库
\q
```

**预期结果**：
- 看到 `admins` 表创建成功
- 看到默认管理员账号：admin / 123456

### 步骤4：创建所有新增文件

根据文件结构，逐个创建以下文件：

#### 后端文件

1. `/src/app/lib/db.ts`
2. `/src/app/lib/jwt.ts`
3. `/src/app/lib/middleware/auth.ts`
4. `/src/app/api/admin/login/route.ts`
5. `/src/app/api/admin/logout/route.ts`

#### 前端文件

6. `/src/app/components/LoginForm.tsx`
7. `/src/app/admin/login/page.tsx`
8. `/src/app/lib/fetch.ts`
9. `/src/app/middleware.ts`

**提示**：所有文件代码已在本次会话中提供，直接复制粘贴即可。

### 步骤5：修改现有API接口（可选）

如果需要保护现有管理员接口，在每个 `/src/app/api/admin/[模块名]/route.ts` 文件开头添加：

```typescript
import { authMiddleware, unauthorizedResponse } from '@/app/lib/middleware/auth';

// 在export async函数开头添加鉴权
export async function GET(request: NextRequest) {
  const user = await authMiddleware(request);
  if (!user) {
    return unauthorizedResponse();
  }
  
  // 原有业务逻辑保持不变...
}
```

---

## 🚀 启动步骤

### 方式1：开发模式

```bash
# 启动开发服务器
npm run dev

# 或
pnpm dev

# 或
yarn dev
```

**预期结果**：
- 服务启动在 http://localhost:3000
- 控制台无错误信息

### 方式2：生产模式

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start

# 或
pnpm start
```

**预期结果**：
- 构建成功，无错误
- 生产服务器启动成功

---

## ✅ 测试步骤

### 测试1：访问登录页面

**操作**：
1. 打开浏览器，访问 http://localhost:3000/admin/login

**预期结果**：
- ✅ 显示登录表单
- ✅ 页面样式正常（居中布局、蓝色按钮）
- ✅ 显示默认账号提示：admin / 123456

---

### 测试2：正常登录

**操作**：
1. 输入账号：`admin`
2. 输入密码：`123456`
3. 点击"登录"按钮

**预期结果**：
- ✅ 按钮显示"登录中..."（加载状态）
- ✅ 登录成功，自动跳转到 http://localhost:3000/admin/dashboard
- ✅ localStorage 中存储了 `admin_token` 和 `admin_user`

**检查方法**：
- 打开浏览器开发者工具（F12）
- Console（控制台）输入：`localStorage.getItem('admin_token')`
- 应该看到类似：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### 测试3：登录失败（账号或密码错误）

**操作**：
1. 输入账号：`admin`
2. 输入密码：`wrong_password`
3. 点击"登录"按钮

**预期结果**：
- ✅ 显示红色错误提示：`账号或密码错误`
- ✅ 不跳转页面
- ✅ 按钮恢复为"登录"状态

---

### 测试4：表单校验

**操作1**：不输入账号，直接点击登录
**预期结果**：
- ✅ 账号输入框下方显示：`请输入账号`
- ✅ 不提交请求

**操作2**：输入账号，不输入密码，直接点击登录
**预期结果**：
- ✅ 密码输入框下方显示：`请输入密码`
- ✅ 不提交请求

**操作3**：输入短密码（少于6位）
**预期结果**：
- ✅ 密码输入框下方显示：`密码长度至少6个字符`
- ✅ 不提交请求

---

### 测试5：已登录访问登录页

**操作**：
1. 先登录成功
2. 手动访问 http://localhost:3000/admin/login

**预期结果**：
- ✅ 自动跳转到 http://localhost:3000/admin/dashboard
- ✅ 不显示登录表单

---

### 测试6：未登录访问后台页面

**操作**：
1. 清除localStorage（登出）
2. 直接访问 http://localhost:3000/admin/dashboard

**预期结果**：
- ✅ 自动跳转到 http://localhost:3000/admin/login
- ✅ 控制台输出：`[中间件] 未登录访问后台页面，跳转到登录页`

---

### 测试7：接口保护测试

**操作**：
1. 登录成功
2. 打开浏览器开发者工具（F12）
3. Console（控制台）执行：

```javascript
// 测试已登录访问API
fetch('/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: '123456' })
})
.then(r => r.json())
.then(d => console.log('登录API测试：', d));

// 测试未登录访问受保护API（如果有受保护的API）
fetch('/api/admin/users', {
  headers: { 'Authorization': 'Bearer invalid_token' }
})
.then(r => r.json())
.then(d => console.log('未授权访问测试：', d));
```

**预期结果**：
- ✅ 登录API返回成功
- ✅ 未授权访问返回401错误

---

### 测试8：登出功能

**操作**：
1. 登录成功
2. 在浏览器开发者工具 Console 执行：

```javascript
// 清除Token（模拟登出）
localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');

// 刷新页面
location.reload();
```

**预期结果**：
- ✅ 自动跳转到登录页
- ✅ 无法直接访问后台页面

---

## ✅ 验证清单

登录系统整合完成后，请对照以下清单验证所有功能：

### 功能验证

- [ ] 登录页面正常显示（/admin/login）
- [ ] 默认账号可正常登录（admin / 123456）
- [ ] 登录成功后跳转到后台首页
- [ ] Token正确存储到localStorage
- [ ] 登录失败显示错误提示
- [ ] 表单校验正常工作
- [ ] 密码显隐切换功能正常
- [ ] 加载状态显示正常
- [ ] 已登录访问登录页自动跳转
- [ ] 未登录访问后台页面自动跳转登录页
- [ ] 登出功能正常工作
- [ ] 中间件日志正常输出

### 安全验证

- [ ] 密码加密存储（数据库中看不到明文密码）
- [ ] Token包含正确的用户信息
- [ ] Token有有效期（7天）
- [ ] 错误提示不泄露敏感信息（账号或密码错误，不区分具体错误）
- [ ] 防重复提交（登录中禁用按钮）

### 代码验证

- [ ] 所有文件创建成功
- [ ] 依赖安装成功（无TypeScript报错）
- [ ] 环境变量配置正确
- [ ] 数据库表创建成功
- [ ] 无控制台错误
- [ ] API接口返回格式正确

---

## ⚠️ 注意事项

### 1. 数据库配置

- 确保 `DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER`、`DB_PASSWORD` 配置正确
- 确保PostgreSQL服务正在运行
- 确保数据库 `health_app` 已创建

### 2. JWT秘钥安全

- ⚠️ **生产环境必须修改 `JWT_SECRET` 为强密码**
- 建议32字符以上的随机字符串
- 不要在代码中硬编码JWT_SECRET

### 3. Token存储

- 当前方案Token存储在localStorage（便于开发）
- 生产环境建议配合httpOnly Cookie使用（更安全）
- 已在 `src/app/middleware.ts` 中提供Cookie方案说明

### 4. 密码安全

- 默认密码 `123456` 仅用于测试
- 生产环境首次登录后立即修改密码
- 建议密码至少8位，包含大小写字母、数字、特殊字符

### 5. 部署注意事项

- **不支持纯静态托管**（如Cloudflare Pages、GitHub Pages）
- 需要Node.js/Next.js服务器
- 数据库需要可访问（同服务器或远程数据库）

---

## 🔍 常见问题

### 问题1：启动时报错 "Error: connect ECONNREFUSED"

**原因**：数据库连接失败

**解决方案**：
1. 检查PostgreSQL服务是否启动
2. 检查 `.env.local` 中的数据库配置是否正确
3. 检查防火墙是否阻止连接

```bash
# 检查PostgreSQL服务状态
sudo systemctl status postgresql

# 启动PostgreSQL服务
sudo systemctl start postgresql
```

---

### 问题2：登录时报错 "数据库操作失败"

**原因**：数据库表不存在或SQL执行失败

**解决方案**：
1. 检查 `admins` 表是否创建成功
2. 重新执行数据库脚本：`\i DB_ADMIN_SETUP.sql`
3. 查看数据库连接日志

```sql
-- 检查表是否存在
SELECT * FROM information_schema.tables WHERE table_name = 'admins';

-- 查看表结构
\d admins
```

---

### 问题3：登录时报错 "生成Token失败"

**原因**：JWT_SECRET配置问题

**解决方案**：
1. 检查 `.env.local` 中的 `JWT_SECRET` 是否配置
2. 确保 `JWT_SECRET` 至少32字符
3. 重启开发服务器（环境变量修改后需要重启）

```bash
# 重新生成JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 重启开发服务器
# 按 Ctrl+C 停止，然后重新运行 npm run dev
```

---

### 问题4：登录成功但未跳转

**原因**：Token未正确存储或路由拦截问题

**解决方案**：
1. 检查localStorage是否存储了Token
2. 检查浏览器控制台是否有JavaScript错误
3. 检查 `src/app/middleware.ts` 是否正常工作

```javascript
// 在浏览器控制台检查Token
localStorage.getItem('admin_token');
localStorage.getItem('admin_user');
```

---

### 问题5：TypeScript报错 "Cannot find module 'bcryptjs'"

**原因**：依赖未安装或类型定义未安装

**解决方案**：
1. 重新安装依赖
2. 安装类型定义

```bash
# 重新安装依赖
pnpm install

# 安装类型定义
pnpm add -D @types/bcryptjs @types/jsonwebtoken
```

---

### 问题6：中间件未拦截未登录访问

**原因**：中间件配置问题或Cookie方案未启用

**解决方案**：
1. 检查 `src/app/middleware.ts` 中的配置
2. 当前方案是前端检查（localStorage），中间件仅作为补充
3. 如需服务端拦截，参考 `src/app/middleware.ts` 中的"改进方案"

---

### 问题7：密码明文存储在数据库

**原因**：bcrypt未正确加密

**解决方案**：
1. 检查 `bcrypt.compare` 调用是否正确
2. 数据库中的 `password_hash` 应该是60字符的bcrypt hash
3. 如果存储的是明文，需要重新加密

```sql
-- 查看密码hash格式
SELECT username, password_hash FROM admins;

-- 应该类似：$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqdH3mC6m9q9e6p8e7kZ3yR8xW0K9e
```

---

## 📞 技术支持

如果遇到其他问题：

1. 查看浏览器控制台错误（F12 -> Console）
2. 查看服务器端日志（终端输出）
3. 检查网络请求（F12 -> Network）
4. 检查环境变量配置（`.env.local`）
5. 检查数据库连接和表结构

---

## 📚 相关文档

- [数据库脚本](./DB_ADMIN_SETUP.sql)
- [依赖说明](./DEPENDENCIES.md)
- [环境变量配置](./env.local.example)
- [API接口文档](./src/app/api/admin/login/route.ts)
- [JWT工具类文档](./src/app/lib/jwt.ts)
- [鉴权中间件文档](./src/app/lib/middleware/auth.ts)

---

**文档版本**：v1.0  
**最后更新**：2024年  
**适用版本**：Next.js 13+、React 18+、PostgreSQL
