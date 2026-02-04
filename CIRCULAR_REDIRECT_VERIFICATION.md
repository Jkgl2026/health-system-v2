# 循环跳转修复验证指南

## 快速验证步骤

### 1. 清除浏览器缓存和 localStorage

在浏览器控制台（F12）中执行：
```javascript
localStorage.clear();
sessionStorage.clear();
```

### 2. 测试正常登录流程

1. 访问 `http://localhost:5000/admin/login`
2. 输入用户名和密码
3. 点击登录
4. 预期：自动跳转到 `/admin/dashboard`，显示管理界面

### 3. 测试未登录访问后台

1. 清除 localStorage（步骤1）
2. 直接访问 `http://localhost:5000/admin/dashboard`
3. 预期：自动跳转到 `/admin/login`，显示登录表单

### 4. 测试登出功能

1. 登录成功后，在 Dashboard 页面点击"登出"按钮
2. 预期：跳转到 `/admin/login`，显示登录表单
3. 检查 localStorage，确认 `admin_token` 和 `admin_user` 已被清除

### 5. 检查登录状态

在浏览器控制台中执行：
```javascript
// 查看当前的登录状态
const token = localStorage.getItem('admin_token');
console.log('Token:', token ? '存在' : '不存在');

const user = localStorage.getItem('admin_user');
console.log('User:', user ? JSON.parse(user) : null);
```

## 控制台日志说明

修复后，你会看到以下日志输出：

### 登录页面
```
[登录页面] 未检测到Token，显示登录表单
[登录表单] 正在登录...
[登录表单] 登录成功 {userId: "xxx", username: "admin"}
[登录页面] 登录成功，准备跳转
```

### 后台首页
```
[后台首页] 已清除登录信息，跳转到登录页
```

## 常见问题排查

### 问题1：仍然循环跳转

**原因**：浏览器缓存了旧的 JavaScript 代码

**解决**：
1. 硬刷新浏览器（Ctrl+Shift+R 或 Cmd+Shift+R）
2. 或者清除浏览器缓存

### 问题2：登录成功后无法跳转

**原因**：Token 未正确保存

**解决**：
1. 检查浏览器控制台是否有错误
2. 检查 localStorage 中是否有 `admin_token`
3. 检查网络请求是否成功

### 问题3：接口返回 404 或 500 错误

**原因**：API 路由未正确配置或构建失败

**解决**：
1. 检查控制台日志
2. 重新构建项目：`pnpm run build`
3. 重启开发服务器：`coze dev`

## 性能优化建议

### 1. 添加加载状态

在登录跳转时显示加载动画，提升用户体验：
```typescript
const [isRedirecting, setIsRedirecting] = useState(false);

const handleLoginSuccess = (token: string, user: any) => {
  setIsRedirecting(true);
  setTimeout(() => {
    window.location.href = '/admin/dashboard';
  }, 300);
};

// 在 UI 中显示
{isRedirecting && <div>正在跳转...</div>}
```

### 2. 添加 Token 过期检查

定期检查 Token 是否过期，避免使用无效 Token：
```typescript
const checkTokenExpiry = () => {
  const tokenData = localStorage.getItem('admin_token');
  if (tokenData) {
    const token = JSON.parse(tokenData);
    if (token.expiresAt && Date.now() > token.expiresAt) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      router.push('/admin/login');
    }
  }
};
```

### 3. 使用 React Context 管理登录状态

将登录状态提升到 Context 中，避免在多个页面重复检查：
```typescript
// AuthContext.tsx
const AuthContext = React.createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setUser(JSON.parse(localStorage.getItem('admin_user')));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## 安全建议

1. **不要在 localStorage 中存储敏感信息**：Token 应该设置过期时间
2. **使用 HTTPS**：确保所有传输都加密
3. **实现 CSRF 保护**：添加 CSRF Token
4. **添加请求频率限制**：防止暴力破解
5. **定期更换密钥**：定期更新 JWT 密钥

## 相关文档

- [循环跳转问题修复报告](CIRCULAR_REDIRECT_FIX.md)
- [Next.js API Routes 文档](https://nextjs.org/docs/api-routes/introduction)
- [Next.js 路由文档](https://nextjs.org/docs/routing/introduction)
