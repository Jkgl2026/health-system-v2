import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  name: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  created_at: string;
  updated_at: string;
}

interface CreateUserRequest {
  name: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

interface UpdateUserRequest {
  id: string;
  name?: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

// 内存存储（实际应用中应该使用数据库）
const usersStore: Map<string, User> = new Map();

// POST /api/users - 创建用户
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    const { name, phone, age, gender } = body;

    if (!name) {
      return NextResponse.json(
        { error: '用户姓名为必填项' },
        { status: 400 }
      );
    }

    // 生成用户ID
    const id = uuidv4();
    const now = new Date().toISOString();

    // 创建用户
    const user: User = {
      id,
      name,
      phone,
      age,
      gender,
      created_at: now,
      updated_at: now,
    };

    // 存储用户
    usersStore.set(id, user);

    console.log('[Users] 创建用户:', { id, name });

    return NextResponse.json({
      success: true,
      data: user,
    }, { status: 201 });
  } catch (error) {
    console.error('[Users] 创建用户失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '创建用户失败', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/users - 获取用户列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');

    let users = Array.from(usersStore.values());

    // 按姓名筛选
    if (name) {
      users = users.filter(user => 
        user.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    // 按电话筛选
    if (phone) {
      users = users.filter(user => 
        user.phone && user.phone.includes(phone)
      );
    }

    // 按创建时间排序（最新的在前）
    users.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    console.log('[Users] 获取用户列表:', { count: users.length });

    return NextResponse.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error('[Users] 获取用户列表失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '获取用户列表失败', details: errorMessage },
      { status: 500 }
    );
  }
}

// PUT /api/users - 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateUserRequest = await request.json();
    const { id, name, phone, age, gender } = body;

    if (!id) {
      return NextResponse.json(
        { error: '用户ID为必填项' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = usersStore.get(id);
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 更新用户信息
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    user.updated_at = new Date().toISOString();

    // 更新存储
    usersStore.set(id, user);

    console.log('[Users] 更新用户:', { id, name: user.name });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('[Users] 更新用户失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '更新用户失败', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/users - 删除用户
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '用户ID为必填项' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = usersStore.get(id);
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 删除用户
    usersStore.delete(id);

    console.log('[Users] 删除用户:', { id });

    return NextResponse.json({
      success: true,
      message: '用户删除成功',
    });
  } catch (error) {
    console.error('[Users] 删除用户失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return NextResponse.json(
      { error: '删除用户失败', details: errorMessage },
      { status: 500 }
    );
  }
}
