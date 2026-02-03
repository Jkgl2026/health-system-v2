/**
 * 管理员登录接口
 * 
 * 功能：
 * - 接收账号密码，验证身份
 * - 生成JWT Token返回给前端
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
 *     "id": 1,
 *     "username": "admin",
 *     "fullName": "系统管理员"
 *   }
 * }
 * 
 * 失败：
 * {
 *   "success": false,
 *   "error": "账号或密码错误"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeSQL } from '@/app/lib/db';
import { generateToken } from '@/app/lib/jwt';
import bcrypt from 'bcryptjs';

/**
 * 管理员数据接口
 */
interface Admin {
  id: number;
  username: string;
  password_hash: string;
  full_name: string | null;
  status: string;
  failed_login_attempts: number;
  locked_until: Date | null;
}

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

    // 3. 查询管理员账号
    const admins = await executeSQL<Admin>(
      'SELECT * FROM admins WHERE username = $1',
      [username.trim()]
    );

    if (admins.length === 0) {
      console.log('[登录] 账号不存在', { username });
      return NextResponse.json(
        { success: false, error: '账号或密码错误' },
        { status: 401 }
      );
    }

    const admin = admins[0];

    // 4. 检查账号状态
    if (admin.status !== 'active') {
      console.log('[登录] 账号已禁用', { username, status: admin.status });
      return NextResponse.json(
        { success: false, error: '账号已被禁用，请联系管理员' },
        { status: 403 }
      );
    }

    // 5. 检查账号是否被锁定
    if (admin.locked_until) {
      const lockedUntil = new Date(admin.locked_until);
      if (lockedUntil > new Date()) {
        console.log('[登录] 账号已锁定', { username, lockedUntil });
        return NextResponse.json(
          { 
            success: false, 
            error: '账号已被锁定，请稍后再试或联系管理员',
            lockedUntil: lockedUntil.getTime()
          },
          { status: 403 }
        );
      }
    }

    // 6. 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      console.log('[登录] 密码错误', { username });

      // 增加失败次数
      const newFailedAttempts = (admin.failed_login_attempts || 0) + 1;
      
      // 超过5次失败，锁定账号30分钟
      if (newFailedAttempts >= 5) {
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        
        await executeSQL(
          'UPDATE admins SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
          [newFailedAttempts, lockedUntil, admin.id]
        );
        
        console.log('[登录] 账号已锁定', { username, failedAttempts: newFailedAttempts });
        
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
      await executeSQL(
        'UPDATE admins SET failed_login_attempts = $1 WHERE id = $2',
        [newFailedAttempts, admin.id]
      );

      return NextResponse.json(
        { success: false, error: '账号或密码错误' },
        { status: 401 }
      );
    }

    // 7. 登录成功
    console.log('[登录] 登录成功', { username, userId: admin.id });

    // 8. 生成JWT Token
    const token = generateToken({
      userId: admin.id,
      username: admin.username,
    });

    // 9. 更新登录信息
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    await executeSQL(
      'UPDATE admins SET last_login_at = $1, last_login_ip = $2, failed_login_attempts = 0, locked_until = NULL WHERE id = $3',
      [new Date(), clientIp, admin.id]
    );

    // 10. 返回Token和用户信息
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
      },
    });

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
