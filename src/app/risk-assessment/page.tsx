'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ArrowLeft, Shield, AlertTriangle, Activity, Heart, Brain, 
  Wind, Stethoscope, Bone, Loader2, TrendingUp, FileText
} from 'lucide-react';

interface RiskFactor {
  category: string;
  riskName: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

interface RiskAssessmentResult {
  overallRisk: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'very_high';
    summary: string;
  };
  systemRisks: {
    cardiovascular: { score: number; level: string; factors: string[] };
    respiratory: { score: number; level: string; factors: string[] };
    digestive: { score: number; level: string; factors: string[] };
    endocrine: { score: number; level: string; factors: string[] };
    nervous: { score: number; level: string; factors: string[] };
    musculoskeletal: { score: number; level: string; factors: string[] };
  };
  riskFactors: RiskFactor[];
  priorityRecommendations: string[];
  lifestyleRecommendations: string[];
  medicalRecommendations: string[];
  disclaimer: string;
}

export default function RiskAssessmentPage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);

  const handleAnalyze = async () => {
    // 从localStorage获取用户ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
      alert('请先进行健康自检或填写健康问卷');
      router.push('/health-questionnaire');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userInfo: {
            age: localStorage.getItem('age'),
            gender: localStorage.getItem('gender')
          }
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert('评估失败：' + data.error);
      }
    } catch (error) {
      console.error('评估失败:', error);
      alert('评估失败，请稍后重试');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'very_high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'low':
        return '低风险';
      case 'medium':
        return '中等风险';
      case 'high':
        return '高风险';
      case 'very_high':
        return '极高风险';
      default:
        return '未知';
    }
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'cardiovascular':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'respiratory':
        return <Wind className="h-5 w-5 text-blue-500" />;
      case 'digestive':
        return <Stethoscope className="h-5 w-5 text-green-500" />;
      case 'endocrine':
        return <Activity className="h-5 w-5 text-purple-500" />;
      case 'nervous':
        return <Brain className="h-5 w-5 text-pink-500" />;
      case 'musculoskeletal':
        return <Bone className="h-5 w-5 text-orange-500" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getSystemName = (system: string) => {
    switch (system) {
      case 'cardiovascular':
        return '心血管系统';
      case 'respiratory':
        return '呼吸系统';
      case 'digestive':
        return '消化系统';
      case 'endocrine':
        return '内分泌系统';
      case 'nervous':
        return '神经系统';
      case 'musculoskeletal':
        return '肌肉骨骼系统';
      default:
        return system;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">健康风险评估</h1>
                <p className="text-sm text-gray-500">多维度综合健康风险分析</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/comprehensive-report')}
            >
              <FileText className="h-4 w-4 mr-2" />
              综合报告
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {!result ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-500" />
                开始风险评估
              </CardTitle>
              <CardDescription>
                基于您的健康数据和检测结果，进行全面的风险评估分析
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>评估说明</AlertTitle>
                <AlertDescription>
                  风险评估将综合分析您的健康问卷、各项检测指标、生活习惯等多维度数据，
                  识别潜在的健康风险因子，并提供针对性的改善建议。
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  💡 提示：系统将基于您的历史健康数据进行评估
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  建议先完成健康问卷或进行AI检测以获得更准确的评估结果
                </p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    开始风险评估
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 总体风险评估 */}
            <Card className="border-2 border-red-200 dark:border-red-900">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-red-500" />
                    总体风险评估
                  </div>
                  <Badge className={`text-white ${getRiskLevelColor(result.overallRisk.level)}`}>
                    {getRiskLevelText(result.overallRisk.level)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">综合风险评分</div>
                    <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
                      {result.overallRisk.score}
                    </div>
                    <div className="text-sm text-gray-500">满分 100</div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {result.overallRisk.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 各系统风险评估 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-blue-500" />
                  各系统风险评估
                </CardTitle>
                <CardDescription>
                  六大系统的风险评分和分析
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(result.systemRisks).map(([system, data]) => (
                    <Card key={system} className="border-2 hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSystemIcon(system)}
                            <CardTitle className="text-base">
                              {getSystemName(system)}
                            </CardTitle>
                          </div>
                          <Badge
                            variant={
                              data.level === '低风险' ? 'default' :
                              data.level === '中等风险' ? 'secondary' : 'destructive'
                            }
                          >
                            {data.level}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600 dark:text-gray-400">风险评分</span>
                              <span className="font-medium">{data.score}/100</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getRiskLevelColor(
                                  data.level === '低风险' ? 'low' :
                                  data.level === '中等风险' ? 'medium' :
                                  data.level === '高风险' ? 'high' : 'low'
                                )}`}
                                style={{ width: `${data.score}%` }}
                              />
                            </div>
                          </div>
                          {data.factors.length > 0 && (
                            <div>
                              <div className="text-xs text-gray-500 mb-1">风险因子</div>
                              <div className="flex flex-wrap gap-1">
                                {data.factors.slice(0, 3).map((factor, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {factor}
                                  </Badge>
                                ))}
                                {data.factors.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{data.factors.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 详细风险因子 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                  详细风险因子分析
                </CardTitle>
                <CardDescription>
                  识别出的具体风险因子和改善建议
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.riskFactors.map((factor, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-red-500"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                factor.severity === 'low' ? 'default' :
                                factor.severity === 'medium' ? 'secondary' : 'destructive'
                              }
                            >
                              {factor.severity === 'low' ? '低' :
                               factor.severity === 'medium' ? '中' : '高'}
                            </Badge>
                            <span className="text-sm text-gray-500">{factor.category}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {factor.riskName}
                          </h4>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {factor.description}
                      </p>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                          💡 建议：{factor.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 优先级建议 */}
            <Card className="border-2 border-purple-200 dark:border-purple-900">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                  优先级改善建议
                </CardTitle>
                <CardDescription>
                  基于风险分析，按优先级排序的改善建议
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.priorityRecommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                    >
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 生活方式建议 */}
            <Card>
              <CardHeader>
                <CardTitle>生活方式改善建议</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.lifestyleRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 医学建议 */}
            <Card>
              <CardHeader>
                <CardTitle>医学建议</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.medicalRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Stethoscope className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 免责声明 */}
            <Alert className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle className="text-yellow-800 dark:text-yellow-300">
                ⚠️ 重要提示
              </AlertTitle>
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                {result.disclaimer}
              </AlertDescription>
            </Alert>

            {/* 操作按钮 */}
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/health-profile')}
              >
                查看健康档案
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/comprehensive-report')}
              >
                查看综合报告
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                }}
              >
                重新评估
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
