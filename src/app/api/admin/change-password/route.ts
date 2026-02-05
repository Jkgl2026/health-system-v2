import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { adminId, oldPassword, newPassword } = await request.json();

    // 验证参数
    if (!adminId || !oldPassword || !newPassword) {
      return NextResponse.json({
        code: 400,
        msg: '参数不完整',
        data: null
      });
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return NextResponse.json({
        code: 400,
        msg: '新密码长度不能少于6位',
        data: null
      });
    }

    // 检查原密码是否正确
    const checkResult = await exec_sql(
      'SELECT admin_id FROM sys_admin WHERE admin_id = $1 AND password = $2',
      [adminId, oldPassword]
    );

    if (checkResult.rowCount === 0) {
      return NextResponse.json({
        code: 400,
        msg: '原密码错误',
        data: null
      });
    }

    // 更新密码
    await exec_sql(
      'UPDATE sys_admin SET password = $1, update_time = NOW() WHERE admin_id = $2',
      [newPassword, adminId]
    );

    return NextResponse.json({
      code: 200,
      msg: '密码修改成功',
      data: null
    });
  } catch (error: any) {
    console.error('修改密码失败:', error);
    return NextResponse.json({
      code: 500,
      msg: '密码修改失败',
      data: null
    });
  }
}
