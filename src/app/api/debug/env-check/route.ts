import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    PGDATABASE_URL: process.env.PGDATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  // 检查每个环境变量
  const issues = [];

  if (!envVars.PGDATABASE_URL) {
    issues.push('❌ PGDATABASE_URL 未设置');
  } else if (envVars.PGDATABASE_URL.includes('base') && !envVars.PGDATABASE_URL.includes('neon')) {
    issues.push('❌ PGDATABASE_URL 值不完整，hostname 是 "base" 而不是 Neon 主机');
    issues.push(`当前值长度: ${envVars.PGDATABASE_URL.length}`);
    issues.push(`当前值前100字符: ${envVars.PGDATABASE_URL.substring(0, 100)}`);
  } else if (!envVars.PGDATABASE_URL.includes('neon')) {
    issues.push('⚠️ PGDATABASE_URL 可能不是 Neon 连接字符串');
  } else {
    issues.push('✅ PGDATABASE_URL 看起来正常');
    issues.push(`值长度: ${envVars.PGDATABASE_URL.length}`);
    // 只显示部分信息，保护敏感数据
    const parts = envVars.PGDATABASE_URL.split('@');
    if (parts.length === 2) {
      issues.push(`主机: ${parts[1].split('?')[0]}`);
    }
  }

  if (!envVars.JWT_SECRET) {
    issues.push('❌ JWT_SECRET 未设置');
  } else if (envVars.JWT_SECRET === 'health-admin-jwt-secret-key-2024-please-change-in-production') {
    issues.push('⚠️ JWT_SECRET 使用默认值，建议修改');
  } else {
    issues.push('✅ JWT_SECRET 已设置');
  }

  if (!envVars.NEXT_PUBLIC_APP_URL) {
    issues.push('⚠️ NEXT_PUBLIC_APP_URL 未设置');
  } else {
    issues.push(`✅ NEXT_PUBLIC_APP_URL: ${envVars.NEXT_PUBLIC_APP_URL}`);
  }

  if (!envVars.NEXT_PUBLIC_API_URL) {
    issues.push('⚠️ NEXT_PUBLIC_API_URL 未设置');
  } else {
    issues.push(`✅ NEXT_PUBLIC_API_URL: ${envVars.NEXT_PUBLIC_API_URL}`);
  }

  issues.push(`📦 NODE_ENV: ${envVars.NODE_ENV}`);

  return NextResponse.json({
    success: issues.every(i => i.includes('✅')),
    issues,
    envVars: {
      ...envVars,
      PGDATABASE_URL: envVars.PGDATABASE_URL
        ? `已设置 (长度: ${envVars.PGDATABASE_URL.length})`
        : '未设置',
      JWT_SECRET: envVars.JWT_SECRET
        ? `已设置 (长度: ${envVars.JWT_SECRET.length})`
        : '未设置',
    },
  });
}
