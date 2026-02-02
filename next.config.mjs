import path from 'path';
import withPWA from 'next-pwa';

const nextConfig = {
  /* config options here */
  // 允许所有域名访问（开发环境）
  // allowedDevOrigins: ['*.dev.coze.site'],
  // 静态导出配置
  output: 'export',
  // 图片优化配置（静态导出必须禁用优化）
  images: {
    unoptimized: true,
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
