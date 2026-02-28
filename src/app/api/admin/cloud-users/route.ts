import { NextRequest, NextResponse } from 'next/server';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';

// 微信云开发配置
const CLOUD_ENV_ID = process.env.WX_CLOUD_ENV_ID || '';
const CLOUD_FUNCTION_URL = `https://api.weixin.qq.com/tcb/invokecloudfunction`;

/**
 * 调用微信云函数获取用户列表
 */
async function callCloudFunction(action: string, data: any = {}) {
  const accessToken = await getAccessToken();
  
  const response = await fetch(
    `${CLOUD_FUNCTION_URL}?access_token=${accessToken}&env=${CLOUD_ENV_ID}&name=getHealthRecords`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, data })
    }
  );
  
  const result = await response.json();
  
  if (result.errcode && result.errcode !== 0) {
    throw new Error(result.errmsg || '云函数调用失败');
  }
  
  return JSON.parse(result.resp_data);
}

/**
 * 获取微信 access_token
 */
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  // 检查缓存
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }
  
  const appid = process.env.WX_APPID;
  const secret = process.env.WX_SECRET;
  
  if (!appid || !secret) {
    throw new Error('缺少微信配置：WX_APPID 或 WX_SECRET');
  }
  
  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
  );
  
  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(data.errmsg || '获取 access_token 失败');
  }
  
  // 缓存 token（提前5分钟过期）
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000
  };
  
  return data.access_token;
}

// GET /api/admin/cloud-users - 从微信云数据库获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 身份验证
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';

    // 尝试调用云函数
    try {
      const result = await callCloudFunction('getUserList', { page, limit, search });
      
      return NextResponse.json({
        success: true,
        data: result.data || [],
        pagination: result.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        source: 'cloud'
      });
    } catch (cloudError) {
      console.error('云函数调用失败:', cloudError);
      
      // 如果云函数调用失败，返回空数据并提示
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        source: 'local',
        message: '云数据库暂未配置，请查看小程序后台管理'
      });
    }
  } catch (error) {
    console.error('Error fetching cloud users:', error);
    return NextResponse.json(
      { error: '获取用户数据失败', message: (error as Error).message },
      { status: 500 }
    );
  }
}
