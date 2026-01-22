import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';
import type { InsertUserChoice } from '@/storage/database';

// POST /api/user-choice - 保存用户选择
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const choiceData: InsertUserChoice = {
      userId: data.userId,
      planType: data.planType,
      planDescription: data.planDescription || null,
    };

    const choice = await healthDataManager.createUserChoice(choiceData);
    return NextResponse.json({ success: true, choice }, { status: 201 });
  } catch (error) {
    console.error('Error creating user choice:', error);
    return NextResponse.json(
      { error: '保存用户选择失败' },
      { status: 500 }
    );
  }
}

// GET /api/user-choice - 获取用户的选择记录
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '必须提供 userId 参数' },
        { status: 400 }
      );
    }

    const choices = await healthDataManager.getUserChoicesByUserId(userId);
    return NextResponse.json({ success: true, choices });
  } catch (error) {
    console.error('Error fetching user choices:', error);
    return NextResponse.json(
      { error: '获取用户选择记录失败' },
      { status: 500 }
    );
  }
}
