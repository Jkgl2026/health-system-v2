/**
 * Supabase Edge Functions - 管理员登出
 * 
 * 功能：
 * - 清除Cookie中的Token
 * - 返回登出成功响应
 * 
 * 路径：/api/admin/logout
 * 
 * 部署后访问地址：
 * https://rtccwmuryojxgxyuktjk.supabase.co/functions/v1/admin-logout
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
        JSON.stringify({ success: false, error: '请使用POST方式' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[登出] 用户登出');

    // 创建响应，清除Cookie
    const response = new Response(
      JSON.stringify({ success: true, message: '已退出登录' }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          // 清除Cookie
          'Set-Cookie': 'admin_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
        },
      }
    );

    return response;

  } catch (error) {
    console.error('[登出] 服务器错误', error);
    
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