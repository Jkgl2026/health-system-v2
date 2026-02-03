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

// 强制动态渲染，因为需要访问 request.cookies
export const dynamic = 'force-dynamic';
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
