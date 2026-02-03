/**
 * 初始化管理员账号脚本
 * 
 * 功能：
 * - 检查是否存在默认管理员账号
 * - 如果不存在，创建默认账号（admin / 123456）
 * 
 * 执行方式：
 * npx tsx scripts/init-admin.ts
 */

import { adminManager } from '../src/storage/database/adminManager';

async function initAdmin() {
  console.log('[初始化] 开始检查管理员账号...');

  try {
    // 检查是否已存在admin账号
    const existingAdmin = await adminManager.findByUsername('admin');

    if (existingAdmin) {
      console.log('[初始化] 管理员账号已存在');
      console.log('账号：admin');
      console.log('ID：', existingAdmin.id);
      console.log('创建时间：', existingAdmin.createdAt);
      return;
    }

    // 创建默认管理员账号
    console.log('[初始化] 创建默认管理员账号...');
    const admin = await adminManager.createAdmin({
      username: 'admin',
      password: '123456',
      name: '系统管理员',
      isActive: true,
    });

    console.log('[初始化] 管理员账号创建成功！');
    console.log('账号：admin');
    console.log('密码：123456');
    console.log('ID：', admin.id);
    console.log('创建时间：', admin.createdAt);
    console.log('');
    console.log('⚠️  请在首次登录后立即修改密码！');

  } catch (error) {
    console.error('[初始化] 初始化失败', error);
    process.exit(1);
  }
}

// 执行初始化
initAdmin();
