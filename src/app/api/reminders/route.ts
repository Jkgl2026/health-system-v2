import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { reminders } from '@/storage/database/shared/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

// GET /api/reminders - 获取提醒设置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // training/rediagnosis/diet
    const isActive = searchParams.get('isActive');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    const conditions = [eq(reminders.userId, userId)];
    
    if (type) {
      conditions.push(eq(reminders.type, type));
    }
    
    if (isActive !== null) {
      conditions.push(eq(reminders.isActive, isActive === 'true'));
    }

    // 查询提醒设置
    const records = await db
      .select()
      .from(reminders)
      .where(and(...conditions))
      .orderBy(desc(reminders.createdAt));

    return NextResponse.json({
      success: true,
      data: {
        reminders: records,
        total: records.length,
      }
    });

  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取提醒设置失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/reminders - 创建提醒设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type, // training/rediagnosis/diet
      title,
      message,
      reminderTime, // HH:mm
      frequency, // daily/weekly/custom
      daysOfWeek, // [0,1,2,3,4,5,6]
      isActive = true,
    } = body;

    if (!userId || !type || !title) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 插入提醒设置
    const insertResult = await db.insert(reminders).values({
      userId,
      type,
      title,
      message,
      reminderTime,
      frequency,
      daysOfWeek,
      isActive,
    }).returning({ id: reminders.id });

    return NextResponse.json({
      success: true,
      data: {
        id: insertResult[0]?.id,
        message: '提醒设置创建成功'
      }
    });

  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '创建提醒设置失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/reminders - 更新提醒设置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少提醒设置ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 更新提醒设置
    const updateResult = await db
      .update(reminders)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(reminders.id, id))
      .returning({ id: reminders.id });

    if (updateResult.length === 0) {
      return NextResponse.json(
        { success: false, error: '提醒设置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updateResult[0]?.id,
        message: '提醒设置更新成功'
      }
    });

  } catch (error) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '更新提醒设置失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reminders - 删除提醒设置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少提醒设置ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 删除提醒设置
    const deleteResult = await db
      .delete(reminders)
      .where(eq(reminders.id, id))
      .returning({ id: reminders.id });

    if (deleteResult.length === 0) {
      return NextResponse.json(
        { success: false, error: '提醒设置不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: '提醒设置删除成功'
      }
    });

  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '删除提醒设置失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
