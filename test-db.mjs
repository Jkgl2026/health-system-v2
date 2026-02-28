import { getDb } from 'coze-coding-dev-sdk';

async function testDb() {
  try {
    const db = await getDb();
    console.log('数据库连接成功');
    
    // 尝试查询用户表
    const result = await db.execute('SELECT COUNT(*) as count FROM users');
    console.log('用户数量:', result);
    
    // 查询管理员表
    const adminResult = await db.execute('SELECT COUNT(*) as count FROM admins');
    console.log('管理员数量:', adminResult);
    
    process.exit(0);
  } catch (error) {
    console.error('数据库错误:', error);
    process.exit(1);
  }
}

testDb();
