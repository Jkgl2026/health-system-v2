/**
 * Supabase Edge Functions - 验证登录状态
 * 
 * 功能：
 * - 验证Cookie中的JWT Token
 * - 返回当前登录用户信息
 * 
 * 路径：/api/admin/auth
 * 
 * 部署后访问地址：
 * https://rtccwmuryojxgxyuktjk.supabase.co/functions/v1/admin-auth
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 仅允许 GET 请求
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ success: false, error: '请使用GET方式' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取Cookie中的Token
    const cookieHeader = req.headers.get('Cookie');
    let token = null;

    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const adminTokenCookie = cookies.find(c => c.startsWith('admin_token='));
      if (adminTokenCookie) {
        token = adminTokenCookie.substring('admin_token='.length);
      }
    }

    if (!token) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '未登录',
          authenticated: false 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 验证Token
    const jwtSecret = Deno.env.get('JWT_SECRET')!;
    const decoded = await verifyJWT(token, jwtSecret);

    if (!decoded) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '登录已过期，请重新登录',
          authenticated: false 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查Token是否过期
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: '登录已过期，请重新登录',
          authenticated: false 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 返回用户信息
    return new Response(
      JSON.stringify({
        success: true,
        authenticated: true,
        user: {
          id: decoded.userId,
          username: decoded.username,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[验证] 服务器错误', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: '服务器错误，请稍后再试',
        authenticated: false,
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * 验证JWT Token
 */
async function verifyJWT(token: string, secret: string): Promise<any> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // 验证签名
    const expectedSignature = await hmacSha256(`${headerB64}.${payloadB64}`, secret);
    const actualSignature = atob(signatureB64);

    if (expectedSignature !== actualSignature) {
      return null;
    }

    // 解析payload
    const payload = JSON.parse(atob(payloadB64));
    return payload;

  } catch (error) {
    console.error('[验证] Token解析失败', error);
    return null;
  }
}

/**
 * HMAC SHA256 签名
 */
async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  
  // 转换为十六进制字符串
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}