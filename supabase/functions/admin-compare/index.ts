// Supabase Edge Function - 数据对比
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

    const { recordIds } = await req.json()

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Record IDs are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 获取指定记录
    const { data: records, error } = await supabaseClient
      .from('health_records')
      .select(`
        *,
        users (
          id,
          name
        )
      `)
      .in('id', recordIds)

    if (error) {
      throw error
    }

    // 生成对比报告
    const comparison = {
      records: records,
      summary: {
        qiTrend: analyzeTrend(records, 'qi_status'),
        circulationTrend: analyzeTrend(records, 'circulation_status'),
        toxinTrend: analyzeTrend(records, 'toxin_status'),
        lipidTrend: analyzeTrend(records, 'lipid_status'),
        immuneTrend: analyzeTrend(records, 'immune_status'),
      },
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: comparison,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Compare error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function analyzeTrend(records, field) {
  const values = records.map(r => r[field]).filter(Boolean)

  if (values.length === 0) {
    return { trend: '无数据', values: [] }
  }

  // 简单的趋势分析
  const first = values[0]
  const last = values[values.length - 1]

  let trend = '稳定'
  if (last !== first) {
    trend = last === '正常' ? '改善' : '下降'
  }

  return { trend, values }
}
