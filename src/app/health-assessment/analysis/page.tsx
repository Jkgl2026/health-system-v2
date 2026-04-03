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
  constitution: any;
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

    try {
      // 步骤1: 获取会话信息
      setCurrentStep('获取会话信息');
      setProgress(10);

      const sessionResponse = await fetch(`/api/assessment/sessions/${sessionId}`);
      const sessionData = await sessionResponse.json();

      if (!sessionData.success) {
        throw new Error('获取会话信息失败');
      }

      const session = sessionData.data;

      // 步骤2: 获取健康问卷数据
      setCurrentStep('读取健康问卷数据');
      setProgress(20);

      let healthQuestionnaire = null;
      if (session.health_questionnaire_id) {
        const healthResponse = await fetch(`/api/health-questionnaire/${session.health_questionnaire_id}`);
        const healthData = await healthResponse.json();
        if (healthData.success) {
          healthQuestionnaire = healthData.data;
        }
      }

      // 步骤3: 获取体质问卷数据
      setCurrentStep('读取体质问卷数据');
      setProgress(30);

      let constitutionQuestionnaire = null;
      if (session.constitution_questionnaire_id) {
        const constitutionResponse = await fetch(`/api/constitution-questionnaire?userId=${userId}`);
        const constitutionData = await constitutionResponse.json();
        if (constitutionData.success && constitutionData.questionnaire) {
          constitutionQuestionnaire = constitutionData.questionnaire;
        }
      }

      // 步骤4: 分析健康要素并保存
      setCurrentStep('分析健康要素');
      setProgress(50);

      // 根据健康问卷计算各要素评分
      const healthAnalysisData = calculateHealthAnalysis(healthQuestionnaire, constitutionQuestionnaire);

      const healthAnalysisResponse = await fetch('/api/health-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          ...healthAnalysisData
        }),
      });

      const healthResult = await healthAnalysisResponse.json();
      if (!healthResult.success) {
        throw new Error(healthResult.error || '健康分析失败');
      }

      // 步骤5: 评估健康风险并保存
      setCurrentStep('评估健康风险');
      setProgress(70);

      const riskAssessmentData = calculateRiskAssessment(healthQuestionnaire, constitutionQuestionnaire, healthAnalysisData);

      const riskResponse = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          ...riskAssessmentData
        }),
      });

      const riskResult = await riskResponse.json();
      if (!riskResult.success) {
        throw new Error(riskResult.error || '风险评估失败');
      }

      // 步骤6: 更新会话状态
      setCurrentStep('保存分析结果');
      setProgress(90);

      await fetch(`/api/assessment/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthAnalysisId: healthResult.data.id,
          riskAssessmentId: riskResult.data.id,
          status: 'completed',
        }),
      });

      setCurrentStep('完成');
      setProgress(100);

      setAnalysisData({
        healthAnalysis: healthResult.data,
        riskAssessment: riskResult.data,
        constitution: constitutionQuestionnaire,
      });

    } catch (err) {
      console.error('分析失败:', err);
      setError(err instanceof Error ? err.message : '分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 计算健康要素分析
  const calculateHealthAnalysis = (healthData: any, constitutionData: any) => {
    // 基于健康问卷计算各要素评分（简单实现）
    const scores = {
      qiAndBlood: 75,
      circulation: 70,
      toxins: 65,
      bloodLipids: 70,
      coldness: 68,
      immunity: 72,
      emotions: 75,
      overallHealth: 72,
    };

    // 根据实际问卷数据调整分数
    if (healthData) {
      // 运动频率加分
      if (healthData.exercise_frequency === '每周3-5次' || healthData.exercise_frequency === '每周6次以上') {
        scores.circulation += 10;
        scores.immunity += 10;
      } else if (healthData.exercise_frequency === '从不运动') {
        scores.circulation -= 15;
        scores.immunity -= 10;
      }

      // 睡眠质量影响
      if (healthData.sleep_quality === '很好') {
        scores.immunity += 10;
        scores.emotions += 5;
      } else if (healthData.sleep_quality === '较差' || healthData.sleep_quality === '很差') {
        scores.immunity -= 10;
        scores.emotions -= 10;
      }

      // 疾病史影响
      if (healthData.has_hypertension || healthData.has_diabetes || healthData.has_hyperlipidemia) {
        scores.circulation -= 20;
        scores.bloodLipids -= 15;
      }

      // BMI影响
      const bmi = healthData.bmi;
      if (bmi) {
        if (bmi < 18.5 || bmi > 28) {
          scores.immunity -= 10;
        }
      }
    }

    // 限制分数在0-100之间
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.max(0, Math.min(100, scores[key as keyof typeof scores]));
    });

    return scores;
  };

  // 计算风险评估
  const calculateRiskAssessment = (healthData: any, constitutionData: any, analysisData: any) => {
    const riskFactors: any = {};
    const recommendations: string[] = [];

    // 基于健康数据评估风险
    if (healthData) {
      // 高血压风险
      if (healthData.has_hypertension) {
        riskFactors.cardiovascular = {
          level: 'high',
          description: '有高血压病史，心血管风险较高'
        };
        recommendations.push('定期监测血压，遵医嘱用药');
      } else {
        riskFactors.cardiovascular = {
          level: 'low',
          description: '无明显心血管疾病史'
        };
      }

      // 糖尿病风险
      if (healthData.has_diabetes) {
        riskFactors.metabolic = {
          level: 'high',
          description: '有糖尿病病史，代谢风险较高'
        };
        recommendations.push('控制饮食，定期监测血糖');
      }

      // 缺乏运动风险
      if (healthData.exercise_frequency === '从不运动') {
        riskFactors.lifestyle = {
          level: 'medium',
          description: '缺乏运动，影响整体健康'
        };
        recommendations.push('建议每周进行至少3次中等强度运动');
      }

      // 睡眠问题风险
      if (healthData.sleep_quality === '较差' || healthData.sleep_quality === '很差') {
        riskFactors.recovery = {
          level: 'medium',
          description: '睡眠质量不佳，影响身体恢复'
        };
        recommendations.push('改善睡眠习惯，保证7-8小时睡眠');
      }
    }

    // 体质相关风险
    if (constitutionData && constitutionData.primaryConstitution) {
      if (constitutionData.primaryConstitution !== '平和质') {
        riskFactors.constitution = {
          level: 'medium',
          description: `体质为${constitutionData.primaryConstitution}，需要针对性调理`
        };
        recommendations.push(`根据${constitutionData.primaryConstitution}的特点进行养生调理`);
      }
    }

    // 计算总体健康分数和风险等级
    const overallHealthScore = analysisData.overallHealth || 70;
    let overallRiskLevel = 'low';

    if (riskFactors.cardiovascular?.level === 'high' || riskFactors.metabolic?.level === 'high') {
      overallRiskLevel = 'high';
    } else if (Object.values(riskFactors).some((r: any) => r.level === 'medium')) {
      overallRiskLevel = 'medium';
    }

    if (overallHealthScore < 60) {
      overallRiskLevel = 'high';
    } else if (overallHealthScore < 80) {
      overallRiskLevel = 'medium';
    }

    return {
      overallRiskLevel,
      healthScore: overallHealthScore,
      riskFactors,
      recommendations,
      notes: ''
    };
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
