// Supabase Edge Function - 保存健康记录
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

    const { userId, healthData } = await req.json()

    if (!userId || !healthData) {
      return new Response(
        JSON.stringify({ error: 'User ID and health data are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 创建或更新用户信息
    const { error: userError } = await supabaseClient
      .from('users')
      .upsert({
        id: userId,
        name: healthData.name,
        age: healthData.age,
        gender: healthData.gender,
        phone: healthData.phone,
        email: healthData.email,
      }, { onConflict: 'id' })

    if (userError) {
      throw userError
    }

    // 保存健康记录
    const { error: recordError } = await supabaseClient
      .from('health_records')
      .insert({
        user_id: userId,
        qi_status: healthData.qiStatus,
        circulation_status: healthData.circulationStatus,
        toxin_status: healthData.toxinStatus,
        lipid_status: healthData.lipidStatus,
        immune_status: healthData.immuneStatus,
        body_language: healthData.bodyLanguage,
        health_elements: healthData.healthElements,
        management_plan: healthData.managementPlan,
      })

    if (recordError) {
      throw recordError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Health record saved successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Save health record error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
