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

// 在开发环境禁用 PWA，避免与 Turbopack 冲突
const pwaConfig = process.env.NODE_ENV === 'development' 
  ? (config) => config
  : withPWA({
      dest: 'public',
      register: true,
      skipWaiting: true,
      disable: true,
      sw: 'sw.js',
      scope: '/',
    });

export default pwaConfig(nextConfig);
