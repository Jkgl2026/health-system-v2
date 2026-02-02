import { getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function initAdmin() {
  try {
    console.log('开始初始化管理员账号...');

    const db = await getDb();

    // 检查管理员是否已存在
    const existingAdmin = await db.execute(
      sql`SELECT * FROM admins WHERE username = 'admin' LIMIT 1`
    );

    if (existingAdmin && existingAdmin.rows && existingAdmin.rows.length > 0) {
      console.log('管理员账号已存在，跳过创建');
      console.log('用户名: admin');
      console.log('请使用您设置的密码登录');
      return;
    }

    // 创建管理员账号
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await db.execute(
      sql`
        INSERT INTO admins (id, username, password, name, is_active, created_at, updated_at)
        VALUES (
          gen_random_uuid(),
          'admin',
          ${hashedPassword},
          '超级管理员',
          true,
          NOW(),
          NOW()
        )
      `
    );

    console.log('✅ 管理员账号创建成功！');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('登录地址: http://localhost:5000/admin/login');
  } catch (error) {
    console.error('初始化管理员账号失败:', error);
    process.exit(1);
  }
}

initAdmin();
