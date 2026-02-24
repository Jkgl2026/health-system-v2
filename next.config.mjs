import withPWA from 'next-pwa';

const nextConfig = {
  // Turbopack 配置（Next.js 16 默认使用 Turbopack）
  turbopack: {},
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

// 完全禁用 PWA，避免缓存问题
const pwaConfig = (config) => config;

export default pwaConfig(nextConfig);
