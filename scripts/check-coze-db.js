#!/usr/bin/env node

/**
 * 检查 Coze 平台数据库中的数据
 */

const { Pool } = require('pg');

// Coze 平台数据库连接
const cozeDbUrl = 'postgresql://user_7598123630362804258:f533732b-385d-4af5-baba-acca942c5adc@cp-right-sunup-1d18c1f8.pg4.aidap-global.cn-beijing.volces.com:5432/Database_1769076935011?sslmode=require&channel_binding=require';

async function checkCozeDatabase() {
  const pool = new Pool({
    connectionString: cozeDbUrl,
  });

  try {
    console.log('🔍 正在连接 Coze 平台数据库...');

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

    // 检查 users 表
    if (tablesResult.rows.some(row => row.table_name === 'users')) {
      const usersCountQuery = 'SELECT COUNT(*) as count FROM users';
      const usersCountResult = await pool.query(usersCountQuery);

      console.log(`\n👥 users 表中有 ${usersCountResult.rows[0].count} 条记录`);

      if (parseInt(usersCountResult.rows[0].count) > 0) {
        const latestUsersQuery = `
          SELECT id, name, phone, created_at
          FROM users
          ORDER BY created_at DESC
          LIMIT 5;
        `;
        const latestUsersResult = await pool.query(latestUsersQuery);

        console.log('\n最新 5 个用户：');
        console.log(JSON.stringify(latestUsersResult.rows, null, 2));
      }
    } else {
      console.log('\n❌ users 表不存在，需要初始化数据库');
    }

    // 检查 admins 表
    if (tablesResult.rows.some(row => row.table_name === 'admins')) {
      const adminsCountQuery = 'SELECT COUNT(*) as count FROM admins';
      const adminsCountResult = await pool.query(adminsCountQuery);
      console.log(`\n🔐 admins 表中有 ${adminsCountResult.rows[0].count} 条记录`);
    }

  } catch (error) {
    console.error('❌ 错误：', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkCozeDatabase();
