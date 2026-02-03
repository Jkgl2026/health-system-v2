/**
 * JWT（JSON Web Token）工具类
 * 
 * 功能：
 * - 生成JWT Token（登录成功后）
 * - 校验JWT Token（中间件、API鉴权）
 * - 解析Token获取用户信息
 * 
 * 使用方式：
 * import { generateToken, verifyToken, decodeToken } from '@/app/lib/jwt';
 * 
 * // 生成Token
 * const token = generateToken({ userId: 1, username: 'admin' });
 * 
 * // 校验Token
 * const decoded = verifyToken(token);
 * 
 * // 解析Token（不校验）
 * const payload = decodeToken(token);
 */

import jwt from 'jsonwebtoken';

// JWT配置（从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 默认7天过期

/**
 * Token载荷接口
 */
export interface JWTPayload {
  userId: string | number;
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * 生成JWT Token
 * 
 * @param payload - Token载荷数据
 * @param expiresIn - 过期时间（可选，默认7天）
 * @returns JWT Token字符串
 * 
 * @example
 * // 登录成功后生成Token
 * const token = generateToken({ userId: 1, username: 'admin' });
 * // 返回给前端存储在localStorage
 * 
 * // 自定义过期时间
 * const token = generateToken({ userId: 1, username: 'admin' }, '30d');
 */
export function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresIn?: string
): string {
  try {
    const secret: string = JWT_SECRET;
    const options = { expiresIn: expiresIn || JWT_EXPIRES_IN };
    // @ts-ignore - jsonwebtoken type definitions have issues with expiresIn type
    const token = jwt.sign(payload, secret, options);
    
    console.log('[JWT] Token已生成', {
      userId: payload.userId,
      username: payload.username,
      expiresIn: expiresIn || JWT_EXPIRES_IN,
    });
    
    return token;
  } catch (error) {
    console.error('[JWT] 生成Token失败', error);
    throw new Error('生成Token失败：' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * 校验JWT Token
 * 
 * @param token - JWT Token字符串
 * @returns Token载荷数据（校验成功）
 * @throws Token无效或过期
 * 
 * @example
 * // 中间件校验Token
 * try {
 *   const decoded = verifyToken(token);
 *   console.log('用户ID:', decoded.userId);
 * } catch (error) {
 *   console.error('Token无效:', error.message);
 * }
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    console.log('[JWT] Token校验成功', {
      userId: decoded.userId,
      username: decoded.username,
    });
    
    return decoded;
  } catch (error) {
    console.error('[JWT] Token校验失败', {
      error: error instanceof Error ? error.message : String(error),
      tokenLength: token.length,
    });
    
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token已过期，请重新登录');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token无效，请重新登录');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token尚未生效');
    } else {
      throw new Error('Token校验失败：' + (error instanceof Error ? error.message : String(error)));
    }
  }
}

/**
 * 解析JWT Token（不校验有效性）
 * 
 * @param token - JWT Token字符串
 * @returns Token载荷数据
 * 
 * @example
 * // 解析Token获取用户信息（不校验有效性）
 * const payload = decodeToken(token);
 * console.log('用户ID:', payload.userId);
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('[JWT] 解析Token失败', error);
    return null;
  }
}

/**
 * 从Authorization请求头中提取Token
 * 
 * @param authHeader - Authorization请求头（Bearer <token>）
 * @returns Token字符串
 * 
 * @example
 * // 从请求中获取Token
 * const token = extractTokenFromHeader(request.headers.get('authorization'));
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  
  return null;
}

/**
 * 验证Token是否即将过期（剩余时间小于1小时）
 * 
 * @param token - JWT Token字符串
 * @returns 是否即将过期
 * 
 * @example
 * if (isTokenExpiringSoon(token)) {
 *   console.log('Token即将过期，建议刷新');
 * }
 */
export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const remaining = decoded.exp - now;
    
    // 剩余时间小于1小时（3600秒）
    return remaining < 3600;
  } catch (error) {
    return true;
  }
}

/**
 * 获取Token剩余有效时间（秒）
 * 
 * @param token - JWT Token字符串
 * @returns 剩余秒数，-1表示无效
 */
export function getTokenRemainingTime(token: string): number {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return -1;
    }
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - now);
  } catch (error) {
    return -1;
  }
}

// 导出jwt模块（用于特殊场景）
export { jwt };

// 默认导出verifyToken（最常用）
export default verifyToken;
