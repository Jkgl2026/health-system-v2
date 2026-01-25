import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// JWT配置
// 使用固定的密钥以确保开发环境中的稳定性
const JWT_SECRET = process.env.JWT_SECRET || 'health-admin-jwt-secret-key-2024-please-change-in-production';
const JWT_EXPIRES_IN = '24h'; // token有效期24小时
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 刷新token有效期7天

// 管理员会话信息接口
export interface AdminSession {
  adminId: string;
  username: string;
  loginTime: number;
  ip?: string;
  userAgent?: string;
}

// Token响应接口
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  admin: {
    id: string;
    username: string;
    createdAt: Date;
  };
}

/**
 * 会话管理器类
 */
export class SessionManager {
  /**
   * 生成访问token
   */
  static generateAccessToken(session: AdminSession): string {
    return jwt.sign(
      {
        adminId: session.adminId,
        username: session.username,
        type: 'access',
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * 生成刷新token
   */
  static generateRefreshToken(session: AdminSession): string {
    return jwt.sign(
      {
        adminId: session.adminId,
        username: session.username,
        type: 'refresh',
      },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );
  }

  /**
   * 验证访问token
   */
  static verifyAccessToken(token: string): AdminSession | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.type !== 'access') {
        return null;
      }

      return {
        adminId: decoded.adminId,
        username: decoded.username,
        loginTime: decoded.iat * 1000,
      };
    } catch (error) {
      console.error('[SessionManager] 验证访问token失败:', error);
      return null;
    }
  }

  /**
   * 验证刷新token
   */
  static verifyRefreshToken(token: string): AdminSession | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.type !== 'refresh') {
        return null;
      }

      return {
        adminId: decoded.adminId,
        username: decoded.username,
        loginTime: decoded.iat * 1000,
      };
    } catch (error) {
      console.error('[SessionManager] 验证刷新token失败:', error);
      return null;
    }
  }

  /**
   * 创建token对
   */
  static createTokenPair(
    adminId: string,
    username: string,
    ip?: string,
    userAgent?: string
  ): TokenResponse {
    const session: AdminSession = {
      adminId,
      username,
      loginTime: Date.now(),
      ip,
      userAgent,
    };

    const accessToken = this.generateAccessToken(session);
    const refreshToken = this.generateRefreshToken(session);

    // 解析token获取过期时间（秒）
    const decoded = jwt.decode(accessToken) as any;
    const expiresIn = decoded.exp - decoded.iat;

    return {
      accessToken,
      refreshToken,
      expiresIn,
      admin: {
        id: adminId,
        username,
        createdAt: new Date(session.loginTime),
      },
    };
  }

  /**
   * 设置认证cookie
   */
  static async setAuthCookies(response: any, tokenResponse: TokenResponse) {
    const cookieStore = await cookies();
    
    // 设置访问token
    cookieStore.set('admin_access_token', tokenResponse.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24小时
      path: '/',
    });

    // 设置刷新token
    cookieStore.set('admin_refresh_token', tokenResponse.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/',
    });
  }

  /**
   * 清除认证cookie
   */
  static async clearAuthCookies() {
    const cookieStore = await cookies();
    
    cookieStore.delete('admin_access_token');
    cookieStore.delete('admin_refresh_token');
  }

  /**
   * 从请求中获取访问token
   */
  static async getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_access_token')?.value || null;
  }

  /**
   * 从请求中获取刷新token
   */
  static async getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('admin_refresh_token')?.value || null;
  }

  /**
   * 验证当前会话
   */
  static async validateSession(): Promise<AdminSession | null> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    return this.verifyAccessToken(accessToken);
  }

  /**
   * 刷新token
   */
  static async refreshToken(): Promise<TokenResponse | null> {
    const refreshToken = await this.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    const session = this.verifyRefreshToken(refreshToken);
    
    if (!session) {
      return null;
    }

    // 生成新的token对
    return this.createTokenPair(
      session.adminId,
      session.username,
      session.ip,
      session.userAgent
    );
  }

  /**
   * 检查token是否即将过期（剩余时间小于1小时）
   */
  static async isTokenExpiringSoon(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      return true;
    }

    try {
      const decoded = jwt.decode(accessToken) as any;
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      return expiresIn < 3600; // 小于1小时
    } catch (error) {
      return true;
    }
  }
}

export default SessionManager;
