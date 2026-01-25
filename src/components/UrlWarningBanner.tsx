'use client';

import { useState, useEffect } from 'react';
import { X, ExternalLink, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CORRECT_URL = 'https://cd776816-213e-4c84-af60-dbe5b397d82e.dev.coze.site';

export function UrlWarningBanner() {
  const [showWarning, setShowWarning] = useState(false);
  const [isCorrectUrl, setIsCorrectUrl] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const currentHostname = window.location.hostname;
    const isCorrect = currentHostname.includes('.dev.coze.site');
    setIsCorrectUrl(isCorrect);

    // 只在错误的地址显示警告
    if (!isCorrect) {
      // 延迟 2 秒显示，避免打扰用户
      const timer = setTimeout(() => {
        setShowWarning(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  // 如果地址正确，不显示横幅
  if (isCorrectUrl) {
    return null;
  }

  // 如果用户关闭了警告，不显示
  if (!showWarning) {
    return null;
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(CORRECT_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const openCorrectUrl = () => {
    window.location.href = CORRECT_URL;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* 警告信息 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                检测到错误的访问地址
              </p>
              <p className="text-xs text-white/90 truncate">
                请使用正确的地址：{CORRECT_URL}
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={copyUrl}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8 px-2"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              <span className="ml-1 text-xs">{copied ? '已复制' : '复制'}</span>
            </Button>
            <Button
              onClick={openCorrectUrl}
              size="sm"
              className="bg-white text-red-600 hover:bg-red-50 h-8 text-sm font-semibold"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              前往正确地址
            </Button>
            <Button
              onClick={() => setShowWarning(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 底部提示条 */}
        <div className="mt-2 pt-2 border-t border-white/30">
          <p className="text-xs text-white/80 flex items-center gap-2">
            <Info className="w-3 h-3" />
            <span>
              <strong>正确地址包含</strong> <code className="bg-white/20 px-1 rounded">.dev.coze.site</code>
              <strong>，错误地址包含</strong> <code className="bg-white/20 px-1 rounded">code.coze.cn</code>
            </span>
          </p>
        </div>
      </div>

      {/* 占位符，避免页面内容被遮挡 */}
      <div className="h-2" />
    </div>
  );
}
