import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertUser } from '@/storage/database';

// POST /api/user - 创建新用户
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const userData: InsertUser = {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      age: data.age || null,
      gender: data.gender || null,
    };

    // 检查手机号是否已存在
    const existingUser = await healthDataManager.getUserByPhone(data.phone);
    if (existingUser) {
      return NextResponse.json(
        { error: '该手机号已注册' },
        { status: 400 }
      );
    }

    const user = await healthDataManager.createUser(userData);
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    );
  }
}

// GET /api/user - 获取用户信息（通过userId或phone查询）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone');

    if (!userId && !phone) {
      return NextResponse.json(
        { error: '必须提供 userId 或 phone 参数' },
        { status: 400 }
      );
    }

    let user;
    if (userId) {
      user = await healthDataManager.getUserById(userId);
    } else if (phone) {
      user = await healthDataManager.getUserByPhone(phone);
    }

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
