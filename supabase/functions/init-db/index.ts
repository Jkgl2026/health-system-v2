// Supabase Edge Function - 初始化数据库
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // 获取 API Key
    const url = new URL(req.url)
    const key = url.searchParams.get('key')

    if (key !== 'init-health-system-2025') {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 创建用户表
    await supabaseClient.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          age INTEGER,
          gender VARCHAR(50),
          phone VARCHAR(20),
          email VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    // 创建健康记录表
    await supabaseClient.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS health_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          qi_status VARCHAR(50),
          circulation_status VARCHAR(50),
          toxin_status VARCHAR(50),
          lipid_status VARCHAR(50),
          immune_status VARCHAR(50),
          body_language TEXT[],
          health_elements TEXT[],
          management_plan TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    // 创建管理员表
    await supabaseClient.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admins (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    })

    // 创建默认管理员账号（密码：admin123）
    // 使用 SHA-256 哈希（简化版本）
    const encoder = new TextEncoder()
    const data = encoder.encode('admin123')
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { error: insertError } = await supabaseClient
      .from('admins')
      .upsert({
        username: 'admin',
        password: hashHex,
        role: 'admin',
      }, { onConflict: 'username' })

    if (insertError && !insertError.message.includes('duplicate')) {
      throw insertError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database initialized successfully',
        tables: ['users', 'health_records', 'admins'],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Init DB error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
