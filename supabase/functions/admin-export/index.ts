// Supabase Edge Function - 数据导出
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'json'
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    // 获取所有用户和记录
    let query = supabaseClient
      .from('health_records')
      .select(`
        *,
        users (
          id,
          name,
          age,
          gender,
          phone,
          email
        )
      `)
      .order('created_at', { ascending: false })

    // 日期过滤
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: records, error } = await query

    if (error) {
      throw error
    }

    // 根据格式导出
    if (format === 'csv') {
      const csv = convertToCSV(records)
      return new Response(csv, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="health-records.csv"',
        },
      })
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          data: records,
          total: records.length,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Export error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function convertToCSV(records) {
  if (records.length === 0) {
    return 'ID,用户名,年龄,性别,电话,邮箱,气血状态,循环状态,毒素状态,血脂状态,免疫状态,身体语言,健康要素,管理方案,创建时间\n'
  }

  const headers = [
    'ID',
    '用户名',
    '年龄',
    '性别',
    '电话',
    '邮箱',
    '气血状态',
    '循环状态',
    '毒素状态',
    '血脂状态',
    '免疫状态',
    '身体语言',
    '健康要素',
    '管理方案',
    '创建时间'
  ]

  const rows = records.map(record => [
    record.id,
    record.users?.name || '',
    record.users?.age || '',
    record.users?.gender || '',
    record.users?.phone || '',
    record.users?.email || '',
    record.qi_status || '',
    record.circulation_status || '',
    record.toxin_status || '',
    record.lipid_status || '',
    record.immune_status || '',
    record.body_language ? record.body_language.join('; ') : '',
    record.health_elements ? record.health_elements.join('; ') : '',
    record.management_plan || '',
    record.created_at
  ])

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
}
