/**
 * 健康评估系统错误显示组件
 * 提供用户友好的错误展示
 */

'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, AlertTriangle, AlertOctagon, 
  RefreshCw, XCircle, Info 
} from 'lucide-react';
import { HealthAnalysisError, ErrorSeverity } from '@/lib/error-handling';

interface ErrorDisplayProps {
  error: HealthAnalysisError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * 错误显示组件
 */
export function ErrorDisplay({ error, onRetry, onDismiss, className }: ErrorDisplayProps) {
  const getSeverityConfig = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return {
          className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: <Info className="w-5 h-5" />,
          title: '提示'
        };
      case ErrorSeverity.MEDIUM:
        return {
          className: 'bg-orange-50 border-orange-200 text-orange-800',
          icon: <AlertTriangle className="w-5 h-5" />,
          title: '警告'
        };
      case ErrorSeverity.HIGH:
        return {
          className: 'bg-red-50 border-red-200 text-red-800',
          icon: <XCircle className="w-5 h-5" />,
          title: '错误'
        };
      case ErrorSeverity.CRITICAL:
        return {
          className: 'bg-red-100 border-red-300 text-red-900',
          icon: <AlertOctagon className="w-5 h-5" />,
          title: '严重错误'
        };
      default:
        return {
          className: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: <AlertCircle className="w-5 h-5" />,
          title: '错误'
        };
    }
  };
  
  const severityConfig = getSeverityConfig();
  
  return (
    <Alert className={cn("border-2", severityConfig.className, className)}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {severityConfig.icon}
        </div>
        <div className="flex-1">
          <AlertTitle className="font-semibold">
            {severityConfig.title}：{error.message}
          </AlertTitle>
          
          {error.suggestion && (
            <AlertDescription className="mt-3">
              <div className="bg-white/50 rounded-lg p-3 border border-current/20">
                <p className="font-medium mb-2">建议：</p>
                <p className="text-sm whitespace-pre-line">{error.suggestion}</p>
              </div>
            </AlertDescription>
          )}
          
          {/* 错误代码 */}
          {error.code && (
            <AlertDescription className="mt-2 text-xs font-mono">
              错误代码：{error.code}
            </AlertDescription>
          )}
          
          {/* 操作按钮 */}
          <div className="mt-4 flex gap-2">
            {error.retryable && onRetry && (
              <Button 
                onClick={onRetry} 
                size="sm"
                variant="outline"
                className="border-current/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </Button>
            )}
            
            {onDismiss && (
              <Button 
                onClick={onDismiss} 
                size="sm"
                variant="ghost"
                className="text-current/70 hover:text-current"
              >
                关闭
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}

/**
 * 批量错误显示组件
 */
interface BatchErrorDisplayProps {
  errors: HealthAnalysisError[];
  onRetry?: (error: HealthAnalysisError) => void;
  onDismiss?: () => void;
  className?: string;
}

export function BatchErrorDisplay({ errors, onRetry, onDismiss, className }: BatchErrorDisplayProps) {
  if (errors.length === 0) return null;
  
  // 按严重度分组
  const groupedErrors = errors.reduce((acc, error) => {
    if (!acc[error.severity]) {
      acc[error.severity] = [];
    }
    acc[error.severity].push(error);
    return acc;
  }, {} as Record<ErrorSeverity, HealthAnalysisError[]>);
  
  // 严重度排序
  const severityOrder = [ErrorSeverity.CRITICAL, ErrorSeverity.HIGH, ErrorSeverity.MEDIUM, ErrorSeverity.LOW];
  
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          发现 {errors.length} 个错误
        </h3>
        {onDismiss && (
          <Button 
            onClick={onDismiss} 
            size="sm" 
            variant="ghost"
          >
            关闭全部
          </Button>
        )}
      </div>
      
      {severityOrder.map(severity => {
        const errorsOfSeverity = groupedErrors[severity];
        if (!errorsOfSeverity || errorsOfSeverity.length === 0) return null;
        
        return (
          <div key={severity} className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              {severity} 错误 ({errorsOfSeverity.length})
            </h4>
            {errorsOfSeverity.map((error, index) => (
              <ErrorDisplay
                key={error.code || index}
                error={error}
                onRetry={onRetry ? () => onRetry(error) : undefined}
                className="mb-2"
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * 紧凑型错误提示组件
 */
interface CompactErrorDisplayProps {
  error: HealthAnalysisError;
  onRetry?: () => void;
  className?: string;
}

export function CompactErrorDisplay({ error, onRetry, className }: CompactErrorDisplayProps) {
  return (
    <div className={cn(
      "flex items-center space-x-2 p-3 rounded-lg border",
      error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL
        ? "bg-red-50 border-red-200 text-red-800"
        : error.severity === ErrorSeverity.MEDIUM
        ? "bg-orange-50 border-orange-200 text-orange-800"
        : "bg-yellow-50 border-yellow-200 text-yellow-800",
      className
    )}>
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{error.message}</p>
        {error.retryable && onRetry && (
          <Button
            onClick={onRetry}
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs mt-1 p-0"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            重试
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * 内联错误提示组件（用于表单字段）
 */
interface InlineErrorDisplayProps {
  message: string;
  className?: string;
}

export function InlineErrorDisplay({ message, className }: InlineErrorDisplayProps) {
  return (
    <div className={cn(
      "flex items-center space-x-1 text-sm text-red-600 mt-1",
      className
    )}>
      <XCircle className="w-4 h-4 flex-shrink-0" />
      <span className="break-words">{message}</span>
    </div>
  );
}
