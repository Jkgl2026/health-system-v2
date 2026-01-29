import { getDb } from 'coze-coding-dev-sdk';
import { admins } from '../src/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function testAdminPassword() {
  try {
    const db = await getDb();
    
    // 获取管理员账户
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, 'admin'))
      .limit(1);

    if (!admin) {
      console.log('未找到管理员账户');
      return;
    }

    console.log('管理员账户信息:');
    console.log('用户名:', admin.username);
    console.log('密码哈希:', admin.password);
    console.log('激活状态:', admin.isActive);
    console.log('');

    // 测试密码验证
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, admin.password);
    
    console.log('密码验证结果:');
    console.log('测试密码:', testPassword);
    console.log('验证结果:', isMatch ? '✅ 匹配' : '❌ 不匹配');

    // 如果不匹配，尝试重新创建管理员账户
    if (!isMatch) {
      console.log('');
      console.log('密码不匹配，正在重新创建管理员账户...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db
        .update(admins)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(admins.username, 'admin'));

      console.log('✅ 管理员账户密码已重置');
      
      // 再次验证
      const newMatch = await bcrypt.compare(testPassword, hashedPassword);
      console.log('新密码验证结果:', newMatch ? '✅ 匹配' : '❌ 不匹配');
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testAdminPassword();
