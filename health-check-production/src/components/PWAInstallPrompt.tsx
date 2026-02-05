'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isCorrectPage, setIsCorrectPage] = useState(false);

  useEffect(() => {
    // 检查是否在正确的页面
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '/install-guide' || currentPath === '/ios-install-guide';

    // 检查是否显示登录页面（通过页面内容判断）
    const isLoginPage = document.body.innerText.includes('欢迎使用扣子') ||
                        document.body.innerText.includes('手机号登录') ||
                        document.body.innerText.includes('账号登录');

    // 只有在正确的页面且不是登录页面时才显示安装提示
    setIsCorrectPage(isHomePage && !isLoginPage);

    if (!isCorrectPage) {
      console.log('PWA install prompt not shown: incorrect page or login page');
      return;
    }

    // 检测设备类型
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /Android/.test(userAgent);
    const isDesktopDevice = !/Mobi|Android/i.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsDesktop(isDesktopDevice);

    // 检查是否已经安装过
    const hasShownPrompt = localStorage.getItem('pwa_install_prompt_shown');
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;

    // 如果是 iOS 设备且未显示过提示，显示 iOS 安装指南
    if (isIOSDevice && !hasShownPrompt && !isInstalled) {
      // 延迟 3 秒后显示提示
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // 只在未安装且未显示过提示时显示
      if (!hasShownPrompt && !isInstalled) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 监听安装成功事件
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa_installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isCorrectPage]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome 安装
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        localStorage.setItem('pwa_install_prompt_shown', 'true');
        localStorage.setItem('pwa_installed', 'true');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } else if (isIOS) {
      // iOS 安装指导
      setShowPrompt(false);
      // 显示详细的 iOS 安装指导
      window.open('/ios-install-guide', '_blank');
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_prompt_shown', 'true');

    // 7 天后再次提示
    const nextPromptTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('pwa_next_prompt_time', nextPromptTime.toString());
  };

  if (!showPrompt || !isCorrectPage) return null;

  const getDeviceIcon = () => {
    if (isIOS || isAndroid) return <Smartphone className="h-5 w-5" />;
    if (isDesktop) return <Monitor className="h-5 w-5" />;
    return <Download className="h-5 w-5" />;
  };

  const getInstallText = () => {
    if (isIOS) return '添加到主屏幕';
    if (isAndroid) return '安装应用到桌面';
    if (isDesktop) return '安装应用到桌面';
    return '安装应用';
  };

  const getDescription = () => {
    if (isIOS) return '在 Safari 中点击分享，选择"添加到主屏幕"';
    if (isAndroid) return '一键安装，随时随地管理健康';
    if (isDesktop) return '安装后可以从桌面直接打开，无需浏览器';
    return '安装到桌面，快速访问';
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto md:min-w-[400px] z-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-6 text-white border-2 border-emerald-400/30">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            {getDeviceIcon()}
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">安装健康管理应用</h3>
            <p className="text-white/90 text-sm mb-4">{getDescription()}</p>

            <div className="flex gap-3">
              <Button
                onClick={handleInstall}
                className="bg-white text-emerald-600 hover:bg-emerald-50 font-semibold flex-1"
              >
                {getInstallText()}
              </Button>

              <Button
                onClick={handleClose}
                variant="ghost"
                className="text-white hover:bg-white/20 px-3"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* 信任提示 */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2 text-xs text-white/80">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>安全可靠，无需下载，节省存储空间</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 导出手动触发安装的 hook
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setCanInstall(false);
      return outcome;
    }
    return null;
  };

  return { canInstall, install };
}
