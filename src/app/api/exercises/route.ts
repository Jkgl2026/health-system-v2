import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { exerciseLibrary } from '@/storage/database/shared/schema';
import { eq, like, or, and, sql, desc, asc } from 'drizzle-orm';

// GET /api/exercises - 获取训练动作列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // 整复训练/本源训练
    const subCategory = searchParams.get('subCategory');
    const targetIssue = searchParams.get('targetIssue'); // 按适用问题搜索
    const search = searchParams.get('search'); // 关键词搜索
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const isActive = searchParams.get('isActive');

    const db = await getDb();

    // 构建查询条件
    const conditions = [];
    
    if (category) {
      conditions.push(eq(exerciseLibrary.category, category));
    }
    
    if (subCategory) {
      conditions.push(eq(exerciseLibrary.subCategory, subCategory));
    }
    
    if (targetIssue) {
      // JSONB数组包含查询
      conditions.push(sql`${exerciseLibrary.targetIssues} @> ${JSON.stringify([targetIssue])}`);
    }
    
    if (search) {
      conditions.push(
        or(
          like(exerciseLibrary.name, `%${search}%`),
          like(exerciseLibrary.description, `%${search}%`)
        )
      );
    }
    
    if (isActive !== null) {
      conditions.push(eq(exerciseLibrary.isActive, isActive === 'true'));
    }

    // 执行查询
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const exercises = await db
      .select()
      .from(exerciseLibrary)
      .where(whereClause)
      .orderBy(asc(exerciseLibrary.sortOrder), desc(exerciseLibrary.createdAt))
      .limit(limit)
      .offset(offset);

    // 查询总数
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(exerciseLibrary)
      .where(whereClause);

    const total = Number(countResult[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data: {
        exercises,
        total,
        limit,
        offset,
      }
    });

  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取训练动作失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/exercises - 创建训练动作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      subCategory,
      description,
      targetIssues,
      contraindications,
      videoUrl,
      gifUrl,
      imageUrl,
      steps,
      tips,
      commonMistakes,
      duration,
      reps,
      sets,
      frequency,
      restTime,
      easierVersion,
      harderVersion,
      primaryMuscles,
      secondaryMuscles,
      stabilizerMuscles,
      relatedMeridians,
      relatedAcupoints,
      sortOrder = 0,
      isActive = true,
    } = body;

    // 必填字段验证
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: '动作名称和分类为必填项' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 插入训练动作
    const insertResult = await db.insert(exerciseLibrary).values({
      name,
      category,
      subCategory,
      description,
      targetIssues,
      contraindications,
      videoUrl,
      gifUrl,
      imageUrl,
      steps,
      tips,
      commonMistakes,
      duration,
      reps,
      sets,
      frequency,
      restTime,
      easierVersion,
      harderVersion,
      primaryMuscles,
      secondaryMuscles,
      stabilizerMuscles,
      relatedMeridians,
      relatedAcupoints,
      sortOrder,
      isActive,
    }).returning({ id: exerciseLibrary.id });

    return NextResponse.json({
      success: true,
      data: {
        id: insertResult[0]?.id,
        message: '训练动作创建成功'
      }
    });

  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '创建训练动作失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/exercises - 更新训练动作
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少训练动作ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 更新训练动作
    const updateResult = await db
      .update(exerciseLibrary)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(exerciseLibrary.id, id))
      .returning({ id: exerciseLibrary.id });

    if (updateResult.length === 0) {
      return NextResponse.json(
        { success: false, error: '训练动作不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updateResult[0]?.id,
        message: '训练动作更新成功'
      }
    });

  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '更新训练动作失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises - 删除训练动作
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少训练动作ID' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 删除训练动作
    const deleteResult = await db
      .delete(exerciseLibrary)
      .where(eq(exerciseLibrary.id, id))
      .returning({ id: exerciseLibrary.id });

    if (deleteResult.length === 0) {
      return NextResponse.json(
        { success: false, error: '训练动作不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: '训练动作删除成功'
      }
    });

  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '删除训练动作失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
