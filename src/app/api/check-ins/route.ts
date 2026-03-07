import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { checkInRecords } from '@/storage/database/shared/schema';
import { eq, desc, sql, and, gte, lte } from 'drizzle-orm';

// GET /api/check-ins - 获取打卡记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // training/diet/symptom
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 构建查询条件
    const conditions = [eq(checkInRecords.userId, userId)];
    
    if (type) {
      conditions.push(eq(checkInRecords.type, type));
    }
    
    if (startDate) {
      conditions.push(gte(checkInRecords.checkInDate, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(checkInRecords.checkInDate, new Date(endDate)));
    }

    // 查询打卡记录
    const records = await db
      .select()
      .from(checkInRecords)
      .where(and(...conditions))
      .orderBy(desc(checkInRecords.checkInDate))
      .limit(limit)
      .offset(offset);

    // 查询总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(checkInRecords)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count) || 0;

    // 统计数据
    const stats = {
      totalCheckIns: total,
      trainingCheckIns: 0,
      dietCheckIns: 0,
      symptomCheckIns: 0,
      thisWeekCheckIns: 0,
      thisMonthCheckIns: 0,
    };

    // 获取各类型统计
    const typeStats = await db
      .select({
        type: checkInRecords.type,
        count: sql<number>`count(*)`,
      })
      .from(checkInRecords)
      .where(eq(checkInRecords.userId, userId))
      .groupBy(checkInRecords.type);

    typeStats.forEach((stat) => {
      if (stat.type === 'training') stats.trainingCheckIns = Number(stat.count);
      if (stat.type === 'diet') stats.dietCheckIns = Number(stat.count);
      if (stat.type === 'symptom') stats.symptomCheckIns = Number(stat.count);
    });

    // 获取本周统计
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStats = await db
      .select({ count: sql<number>`count(*)` })
      .from(checkInRecords)
      .where(and(
        eq(checkInRecords.userId, userId),
        gte(checkInRecords.checkInDate, weekAgo)
      ));
    stats.thisWeekCheckIns = Number(weekStats[0]?.count) || 0;

    // 获取本月统计
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthStats = await db
      .select({ count: sql<number>`count(*)` })
      .from(checkInRecords)
      .where(and(
        eq(checkInRecords.userId, userId),
        gte(checkInRecords.checkInDate, monthAgo)
      ));
    stats.thisMonthCheckIns = Number(monthStats[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data: {
        records,
        total,
        limit,
        offset,
        stats,
      }
    });

  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取打卡记录失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/check-ins - 创建打卡记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type, // training/diet/symptom
      content,
      notes,
      exerciseIds,
      completed = true,
      duration,
      checkInDate,
    } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 插入打卡记录
    const insertResult = await db.insert(checkInRecords).values({
      userId,
      type,
      content: content || {},
      notes,
      exerciseIds: exerciseIds || [],
      completed,
      duration,
      checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
    }).returning({ id: checkInRecords.id });

    return NextResponse.json({
      success: true,
      data: {
        id: insertResult[0]?.id,
        message: '打卡成功'
      }
    });

  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '打卡失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/check-ins - 删除打卡记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少打卡记录ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 删除打卡记录
    const deleteResult = await db
      .delete(checkInRecords)
      .where(eq(checkInRecords.id, id))
      .returning({ id: checkInRecords.id });

    if (deleteResult.length === 0) {
      return NextResponse.json(
        { success: false, error: '打卡记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: '打卡记录删除成功'
      }
    });

  } catch (error) {
    console.error('Error deleting check-in:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '删除打卡记录失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
