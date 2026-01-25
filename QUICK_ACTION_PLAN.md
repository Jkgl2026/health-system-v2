# 快速改进行动计划

## 🚀 立即行动项（本周完成）

### 1. 安全加固（2-3天）

#### 1.1 创建身份验证中间件 ⭐⭐⭐
```bash
# 创建文件
touch src/middleware.ts
```

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 不需要验证的路径
const publicPaths = ['/api/admin/login', '/api/admin/init-admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保护管理后台API
  if (pathname.startsWith('/api/admin') && !publicPaths.includes(pathname)) {
    const adminSession = request.cookies.get('admin_session');

    if (!adminSession) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 验证session（这里简化处理，实际应该从数据库验证）
    try {
      const session = JSON.parse(adminSession.value);
      if (!session.adminId || !session.expiresAt) {
        return NextResponse.json(
          { error: '会话无效' },
          { status: 401 }
        );
      }

      // 检查是否过期
      if (new Date(session.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: '会话已过期' },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: '会话格式错误' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/admin/:path*',
};
```

#### 1.2 实现会话管理 ⭐⭐⭐
```bash
# 创建会话管理工具
touch src/lib/session-manager.ts
```

```typescript
// src/lib/session-manager.ts
import { cookies } from 'next/headers';

const SESSION_DURATION = 30 * 60 * 1000; // 30分钟

export interface AdminSession {
  adminId: string;
  username: string;
  name: string;
  expiresAt: string;
  createdAt: string;
}

export function createAdminSession(admin: {
  id: string;
  username: string;
  name: string;
}): AdminSession {
  const session: AdminSession = {
    adminId: admin.id,
    username: admin.username,
    name: admin.name,
    expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
    createdAt: new Date().toISOString(),
  };

  return session;
}

export function setAdminSession(session: AdminSession) {
  cookies().set('admin_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
  });
}

export function clearAdminSession() {
  cookies().delete('admin_session');
}

export function getAdminSession(): AdminSession | null {
  const sessionCookie = cookies().get('admin_session');
  if (!sessionCookie) return null;

  try {
    const session = JSON.parse(sessionCookie.value) as AdminSession;
    if (new Date(session.expiresAt) < new Date()) {
      clearAdminSession();
      return null;
    }
    return session;
  } catch (error) {
    clearAdminSession();
    return null;
  }
}
```

修改登录API：
```typescript
// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import { createAdminSession, setAdminSession } from '@/lib/session-manager';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { username, password } = data;

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const admin = await healthDataManager.verifyAdmin(username, password);

    if (!admin) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 创建会话
    const session = createAdminSession({
      id: admin.id,
      username: admin.username,
      name: admin.name || admin.username,
    });

    setAdminSession(session);

    // 返回管理员信息（不包含密码）
    const { password: _, ...adminInfo } = admin;
    return NextResponse.json({
      success: true,
      admin: adminInfo,
      session: {
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
```

添加登出API：
```bash
touch src/app/api/admin/logout/route.ts
```

```typescript
// src/app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/session-manager';

export async function POST() {
  clearAdminSession();
  return NextResponse.json({
    success: true,
    message: '已退出登录',
  });
}
```

#### 1.3 添加速率限制 ⭐⭐
```bash
pnpm add @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// 创建速率限制器
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10秒内最多10次请求
  analytics: true,
  prefix: '@upstash/ratelimit',
});

// 内存版本的速率限制（不依赖Redis）
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function memoryRateLimit(identifier: string, limit: number = 10, window: number = 10000): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    // 重置或创建新记录
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + window,
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export function getRateLimitHeaders(identifier: string) {
  const record = requestCounts.get(identifier);
  if (!record) {
    return {
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': '10',
      'X-RateLimit-Reset': (Date.now() + 10000).toString(),
    };
  }

  return {
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': Math.max(0, 10 - record.count).toString(),
    'X-RateLimit-Reset': record.resetTime.toString(),
  };
}
```

### 2. 性能优化（2天）

#### 2.1 实现JSONB压缩 ⭐⭐⭐
修改保存逻辑，自动压缩大型JSONB字段：

```typescript
// src/storage/database/healthDataManager.ts
import { compressData, decompressData } from '@/lib/compressionUtils';

// 在保存requirements时压缩
export async function saveRequirements(
  userId: string,
  data: {
    badHabitsChecklist?: number[];
    symptoms300Checklist?: number[];
    [key: string]: any;
  }
) {
  const compressedData: any = {};

  // 压缩大型数组
  if (data.badHabitsChecklist && data.badHabitsChecklist.length > 50) {
    compressedData.badHabitsChecklist = compressData(data.badHabitsChecklist);
  } else {
    compressedData.badHabitsChecklist = data.badHabitsChecklist;
  }

  if (data.symptoms300Checklist && data.symptoms300Checklist.length > 50) {
    compressedData.symptoms300Checklist = compressData(data.symptoms300Checklist);
  } else {
    compressedData.symptoms300Checklist = data.symptoms300Checklist;
  }

  // 保存到数据库
  // ...
}

// 在读取时解压
export async function getRequirements(userId: string) {
  const result = await db.query.requirements.findFirst({
    where: eq(requirements.userId, userId),
  });

  if (!result) return null;

  // 解压数据
  if (result.badHabitsChecklist) {
    result.badHabitsChecklist = decompressData(result.badHabitsChecklist);
  }

  if (result.symptoms300Checklist) {
    result.symptoms300Checklist = decompressData(result.symptoms300Checklist);
  }

  return result;
}
```

#### 2.2 配置数据库连接池 ⭐⭐
```typescript
// src/storage/database/index.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // 最大连接数
  min: 5,  // 最小连接数
  idleTimeoutMillis: 30000, // 空闲连接超时30秒
  connectionTimeoutMillis: 2000, // 连接超时2秒
});

// 监听连接事件
pool.on('error', (err) => {
  console.error('数据库连接池错误:', err);
});

export { pool };
```

### 3. 代码质量提升（2天）

#### 3.1 统一错误处理 ⭐⭐⭐
```bash
touch src/lib/error-handler.ts
```

```typescript
// src/lib/error-handler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} (ID: ${id}) 不存在` : `${resource} 不存在`,
      404,
      'NOT_FOUND'
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export function handleApiError(error: unknown): {
  error: string;
  code?: string;
  details?: any;
  statusCode: number;
} {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      statusCode: 500,
    };
  }

  return {
    error: '服务器错误',
    statusCode: 500,
  };
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<{ data?: T; error?: ReturnType<typeof handleApiError> }> {
  try {
    const data = await handler();
    return { data };
  } catch (error) {
    return { error: handleApiError(error) };
  }
}
```

使用示例：
```typescript
// src/app/api/admin/users/[userId]/route.ts
import { withErrorHandling, NotFoundError } from '@/lib/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const result = await withErrorHandling(async () => {
    const user = await healthDataManager.getUserById(params.userId);

    if (!user) {
      throw new NotFoundError('用户', params.userId);
    }

    return user;
  });

  if (result.error) {
    return NextResponse.json(
      result.error,
      { status: result.error.statusCode }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}
```

#### 3.2 添加常量定义 ⭐
```bash
touch src/lib/constants.ts
```

```typescript
// src/lib/constants.ts

// 文件大小
export const FILE_SIZE = {
  MAX_UPLOAD: 10 * 1024 * 1024, // 10MB
  MAX_AVATAR: 2 * 1024 * 1024, // 2MB
} as const;

// 时间
export const TIME = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30分钟
  CACHE_TTL: 5 * 60 * 1000, // 5分钟
  ARCHIVE_THRESHOLD: 365 * 24 * 60 * 60 * 1000, // 1年
} as const;

