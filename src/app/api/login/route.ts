import { NextRequest, NextResponse } from 'next/server';
import { exec_sql } from '@/app/lib/db';

/**
 * POST /login
 * 管理员登录接口
 * 严格遵循需求文档
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 校验参数
    if (!username || !password) {
      return NextResponse.json({
        code: 400,
        msg: '用户名和密码不能为空',
        data: null
      });
    }

    // 查询管理员
    const result = await exec_sql(
      'SELECT id, username, password FROM sys_admin WHERE username = $1',
      [username]
    );

    if (!result || result.length === 0) {
      return NextResponse.json({
        code: 401,
        msg: '用户名或密码错误',
        data: null
      });
    }

    const admin = result[0];

    // 验证密码
    if (admin.password !== password) {
      return NextResponse.json({
        code: 401,
        msg: '用户名或密码错误',
        data: null
      });
    }

    // 生成简单token（实际项目应该用JWT）
    const token = Buffer.from(`${admin.id}:${username}:${Date.now()}`).toString('base64');

    // 返回统一格式
    return NextResponse.json({
      code: 200,
      msg: '登录成功',
      data: {
        token,
        adminId: admin.id,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('[Login API] Error:', error);
    return NextResponse.json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
}
