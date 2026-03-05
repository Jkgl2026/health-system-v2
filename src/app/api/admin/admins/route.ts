import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { admins } from '@/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/password';
import { withAuth, unauthorizedResponse } from '@/lib/api-auth';

// GET - 获取管理员列表
export async function GET(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const db = await getDb();
    const allAdmins = await db
      .select({
        id: admins.id,
        username: admins.username,
        name: admins.name,
        createdAt: admins.createdAt,
        isActive: admins.isActive,
      })
      .from(admins);

    return NextResponse.json({
      success: true,
      data: allAdmins,
    });
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取管理员列表失败' },
      { status: 500 }
    );
  }
}

// POST - 创建新管理员
export async function POST(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json();
    const { username, password, name } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查用户名是否已存在
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username))
      .limit(1);

    if (existingAdmin.length > 0) {
      return NextResponse.json(
        { success: false, error: '用户名已存在' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建管理员
    const newAdmin = await db
      .insert(admins)
      .values({
        username,
        password: hashedPassword,
        name: name || username,
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newAdmin[0].id,
        username: newAdmin[0].username,
        name: newAdmin[0].name,
        createdAt: newAdmin[0].createdAt,
        isActive: newAdmin[0].isActive,
      },
    });
  } catch (error) {
    console.error('创建管理员失败:', error);
    return NextResponse.json(
      { success: false, error: '创建管理员失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新管理员密码或状态
export async function PUT(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const body = await request.json();
    const { id, newPassword, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少管理员ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const updateData: any = {};

    if (newPassword) {
      updateData.password = await hashPassword(newPassword);
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    updateData.updatedAt = new Date();

    // 更新
    await db
      .update(admins)
      .set(updateData)
      .where(eq(admins.id, id));

    return NextResponse.json({
      success: true,
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新失败:', error);
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除管理员
export async function DELETE(request: NextRequest) {
  try {
    const auth = await withAuth(request);
    if (!auth.success) {
      return unauthorizedResponse(auth.error);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少管理员ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查是否是最后一个管理员
    const allAdmins = await db.select().from(admins);
    if (allAdmins.length <= 1) {
      return NextResponse.json(
        { success: false, error: '不能删除最后一个管理员账号' },
        { status: 400 }
      );
    }

    // 删除管理员
    await db.delete(admins).where(eq(admins.id, id));

    return NextResponse.json({
      success: true,
      message: '管理员删除成功',
    });
  } catch (error) {
    console.error('删除管理员失败:', error);
    return NextResponse.json(
      { success: false, error: '删除管理员失败' },
      { status: 500 }
    );
  }
}
