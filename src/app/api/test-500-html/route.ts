import { NextResponse } from 'next/server';

// 测试端点：返回 HTML 格式的 500 错误
export async function GET() {
  return new NextResponse('<html><body><h1>Internal Server Error</h1><p>This is a simulated 500 error with HTML response</p></body></html>', {
    status: 500,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
