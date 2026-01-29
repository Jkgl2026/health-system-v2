import { NextResponse } from 'next/server';

// 测试端点：返回 JSON 格式的 500 错误
export async function GET() {
  return NextResponse.json(
    {
      error: '数据库连接失败',
      details: 'Connection timeout after 30000ms',
      timestamp: new Date().toISOString()
    },
    { status: 500 }
  );
}
