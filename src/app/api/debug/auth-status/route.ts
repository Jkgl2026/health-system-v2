import { NextRequest, NextResponse } from 'next/server';

// GET /api/debug/auth-status - 检查认证状态
export async function GET(request: NextRequest) {
  const cookies = request.cookies;
  
  const accessToken = cookies.get('admin_access_token')?.value;
  const refreshToken = cookies.get('admin_refresh_token')?.value;
  
  // 检查 localStorage 标记（无法直接访问，只返回 cookie 信息）
  
  return NextResponse.json({
    success: true,
    cookies: {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenPreview: accessToken ? accessToken.substring(0, 50) + '...' : null,
    },
    headers: {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
    },
    nodeEnv: process.env.NODE_ENV,
  });
}
