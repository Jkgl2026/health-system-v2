#!/usr/bin/env node

/**
 * 从 Supabase 数据库导出数据
 */

const { Pool } = require('pg');

// Supabase 数据库连接
const supabaseDbUrl = 'postgresql://postgres:rTrWXqwle5phUGY4@db.rtccwmuryojxgxyuktjk.supabase.co:5432/postgres?sslmode=require';

async function exportSupabaseData() {
  const pool = new Pool({
    connectionString: supabaseDbUrl,
    // 强制使用 IPv4
    host: 'db.rtccwmuryojxgxyuktjk.supabase.co',
  });

  try {
    console.log('🔍 正在连接 Supabase 数据库...');

    // 检查表是否存在
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    const tablesResult = await pool.query(tablesQuery);
    console.log('\n📋 数据库中的表：');
    console.log(tablesResult.rows.map(row => `- ${row.table_name}`).join('\n'));

    // 导出所有表数据
    const tables = tablesResult.rows.map(row => row.table_name);
    const data = {};
    const statistics = {};

    for (const table of tables) {
      try {
        console.log(`\n📥 正在导出表 ${table}...`);
        const result = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
        data[table] = result.rows;
        statistics[table] = result.rows.length;
        console.log(`   ✅ ${table} 表有 ${result.rows.length} 条记录`);
      } catch (error) {
        console.error(`❌ 导出表 ${table} 失败:`, error.message);
        data[table] = [];
        statistics[table] = 0;
      }
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      statistics: statistics,
      totalUsers: statistics.users || 0,
      data: data
    };

    console.log('\n📊 导出统计：');
    console.log(`总用户数：${statistics.users || 0}`);
    console.log(`自检记录数：${statistics.symptom_checks || 0}`);
    console.log(`健康分析数：${statistics.health_analysis || 0}`);

    return exportData;

  } catch (error) {
    console.error('❌ 错误：', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// 执行导出
exportSupabaseData()
  .then(data => {
    console.log('\n✅ 数据导出成功！');
    console.log('数据结构：', Object.keys(data.data));
  })
  .catch(error => {
    console.error('\n❌ 导出失败：', error);
    process.exit(1);
  });
