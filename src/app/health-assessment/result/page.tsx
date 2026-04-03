'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, TrendingUp, Shield, Heart, Activity, AlertTriangle, CheckCircle2, Download, Share2 } from 'lucide-react';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [healthAnalysis, setHealthAnalysis] = useState<any>(null);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [constitutionResult, setConstitutionResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      router.push('/health-assessment');
      return;
    }

    loadResults();
  }, [sessionId]);

  const loadResults = async () => {
    setLoading(true);
    setError('');

    try {
      // 获取会话信息
      const sessionResponse = await fetch(`/api/assessment/sessions/${sessionId}`);
      const sessionDataResult = await sessionResponse.json();
      if (!sessionDataResult.success) {
        throw new Error('获取会话信息失败');
      }
      setSessionData(sessionDataResult.data);

      // 获取健康分析（不管会话是否关联，直接获取最新数据）
      try {
        const healthResponse = await fetch(`/api/health-analysis?userId=${userId}`);
        const healthData = await healthResponse.json();
        if (healthData.success && healthData.data && healthData.data.length > 0) {
          // 转换 snake_case 到 camelCase
          const raw = healthData.data[0];
          const transformed = {
            qiAndBlood: raw.qi_and_blood,
            circulation: raw.circulation,
            toxins: raw.toxins,
            bloodLipids: raw.blood_lipids,
            coldness: raw.coldness,
            immunity: raw.immunity,
            emotions: raw.emotions,
            overallHealth: raw.overall_health,
          };
          setHealthAnalysis(transformed);
        }
      } catch (err) {
        console.error('获取健康分析失败:', err);
      }

      // 获取风险评估（不管会话是否关联，直接获取最新数据）
      try {
        const riskResponse = await fetch(`/api/risk-assessment?userId=${userId}`);
        const riskData = await riskResponse.json();
        if (riskData.success && riskData.data && riskData.data.records && riskData.data.records.length > 0) {
          // 转换字段名
          const raw = riskData.data.records[0];
          const riskFactors = raw.risk_factors ? JSON.parse(raw.risk_factors) : {};
          const recommendations = raw.recommendations ? JSON.parse(raw.recommendations) : [];

          // 计算各项风险（简化版）
          const transformed = {
            overallRisk: raw.overall_risk_level,
            overallRiskLevel: raw.overall_risk_level,
            healthScore: raw.health_score,
            hypertensionRisk: riskFactors.cardiovascular?.level === 'high' ? 0.7 : (riskFactors.cardiovascular?.level === 'medium' ? 0.4 : 0.1),
            diabetesRisk: riskFactors.metabolic?.level === 'high' ? 0.6 : (riskFactors.metabolic?.level === 'medium' ? 0.3 : 0.1),
            cardiovascularRisk: riskFactors.cardiovascular?.level === 'high' ? 0.65 : (riskFactors.cardiovascular?.level === 'medium' ? 0.35 : 0.15),
            recommendations: recommendations,
            riskFactors: riskFactors,
          };
          setRiskAssessment(transformed);
        }
      } catch (err) {
        console.error('获取风险评估失败:', err);
      }

      // 获取体质分析（不管会话是否关联，直接获取最新数据）
      try {
        const constitutionResponse = await fetch(`/api/constitution-questionnaire?userId=${userId}`);
        const constitutionData = await constitutionResponse.json();
        if (constitutionData.success && constitutionData.questionnaire) {
          // 字段名已经是正确的格式
          setConstitutionResult(constitutionData.questionnaire);
        }
      } catch (err) {
        console.error('获取体质分析失败:', err);
      }

    } catch (err) {
      console.error('加载结果失败:', err);
      setError(err instanceof Error ? err.message : '加载结果失败');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return '低风险';
      case 'medium': return '中等风险';
      case 'high': return '高风险';
      default: return '未知';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载分析结果...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/health-assessment/history')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回历史
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">健康评估报告</h1>
            {sessionData?.sessionName && (
              <p className="text-gray-600 mt-1">{sessionData.sessionName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 评估日期 */}
        <div className="flex items-center justify-center space-x-2 text-gray-600 mb-8">
          <Calendar className="h-4 w-4" />
          <span>评估时间：{sessionData?.completedAt ? new Date(sessionData.completedAt).toLocaleString('zh-CN') : '-'}</span>
        </div>

        {/* 总体评分卡片 */}
        <Card className="shadow-lg border-2 mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-2xl">总体健康状况</CardTitle>
            <CardDescription>基于您提供的所有健康信息综合评估</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {healthAnalysis?.overallHealth || 0}
                </div>
                <p className="text-gray-600">健康指数</p>
                <Progress value={healthAnalysis?.overallHealth || 0} className="mt-2" />
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${getRiskColor(riskAssessment?.overallRisk || riskAssessment?.overallRiskLevel)}`}>
                  {getRiskLabel(riskAssessment?.overallRisk || riskAssessment?.overallRiskLevel)}
                </div>
                <p className="text-gray-600">风险等级</p>
                <div className="mt-2">
                  {(riskAssessment?.overallRisk === 'low' || riskAssessment?.overallRiskLevel === 'low') && <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto" />}
                  {(riskAssessment?.overallRisk === 'medium' || riskAssessment?.overallRiskLevel === 'medium') && <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto" />}
                  {(riskAssessment?.overallRisk === 'high' || riskAssessment?.overallRiskLevel === 'high') && <AlertTriangle className="h-8 w-8 text-red-600 mx-auto" />}
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {constitutionResult?.primaryConstitution || '-'}
                </div>
                <p className="text-gray-600">体质类型</p>
                <div className="flex justify-center gap-2 mt-2">
                  {constitutionResult?.secondaryConstitutions && constitutionResult.secondaryConstitutions.map((sec: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{sec}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 健康要素分析 */}
        <Card className="shadow-lg border-2 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              健康要素分析
            </CardTitle>
            <CardDescription>基于您的健康问卷分析各项健康要素</CardDescription>
          </CardHeader>
          <CardContent>
            {healthAnalysis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: '气血', value: healthAnalysis.qiAndBlood, color: 'bg-red-500' },
                  { name: '循环', value: healthAnalysis.circulation, color: 'bg-orange-500' },
                  { name: '毒素', value: healthAnalysis.toxins, color: 'bg-green-500' },
                  { name: '血脂', value: healthAnalysis.bloodLipids, color: 'bg-yellow-500' },
                  { name: '寒凉', value: healthAnalysis.coldness, color: 'bg-blue-500' },
                  { name: '免疫', value: healthAnalysis.immunity, color: 'bg-purple-500' },
                  { name: '情绪', value: healthAnalysis.emotions, color: 'bg-pink-500' },
                ].map((item) => (
                  <div key={item.name} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">{item.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{item.value}</span>
                      <Progress value={item.value} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 体质分析 */}
        <Card className="shadow-lg border-2 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              体质分析
            </CardTitle>
            <CardDescription>基于体质问卷分析您的中医体质类型</CardDescription>
          </CardHeader>
          <CardContent>
            {constitutionResult && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-lg font-semibold text-blue-900 mb-2">
                    主要体质：{constitutionResult.primary}
                  </div>
                  <p className="text-sm text-blue-800">
                    {constitutionResult.primary === '气虚质' && '气虚质的人容易疲乏，声音低弱，稍微活动就容易出汗。建议适当增加运动，注意保暖，避免过度劳累。'}
                    {constitutionResult.primary === '平和质' && '平和质是理想的体质状态，身体阴阳气血调和，体态适中，面色红润，精力充沛。继续保持良好的生活习惯。'}
                  </p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.entries(constitutionResult.scores).map(([name, score]: [string, any]) => (
                    <div
                      key={name}
                      className={`p-3 rounded-lg text-center ${
                        name === constitutionResult.primaryConstitution
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-sm text-gray-600">{name}</div>
                      <div className="text-xl font-bold">{score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 风险评估 */}
        <Card className="shadow-lg border-2 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              风险评估
            </CardTitle>
            <CardDescription>基于您的健康状况评估潜在健康风险</CardDescription>
          </CardHeader>
          <CardContent>
            {riskAssessment && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">高血压风险</div>
                    <div className="text-2xl font-bold text-red-600">
                      {Math.round((riskAssessment.hypertensionRisk || 0) * 100)}%
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">糖尿病风险</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {Math.round((riskAssessment.diabetesRisk || 0) * 100)}%
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">心血管风险</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((riskAssessment.cardiovascularRisk || 0) * 100)}%
                    </div>
                  </div>
                </div>
                {riskAssessment.recommendations && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="font-semibold text-blue-900 mb-2">改善建议：</div>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      {riskAssessment.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/health-assessment/history')}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            查看历史记录
          </Button>
          <Button
            onClick={() => router.push('/health-assessment')}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            开始新的评估
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