// 分页
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 30, 50, 100],
} as const;

// 健康评分
export const HEALTH_SCORE = {
  MIN: 0,
  MAX: 10,
  EXCELLENT: 8,
  GOOD: 6,
  FAIR: 4,
} as const;

// 状态
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
  ARCHIVED: 'archived',
} as const;
```

---

## 📅 短期改进（1个月内）

### 4. 添加单元测试
```bash
# 安装测试依赖
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
```

```bash
# 创建测试文件
mkdir -p tests/lib
touch tests/lib/compressionUtils.test.ts
```

```typescript
// tests/lib/compressionUtils.test.ts
import { describe, it, expect } from 'vitest';
import { compressData, decompressData } from '@/lib/compressionUtils';

describe('compressionUtils', () => {
  it('should compress and decompress data correctly', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const compressed = compressData(data);
    const decompressed = decompressData(compressed);

    expect(decompressed).toEqual(data);
  });

  it('should reduce data size', () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => i);
    const compressed = compressData(largeData);

    expect(compressed.length).toBeLessThan(JSON.stringify(largeData).length);
  });
});
```

### 5. 实现虚拟滚动
```bash
pnpm add @tanstack/react-virtual
```

```typescript
// 优化300症状表显示
import { useVirtualizer } from '@tanstack/react-virtual';

