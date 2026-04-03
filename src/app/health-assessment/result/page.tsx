'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Calendar, TrendingUp, Shield, Heart, Activity,
  AlertTriangle, CheckCircle2, Download, Share2, Home,
  Clock, Target, Zap, Brain, Users, Smile, LifeBuoy, Snowflake
} from 'lucide-react';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [sessionData, setSessionData] = useState<any>(null);
  const [healthAnalysis, setHealthAnalysis] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    } else {
      setError('缺少会话ID');
      setLoading(false);
    }
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      // 首先尝试从缓存或数据库获取已有的分析结果
      const response = await fetch(`/api/assessment/analyze?sessionId=${sessionId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setHealthAnalysis(data.data);
        setLoading(false);
        return;
      }

      // 如果没有已有结果，检查会话是否可以进行分析
      const sessionResponse = await fetch(`/api/assessment/sessions/${sessionId}`);
      const sessionResult = await sessionResponse.json();

      if (!sessionResult.success) {
        setError('会话不存在');
        setLoading(false);
        return;
      }

      setSessionData(sessionResult.data);

      // 检查是否可以开始分析
      if (sessionResult.data.healthQuestionnaireId && sessionResult.data.constitutionQuestionnaireId) {
        // 开始后端分析
        startAnalysis();
      } else {
        setError('请先完成健康问卷和体质问卷');
        setLoading(false);
      }

    } catch (err) {
      setError('加载数据失败');
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    setAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // 调用后端分析API
      const response = await fetch('/api/assessment/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const data = await response.json();

      if (data.success) {
        setHealthAnalysis(data.data);
      } else {
        setError(data.error || '分析失败');
      }

    } catch (err) {
      setError('分析过程中出错');
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  // 获取评分颜色
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 获取风险等级颜色
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 术语映射（英文 → 中文）
  const getTermName = (term: string): string => {
    const termMap: Record<string, string> = {
      // 生活质量领域
      physical: '身体功能',
      mental: '心理功能',
      social: '社会功能',
      emotional: '情绪健康',
      // 风险因素
      cardiovascular: '心血管',
      metabolic: '代谢',
      lifestyle: '生活方式',
      recovery: '恢复能力',
      constitution: '体质',
      // 其他
      overall: '综合',
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差'
    };
    return termMap[term] || term;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            {analyzing ? (
              <div>
                <div className="mb-4">
                  <Activity className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  正在进行健康分析...
                </h2>
                <Progress value={analysisProgress} className="max-w-md mx-auto mb-4" />
                <p className="text-gray-600">
                  {analysisProgress < 25 && '计算健康评分...'}
                  {analysisProgress >= 25 && analysisProgress < 50 && '评估健康风险...'}
                  {analysisProgress >= 50 && analysisProgress < 75 && '分析体质特征...'}
                  {analysisProgress >= 75 && '生成综合建议...'}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">加载中...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/health-assessment')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回评估
          </Button>
        </div>
      </div>
    );
  }

  const analysis = healthAnalysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/health-assessment')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">健康评估报告</h1>
              <p className="text-gray-600">
                <Calendar className="inline h-4 w-4 mr-1" />
                {new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              分享
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              下载
            </Button>
          </div>
        </div>

        {/* 综合摘要卡片 */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <Shield className="mr-2 h-6 w-6" />
              健康综合评估
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {analysis.healthScores?.overallHealth || 72}
                </div>
                <div className="text-sm opacity-90">整体健康评分</div>
              </div>
              <div className="text-center">
                <Badge className={`text-lg px-3 py-1 ${getRiskColor(analysis.riskAssessment?.riskLevel)}`}>
                  {analysis.riskAssessment?.riskLevel === 'severe' ? '极高风险' :
                   analysis.riskAssessment?.riskLevel === 'high' ? '高风险' :
                   analysis.riskAssessment?.riskLevel === 'medium' ? '中等风险' : '低风险'}
                </Badge>
                <div className="text-sm opacity-90 mt-2">风险评估</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {analysis.qualityOfLife?.overallScore || 75}
                </div>
                <div className="text-sm opacity-90">生活质量评分</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {analysis.lifeExpectancy?.expectedAge || 80}
                </div>
                <div className="text-sm opacity-90">预期年龄（岁）</div>
              </div>
            </div>

            {analysis.summary && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <h3 className="font-semibold mb-2">健康摘要</h3>
                <p className="text-white/90">{analysis.summary.overallHealth}</p>
                {analysis.summary.primaryConcerns?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">主要关注：</span>
                    {analysis.summary.primaryConcerns.map((concern: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="ml-2 text-white bg-white/20">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 健康要素分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-blue-600" />
              健康要素分析
            </CardTitle>
            <CardDescription>
              基于多维度的健康评分系统
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: '免疫力', value: analysis.healthScores?.immunity, icon: Shield },
                { label: '循环系统', value: analysis.healthScores?.circulation, icon: Heart },
                { label: '毒素清理', value: analysis.healthScores?.toxins, icon: Zap },
                { label: '血脂水平', value: analysis.healthScores?.bloodLipids, icon: Activity },
                { label: '寒性程度', value: analysis.healthScores?.coldness, icon: Snowflake },
                { label: '情绪状态', value: analysis.healthScores?.emotions, icon: Smile },
              ].filter(item => item.value !== undefined).map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <item.icon className="h-4 w-4 mr-2 text-gray-500" />
                      {item.label}
                    </span>
                    <span className={`text-2xl font-bold ${getScoreColor(item.value)}`}>
                      {item.value}
                    </span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 生活质量评估 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smile className="mr-2 h-5 w-5 text-purple-600" />
              生活质量评估
            </CardTitle>
            <CardDescription>
              身体、心理、社会和情绪健康维度
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: '身体功能', value: analysis.qualityOfLife?.physicalFunction, icon: Activity },
                { label: '心理功能', value: analysis.qualityOfLife?.mentalFunction, icon: Brain },
                { label: '社会功能', value: analysis.qualityOfLife?.socialFunction, icon: Users },
                { label: '情绪健康', value: analysis.qualityOfLife?.emotionalWellbeing, icon: Smile },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center">
                      <item.icon className="h-4 w-4 mr-2 text-gray-500" />
                      {item.label}
                    </span>
                    <span className={`text-2xl font-bold ${getScoreColor(item.value)}`}>
                      {item.value}
                    </span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>

            {analysis.qualityOfLife?.domainScores && (
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {Object.entries(analysis.qualityOfLife.domainScores).map(([domain, score]: [string, any]) => (
                  <div key={domain} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{getTermName(domain)}</span>
                      <Badge variant={score.level === 'excellent' ? 'default' : 'secondary'}>
                        {score.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{score.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 疾病史 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-600" />
              疾病史
            </CardTitle>
            <CardDescription>
              您的健康状况和既往病史
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 三高疾病 */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 ${analysis.medicalHistory?.hasHypertension ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">高血压</span>
                    <Badge variant={analysis.medicalHistory?.hasHypertension ? "destructive" : "outline"}>
                      {analysis.medicalHistory?.hasHypertension ? '有' : '无'}
                    </Badge>
                  </div>
                  {analysis.medicalHistory?.hasHypertension && analysis.medicalHistory.hypertensionYears && (
                    <p className="text-sm text-gray-600 mt-2">病程：{analysis.medicalHistory.hypertensionYears}年</p>
                  )}
                </div>

                <div className={`p-4 rounded-lg border-2 ${analysis.medicalHistory?.hasDiabetes ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">糖尿病</span>
                    <Badge variant={analysis.medicalHistory?.hasDiabetes ? "destructive" : "outline"}>
                      {analysis.medicalHistory?.hasDiabetes ? '有' : '无'}
                    </Badge>
                  </div>
                  {analysis.medicalHistory?.hasDiabetes && analysis.medicalHistory.diabetesType && (
                    <p className="text-sm text-gray-600 mt-2">类型：{analysis.medicalHistory.diabetesType}</p>
                  )}
                </div>

                <div className={`p-4 rounded-lg border-2 ${analysis.medicalHistory?.hasHyperlipidemia ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">高血脂</span>
                    <Badge variant={analysis.medicalHistory?.hasHyperlipidemia ? "destructive" : "outline"}>
                      {analysis.medicalHistory?.hasHyperlipidemia ? '有' : '无'}
                    </Badge>
                  </div>
                  {analysis.medicalHistory?.hasHyperlipidemia && analysis.medicalHistory.hyperlipidemiaYears && (
                    <p className="text-sm text-gray-600 mt-2">病程：{analysis.medicalHistory.hyperlipidemiaYears}年</p>
                  )}
                </div>
              </div>

              {/* 其他疾病 */}
              {analysis.medicalHistory?.otherDiseases && analysis.medicalHistory.otherDiseases.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">其他疾病</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.medicalHistory.otherDiseases.map((disease: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        {disease}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 症状 */}
              {analysis.medicalHistory?.symptoms && analysis.medicalHistory.symptoms.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">当前症状</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.medicalHistory.symptoms.map((symptom: string, idx: number) => (
                      <Badge key={idx} variant="outline">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 风险评估 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
              风险评估
            </CardTitle>
            <CardDescription>
              基于当前健康状况的健康风险评估
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 整体风险等级 */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600 mb-1">整体风险等级</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {analysis.riskAssessment?.overallRiskLevel === 'high' && '高风险'}
                    {analysis.riskAssessment?.overallRiskLevel === 'medium' && '中等风险'}
                    {analysis.riskAssessment?.overallRiskLevel === 'low' && '低风险'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">健康评分</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {analysis.riskAssessment?.healthScore}
                  </div>
                </div>
              </div>

              {/* 各维度风险评估 */}
              {analysis.riskAssessment?.riskFactors && (
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(analysis.riskAssessment.riskFactors).map(([key, risk]: [string, any]) => {
                    const riskName = getTermName(key);
                    const riskLevel = risk.level === 'high' ? 'high' : risk.level === 'medium' ? 'medium' : 'low';
                    return (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{riskName}</span>
                          <Badge
                            className={
                              risk.level === 'high'
                                ? 'bg-red-100 text-red-800'
                                : risk.level === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }
                          >
                            {risk.level === 'high' ? '高风险' : risk.level === 'medium' ? '中等风险' : '低风险'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{risk.description}</div>
                        {risk.score !== undefined && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>风险评分</span>
                              <span>{risk.score}/100</span>
                            </div>
                            <Progress value={risk.score} className="h-2" />
                          </div>
                        )}
                        {risk.factors && risk.factors.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs text-gray-500 mb-2">风险因素：</div>
                            <div className="flex flex-wrap gap-1">
                              {risk.factors.map((factor: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 风险建议 */}
              {analysis.riskAssessment?.recommendations && analysis.riskAssessment.recommendations.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                    针对性风险建议
                  </h4>
                  <div className="space-y-2">
                    {analysis.riskAssessment.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start text-sm">
                        <div className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                          {idx + 1}
                        </div>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 预期寿命评估 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LifeBuoy className="mr-2 h-5 w-5 text-green-600" />
              预期寿命评估
            </CardTitle>
            <CardDescription>
              基于当前健康状况的预期寿命和改善潜力
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {analysis.lifeExpectancy?.currentAge}岁
                </div>
                <div className="text-sm text-gray-600">当前年龄</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {analysis.lifeExpectancy?.expectedAge}岁
                </div>
                <div className="text-sm text-gray-600">预期年龄</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  +{analysis.lifeExpectancy?.potentialGain}年
                </div>
                <div className="text-sm text-gray-600">改善潜力</div>
              </div>
            </div>

            {analysis.lifeExpectancy?.keyFactors && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center text-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    有利因素
                  </h4>
                  <div className="space-y-2">
                    {analysis.lifeExpectancy.keyFactors.positive.map((factor: string, idx: number) => (
                      <div key={idx} className="flex items-center text-sm">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 flex items-center text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    不利因素
                  </h4>
                  <div className="space-y-2">
                    {analysis.lifeExpectancy.keyFactors.negative.map((factor: string, idx: number) => (
                      <div key={idx} className="flex items-center text-sm">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 体质问卷结果 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              体质问卷结果
            </CardTitle>
            <CardDescription>
              基于中医体质辨识的问卷结果
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.constitutionResult ? (
              <div className="space-y-6">
                {/* 主要体质 */}
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="text-sm text-gray-600 mb-1">主要体质</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {analysis.constitutionResult.primaryConstitution}
                  </div>
                </div>

                {/* 次要体质 */}
                {analysis.constitutionResult.secondaryConstitutions &&
                  analysis.constitutionResult.secondaryConstitutions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">次要体质</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.constitutionResult.secondaryConstitutions.map((constitution: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-base px-3 py-1">
                          {constitution}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 体质评分 */}
                {analysis.constitutionResult.scores && Object.keys(analysis.constitutionResult.scores).length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">体质评分</h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      {Object.entries(analysis.constitutionResult.scores).map(([type, score]: [string, any]) => {
                        const typeNames: Record<string, string> = {
                          PINGHE: '平和质',
                          QIXU: '气虚质',
                          YANGXU: '阳虚质',
                          YINXU: '阴虚质',
                          TANSHI: '痰湿质',
                          SHIRE: '湿热质',
                          XUEYU: '血瘀质',
                          QIYU: '气郁质',
                          TEBING: '特禀质'
                        };
                        const typeName = typeNames[type] || type;
                        const isMax = score === Math.max(...(Object.values(analysis.constitutionResult.scores) as number[]));

                        return (
                          <div key={type} className={`p-3 rounded-lg border-2 ${isMax ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{typeName}</span>
                              <span className={`font-bold ${isMax ? 'text-blue-600' : 'text-gray-700'}`}>{score}</span>
                            </div>
                            <Progress value={score} className={`h-2 ${isMax ? 'bg-blue-200' : ''}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                体质问卷结果不可用
              </div>
            )}
          </CardContent>
        </Card>

        {/* 体质分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5 text-indigo-600" />
              体质分析
            </CardTitle>
            <CardDescription>
              中医体质辨识与调理建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 主要体质类型 */}
              <div className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                <div className="text-4xl font-bold text-indigo-600">
                  {analysis.constitutionAnalysis?.syndromeType}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-medium">主要体质类型</div>
                  <div className="text-sm text-gray-600">
                    {analysis.constitutionAnalysis?.syndromeDescription || '无明显倾向'}
                  </div>
                </div>
              </div>

              {/* 八纲辨证 */}
              {analysis.constitutionAnalysis?.eightPrinciple && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-gray-600" />
                    八纲辨证
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm text-gray-600">阴阳</span>
                      <Badge variant="outline">{analysis.constitutionAnalysis.eightPrinciple.yinYang}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm text-gray-600">寒热</span>
                      <Badge variant="outline">{analysis.constitutionAnalysis.eightPrinciple.coldHeat}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm text-gray-600">虚实</span>
                      <Badge variant="outline">{analysis.constitutionAnalysis.eightPrinciple.deficiencyExcess}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm text-gray-600">表里</span>
                      <Badge variant="outline">{analysis.constitutionAnalysis.eightPrinciple.interiorExterior}</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* 脏腑辨证 */}
              {analysis.constitutionAnalysis?.organ && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-gray-600" />
                    脏腑辨证
                  </h4>
                  <div className="space-y-3">
                    {analysis.constitutionAnalysis.organ.primaryImbalance && (
                      <div className="p-3 bg-white rounded">
                        <div className="text-sm text-gray-600 mb-1">主要失衡</div>
                        <div className="font-bold text-red-600">{analysis.constitutionAnalysis.organ.primaryImbalance}</div>
                      </div>
                    )}
                    {analysis.constitutionAnalysis.organ.organDifferentiation && (
                      <div>
                        <div className="text-sm text-gray-600 mb-2">受累脏腑</div>
                        <div className="flex flex-wrap gap-2">
                          {analysis.constitutionAnalysis.organ.organDifferentiation.map((organ: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="px-3 py-1">
                              {organ}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 气血津液辨证 */}
              {analysis.constitutionAnalysis?.qiBloodFluid && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-gray-600" />
                    气血津液辨证
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded">
                      <div className="text-sm text-gray-600 mb-1">气</div>
                      <div className="font-medium">{analysis.constitutionAnalysis.qiBloodFluid.qiStatus}</div>
                    </div>
                    <div className="p-3 bg-white rounded">
                      <div className="text-sm text-gray-600 mb-1">血</div>
                      <div className="font-medium">{analysis.constitutionAnalysis.qiBloodFluid.bloodStatus}</div>
                    </div>
                    <div className="p-3 bg-white rounded">
                      <div className="text-sm text-gray-600 mb-1">津液</div>
                      <div className="font-medium">{analysis.constitutionAnalysis.qiBloodFluid.fluidStatus}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 治疗原则 */}
              {analysis.constitutionAnalysis?.overallPattern && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium mb-2 flex items-center text-blue-700">
                    <Target className="h-4 w-4 mr-2" />
                    治疗原则
                  </h4>
                  <p className="text-sm text-blue-900">{analysis.constitutionAnalysis.overallPattern}</p>
                </div>
              )}

              {/* 推荐方剂 */}
              {analysis.constitutionAnalysis?.herbalFormula && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium mb-2 flex items-center text-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    推荐方剂
                  </h4>
                  <p className="text-sm text-green-900">{analysis.constitutionAnalysis.herbalFormula}</p>
                </div>
              )}

              {/* 推荐穴位 */}
              {analysis.constitutionAnalysis?.acupuncturePoints && analysis.constitutionAnalysis.acupuncturePoints.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium mb-2 flex items-center text-purple-700">
                    <Target className="h-4 w-4 mr-2" />
                    推荐穴位
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.constitutionAnalysis.acupuncturePoints.map((point: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1 bg-purple-100 text-purple-800">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 调理建议 */}
              {analysis.constitutionAnalysis?.recommendations && analysis.constitutionAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Smile className="h-4 w-4 mr-2 text-green-600" />
                    调理建议
                  </h4>
                  <div className="grid gap-2">
                    {analysis.constitutionAnalysis.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start text-sm p-3 bg-gray-50 rounded">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 改善建议 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
              综合改善建议
            </CardTitle>
            <CardDescription>
              基于以上分析结果的健康改善建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.recommendations?.map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start p-4 border rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-600 text-sm font-bold mr-3 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 置信度信息 */}
        {analysis.confidence && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">评估置信度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">健康评分</div>
                  <div className="font-bold">{analysis.confidence.healthScore}%</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">风险评估</div>
                  <div className="font-bold">{analysis.confidence.riskAssessment}%</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">体质分析</div>
                  <div className="font-bold">{analysis.confidence.constitution}%</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">整体置信度</div>
                  <div className="font-bold">{analysis.confidence.overall}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 底部操作 */}
        <div className="flex justify-center space-x-4 pb-8">
          <Button 
            onClick={() => router.push('/health-assessment')}
            size="lg"
          >
            <Home className="mr-2 h-5 w-5" />
            返回首页
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push(`/health-assessment/result?sessionId=${sessionId}`)}
            size="lg"
          >
            <Activity className="mr-2 h-5 w-5" />
            重新评估
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <ResultContent />
    </Suspense>
  );
}
