# 本地开发环境 WiFi 网络访问修复方案

## 问题根因分析

### 1. 端口监听问题 ❌
**检测结果**：服务正常监听在 `0.0.0.0:5000`，所有网络接口可访问 ✅

### 2. 中间件Cookie验证问题 ❌
**根因**：登录成功后只设置localStorage，未设置Cookie，导致中间件无法识别登录状态
- 中间件检查 `request.cookies.get('admin_token')`
- 但登录接口只设置 `localStorage.setItem('admin_token')`
- 结果：访问 `/admin/dashboard` 被重定向到 `/admin/login`

### 3. WiFi网络访问问题 ⚠️
**说明**：`localhost` 仅在本机有效，其他设备需使用服务器真实IP地址
- 本机访问：`http://localhost:5000/admin/login`
- 其他设备访问：`http://9.129.49.238:5000/admin/login`

---

## 修复方案

### 修复1：登录接口增加Cookie设置
**文件路径**：`src/app/api/admin/login/route.ts`

### 修复2：简化中间件日志输出
**文件路径**：`src/app/middleware.ts`

### 修复3：清除浏览器缓存并重新访问
**操作**：在浏览器中按 `Ctrl+Shift+R`（Windows）或 `Cmd+Shift+R`（Mac）

---

## 完整修复代码

### 文件1：src/app/api/admin/login/route.ts

```typescript
/**
 * 管理员登录接口（Drizzle ORM版本 + Cookie支持）
 * 
 * 功能：
 * - 接收账号密码，验证身份
 * - 生成JWT Token并设置到Cookie和localStorage
 * - 记录登录时间和IP
 * - 防暴力破解（失败次数限制）
 * 
 * 请求方式：POST
 * 请求路径：/api/admin/login
 * 请求头：Content-Type: application/json
 * 请求体：
 * {
 *   "username": "admin",
 *   "password": "123456"
 * }
 * 
 * 响应：
 * 成功：
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id": "1",
 *     "username": "admin",
 *     "name": "系统管理员"
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminManager } from '@/storage/database/adminManager';
import { generateToken } from '@/app/lib/jwt';

/**
 * 登录失败计数（内存存储，生产环境建议使用Redis）
 */
const loginAttempts = new Map<string, { count: number; lockedUntil: Date | null }>();

/**
 * POST请求处理 - 管理员登录
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json();
    const { username, password } = body;

    // 2. 表单校验
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '账号和密码不能为空' },
        { status: 400 }
      );
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: '账号和密码格式错误' },
        { status: 400 }
      );
    }

    const usernameTrimmed = username.trim();

    // 3. 检查账号是否被锁定
    const attemptInfo = loginAttempts.get(usernameTrimmed);
    if (attemptInfo && attemptInfo.lockedUntil && attemptInfo.lockedUntil > new Date()) {
      console.log('[登录] 账号已锁定', { username: usernameTrimmed });
      return NextResponse.json(
        { 
          success: false, 
          error: '登录失败次数过多，账号已被锁定30分钟',
          lockedUntil: attemptInfo.lockedUntil.getTime()
        },
        { status: 403 }
      );
    }

    // 4. 查询管理员账号
    const admin = await adminManager.findByUsername(usernameTrimmed);

    if (!admin) {
      console.log('[登录] 账号不存在', { username: usernameTrimmed });
      return NextResponse.json(
        { success: false, error: '账号或密码错误' },
        { status: 401 }
      );
    }

    // 5. 检查账号状态
    if (!admin.isActive) {
      console.log('[登录] 账号已禁用', { username: usernameTrimmed });
      return NextResponse.json(
        { success: false, error: '账号已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    // 6. 验证密码
    const isPasswordValid = await adminManager.verifyPassword(admin, password);

    if (!isPasswordValid) {
      console.log('[登录] 密码错误', { username: usernameTrimmed });

      // 增加失败次数
      const currentCount = (attemptInfo?.count || 0) + 1;
      
      // 超过5次失败，锁定账号30分钟
      if (currentCount >= 5) {
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        
        loginAttempts.set(usernameTrimmed, {
          count: currentCount,
          lockedUntil,
        });
        
        console.log('[登录] 账号已锁定', { username: usernameTrimmed, failedAttempts: currentCount });
        
        return NextResponse.json(
          { 
            success: false, 
            error: '登录失败次数过多，账号已被锁定30分钟',
            lockedUntil: lockedUntil.getTime()
          },
          { status: 403 }
        );
      }
      
      // 更新失败次数
      loginAttempts.set(usernameTrimmed, {
        count: currentCount,
        lockedUntil: null,
      });

      return NextResponse.json(
        { success: false, error: '账号或密码错误' },
        { status: 401 }
      );
    }

    // 7. 登录成功
    console.log('[登录] 登录成功', { username: usernameTrimmed, userId: admin.id });

    // 8. 生成JWT Token
    const token = generateToken({
      userId: admin.id,
      username: admin.username,
    });

    // 9. 清除失败次数
    loginAttempts.delete(usernameTrimmed);

    // 10. 创建响应对象
    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
      },
    });

    // 11. 设置Cookie（关键修复）
    response.cookies.set('admin_token', token, {
      httpOnly: true,                    // 仅HTTP访问，防止XSS
      secure: process.env.NODE_ENV === 'production',  // 生产环境仅HTTPS
      sameSite: 'lax',                   // 防止CSRF
      maxAge: 60 * 60 * 24 * 7,          // 7天过期
      path: '/',                         // 全站可用
    });

    // 12. 返回响应
    return response;

  } catch (error) {
    console.error('[登录] 服务器错误', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器错误，请稍后再试',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET请求处理 - 不允许
 */
export async function GET() {
  return NextResponse.json(
    { success: false, error: '请使用POST方式登录' },
    { status: 405 }
  );
}
```

