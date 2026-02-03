# 快速开始指南（5分钟快速部署）

本指南帮助您在5分钟内完成后台登录系统的部署和测试。

## ⚡ 5分钟快速部署

### 第1步：安装依赖（1分钟）

```bash
pnpm add bcryptjs jsonwebtoken pg
pnpm add -D @types/bcryptjs @types/jsonwebtoken
```

### 第2步：配置环境变量（1分钟）

```bash
# 1. 复制环境变量文件
cp env.local.example .env.local

# 2. 编辑 .env.local，修改以下两项：
# DB_PASSWORD=你的数据库密码
# JWT_SECRET=生成的强秘钥（至少32字符）

# 生成JWT秘钥：
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 第3步：创建数据库表（2分钟）

```bash
# 1. 连接数据库
psql -U postgres -d health_app

# 2. 执行脚本
\i DB_ADMIN_SETUP.sql

# 3. 验证
SELECT * FROM admins WHERE username = 'admin';

# 4. 退出
\q
```

### 第4步：创建文件（1分钟）

按照以下路径创建文件（代码已提供）：

**后端文件**（5个）：
- `/src/app/lib/db.ts`
- `/src/app/lib/jwt.ts`
- `/src/app/lib/middleware/auth.ts`
- `/src/app/api/admin/login/route.ts`
- `/src/app/api/admin/logout/route.ts`

**前端文件**（4个）：
- `/src/app/components/LoginForm.tsx`
- `/src/app/admin/login/page.tsx`
- `/src/app/lib/fetch.ts`
- `/src/app/middleware.ts`

### 第5步：启动项目（30秒）

```bash
npm run dev
```

### 第6步：测试登录（30秒）

1. 访问：http://localhost:3000/admin/login
2. 账号：`admin`
3. 密码：`123456`
4. 点击登录

✅ 成功！自动跳转到后台首页。

---

## 📦 完整文件清单

### 数据库（1个）
- ✅ `DB_ADMIN_SETUP.sql` - 数据库脚本

### 后端文件（5个）
- ✅ `/src/app/lib/db.ts` - 数据库连接
- ✅ `/src/app/lib/jwt.ts` - JWT工具
- ✅ `/src/app/lib/middleware/auth.ts` - 鉴权中间件
- ✅ `/src/app/api/admin/login/route.ts` - 登录接口
- ✅ `/src/app/api/admin/logout/route.ts` - 登出接口

### 前端文件（4个）
- ✅ `/src/app/components/LoginForm.tsx` - 登录表单
- ✅ `/src/app/admin/login/page.tsx` - 登录页面
- ✅ `/src/app/lib/fetch.ts` - fetch封装
- ✅ `/src/app/middleware.ts` - 路由中间件

### 配置文件（2个）
- ✅ `env.local.example` - 环境变量示例
- ✅ `DEPENDENCIES.md` - 依赖说明

### 文档（2个）
- ✅ `ADMIN_LOGIN_SYSTEM_GUIDE.md` - 完整整合文档
- ✅ `QUICK_START.md` - 本文档

**总计：14个文件**

---

## 🎯 核心功能测试

### ✅ 登录测试
```
访问：/admin/login
账号：admin
密码：123456
结果：登录成功，跳转到 /admin/dashboard
```

### ✅ 登出测试
```javascript
// 在浏览器控制台执行
localStorage.removeItem('admin_token');
location.reload();
```

### ✅ 接口测试
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

---

## 🔐 默认账号

```
账号：admin
密码：123456
```

⚠️ **首次登录后请立即修改密码！**

---

## 📝 最小化修改现有代码

如需保护现有API接口，仅需在文件开头添加一行：

```typescript
import { authMiddleware, unauthorizedResponse } from '@/app/lib/middleware/auth';

export async function GET(request: NextRequest) {
  const user = await authMiddleware(request);
  if (!user) {
    return unauthorizedResponse();
  }
  
  // 原有逻辑保持不变...
}
```

---

## 🆘 常见问题速查

### Q1: 启动报错 "ECONNREFUSED"
**A**: 检查PostgreSQL服务是否启动
```bash
sudo systemctl start postgresql
```

### Q2: 登录报错 "数据库操作失败"
**A**: 重新执行数据库脚本
```bash
psql -U postgres -d health_app -f DB_ADMIN_SETUP.sql
```

### Q3: 登录报错 "生成Token失败"
**A**: 检查JWT_SECRET配置，重启服务器
```bash
# 重新生成秘钥
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 重启服务器
npm run dev
```

### Q4: 登录成功不跳转
**A**: 检查localStorage是否存储了Token
```javascript
// 浏览器控制台
localStorage.getItem('admin_token')
```

---

## 📚 详细文档

- 完整整合文档：`ADMIN_LOGIN_SYSTEM_GUIDE.md`
- 依赖说明：`DEPENDENCIES.md`
- 环境变量：`env.local.example`
- 数据库脚本：`DB_ADMIN_SETUP.sql`

---

## ✅ 部署检查清单

- [ ] 依赖安装成功
- [ ] 环境变量配置正确
- [ ] 数据库表创建成功
- [ ] 所有文件创建完成
- [ ] 项目启动成功
- [ ] 登录功能正常
- [ ] 跳转功能正常
- [ ] Token存储正确

---

**祝部署顺利！如有问题，请查阅 `ADMIN_LOGIN_SYSTEM_GUIDE.md` 详细文档。**