function SymptomsList({ symptoms }: { symptoms: Symptom[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: symptoms.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // 每行高度50px
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <SymptomItem symptom={symptoms[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. 实现数据自动保存
```typescript
// 使用localStorage自动保存
export function useAutoSave<T>(
  key: string,
  data: T,
  interval: number = 5000 // 5秒自动保存
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(key, JSON.stringify({
        data,
        savedAt: new Date().toISOString(),
      }));
      setLastSaved(new Date());
    }, interval);

    return () => clearInterval(timer);
  }, [data, key, interval]);

  const loadSavedData = useCallback(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.data as T;
      } catch (error) {
        return null;
      }
    }
    return null;
  }, [key]);

  return { lastSaved, loadSavedData };
}
```

---

## 🎯 中期改进（3个月内）

### 7. 实现缓存机制
```bash
pnpm add @upstash/redis
```

```typescript
// src/lib/cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function get<T>(key: string): Promise<T | null> {
  const data = await redis.get<string>(key);
  return data ? JSON.parse(data) : null;
}

export async function set<T>(
  key: string,
  value: T,
  ttl: number = 300 // 默认5分钟
): Promise<void> {
  await redis.set(key, JSON.stringify(value), { ex: ttl });
}

export async function del(key: string): Promise<void> {
  await redis.del(key);
}

export async function invalidatePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### 8. 添加数据导出功能
```typescript
// src/lib/export.ts
import { Parser } from 'json2csv';

export async function exportToCSV<T>(data: T[], filename: string) {
  const parser = new Parser();
  const csv = parser.parse(data);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function exportToJSON<T>(data: T[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
```

### 9. 添加统计报表
```typescript
// 创建统计API
// src/app/api/admin/stats/route.ts
export async function GET() {
  const stats = {
    users: await getUserStats(),
    health: await getHealthStats(),
    requirements: await getRequirementsStats(),
    activity: await getActivityStats(),
  };

  return NextResponse.json({ success: true, data: stats });
}
```

---

## ✅ 检查清单

### 本周完成
- [ ] 创建身份验证中间件
- [ ] 实现会话管理
- [ ] 添加速率限制
- [ ] 实现JSONB压缩
- [ ] 配置数据库连接池
- [ ] 统一错误处理
- [ ] 添加常量定义

### 本月完成
- [ ] 添加单元测试
- [ ] 实现虚拟滚动
- [ ] 实现数据自动保存
- [ ] 优化移动端体验
- [ ] 完善健康检查
- [ ] 添加告警机制

### 3个月内完成
- [ ] 实现缓存机制
- [ ] 添加数据导出功能
- [ ] 添加统计报表
- [ ] 实现数据归档策略
- [ ] 优化数据库分区

---

## 📞 支持

如果在实施过程中遇到问题，请参考以下文档：
- 系统检查报告：`SYSTEM_COMPREHENSIVE_REVIEW.md`
- 数据库优化文档：`DATABASE_OPTIMIZATION_SUMMARY.md`
- 自动维护文档：`AUTO_MAINTENANCE_GUIDE.md`
- 数据安全文档：`DATA_SAFETY_PROTECTION.md`

---

**开始行动！加油！💪**
