/**
 * 重新创建管理员账号脚本
 * 
 * 功能：
 * - 删除现有的admin账号
 * - 创建新的默认账号（admin / 123456）
 * 
 * 执行方式：
 * npx tsx scripts/init-admin.ts
 */

import { adminManager } from '../src/storage/database/adminManager';
import { getDb } from "coze-coding-dev-sdk";
import { admins } from "../src/storage/database/shared/schema";
import { eq } from "drizzle-orm";

async function resetAdmin() {
  console.log('[重置] 开始重置管理员账号...');

  try {
    // 查询现有admin账号
    const existingAdmin = await adminManager.findByUsername('admin');

    if (existingAdmin) {
      console.log('[重置] 找到现有admin账号，ID:', existingAdmin.id);
      
      // 删除现有账号
      const db = await getDb();
      await db.delete(admins).where(eq(admins.username, 'admin'));
      console.log('[重置] 已删除现有admin账号');
    }

    // 创建新的管理员账号
    console.log('[重置] 创建新的管理员账号...');
    const admin = await adminManager.createAdmin({
      username: 'admin',
      password: '123456',
      name: '系统管理员',
      isActive: true,
    });

    console.log('[重置] 管理员账号创建成功！');
    console.log('账号：admin');
    console.log('密码：123456');
    console.log('ID：', admin.id);
    console.log('创建时间：', admin.createdAt);
    console.log('');
    console.log('⚠️  请在首次登录后立即修改密码！');

  } catch (error) {
    console.error('[重置] 重置失败', error);
    process.exit(1);
  }
}

// 执行重置
resetAdmin();
