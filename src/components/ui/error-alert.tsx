'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title: string;
  error: string | Error | unknown;
  onRetry?: () => void;
  onContinue?: () => void;
  isRetrying?: boolean;
}

export function ErrorAlert({
  title,
  error,
  onRetry,
  onContinue,
  isRetrying = false
}: ErrorAlertProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getErrorMessage = (err: string | Error | unknown): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    return String(err);
  };

  const getErrorStack = (err: string | Error | unknown): string | undefined => {
    if (err instanceof Error) return err.stack;
    return undefined;
  };

  const errorMessage = getErrorMessage(error);
  const errorStack = getErrorStack(error);

  return (
    <Alert variant="destructive" className="border-red-300 bg-red-50">
      <AlertCircle className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle className="text-red-800 font-semibold">{title}</AlertTitle>
        <AlertDescription className="text-red-700 mt-1">
          {errorMessage}
        </AlertDescription>
      </div>

      <div className="flex gap-2">
        {errorStack && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-700 hover:text-red-900 hover:bg-red-100"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                详情
              </>
            )}
          </Button>
        )}

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                重试中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" />
                重试
              </>
            )}
          </Button>
        )}

        {onContinue && (
          <Button
            variant="outline"
            size="sm"
            onClick={onContinue}
            className="ml-2"
          >
            继续填写
          </Button>
        )}
      </div>

      {showDetails && errorStack && (
        <div className="mt-3 p-3 bg-red-900/10 rounded-md border border-red-200">
          <pre className="text-xs text-red-800 whitespace-pre-wrap font-mono overflow-auto max-h-48">
            {errorStack}
          </pre>
        </div>
      )}
    </Alert>
  );
}
