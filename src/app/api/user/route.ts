import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertUser } from '@/storage/database';

// POST /api/user - 创建新用户
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('POST /api/user - 接收到数据:', data);

    const userData: InsertUser = {
      name: data.name || null,
      phone: data.phone || null,
      email: data.email || null,
      age: data.age || null,
      gender: data.gender || null,
      weight: data.weight || null,
      height: data.height || null,
      bloodPressure: data.bloodPressure || null,
      occupation: data.occupation || null,
      address: data.address || null,
      bmi: data.bmi || null,
    };

    // 如果提供了phone，检查是否已存在
    if (data.phone) {
      const existingUser = await healthDataManager.getUserByPhone(data.phone);
      if (existingUser) {
        return NextResponse.json(
          { error: '该手机号已注册' },
          { status: 400 }
        );
      }
    }

    console.log('开始创建用户:', userData);
    const user = await healthDataManager.createUser(userData);
    console.log('用户创建成功:', user);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '创建用户失败', details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/user - 更新用户信息
export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '必须提供 userId 参数' },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log('PATCH /api/user - userId:', userId, '数据:', data);

    const userData: Partial<InsertUser> = {};

    if (data.name !== undefined) userData.name = data.name;
    if (data.phone !== undefined) userData.phone = data.phone;
    if (data.email !== undefined) userData.email = data.email;
    if (data.age !== undefined) userData.age = data.age;
    if (data.gender !== undefined) userData.gender = data.gender;
    if (data.weight !== undefined) userData.weight = data.weight;
    if (data.height !== undefined) userData.height = data.height;
    if (data.bloodPressure !== undefined) userData.bloodPressure = data.bloodPressure;
    if (data.occupation !== undefined) userData.occupation = data.occupation;
    if (data.address !== undefined) userData.address = data.address;
    if (data.bmi !== undefined) userData.bmi = data.bmi;

    console.log('开始更新用户:', { userId, userData });
    const updatedUser = await healthDataManager.updateUser(userId, userData);
    console.log('用户更新成功:', updatedUser);

    if (!updatedUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '更新用户信息失败', details: errorMessage },
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

    console.log('GET /api/user - userId:', userId, 'phone:', phone);

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

    console.log('获取用户成功:', user.id);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '获取用户信息失败', details: errorMessage },
      { status: 500 }
    );
  }
}
