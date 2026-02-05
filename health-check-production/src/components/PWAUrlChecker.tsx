'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * PWA URL 检测组件
 * 用于检测 PWA 应用是否使用了正确的访问地址
 * 如果使用了错误的地址，则自动跳转到错误页面
 */
export function PWAUrlChecker() {
  const router = useRouter();

  useEffect(() => {
    // 检查是否是 PWA 模式
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes('android-app://');

    if (!isPWA) {
      return; // 不是 PWA 模式，不需要检测
    }

    // 检查当前 URL 是否正确
    const currentHostname = window.location.hostname;

    // 正确的 hostname 应该包含 .dev.coze.site
    // 错误的 hostname 可能是 code.coze.cn 或其他
    const isCorrectHostname = currentHostname.includes('.dev.coze.site');

    // 检查是否在错误页面或安装指南页面
    const currentPath = window.location.pathname;
    const isErrorPage = currentPath === '/error-page';
    const isInstallPage = currentPath === '/install-guide' || currentPath === '/ios-install-guide';

    // 如果已经在错误页面或安装页面，不需要重定向
    if (isErrorPage || isInstallPage) {
      return;
    }

    // 如果 hostname 不正确，跳转到错误页面
    if (!isCorrectHostname) {
      console.log('检测到错误的 PWA 地址:', currentHostname);

      // 保存当前错误地址，用于错误页面显示
      sessionStorage.setItem('wrong_pwa_url', window.location.href);

      // 延迟 1 秒后跳转，给用户一些时间看到错误
      setTimeout(() => {
        window.location.href = '/error-page';
      }, 1000);
    }
  }, [router]);

  return null;
}
