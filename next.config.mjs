import path from 'path';
import withPWA from 'next-pwa';

const nextConfig = {
  /* config options here */
  // 允许所有域名访问（开发环境）
  // allowedDevOrigins: ['*.dev.coze.site'],

  // ⚠️ 重要：不要使用 output: 'export'，因为它会禁用 API 路由
  // 静态导出模式不支持 API 路由，会导致 src/app/api/* 下的接口无法访问

  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  sw: 'sw.js',
  scope: '/',
});

export default pwaConfig(nextConfig);
