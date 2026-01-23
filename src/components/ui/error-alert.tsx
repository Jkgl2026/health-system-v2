'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  error: any;
  onRetry?: () => void;
  title?: string;
}

export function ErrorAlert({ error, onRetry, title = '操作失败' }: ErrorAlertProps) {
  const errorMessage = error?.message || error?.error || '发生未知错误，请重试';
  const errorDetails = error?.data || error?.details || null;

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="font-medium">{errorMessage}</div>
        {errorDetails && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
              查看详细信息
            </summary>
            <pre className="mt-2 p-2 bg-black/20 rounded overflow-x-auto text-xs">
              {typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}
            </pre>
          </details>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 flex items-center gap-2 text-sm font-medium hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}
