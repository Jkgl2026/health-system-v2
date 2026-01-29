// 测试数据库连接和数据读取
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testDatabase() {
  try {
    console.log('开始检查数据库...\n');

    // 检查 users 表
    const usersResult = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 10');
    console.log('=== Users 表数据 ===');
    console.log(`总用户数: ${usersResult.rowCount}`);
    usersResult.rows.forEach((user, index) => {
      console.log(`\n用户 ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  姓名: ${user.name}`);
      console.log(`  手机: ${user.phone}`);
      console.log(`  年龄: ${user.age}`);
      console.log(`  性别: ${user.gender}`);
      console.log(`  创建时间: ${user.created_at}`);
    });

    // 检查 symptom_checks 表
    const symptomChecksResult = await pool.query('SELECT * FROM symptom_checks ORDER BY checked_at DESC LIMIT 10');
    console.log('\n\n=== Symptom Checks 表数据 ===');
    console.log(`总记录数: ${symptomChecksResult.rowCount}`);
    symptomChecksResult.rows.forEach((check, index) => {
      console.log(`\n自检记录 ${index + 1}:`);
      console.log(`  ID: ${check.id}`);
      console.log(`  用户ID: ${check.user_id}`);
      console.log(`  检查症状数: ${JSON.parse(check.checked_symptoms).length}`);
      console.log(`  总分: ${check.total_score}`);
      console.log(`  检查时间: ${check.checked_at}`);
    });

    // 检查 health_analysis 表
    const analysisResult = await pool.query('SELECT * FROM health_analysis ORDER BY analyzed_at DESC LIMIT 10');
    console.log('\n\n=== Health Analysis 表数据 ===');
    console.log(`总记录数: ${analysisResult.rowCount}`);
    analysisResult.rows.forEach((analysis, index) => {
      console.log(`\n分析记录 ${index + 1}:`);
      console.log(`  ID: ${analysis.id}`);
      console.log(`  用户ID: ${analysis.user_id}`);
      console.log(`  气血: ${analysis.qi_and_blood}`);
      console.log(`  循环: ${analysis.circulation}`);
      console.log(`  毒素: ${analysis.toxins}`);
      console.log(`  分析时间: ${analysis.analyzed_at}`);
    });

    // 检查 user_choices 表
    const choicesResult = await pool.query('SELECT * FROM user_choices ORDER BY selected_at DESC LIMIT 10');
    console.log('\n\n=== User Choices 表数据 ===');
    console.log(`总记录数: ${choicesResult.rowCount}`);
    choicesResult.rows.forEach((choice, index) => {
      console.log(`\n选择记录 ${index + 1}:`);
      console.log(`  ID: ${choice.id}`);
      console.log(`  用户ID: ${choice.user_id}`);
      console.log(`  方案类型: ${choice.plan_type}`);
      console.log(`  方案描述: ${choice.plan_description}`);
      console.log(`  选择时间: ${choice.selected_at}`);
    });

    // 检查 requirements 表
    const requirementsResult = await pool.query('SELECT * FROM requirements ORDER BY updated_at DESC LIMIT 10');
    console.log('\n\n=== Requirements 表数据 ===');
    console.log(`总记录数: ${requirementsResult.rowCount}`);
    requirementsResult.rows.forEach((req, index) => {
      console.log(`\n要求记录 ${index + 1}:`);
      console.log(`  ID: ${req.id}`);
      console.log(`  用户ID: ${req.user_id}`);
      console.log(`  要求1完成: ${req.requirement1_completed}`);
      console.log(`  要求2完成: ${req.requirement2_completed}`);
      console.log(`  要求3完成: ${req.requirement3_completed}`);
      console.log(`  要求4完成: ${req.requirement4_completed}`);
    });

    // 联合查询：检查每个用户的完整数据
    console.log('\n\n=== 用户完整数据统计 ===');
    const fullDataResult = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.phone,
        u.age,
        u.gender,
        u.created_at,
        COUNT(DISTINCT sc.id) as symptom_check_count,
        COUNT(DISTINCT ha.id) as analysis_count,
        COUNT(DISTINCT uc.id) as choice_count,
        COUNT(DISTINCT r.id) as requirements_count
      FROM users u
      LEFT JOIN symptom_checks sc ON u.id = sc.user_id
      LEFT JOIN health_analysis ha ON u.id = ha.user_id
      LEFT JOIN user_choices uc ON u.id = uc.user_id
      LEFT JOIN requirements r ON u.id = r.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    fullDataResult.rows.forEach((row, index) => {
      console.log(`\n用户 ${index + 1}: ${row.name || '未命名'} (${row.phone || '无手机'})`);
      console.log(`  自检记录: ${row.symptom_check_count} 条`);
      console.log(`  分析记录: ${row.analysis_count} 条`);
      console.log(`  选择记录: ${row.choice_count} 条`);
      console.log(`  要求记录: ${row.requirements_count} 条`);
    });

  } catch (error) {
    console.error('数据库查询失败:', error);
  } finally {
    await pool.end();
  }
}

testDatabase();
