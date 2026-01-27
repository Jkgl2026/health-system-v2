#!/usr/bin/env node

/**
 * 七问答案诊断工具
 * 对比正常用户和其他用户的七问答案数据结构
 */

const { Client } = require('pg');
const fs = require('fs');

async function diagnose() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/health_check'
  });

  try {
    await client.connect();
    console.log('✅ 已连接到数据库\n');

    const normalUserId = '92564c96-fac9-4585-8ebb-1baf4f7146aa';

    // 1. 查询正常用户的七问答案
    console.log('📌 查询正常用户的七问答案...');
    console.log(`用户ID: ${normalUserId}\n`);

    const normalResult = await client.query(
      `SELECT u.id, u.name, u.phone, r.seven_questions_answers, r.updated_at
       FROM users u
       LEFT JOIN requirements r ON u.id = r.user_id
       WHERE u.id = $1`,
      [normalUserId]
    );

    console.log('正常用户数据:');
    if (normalResult.rows.length > 0) {
      const userData = normalResult.rows[0];
      console.log('  姓名:', userData.name);
      console.log('  手机:', userData.phone);
      console.log('  更新时间:', userData.updated_at);
      console.log('  七问答案数据类型:', typeof userData.seven_questions_answers);
      console.log('  七问答案是否为null:', userData.seven_questions_answers === null);

      if (userData.seven_questions_answers !== null) {
        console.log('  七问答案键数量:', Object.keys(userData.seven_questions_answers).length);
        console.log('  七问答案的键:', Object.keys(userData.seven_questions_answers));
        console.log('\n  完整数据结构:');
        console.log(JSON.stringify(userData.seven_questions_answers, null, 2));
      }
    } else {
      console.log('  ❌ 未找到该用户');
    }

    // 2. 查询其他用户的七问答案（随机取几个）
    console.log('\n\n📌 查询其他用户的七问答案（随机取5个）...\n');

    const otherUsersResult = await client.query(
      `SELECT u.id, u.name, u.phone, r.seven_questions_answers, r.updated_at
       FROM users u
       LEFT JOIN requirements r ON u.id = r.user_id
       WHERE u.id != $1
         AND r.seven_questions_answers IS NOT NULL
       ORDER BY RANDOM()
       LIMIT 5`,
      [normalUserId]
    );

    console.log(`找到 ${otherUsersResult.rows.length} 个其他用户\n`);

    otherUsersResult.rows.forEach((user, idx) => {
      console.log(`\n--- 用户 ${idx + 1} ---`);
      console.log('  ID:', user.id);
      console.log('  姓名:', user.name);
      console.log('  手机:', user.phone);
      console.log('  更新时间:', user.updated_at);
      console.log('  七问答案数据类型:', typeof user.seven_questions_answers);
      console.log('  七问答案是否为null:', user.seven_questions_answers === null);

      if (user.seven_questions_answers !== null) {
        console.log('  七问答案键数量:', Object.keys(user.seven_questions_answers).length);
        console.log('  七问答案的键:', Object.keys(user.seven_questions_answers));
        console.log('\n  完整数据结构:');
        console.log(JSON.stringify(user.seven_questions_answers, null, 2));
      }
    });

    // 3. 统计七问答案为null的用户数量
    console.log('\n\n📊 统计信息...\n');

    const statsResult = await client.query(
      `SELECT
         COUNT(*) as total_users,
         COUNT(r.seven_questions_answers) as users_with_answers,
         COUNT(*) - COUNT(r.seven_questions_answers) as users_without_answers
       FROM users u
       LEFT JOIN requirements r ON u.id = r.user_id
       WHERE u.deleted_at IS NULL`
    );

    const stats = statsResult.rows[0];
    console.log('  总用户数:', stats.total_users);
    console.log('  有七问答案的用户数:', stats.users_with_answers);
    console.log('  无七问答案的用户数:', stats.users_without_answers);
    console.log('  有答案占比:', ((stats.users_with_answers / stats.total_users) * 100).toFixed(2) + '%');

    // 4. 查询七问答案数据结构的分布
    console.log('\n\n📊 七问答案数据结构分布...\n');

    const structureResult = await client.query(
      `SELECT
         CASE
           WHEN r.seven_questions_answers IS NULL THEN 'null'
           WHEN jsonb_typeof(r.seven_questions_answers) = 'object' THEN 'object (键值对)'
           WHEN jsonb_typeof(r.seven_questions_answers) = 'array' THEN 'array (数组)'
           ELSE jsonb_typeof(r.seven_questions_answers)
         END as data_type,
         COUNT(*) as count
       FROM users u
       LEFT JOIN requirements r ON u.id = r.user_id
       WHERE u.deleted_at IS NULL
       GROUP BY data_type
       ORDER BY count DESC`
    );

    structureResult.rows.forEach(row => {
      console.log(`  ${row.data_type}: ${row.count} 用户`);
    });

  } catch (error) {
    console.error('❌ 诊断失败:', error);
  } finally {
    await client.end();
    console.log('\n✅ 诊断完成');
  }
}

diagnose();
