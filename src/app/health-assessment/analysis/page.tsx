'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Activity, TrendingUp, Shield, Heart } from 'lucide-react';

interface AnalysisData {
  healthAnalysis: any;
  riskAssessment: any;
}

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      router.push('/health-assessment');
    }
  }, [sessionId, router]);

  useEffect(() => {
    generateAnalysis();
  }, [sessionId]);

  const generateAnalysis = async () => {
    setLoading(true);
    setError('');

    const steps = [
      { name: '获取会话信息', progress: 10 },
      { name: '分析健康要素', progress: 30 },
      { name: '评估健康风险', progress: 50 },
      { name: '生成综合报告', progress: 70 },
      { name: '保存分析结果', progress: 90 },
      { name: '完成', progress: 100 },
    ];

    try {
      for (const step of steps) {
        setCurrentStep(step.name);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 800)); // 模拟处理时间
      }

      // 调用健康分析API
      const healthResponse = await fetch('/api/health-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId }),
      });

      const healthData = await healthResponse.json();
      if (!healthData.success) {
        throw new Error(healthData.error || '健康分析失败');
      }

      // 调用风险评估API
      const riskResponse = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId }),
      });

      const riskData = await riskResponse.json();
      if (!riskData.success) {
        throw new Error(riskData.error || '风险评估失败');
      }

      // 更新会话
      await fetch(`/api/assessment/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthAnalysisId: healthData.data.id,
          riskAssessmentId: riskData.data.id,
          status: 'completed',
        }),
      });

      setAnalysisData({
        healthAnalysis: healthData.data,
        riskAssessment: riskData.data,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleViewResults = () => {
    router.push(`/health-assessment/result?sessionId=${sessionId}&userId=${userId}`);
  };

  const handleViewHistory = () => {
    router.push(`/health-assessment/history`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          {/* 头部 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">正在分析您的健康状况</h1>
            <p className="text-gray-600">系统正在综合分析您的健康数据</p>
          </div>

          {/* 分析卡片 */}
          <Card className="shadow-lg border-2">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* 进度条 */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">{currentStep}</span>
                    <span className="text-gray-900 font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>

                {/* 加载动画 */}
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                  </div>
                  <p className="text-gray-600 text-lg">
                    {progress < 30 && '正在读取您的问卷数据...'}
                    {progress >= 30 && progress < 60 && '正在分析健康要素...'}
                    {progress >= 60 && progress < 80 && '正在评估潜在风险...'}
                    {progress >= 80 && '正在生成综合报告...'}
                  </p>
                </div>

                {/* 提示信息 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 text-center">
                    <strong>分析内容：</strong>
                    健康要素分析（气血、循环、毒素、血脂、寒凉、免疫、情绪）+ 体质分析 + 风险评估
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="w-full">
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* 成功提示 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">分析完成！</h1>
          <p className="text-gray-600">您的健康评估报告已生成</p>
        </div>

        {/* 分析摘要卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">健康要素分析</p>
                  <p className="text-2xl font-bold text-green-700">已完成</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">体质分析</p>
                  <p className="text-2xl font-bold text-blue-700">已完成</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">风险评估</p>
                  <p className="text-2xl font-bold text-purple-700">已完成</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Heart className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">综合报告</p>
                  <p className="text-2xl font-bold text-red-700">已生成</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 下一步提示 */}
        <Card className="shadow-lg border-2 mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-900">
                🎉 恭喜！您已成功完成健康评估
              </p>
              <p className="text-gray-600">
                您可以查看详细的分析结果，包括健康要素评分、体质类型、潜在风险以及改善建议
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button
            onClick={handleViewResults}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            查看详细报告
          </Button>
          <Button
            onClick={handleViewHistory}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            查看历史记录
          </Button>
        </div>

        {/* 返回首页提示 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>您可以随时返回首页进行新的评估</p>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
