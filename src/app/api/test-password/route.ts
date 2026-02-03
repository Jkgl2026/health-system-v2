import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { password, hashedPassword } = await request.json();

    if (!password || !hashedPassword) {
      return NextResponse.json(
        { error: '缺少参数' },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);

    console.log('[TestPassword] password:', password);
    console.log('[TestPassword] hashedPassword:', hashedPassword);
    console.log('[TestPassword] isMatch:', isMatch);

    return NextResponse.json({
      success: true,
      isMatch,
    });
  } catch (error) {
    console.error('[TestPassword] Error:', error);
    return NextResponse.json(
      { error: '测试失败' },
      { status: 500 }
    );
  }
}
