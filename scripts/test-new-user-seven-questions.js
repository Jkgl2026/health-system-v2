// 创建新用户并保存七问答案的测试脚本

const { Client } = require('pg');
const crypto = require('crypto');

async function testNewUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/health_check'
  });

  try {
    await client.connect();
    console.log('✅ 已连接到数据库\n');

    // 生成新的用户ID
    const newUserId = crypto.randomUUID();
    console.log(`📌 创建新用户测试`);
    console.log(`用户ID: ${newUserId}\n`);

    // 1. 创建新用户
    console.log('步骤1: 创建新用户...');
    const insertUserResult = await client.query(
      `INSERT INTO users (id, name, phone, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, name, phone`,
      [newUserId, '测试用户_新七问', '13800000888']
    );
    console.log('✅ 用户创建成功:', insertUserResult.rows[0]);

    // 2. 创建 requirements 记录（包含七问答案）
    console.log('\n步骤2: 创建 requirements 记录并保存七问答案...');

    const sevenQuestionsAnswers = {
      "1": {
        "answer": "最近一个月才开始出现症状，大概是每周一次",
        "date": new Date().toISOString()
      },
      "2": {
        "answer": "每次持续大概3-4小时，通常在下午开始",
        "date": new Date().toISOString()
      },
      "3": {
        "answer": "主要症状是头痛、眼睛干涩、有时候会恶心",
        "date": new Date().toISOString()
      },
      "4": {
        "answer": "之前试过按摩和休息，效果一般。最近开始尝试中药调理",
        "date": new Date().toISOString()
      },
      "5": {
        "answer": "大概从上个月开始，那时候刚换工作，压力比较大",
        "date": new Date().toISOString()
      },
      "6": {
        "answer": "周末休息的时候会好一些，特别是睡个好觉后",
        "date": new Date().toISOString()
      },
      "7": {
        "answer": "昨天下午开会的时候出现的，那时候空气不太好",
        "date": new Date().toISOString()
      }
    };

    const insertRequirementResult = await client.query(
      `INSERT INTO requirements
       (user_id, requirement1_completed, requirement2_completed, requirement3_completed, requirement4_completed,
        seven_questions_answers, updated_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW(), NOW())
       RETURNING id, user_id, seven_questions_answers, updated_at`,
      [newUserId, true, true, true, true, JSON.stringify(sevenQuestionsAnswers)]
    );
    console.log('✅ Requirements 创建成功');
    console.log('   七问答案数量:', Object.keys(sevenQuestionsAnswers).length);
    console.log('   更新时间:', insertRequirementResult.rows[0].updated_at);

    // 3. 验证数据是否正确保存
    console.log('\n步骤3: 验证数据是否正确保存...');
    const verifyResult = await client.query(
      `SELECT
         u.id,
         u.name,
         u.phone,
         jsonb_typeof(r.seven_questions_answers) as data_type,
         r.seven_questions_answers,
         r.updated_at
       FROM users u
       LEFT JOIN requirements r ON u.id = r.user_id
       WHERE u.id = $1`,
      [newUserId]
    );

    if (verifyResult.rows.length > 0) {
      const userData = verifyResult.rows[0];
      console.log('✅ 验证成功！');
      console.log('   用户名:', userData.name);
      console.log('   数据类型:', userData.data_type);
      console.log('   七问答案键数量:', Object.keys(userData.seven_questions_answers || {}).length);
      console.log('   答案示例:', userData.seven_questions_answers?.['1']);
    }

    // 4. 显示完整的七问答案
    console.log('\n✅ 完整的七问答案：');
    Object.keys(sevenQuestionsAnswers).forEach((key, index) => {
      const item = sevenQuestionsAnswers[key];
      console.log(`\n问题 ${key}:`);
      console.log(`  答案: ${item.answer}`);
      console.log(`  时间: ${item.date}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 测试完成！');
    console.log('='.repeat(60));
    console.log('\n请使用以下信息在后台查看：');
    console.log(`用户ID: ${newUserId}`);
    console.log(`用户名: 测试用户_新七问`);
    console.log(`手机号: 13800000888`);
    console.log('\n请刷新后台页面，查看该用户的七问答案是否正常显示！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await client.end();
    console.log('\n✅ 数据库连接已关闭');
  }
}

testNewUser();
