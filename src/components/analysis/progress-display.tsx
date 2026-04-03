/**
 * 健康评估系统进度组件
 * 提供可视化的进度展示
 */

'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, CheckCircle2, XCircle, Loader2, 
  AlertTriangle, Shield, Activity, Database 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalysisProgress, formatTime } from '@/lib/progress-system';

interface AnalysisProgressBarProps {
  progress: AnalysisProgress;
  className?: string;
}

/**
 * 分析进度条组件
 */
export function AnalysisProgressBar({ progress, className }: AnalysisProgressBarProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* 主进度条 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">分析进度</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-blue-600">
              {progress.percentage}%
            </span>
            <span className="text-sm text-gray-500">
              ({progress.currentStep}/{progress.totalSteps})
            </span>
          </div>
        </div>
        <Progress value={progress.percentage} className="h-3" />
      </div>
      
      {/* 预计剩余时间 */}
      {progress.estimatedTimeRemaining > 0 && !progress.steps.every(s => s.status === 'completed') && (
        <div className="text-sm text-gray-600 flex items-center bg-blue-50 px-3 py-2 rounded-lg">
          <Clock className="w-4 h-4 mr-2 text-blue-600" />
          <span>
            预计剩余时间：<span className="font-medium">{formatTime(progress.estimatedTimeRemaining)}</span>
          </span>
        </div>
      )}
      
      {/* 步骤列表 */}
      <div className="space-y-2 mt-4">
        {progress.steps.map((step, index) => (
          <StepItem key={step.id} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}

/**
 * 单个步骤组件
 */
interface StepItemProps {
  step: any;
  index: number;
}

function StepItem({ step, index }: StepItemProps) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'pending':
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };
  
  const getStatusBgColor = () => {
    switch (step.status) {
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  return (
    <div className={cn(
      "flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200",
      getStatusBgColor()
    )}>
      <div className="flex-shrink-0 mt-0.5">
        {getStatusIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className={cn(
            "text-sm font-medium",
            step.status === 'failed' ? "text-red-900" : "text-gray-900"
          )}>
            {step.name}
          </p>
          {step.icon && (
            <span className="text-gray-500 flex-shrink-0">
              {step.icon}
            </span>
          )}
        </div>
        <p className={cn(
          "text-sm mt-1",
          step.status === 'failed' ? "text-red-700" : "text-gray-500"
        )}>
          {step.description}
        </p>
        {step.status === 'failed' && step.error && (
          <p className="text-xs text-red-600 mt-2 bg-red-50 px-2 py-1 rounded">
            {step.error}
          </p>
        )}
      </div>
      
      {/* 步骤序号 */}
      <div className={cn(
        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
        step.status === 'completed' ? "bg-green-500 text-white" :
        step.status === 'processing' ? "bg-blue-500 text-white" :
        step.status === 'failed' ? "bg-red-500 text-white" :
        "bg-gray-300 text-gray-600"
      )}>
        {index + 1}
      </div>
    </div>
  );
}

/**
 * 紧凑型进度条组件
 */
export function CompactProgressBar({ progress, className }: { progress: AnalysisProgress; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">分析中...</span>
        <span className="text-sm font-semibold text-blue-600">
          {progress.percentage}%
        </span>
      </div>
      <Progress value={progress.percentage} className="h-2" />
    </div>
  );
}

/**
 * 进度卡片组件
 */
export function ProgressCard({ progress, className }: { progress: AnalysisProgress; className?: string }) {
  const currentStep = progress.steps.find(s => s.status === 'processing') || 
                      progress.steps.find(s => s.status === 'pending');
  
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-lg border border-gray-200 p-6",
      className
    )}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            健康评估分析
          </h3>
        </div>
        {progress.estimatedTimeRemaining > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {formatTime(progress.estimatedTimeRemaining)}
          </div>
        )}
      </div>
      
      {/* 当前步骤 */}
      {currentStep && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-blue-900">
              正在进行：{currentStep.name}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {currentStep.description}
          </p>
        </div>
      )}
      
      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">总体进度</span>
          <span className="font-medium text-blue-600">
            {progress.percentage}%
          </span>
        </div>
        <Progress value={progress.percentage} className="h-3" />
      </div>
      
      {/* 步骤概览 */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-gray-900">
            {progress.steps.filter(s => s.status === 'completed').length}
          </div>
          <div className="text-xs text-gray-500">已完成</div>
        </div>
        <div className="p-2 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">
            {progress.steps.filter(s => s.status === 'processing').length}
          </div>
          <div className="text-xs text-blue-500">进行中</div>
        </div>
        <div className="p-2 bg-gray-50 rounded">
          <div className="text-2xl font-bold text-gray-900">
            {progress.steps.filter(s => s.status === 'pending').length}
          </div>
          <div className="text-xs text-gray-500">待处理</div>
        </div>
        <div className="p-2 bg-red-50 rounded">
          <div className="text-2xl font-bold text-red-600">
            {progress.steps.filter(s => s.status === 'failed').length}
          </div>
          <div className="text-xs text-red-500">失败</div>
        </div>
      </div>
    </div>
  );
}
