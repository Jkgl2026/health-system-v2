import { NextRequest, NextResponse } from 'next/server';
import { healthDataManager } from '@/storage/database';

// GET /api/debug/users-list - 直接测试用户列表
export async function GET(request: NextRequest) {
  try {
    const result = await healthDataManager.getAllUsersSummary({
      skip: 0,
      limit: 10,
      search: ''
    });
    
    return NextResponse.json({
      success: true,
      total: result.total,
      count: result.users.length,
      users: result.users.map(u => ({
        id: u.user.id,
        name: u.user.name,
        phone: u.user.phone,
        hasSymptomCheck: !!u.latestSymptomCheck,
        hasHealthAnalysis: !!u.latestHealthAnalysis
      }))
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}
