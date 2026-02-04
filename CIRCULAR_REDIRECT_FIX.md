# 循环跳转问题修复报告

## 问题描述

用户反馈页面出现 `/admin/login` 和 `/admin/` 循环跳转的问题，导致无法正常访问后台管理系统。

## 根本原因

经过排查，发现循环跳转的根本原因是 **登录状态校验逻辑不匹配**：

### 问题流程

1. **登录成功时**：
   - `LoginForm` 组件保存了 `admin_token` 和 `admin_user` 到 localStorage
   - 代码位置：`src/app/components/LoginForm.tsx`
   ```typescript
   localStorage.setItem('admin_token', JSON.stringify(data.token));
   localStorage.setItem('admin_user', JSON.stringify(user));
   ```

2. **后台首页校验时**：
   - `/admin/dashboard` 页面的 `checkAuth()` 函数检查的是 `adminLoggedIn`，而不是 `admin_token`
   - 代码位置：`src/app/admin/dashboard/page.tsx`
   ```typescript
   const checkAuth = () => {
     const isLoggedIn = localStorage.getItem('adminLoggedIn');  // ❌ 错误
     if (!isLoggedIn) {
       router.push('/admin/login');
     }
   };
   ```

3. **登录页面再次跳转**：
   - `/admin/login` 页面检查 `admin_token` 是否存在
   - 如果存在，自动跳转到 `/admin/dashboard`
   - 代码位置：`src/app/admin/login/page.tsx`
   ```typescript
   const token = localStorage.getItem('admin_token');  // ✅ 正确
   if (token) {
     window.location.href = '/admin/dashboard';
   }
   ```

4. **结果**：形成循环跳转
   - `/admin/dashboard` → 未找到 `adminLoggedIn` → 跳转到 `/admin/login`
   - `/admin/login` → 找到 `admin_token` → 跳转到 `/admin/dashboard`
   - 无限循环...

## 修复方案

### 1. 修复 Dashboard 页面的登录状态校验

**文件**：`src/app/admin/dashboard/page.tsx`

**修改前**：
```typescript
const checkAuth = () => {
  const isLoggedIn = localStorage.getItem('adminLoggedIn');
  if (!isLoggedIn) {
    router.push('/admin/login');
  }
};
```

**修改后**：
```typescript
const checkAuth = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    console.log('[后台首页] 未检测到登录Token，跳转到登录页');
    router.push('/admin/login');
  }
};
```

### 2. 修复数据对比页面的登录状态校验

**文件**：src/app/admin/compare/page.tsx

**修改前**：
```typescript
const loggedIn = localStorage.getItem('adminLoggedIn');
if (loggedIn !== 'true') {
  window.location.href = '/admin-login.html';
}
```

**修改后**：
```typescript
const token = localStorage.getItem('admin_token');
if (!token) {
  console.log('[数据对比页] 未检测到登录Token，跳转到登录页');
  window.location.href = '/admin/login';
}
```

### 3. 修复登出功能

**文件**：src/app/admin/dashboard/page.tsx

**修改前**：
```typescript
const handleLogout = () => {
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('admin');
  router.push('/admin/login');
};
```

**修改后**：
```typescript
const handleLogout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  console.log('[后台首页] 已清除登录信息，跳转到登录页');
  router.push('/admin/login');
};
```

## 修复验证

### 1. TypeScript 类型检查

运行 `npx tsc --noEmit`，无错误输出。

### 2. API 接口测试

测试登录接口 `/api/admin/login`：
- ✅ 返回 JSON 响应，不是 HTML 页面
- ✅ 正确返回错误信息：`{"error":"用户名或密码错误"}`

### 3. 页面访问测试

- ✅ 首页 `/` 返回 200 OK
- ✅ 登录页 `/admin/login` 返回 200 OK
- ✅ Dashboard 页面 `/admin/dashboard` 返回 200 OK（但会在客户端跳转到登录页）

## 修复后预期行为

### 正常登录流程

1. 用户访问 `/admin/login`
2. 登录页面检查 Token，不存在，显示登录表单
3. 用户输入用户名密码，点击登录
4. 前端调用 `/api/admin/login` 接口
5. 登录成功后，保存 `admin_token` 和 `admin_user` 到 localStorage
6. 自动跳转到 `/admin/dashboard`
7. Dashboard 页面检查 `admin_token`，存在，显示管理界面

### 未登录访问后台流程

1. 用户直接访问 `/admin/dashboard`
2. 页面加载，执行 `checkAuth()` 函数
3. 检查 `admin_token`，不存在
4. 调用 `router.push('/admin/login')` 跳转到登录页
5. 显示登录表单

### 登出流程

1. 用户点击"登出"按钮
2. 删除 `admin_token` 和 `admin_user`
3. 跳转到登录页
4. 登录页检查 Token，不存在，显示登录表单

## 注意事项

1. **客户端路由跳转**：Next.js 的 `router.push()` 是客户端路由跳转，服务器端仍会返回请求页面的 HTML。这是正常行为。

2. **登录状态统一**：所有后台管理页面都应该统一检查 `admin_token`，而不是其他字段。

3. **日志记录**：添加了 console.log 日志，方便调试和排查问题。

## 相关文件

- `src/app/components/LoginForm.tsx` - 登录表单组件
- `src/app/admin/login/page.tsx` - 登录页面
- `src/app/admin/dashboard/page.tsx` - 后台首页
- `src/app/admin/compare/page.tsx` - 数据对比页

## 后续建议

1. 考虑使用更安全的 Token 存储方式，如 HttpOnly Cookie
2. 添加 Token 过期机制，定期刷新 Token
3. 实现服务端渲染（SSR）的登录状态检查，提升安全性和用户体验
4. 添加登录失败次数限制，防止暴力破解
