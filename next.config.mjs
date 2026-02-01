import path from 'path';
import withPWA from 'next-pwa';

const nextConfig = {
  // 禁用静态生成，避免 DYNAMIC_SERVER_USAGE 错误
  output: 'standalone',
  /* config options here */
  // 允许所有域名访问（开发环境）
  // allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
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
