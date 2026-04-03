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
  Clock, Target, Zap, Brain, Users, Smile, LifeBuoy
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
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: '免疫力', value: analysis.healthScores?.immunity, icon: Shield },
                { label: '循环系统', value: analysis.healthScores?.circulation, icon: Heart },
                { label: '消化系统', value: analysis.healthScores?.digestion, icon: Activity },
                { label: '神经系统', value: analysis.healthScores?.nervousSystem, icon: Brain },
                { label: '能量水平', value: analysis.healthScores?.energyLevel, icon: Zap },
                { label: '气血状态', value: analysis.healthScores?.qiAndBlood, icon: Target },
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
                      <span className="font-medium">{domain}</span>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <span className="font-medium text-red-900">高风险因素</span>
                <span className="text-2xl font-bold text-red-600">
                  {analysis.riskAssessment?.highRiskFactors?.length || 0}
                </span>
              </div>
              {analysis.riskAssessment?.highRiskFactors?.length > 0 && (
                <div className="grid gap-2">
                  {analysis.riskAssessment.highRiskFactors.map((factor: string, idx: number) => (
                    <Badge key={idx} variant="destructive" className="justify-start">
                      {factor}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <span className="font-medium text-yellow-900">中等风险因素</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {analysis.riskAssessment?.moderateRiskFactors?.length || 0}
                </span>
              </div>
              {analysis.riskAssessment?.moderateRiskFactors?.length > 0 && (
                <div className="grid gap-2">
                  {analysis.riskAssessment.moderateRiskFactors.map((factor: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="justify-start bg-yellow-100 text-yellow-800">
                      {factor}
                    </Badge>
                  ))}
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
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl font-bold text-indigo-600">
                {analysis.constitutionAnalysis?.primaryConstitution}
              </div>
              <div className="flex-1">
                <div className="text-lg font-medium">主要体质类型</div>
                <div className="text-sm text-gray-600">
                  {analysis.constitutionAnalysis?.tendency?.join('、') || '无明显倾向'}
                </div>
              </div>
            </div>

            {analysis.constitutionAnalysis?.recommendations && (
              <div>
                <h4 className="font-medium mb-3">调理建议</h4>
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