### 文件2：src/app/middleware.ts

```typescript
/**
 * Next.js全局中间件
 * 
 * 功能：
 * - 拦截/admin/*页面，未登录跳转到登录页
 * - 已登录用户访问/login自动跳转到/admin/dashboard
 * - 保护所有后台管理页面
 * 
 * 工作原理：
 * - 检查Cookie中的admin_token
 * - 根据路径和登录状态决定是否允许访问
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 中间件配置
 */
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};

/**
 * 中间件主函数
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查Cookie中的Token
  const token = request.cookies.get('admin_token');
  
  // 登录页面：如果已登录，跳转到后台首页
  if (pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // 其他/admin/*页面：如果未登录，跳转到登录页
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // 允许访问
  return NextResponse.next();
}
```

### 文件3：src/app/api/admin/logout/route.ts

```typescript
/**
 * 管理员登出接口
 * 
 * 功能：
 * - 清除Cookie中的Token
 * - 返回成功响应
 * 
 * 请求方式：POST
 * 请求路径：/api/admin/logout
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * POST请求处理 - 管理员登出
 */
export async function POST(request: NextRequest) {
  try {
    // 创建响应对象
    const response = NextResponse.json({
      success: true,
      message: '登出成功',
    });

    // 清除Cookie
    response.cookies.delete('admin_token');

    return response;

  } catch (error) {
    console.error('[登出] 服务器错误', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器错误，请稍后再试',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET请求处理 - 不允许
 */
export async function GET() {
  return NextResponse.json(
    { success: false, error: '请使用POST方式登出' },
    { status: 405 }
  );
}
```

### 文件4：src/app/lib/fetch.ts（更新）

```typescript
/**
 * 前端fetch请求封装工具
 * 
 * 功能：
 * - 自动携带Token（优先使用Cookie，备用localStorage）
 * - 统一异常处理
 * - 统一返回格式
 * - 自动处理401未授权（跳转登录）
 */

/**
 * API响应接口
 */
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * 请求配置接口
 */
interface FetchConfig extends RequestInit {
  /** 是否自动处理401（默认true） */
  redirectOn401?: boolean;
  /** 请求超时时间（毫秒，默认30000） */
  timeout?: number;
}

/**
 * 默认请求配置
 */
const DEFAULT_CONFIG: FetchConfig = {
  redirectOn401: true,
  timeout: 30000,
};

/**
 * 封装的fetch函数（管理员专用）
 * 
 * @param url - 请求路径
 * @param config - 请求配置
 * @returns API响应数据
 */
export async function adminFetch<T = any>(
  url: string,
  config: FetchConfig = {}
): Promise<T> {
  // 合并配置
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // 1. 准备请求头
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    };
    
    // 2. 尝试从localStorage获取Token（备用）
    const token = localStorage.getItem('admin_token');
    
    if (!token) {
      console.error('[adminFetch] 未找到Token');
      
      if (mergedConfig.redirectOn401) {
        redirectToLogin();
      }
      
      throw new Error('未登录，请先登录');
    }
    
    // 3. Token将通过Cookie自动发送，不需要手动设置Authorization头
    console.log('[adminFetch] 发送请求', { url });
    
    // 4. 创建超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, mergedConfig.timeout);
    
    // 5. 发送请求
    const response = await fetch(url, {
      ...mergedConfig,
      headers,
      credentials: 'include',  // 包含Cookie
      signal: controller.signal,
    });
    
    // 清除超时
    clearTimeout(timeoutId);
    
    // 6. 解析响应
    const data: APIResponse<T> = await response.json();
    
    // 7. 处理401未授权
    if (response.status === 401) {
      console.error('[adminFetch] 401未授权', { url, error: data.error });
      
      // 清除Token
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      if (mergedConfig.redirectOn401) {
        redirectToLogin();
      }
      
      throw new Error(data.error || '登录已过期，请重新登录');
    }
    
    // 8. 处理其他错误状态码
    if (!response.ok) {
      console.error('[adminFetch] 请求失败', { 
        url, 
        status: response.status, 
        error: data.error 
      });
      
      throw new Error(data.error || `请求失败：${response.status}`);
    }
    
    // 9. 处理业务错误
    if (!data.success) {
      console.error('[adminFetch] 业务错误', { url, error: data.error });
      throw new Error(data.error || '操作失败');
    }
    
    // 10. 返回数据
    return data.data as T;
    
  } catch (error) {
    // 处理超时错误
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[adminFetch] 请求超时', { url });
      throw new Error('请求超时，请检查网络连接');
    }
    
    // 抛出原始错误
    console.error('[adminFetch] 请求异常', { url, error });
    throw error;
  }
}

/**
 * 跳转到登录页面
 */
function redirectToLogin() {
  // 保存当前页面路径，登录后可以跳转回来
  const currentPath = window.location.pathname;
  if (currentPath !== '/admin/login') {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  
  // 跳转到登录页
  window.location.href = '/admin/login';
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('admin_user');
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('[getCurrentUser] 解析用户信息失败', error);
    return null;
  }
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  const token = localStorage.getItem('admin_token');
  return !!token;
}

/**
 * 登出
 * 
 * @param redirect - 是否跳转到登录页（默认true）
 */
export function logout(redirect: boolean = true) {
  console.log('[logout] 清除登录信息');
  
  // 清除本地存储
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  
  // 跳转到登录页
  if (redirect) {
    window.location.href = '/admin/login';
  }
}

// 导出快捷方法
export const get = <T = any>(url: string, config?: Omit<FetchConfig, 'method'>) => {
  return adminFetch<T>(url, { ...config, method: 'GET' });
};

export const post = <T = any>(url: string, body?: any, config?: Omit<FetchConfig, 'method' | 'body'>) => {
  return adminFetch<T>(url, {
    ...config,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const put = <T = any>(url: string, body?: any, config?: Omit<FetchConfig, 'method' | 'body'>) => {
  return adminFetch<T>(url, {
    ...config,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const del = <T = any>(url: string, config?: Omit<FetchConfig, 'method'>) => {
  return adminFetch<T>(url, { ...config, method: 'DELETE' });
};

// 默认导出
export default adminFetch;
```

