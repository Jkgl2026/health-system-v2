'use client';

import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AutoSaveIndicatorProps {
  isSaving?: boolean;
  lastSaveTime?: number | null;
  error?: string | null;
}

export function AutoSaveIndicator({
  isSaving = false,
  lastSaveTime = null,
  error = null,
}: AutoSaveIndicatorProps) {
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (error) {
      setStatus('error');
    } else if (isSaving) {
      setStatus('idle');
    } else if (lastSaveTime) {
      setStatus('saved');
      // 3秒后重置状态
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaveTime, error]);

  if (status === 'idle' && !isSaving && !error) {
    return null;
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return '刚刚';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
    return `${Math.floor(seconds / 3600)}小时前`;
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {status === 'saved' && lastSaveTime && (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-green-600 dark:text-green-400">
            已保存 {formatTimeAgo(lastSaveTime)}
          </span>
        </>
      )}

      {status === 'error' && error && (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-600 dark:text-red-400">
            保存失败
          </span>
        </>
      )}

      {isSaving && (
        <>
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <span className="text-blue-600 dark:text-blue-400">
            保存中...
          </span>
        </>
      )}
    </div>
  );
}
