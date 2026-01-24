'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * PWA 启动重定向组件
 * 用于检测 PWA 启动时是否在正确的页面，如果不在则自动跳转
 */
export function PWARedirect() {
  const router = useRouter();

  useEffect(() => {
    // 检查是否是 PWA 启动
    const urlParams = new URLSearchParams(window.location.search);
    const isPWA = urlParams.get('pwa') === 'true';

    if (!isPWA) {
      return;
    }

    // 检查页面内容，如果显示登录页面，则跳转到首页
    const checkAndRedirect = () => {
      const bodyText = document.body.innerText.toLowerCase();

      // 检测是否是登录页面
      const isLoginPage =
        bodyText.includes('欢迎使用扣子') ||
        bodyText.includes('手机号登录') ||
        bodyText.includes('账号登录') ||
        bodyText.includes('请输入手机号') ||
        bodyText.includes('请输入验证码');

      if (isLoginPage) {
        console.log('检测到登录页面，准备跳转到首页...');

        // 清除可能导致的登录缓存的本地存储
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('login') || key.includes('auth'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // 延迟 1 秒后跳转，避免过于频繁的刷新
        setTimeout(() => {
          window.location.href = '/?pwa=true';
        }, 1000);
      }
    };

    // 页面加载完成后检查
    if (document.readyState === 'complete') {
      checkAndRedirect();
    } else {
      window.addEventListener('load', checkAndRedirect);
      return () => window.removeEventListener('load', checkAndRedirect);
    }
  }, [router]);

  return null;
}
