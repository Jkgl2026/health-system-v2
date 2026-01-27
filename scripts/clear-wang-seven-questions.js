// 手动清除王同学的七问默认答案
// 直接设置为 null，让用户重新填写

import { db } from '../src/lib/db/index.js';
import { requirements } from '../src/lib/db/schema.js';
import { eq } from 'drizzle-orm';

const WANG_USER_ID = '970ef135-ad1b-4028-bab7-5006c13dab6c';

async function clearWangSevenQuestions() {
  console.log('🔧 开始清除王同学的七问默认答案...');
  console.log('用户ID:', WANG_USER_ID);

  try {
    // 检查当前数据
    const [current] = await db
      .select({ seven_questions_answers: requirements.seven_questions_answers })
      .from(requirements)
      .where(eq(requirements.user_id, WANG_USER_ID));

    console.log('当前数据:', JSON.stringify(current, null, 2));

    if (!current) {
      console.log('❌ 用户不存在');
      process.exit(1);
    }

    // 清除默认答案，设置为 null
    const result = await db
      .update(requirements)
      .set({
        seven_questions_answers: null,
        updated_at: new Date(),
      })
      .where(eq(requirements.user_id, WANG_USER_ID));

    console.log('✅ 成功清除七问答案，设置为 null');
    console.log('影响行数:', result.rowCount);

    // 验证清除结果
    const [updated] = await db
      .select({ seven_questions_answers: requirements.seven_questions_answers })
      .from(requirements)
      .where(eq(requirements.user_id, WANG_USER_ID));

    console.log('清除后数据:', JSON.stringify(updated, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ 清除失败:', error);
    process.exit(1);
  }
}

clearWangSevenQuestions();
