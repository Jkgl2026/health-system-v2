import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: '测试 API 正常工作',
    timestamp: new Date().toISOString(),
  });
}
