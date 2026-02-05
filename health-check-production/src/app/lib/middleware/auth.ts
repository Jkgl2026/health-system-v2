/**
 * JWT鉴权中间件
 * 
 * 功能：
 * - 校验/api/admin/*接口的Token
 * - 未登录返回401状态码
 * - 将用户信息注入到请求对象中
 * 
 * 使用方式：
 * import { authMiddleware } from '@/app/lib/middleware/auth';
 * 
 * // 在API路由中使用
 * import { NextRequest, NextResponse } from 'next/server';
 * 
 * export async function GET(request: NextRequest) {
 *   // 校验Token
 *   const user = await authMiddleware(request);
 *   if (!user) {
 *     return NextResponse.json({ success: false, error: '未登录' }, { status: 401 });
 *   }
 *   
 *   // 已登录，继续处理业务逻辑
 *   console.log('当前用户:', user);
 *   return NextResponse.json({ success: true, data: { userId: user.userId } });
 * }
 */

import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '@/app/lib/jwt';

/**
 * 认证结果接口
 */
export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
}

/**
 * JWT鉴权中间件
 * 
 * @param request - Next.js请求对象
 * @returns 用户信息（鉴权成功）或null（鉴权失败）
 * 
 * @example
 * // 在API路由中使用
 * export async function POST(request: NextRequest) {
 *   const user = await authMiddleware(request);
 *   
 *   if (!user) {
 *     return NextResponse.json(
 *       { success: false, error: '请先登录' },
 *       { status: 401 }
 *     );
 *   }
 *   
 *   // 已登录，继续处理
 *   console.log('当前用户ID:', user.userId);
 *   // ... 业务逻辑
 * }
 */
export async function authMiddleware(
  request: NextRequest
): Promise<JWTPayload | null> {
  try {
    // 1. 从请求头中提取Token
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      console.log('[鉴权中间件] 未提供Token');
      return null;
    }
    
    // 2. 校验Token有效性
    const user = verifyToken(token);
    
    console.log('[鉴权中间件] Token校验成功', {
      userId: user.userId,
      username: user.username,
      path: request.nextUrl.pathname,
    });
    
    // 3. 返回用户信息
    return user;
  } catch (error) {
    console.error('[鉴权中间件] Token校验失败', {
      error: error instanceof Error ? error.message : String(error),
      path: request.nextUrl.pathname,
    });
    
    return null;
  }
}

/**
 * 返回401未授权响应
 * 
 * @param message - 错误信息
 * @returns NextResponse对象
 * 
 * @example
 * const user = await authMiddleware(request);
 * if (!user) {
 *   return unauthorizedResponse('请先登录');
 * }
 */
export function unauthorizedResponse(message: string = '未登录，请先登录') {
  return Response.json(
    { 
      success: false, 
      error: message,
      code: 'UNAUTHORIZED'
    },
    { status: 401 }
  );
}

/**
 * 返回403禁止访问响应
 * 
 * @param message - 错误信息
 * @returns NextResponse对象
 * 
 * @example
 * if (user.username !== 'admin') {
 *   return forbiddenResponse('权限不足');
 * }
 */
export function forbiddenResponse(message: string = '权限不足') {
  return Response.json(
    { 
      success: false, 
      error: message,
      code: 'FORBIDDEN'
    },
    { status: 403 }
  );
}

/**
 * 检查用户是否有管理员权限
 * 
 * @param username - 用户名
 * @returns 是否为管理员
 * 
 * @example
 * const user = await authMiddleware(request);
 * if (!isAdmin(user.username)) {
 *   return forbiddenResponse('需要管理员权限');
 * }
 */
export function isAdmin(username: string): boolean {
  return username === 'admin';
}

/**
 * 可选鉴权中间件（不强制登录，但提供用户信息）
 * 
 * @param request - Next.js请求对象
 * @returns 用户信息（已登录）或null（未登录）
 * 
 * @example
 * // 可选登录的接口
 * export async function GET(request: NextRequest) {
 *   const user = await optionalAuthMiddleware(request);
 *   
 *   // 如果未登录，返回公开数据
 *   if (!user) {
 *     return NextResponse.json({ success: true, data: publicData });
 *   }
 *   
 *   // 如果已登录，返回私人数据
 *   return NextResponse.json({ success: true, data: privateData });
 * }
 */
export async function optionalAuthMiddleware(
  request: NextRequest
): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return null;
    }
    
    const user = verifyToken(token);
    return user;
  } catch (error) {
    // 可选鉴权失败不报错，返回null
    return null;
  }
}

// 默认导出authMiddleware
export default authMiddleware;
