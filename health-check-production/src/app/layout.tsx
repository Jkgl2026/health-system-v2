import type { Metadata } from 'next';
import { PWAUrlChecker } from '@/components/PWAUrlChecker';
import { UrlWarningBanner } from '@/components/UrlWarningBanner';
import './globals.css';

// 暂时禁用可能导致启动失败的组件
// const PWAUrlCheckerDynamic = dynamic(() => import('@/components/PWAUrlChecker'), { ssr: false });
// const UrlWarningBannerDynamic = dynamic(() => import('@/components/UrlWarningBanner'), { ssr: false });

export const metadata: Metadata = {
  title: {
    default: '健康自我管理',
    template: '%s | 健康自我管理',
  },
  description:
    '健康自我管理系统 - 让老百姓少花钱甚至不花钱解决问题。通过科学的症状自检和健康要素分析，帮助您了解身体状况，掌握健康管理的科学方法。',
  keywords: [
    '健康管理',
    '健康自检',
    '症状分析',
    '健康要素',
    '自我管理',
    '预防保健',
    '气血',
    '循环',
    '毒素',
    '血脂',
    '免疫',
  ],
  authors: [{ name: '健康管理团队' }],
  generator: 'Next.js',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/icon-167x167.png', sizes: '167x167', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '健康管理',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: '健康自我管理 | 把健康把握在自己手里',
    description:
      '通过科学的症状自检和健康要素分析，了解您的身体状况，掌握健康管理的科学方法。让老百姓少花钱甚至不花钱解决问题。',
    siteName: '健康自我管理',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {/* 暂时禁用可能导致启动失败的组件 */}
        {/* <UrlWarningBanner /> */}
        {/* <PWAUrlChecker /> */}
        {children}
      </body>
    </html>
  );
}
