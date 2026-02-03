#!/usr/bin/env node

import pg from 'pg';
const { Client } = pg;

async function testConnection() {
  const connectionString = 'postgresql://postgres:rTrWXqwle5phUGY4@db.rtccwmuryojxgxyuktjk.supabase.co:5432/postgres?sslmode=require&connect_timeout=10';

  const client = new Client({
    connectionString
  });

  try {
    console.log('正在连接 Supabase 数据库...');
    await client.connect();
    console.log('✅ 连接成功！');

    const result = await client.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`✅ 查询成功！用户数量: ${result.rows[0].user_count}`);

    await client.end();
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    await client.end();
    process.exit(1);
  }
}

testConnection();
