'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, TrendingUp, Shield, Heart, Activity, AlertTriangle, CheckCircle2, Download, Share2, Home } from 'lucide-react';

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

  // 计算健康要素分析
  const calculateHealthAnalysis = (healthData: any, constitutionData: any) => {
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

    if (healthData) {
      // 使用snake_case字段名
      if (healthData.exercise_frequency === '每周3-5次' || healthData.exercise_frequency === '每周6次以上') {
        scores.circulation += 10;
        scores.immunity += 10;
      } else if (healthData.exercise_frequency === '从不运动') {
        scores.circulation -= 15;
        scores.immunity -= 10;
      }

      if (healthData.sleep_quality === '很好') {
        scores.immunity += 10;
        scores.emotions += 5;
      } else if (healthData.sleep_quality === '较差' || healthData.sleep_quality === '很差') {
        scores.immunity -= 10;
        scores.emotions -= 10;
      }

      if (healthData.has_hypertension || healthData.has_diabetes || healthData.has_hyperlipidemia) {
        scores.circulation -= 20;
        scores.bloodLipids -= 15;
      }

      const bmi = healthData.bmi;
      if (bmi) {
        if (bmi < 18.5 || bmi > 28) {
          scores.immunity -= 10;
        }
      }
    }

    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.max(0, Math.min(100, scores[key as keyof typeof scores]));
    });

    return scores;
  };

  // 计算风险评估
  const calculateRiskAssessment = (healthData: any, constitutionData: any, analysisData: any) => {
    const riskFactors: any = {};
    const recommendations: string[] = [];

    if (healthData) {
      // 使用snake_case字段名
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

      if (healthData.has_diabetes) {
        riskFactors.metabolic = {
          level: 'high',
          description: '有糖尿病病史，代谢风险较高'
        };
        recommendations.push('控制饮食，定期监测血糖');
      }

      if (healthData.exercise_frequency === '从不运动') {
        riskFactors.lifestyle = {
          level: 'medium',
          description: '缺乏运动，影响整体健康'
        };
        recommendations.push('建议每周进行至少3次中等强度运动');
      }

      if (healthData.sleep_quality === '较差' || healthData.sleep_quality === '很差') {
        riskFactors.recovery = {
          level: 'medium',
          description: '睡眠质量不佳，影响身体恢复'
        };
        recommendations.push('改善睡眠习惯，保证7-8小时睡眠');
      }
    }

    if (constitutionData && constitutionData.primaryConstitution) {
      if (constitutionData.primaryConstitution !== '平和质') {
        riskFactors.constitution = {
          level: 'medium',
          description: `体质为${constitutionData.primaryConstitution}，需要针对性调理`
        };
        recommendations.push(`根据${constitutionData.primaryConstitution}的特点进行养生调理`);
      }
    }

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

      // 如果没有健康分析和风险评估数据，立即生成
      if (!healthAnalysis || !riskAssessment) {
        try {
          console.log('检测到缺少健康分析或风险评估数据，开始生成...');
          await generateMissingData(sessionId, userId);
          // 重新加载数据
          await reloadData(userId);
        } catch (err) {
          console.error('自动生成数据失败:', err);
        }
      }

    } catch (err) {
      console.error('加载结果失败:', err);
      setError(err instanceof Error ? err.message : '加载结果失败');
    } finally {
      setLoading(false);
    }
  };

  const reloadData = async (uid: string) => {
    try {
      const healthResponse = await fetch(`/api/health-analysis?userId=${uid}`);
      const healthData = await healthResponse.json();
      if (healthData.success && healthData.data && healthData.data.length > 0) {
        const raw = healthData.data[0];
        setHealthAnalysis({
          qiAndBlood: raw.qi_and_blood,
          circulation: raw.circulation,
          toxins: raw.toxins,
          bloodLipids: raw.blood_lipids,
          coldness: raw.coldness,
          immunity: raw.immunity,
          emotions: raw.emotions,
          overallHealth: raw.overall_health,
        });
      }

      const riskResponse = await fetch(`/api/risk-assessment?userId=${uid}`);
      const riskData = await riskResponse.json();
      if (riskData.success && riskData.data && riskData.data.records && riskData.data.records.length > 0) {
        const raw = riskData.data.records[0];
        const riskFactors = raw.risk_factors ? JSON.parse(raw.risk_factors) : {};
        const recommendations = raw.recommendations ? JSON.parse(raw.recommendations) : [];
        setRiskAssessment({
          overallRisk: raw.overall_risk_level,
          overallRiskLevel: raw.overall_risk_level,
          healthScore: raw.health_score,
          hypertensionRisk: riskFactors.cardiovascular?.level === 'high' ? 0.7 : (riskFactors.cardiovascular?.level === 'medium' ? 0.4 : 0.1),
          diabetesRisk: riskFactors.metabolic?.level === 'high' ? 0.6 : (riskFactors.metabolic?.level === 'medium' ? 0.3 : 0.1),
          cardiovascularRisk: riskFactors.cardiovascular?.level === 'high' ? 0.65 : (riskFactors.cardiovascular?.level === 'medium' ? 0.35 : 0.15),
          recommendations: recommendations,
          riskFactors: riskFactors,
        });
      }
    } catch (err) {
      console.error('重新加载数据失败:', err);
    }
  };

  const generateMissingData = async (sid: string, uid: string) => {
    try {
      // 获取健康问卷数据（通过会话关联或获取最新）
      let healthQuestionnaire: any = null;
      if (sessionData?.health_questionnaire_id) {
        const healthResponse = await fetch(`/api/health-questionnaire/${sessionData.health_questionnaire_id}`);
        const healthResp = await healthResponse.json();
        if (healthResp.success) {
          healthQuestionnaire = healthResp.data;
        }
      }
      if (!healthQuestionnaire) {
        // 获取最新的健康问卷
        const healthResponse = await fetch(`/api/health-questionnaire?userId=${uid}&limit=1`);
        const healthResp = await healthResponse.json();
        if (healthResp.success && healthResp.data.records.length > 0) {
          healthQuestionnaire = healthResp.data.records[0];
        }
      }

      // 获取体质问卷数据
      const constitutionResponse = await fetch(`/api/constitution-questionnaire?userId=${uid}`);
      const constitutionData = await constitutionResponse.json();
      const constitutionQuestionnaire = constitutionData.success ? constitutionData.questionnaire : null;

      if (!healthQuestionnaire && !constitutionQuestionnaire) {
        throw new Error('没有可用的问卷数据');
      }

      // 计算健康要素分析
      const healthAnalysisData = calculateHealthAnalysis(healthQuestionnaire, constitutionQuestionnaire);

      const healthAnalysisResponse = await fetch('/api/health-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          sessionId: sid,
          ...healthAnalysisData
        }),
      });

      const healthResult = await healthAnalysisResponse.json();
      if (healthResult.success) {
        await fetch(`/api/assessment/sessions/${sid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            healthAnalysisId: healthResult.data.id,
          }),
        });
      }

      // 计算风险评估
      const riskAssessmentData = calculateRiskAssessment(healthQuestionnaire, constitutionQuestionnaire, healthAnalysisData);

      const riskResponse = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          sessionId: sid,
          ...riskAssessmentData
        }),
      });

      const riskResult = await riskResponse.json();
      if (riskResult.success) {
        await fetch(`/api/assessment/sessions/${sid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            riskAssessmentId: riskResult.data.id,
            status: 'completed',
          }),
        });
      }

      console.log('自动生成数据完成');
    } catch (err) {
      console.error('生成数据失败:', err);
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
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              首页
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/health-assessment/history')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回历史
            </Button>
          </div>
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
