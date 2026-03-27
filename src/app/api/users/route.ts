import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from 'coze-coding-dev-sdk';
import { sql, and, desc, like, eq } from 'drizzle-orm';
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

// 用户表定义
const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone'),
  age: integer('age'),
  gender: text('gender'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

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

    const db = await getDb();

    // 插入用户到数据库
    const result = await db.execute(sql`
      INSERT INTO users (id, name, phone, age, gender)
      VALUES (${uuidv4()}, ${name}, ${phone || null}, ${age || null}, ${gender || null})
      RETURNING id, name, phone, age, gender, created_at, updated_at
    `);

    const user = result.rows[0];

    console.log('[Users] 创建用户:', { id: user.id, name: user.name });

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

    const db = await getDb();

    let result: any;

    if (name || phone) {
      // 有搜索条件 - 使用Drizzle查询构建器
      const conditions: any[] = [];

      if (name) {
        conditions.push(like(usersTable.name, `%${name}%`));
      }
      if (phone) {
        conditions.push(like(usersTable.phone, `%${phone}%`));
      }

      const query = db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          phone: usersTable.phone,
          age: usersTable.age,
          gender: usersTable.gender,
          created_at: usersTable.createdAt,
          updated_at: usersTable.updatedAt,
        })
        .from(usersTable)
        .orderBy(desc(usersTable.createdAt));

      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      result = await query;
    } else {
      // 无搜索条件
      result = await db.execute(sql`
        SELECT id, name, phone, age, gender, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `);
    }

    const users = result.rows;

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

    const db = await getDb();

    // 构建更新数据对象
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name;
    }
    if (phone !== undefined) {
      updateData.phone = phone || null;
    }
    if (age !== undefined) {
      updateData.age = age || null;
    }
    if (gender !== undefined) {
      updateData.gender = gender || null;
    }

    // 执行更新
    const result = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, id))
      .returning({
        id: usersTable.id,
        name: usersTable.name,
        phone: usersTable.phone,
        age: usersTable.age,
        gender: usersTable.gender,
        created_at: usersTable.createdAt,
        updated_at: usersTable.updatedAt,
      });

    if (result.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    const user = result[0];

    console.log('[Users] 更新用户:', { id: user.id, name: user.name });

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

    const db = await getDb();

    // 删除用户
    const result = await db.execute(sql`
      DELETE FROM users
      WHERE id = ${id}
      RETURNING id
    `);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

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