---

## 验证步骤

### 步骤1：清除浏览器缓存
1. 打开浏览器（Chrome/Edge/Firefox）
2. 按 `Ctrl+Shift+Delete`（Windows）或 `Cmd+Shift+Delete`（Mac）
3. 清除缓存和Cookie
4. 关闭并重新打开浏览器

### 步骤2：访问登录页面
```
本机访问：http://localhost:5000/admin/login
其他设备访问：http://9.129.49.238:5000/admin/login
```

### 步骤3：输入账号密码
- 账号：`admin`
- 密码：`123456`

### 步骤4：预期结果
✅ 登录成功后自动跳转到 `/admin/dashboard`
✅ Cookie中存储了 `admin_token`
✅ localStorage中存储了 `admin_token` 和 `admin_user`

---

## 故障排查

### 问题1：连接超时
**原因**：防火墙阻止或服务未启动
**解决**：
```bash
# 检查服务是否运行
ss -tuln | grep :5000

# 检查防火墙状态（如ufw）
sudo ufw status

# 开放5000端口（如果需要）
sudo ufw allow 5000
```

### 问题2：空白页
**原因**：JavaScript执行错误
**解决**：
1. 打开浏览器开发者工具（F12）
2. 查看Console（控制台）错误信息
3. 查看Network（网络）请求状态

### 问题3：404错误
**原因**：路由配置错误
**解决**：
1. 确认文件路径正确：`src/app/admin/login/page.tsx`
2. 重启开发服务器
```bash
# 停止服务
Ctrl+C

# 重新启动
npm run dev
```

---

## 端口和监听配置确认

### 当前配置（已正确）
- **监听地址**：`0.0.0.0`（所有网络接口）
- **端口**：`5000`
- **状态**：正常运行 ✅

### 如何确认监听地址
```bash
ss -tuln | grep :5000
# 输出：tcp   LISTEN  0  511  0.0.0.0:5000  0.0.0.0:*
# 说明：0.0.0.0 表示所有接口可访问 ✅
```

---

## 注意事项

1. **localhost vs IP地址**：
   - `localhost` 仅本机有效
   - 其他设备需使用真实IP：`9.129.49.238`

2. **Cookie vs localStorage**：
   - Cookie用于服务端验证（中间件）
   - localStorage用于前端API请求
   - 两者同时设置，确保兼容性

3. **清除缓存**：
   - 修改代码后，务必清除浏览器缓存
   - 或使用无痕模式测试

---

## 快速验证命令

```bash
# 1. 测试本地访问
curl -I http://localhost:5000/admin/login

# 2. 测试IP地址访问
curl -I http://9.129.49.238:5000/admin/login

# 3. 测试登录API
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' \
  -v
```

---

**修复完成后，刷新浏览器并重新登录即可正常使用。** ✅
