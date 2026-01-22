import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

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
  // icons: {
  //   icon: '',
  // },
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
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
