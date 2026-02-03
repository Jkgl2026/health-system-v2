/**
 * Supabase Edge Functions - 管理员登录
 * 
 * 功能：
 * - 接收账号密码，验证身份
 * - 生成JWT Token
 * - 设置Cookie
 * 
 * 路径：/api/admin/login
 * 
 * 部署后访问地址：
 * https://rtccwmuryojxgxyuktjk.supabase.co/functions/v1/admin-login
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 仅允许 POST 请求
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: '请使用POST方式登录' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 解析请求体
    const { username, password } = await req.json();

    // 表单校验
    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, error: '账号和密码不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const usernameTrimmed = username.trim();

    // 创建 Supabase 客户端（使用新的环境变量名）
    const supabaseUrl = Deno.env.get('DATABASE_URL')!;
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 查询管理员账号
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', usernameTrimmed)
      .single();

    if (adminError || !adminData) {
      console.error('[登录] 账号不存在', { username: usernameTrimmed, error: adminError });
      return new Response(
        JSON.stringify({ success: false, error: '账号或密码错误' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查账号状态
    if (!adminData.is_active) {
      console.error('[登录] 账号已禁用', { username: usernameTrimmed });
      return new Response(
        JSON.stringify({ success: false, error: '账号已被禁用，请联系管理员' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, adminData.password);

    if (!isPasswordValid) {
      console.error('[登录] 密码错误', { username: usernameTrimmed });
      return new Response(
        JSON.stringify({ success: false, error: '账号或密码错误' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 登录成功
    console.log('[登录] 登录成功', { username: usernameTrimmed, userId: adminData.id });

    // 生成JWT Token
    const jwtSecret = Deno.env.get('JWT_SECRET')!;
    const token = await createJWT(adminData.id, adminData.username, jwtSecret);

    // 创建响应
    const response = new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: adminData.id,
          username: adminData.username,
          name: adminData.name,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          // 设置Cookie
          'Set-Cookie': `admin_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        },
      }
    );

    return response;

  } catch (error) {
    console.error('[登录] 服务器错误', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: '服务器错误，请稍后再试',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * 创建JWT Token
 */
async function createJWT(userId: string, username: string, secret: string): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    userId,
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7天过期
  };

  // 简化的 JWT 实现（生产环境建议使用专业库）
  const headerB64 = btoa(JSON.stringify(header));
  const payloadB64 = btoa(JSON.stringify(payload));
  
  const signature = await hmacSha256(`${headerB64}.${payloadB64}`, secret);
  const signatureB64 = btoa(signature);

  return `${headerB64}.${payloadB64}.${signatureB64}`;
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