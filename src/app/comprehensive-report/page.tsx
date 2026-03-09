'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, FileText, Activity, Heart, AlertCircle, Loader2,
  Calendar, TrendingUp, Lightbulb, User, Target, Zap, RefreshCw,
  Wind, GitBranch, Brain, ClipboardList, Timer, Dumbbell
} from 'lucide-react';

interface ComprehensiveData {
  faceDiagnosis: any;
  tongueDiagnosis: any;
  postureDiagnosis: any;
  comprehensiveAnalysis: {
    overallScore: number | null;
    organStatus: Record<string, { face: number | null; tongue: number | null }>;
    constitution: { type: string; description?: string } | null;
    postureGrade: string | null;
    postureScore: number | null;
    recommendations: Array<{ text: string }>;
  };
  healthProfile: any;
  generatedAt: string;
}

interface TreatmentPlan {
  diagnosis?: {
    summary: string;
    constitution: { type: string; description: string; evidence: string[] };
    primaryIssues: Array<{ issue: string; severity: string; source: string; interconnections: string[] }>;
    rootCauses: Array<{ cause: string; evidence: string; impact: string }>;
    interconnectedFactors: Array<{ factor1: string; factor2: string; relationship: string; mechanism: string }>;
  };
  phases: Array<{
    phase: number;
    name: string;
    duration: string;
    goals: string[];
    zhengfu?: any;
    benyuan?: any;
    tcm?: {
      acupressure?: { points: string[]; method: string; frequency: string; duration: string };
      moxibustion?: { points: string[]; duration: string; frequency: string; cautions: string[] };
      herbalTea?: string[];
      dietaryTherapy?: string[];
    };
    lifestyle?: {
      posture?: string[];
      habits?: string[];
      environment?: string[];
    };
    expectedOutcome?: string;
  }>;
  dailyRoutine?: {
    morning?: Array<{ time: string; activity: string; duration: string; purpose: string }>;
    daytime?: Array<{ time: string; activity: string; duration: string; purpose: string }>;
    evening?: Array<{ time: string; activity: string; duration: string; purpose: string }>;
    anytime?: Array<{ activity: string; duration: string; purpose: string }>;
  };
  dietaryGuidelines?: {
    principles?: string[];
    recommended?: string[];
    avoid?: string[];
  };
  contraindications?: string[];
  medicalAdvice?: Array<{ condition: string; department: string; urgency: string }>;
}

export default function ComprehensiveReportPage() {
  const router = useRouter();
  const [data, setData] = useState<ComprehensiveData | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [trainingRecommendation, setTrainingRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTreatment, setLoadingTreatment] = useState(false);
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/comprehensive-report');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || '获取报告失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const fetchTreatmentPlan = async () => {
    if (!data?.postureDiagnosis && !data?.faceDiagnosis && !data?.tongueDiagnosis) {
      alert('请先完成至少一项诊断');
      return;
    }
    
    setLoadingTreatment(true);
    try {
      const response = await fetch('/api/comprehensive-treatment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current' }),
      });
      const result = await response.json();
      if (result.success) {
        setTreatmentPlan(result.data.treatmentPlan);
        setActiveTab('treatment');
      } else {
        alert(result.error || '生成调理方案失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setLoadingTreatment(false);
    }
  };

  const fetchTrainingRecommendation = async () => {
    if (!data?.postureDiagnosis?.id) {
      alert('请先完成体态评估');
      return;
    }
    
    setLoadingTraining(true);
    try {
      const response = await fetch('/api/training-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'current',
          diagnosisRecordId: data.postureDiagnosis.id,
          phase: 'all',
        }),
      });
      const result = await response.json();
      if (result.success) {
        setTrainingRecommendation(result.data);
      } else {
        alert(result.error || '生成训练推荐失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setLoadingTraining(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { label: '优秀', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { label: '良好', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 70) return { label: '一般', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 60) return { label: '欠佳', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: '需关注', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />返回
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">综合健康报告</h1>
              <p className="text-sm text-muted-foreground">面诊与舌诊综合分析</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        ) : !data ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无数据</p>
              <p className="text-sm mt-2">请先进行面诊、舌诊或体态评估</p>
              <div className="flex justify-center gap-2 mt-4 flex-wrap">
                <Button onClick={() => router.push('/tongue-diagnosis')}>开始舌诊</Button>
                <Button variant="outline" onClick={() => router.push('/face-diagnosis')}>开始面诊</Button>
                <Button variant="outline" onClick={() => router.push('/posture-diagnosis')}>开始体态评估</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 报告头部 */}
            <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-80">综合健康评分</div>
                    <div className="text-5xl font-bold mt-2">
                      {data.comprehensiveAnalysis.overallScore || '-'}
                    </div>
                    {data.comprehensiveAnalysis.overallScore && (
                      <div className={`text-lg mt-2 ${
                        getScoreLevel(data.comprehensiveAnalysis.overallScore).color.replace('text-', 'text-')
                      }`}>
                        {getScoreLevel(data.comprehensiveAnalysis.overallScore).label}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm opacity-80">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="h-4 w-4" />
                      报告生成时间
                    </div>
                    <div className="mt-1">{formatDate(data.generatedAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 诊断来源 */}
            <div className="grid grid-cols-3 gap-3">
              <Card className={data.faceDiagnosis ? '' : 'opacity-50'}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      面
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">面诊分析</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {data.faceDiagnosis 
                          ? `${data.faceDiagnosis.score || '-'}分`
                          : '暂无'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={data.tongueDiagnosis ? '' : 'opacity-50'}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      舌
                    </div>
                    <div className="flex-1 min-width-0">
                      <div className="text-xs font-medium">舌诊分析</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {data.tongueDiagnosis 
                          ? `${data.tongueDiagnosis.score || '-'}分`
                          : '暂无'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={data.postureDiagnosis ? '' : 'opacity-50'}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      体
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">体态评估</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {data.postureDiagnosis 
                          ? `${data.postureDiagnosis.score || '-'}分 (${data.postureDiagnosis.grade || '-'}级)`
                          : '暂无'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 体态评估详情 */}
            {data.postureDiagnosis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    体态评估结果
                  </CardTitle>
                  <CardDescription>
                    评估时间: {formatDate(data.postureDiagnosis.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        {data.postureDiagnosis.score || '-'}
                      </div>
                      <div className="text-xs text-gray-500">体态评分</div>
                    </div>
                    <div className="text-center p-3 bg-cyan-50 rounded-lg">
                      <Badge className={`text-lg ${
                        data.postureDiagnosis.grade === 'A' ? 'bg-green-500' :
                        data.postureDiagnosis.grade === 'B' ? 'bg-blue-500' :
                        data.postureDiagnosis.grade === 'C' ? 'bg-yellow-500' :
                        data.postureDiagnosis.grade === 'D' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}>
                        {data.postureDiagnosis.grade || '-'}级
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">体态等级</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Target className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                      <div className="text-xs text-gray-500">
                        {data.postureDiagnosis.bodyStructure ? 
                          Object.keys(data.postureDiagnosis.bodyStructure).length + '个部位' : 
                          '-'}
                      </div>
                      <div className="text-xs text-gray-500">结构评估</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Zap className="h-6 w-6 mx-auto text-green-500 mb-1" />
                      <div className="text-xs text-gray-500">
                        {data.postureDiagnosis.treatmentPlan ? '已生成' : '-'}
                      </div>
                      <div className="text-xs text-gray-500">调理方案</div>
                    </div>
                  </div>
                  
                  {/* 主要问题 */}
                  {data.postureDiagnosis.bodyStructure && (
                    <div>
                      <div className="text-sm font-medium mb-2">主要体态问题</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(data.postureDiagnosis.bodyStructure)
                          .filter(([, value]: [string, any]) => value.severity && value.severity !== '无')
                          .slice(0, 5)
                          .map(([key, value]: [string, any]) => (
                            <Badge key={key} variant="outline" className="bg-red-50 text-red-700">
                              {key}: {value.severity}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 深度评估分析 */}
            {data.postureDiagnosis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    深度评估分析
                  </CardTitle>
                  <CardDescription>筋膜链、呼吸模式、代偿识别、健康预测</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="fascia" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="fascia">筋膜链</TabsTrigger>
                      <TabsTrigger value="breathing">呼吸模式</TabsTrigger>
                      <TabsTrigger value="compensation">代偿模式</TabsTrigger>
                      <TabsTrigger value="prediction">健康预测</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="fascia" className="mt-4">
                      {data.postureDiagnosis.fasciaChainAnalysis ? (
                        <div className="space-y-3">
                          {[
                            { key: 'frontLine', name: '前表链', icon: '⬆️' },
                            { key: 'backLine', name: '后表链', icon: '⬇️' },
                            { key: 'lateralLine', name: '体侧链', icon: '↔️' },
                            { key: 'spiralLine', name: '螺旋链', icon: '🌀' },
                            { key: 'armLine', name: '手臂链', icon: '💪' },
                            { key: 'deepFrontLine', name: '深前线', icon: '🔬' },
                          ].map((chain) => {
                            const data2 = (data.postureDiagnosis.fasciaChainAnalysis as any)?.[chain.key];
                            if (!data2) return null;
                            return (
                              <div key={chain.key} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">{chain.icon}</span>
                                  <span className="font-medium">{chain.name}</span>
                                  {data2.tension && (
                                    <Badge variant={data2.tension.includes('紧张') ? 'destructive' : 'secondary'}>
                                      {data2.tension}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">{data2.status || '-'}</div>
                                {data2.issues && data2.issues.length > 0 && (
                                  <div className="mt-2 text-xs text-red-600">
                                    问题: {data2.issues.join(', ')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>暂无筋膜链评估数据</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="breathing" className="mt-4">
                      {data.postureDiagnosis.breathingAssessment ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                              <Wind className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                              <div className="text-sm text-muted-foreground">呼吸模式</div>
                              <div className="font-medium">{(data.postureDiagnosis.breathingAssessment as any).pattern || '-'}</div>
                            </div>
                            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-center">
                              <Activity className="h-8 w-8 mx-auto text-cyan-500 mb-2" />
                              <div className="text-sm text-muted-foreground">膈肌功能</div>
                              <div className="font-medium">{(data.postureDiagnosis.breathingAssessment as any).diaphragm || '-'}</div>
                            </div>
                          </div>
                          {(data.postureDiagnosis.breathingAssessment as any).issues && (
                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                              <div className="text-sm font-medium text-orange-700 mb-1">识别问题</div>
                              <ul className="text-sm text-orange-600 list-disc list-inside">
                                {((data.postureDiagnosis.breathingAssessment as any).issues || []).map((issue: string, i: number) => (
                                  <li key={i}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {(data.postureDiagnosis.breathingAssessment as any).impact && (
                            <div className="text-sm text-muted-foreground p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                              <strong>对体态影响:</strong> {(data.postureDiagnosis.breathingAssessment as any).impact}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Wind className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>暂无呼吸模式评估数据</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="compensation" className="mt-4">
                      {data.postureDiagnosis.compensationPatterns && (data.postureDiagnosis.compensationPatterns as any[]).length > 0 ? (
                        <div className="space-y-3">
                          {((data.postureDiagnosis.compensationPatterns as any[]) || []).map((pattern: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{pattern.name}</span>
                                <Badge variant={pattern.severity === '高' ? 'destructive' : pattern.severity === '中' ? 'default' : 'secondary'}>
                                  {pattern.severity}风险
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-1">{pattern.description}</div>
                              <div className="text-xs"><strong>原因:</strong> {pattern.cause}</div>
                              <div className="text-xs"><strong>影响区域:</strong> {pattern.affectedArea}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>暂无代偿模式识别数据</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="prediction" className="mt-4">
                      {data.postureDiagnosis.healthPrediction ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Timer className="h-5 w-5 text-red-500" />
                              <span className="font-medium text-red-700">短期预测 (3个月内)</span>
                            </div>
                            <p className="text-sm text-red-600">{(data.postureDiagnosis.healthPrediction as any).shortTerm || '-'}</p>
                          </div>
                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Timer className="h-5 w-5 text-orange-500" />
                              <span className="font-medium text-orange-700">中期预测 (1年内)</span>
                            </div>
                            <p className="text-sm text-orange-600">{(data.postureDiagnosis.healthPrediction as any).midTerm || '-'}</p>
                          </div>
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Timer className="h-5 w-5 text-yellow-500" />
                              <span className="font-medium text-yellow-700">长期预测 (3年以上)</span>
                            </div>
                            <p className="text-sm text-yellow-600">{(data.postureDiagnosis.healthPrediction as any).longTerm || '-'}</p>
                          </div>
                          {(data.postureDiagnosis.healthPrediction as any).preventiveMeasures && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="text-sm font-medium text-green-700 mb-1">预防措施</div>
                              <ul className="text-sm text-green-600 list-disc list-inside">
                                {((data.postureDiagnosis.healthPrediction as any).preventiveMeasures || []).map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Timer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>暂无健康预测数据</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* 训练推荐按钮 */}
            {data?.postureDiagnosis && (
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">个性化训练推荐</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        基于体态评估结果，智能推荐整复训练和本源训练动作
                      </p>
                    </div>
                    <Button 
                      onClick={fetchTrainingRecommendation}
                      disabled={loadingTraining}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      {loadingTraining ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          生成训练
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 训练推荐展示 */}
            {trainingRecommendation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-blue-500" />
                    个性化训练推荐
                  </CardTitle>
                  <CardDescription>基于体态评估的定制化训练方案</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 优先问题 */}
                    {trainingRecommendation.priorityIssues && trainingRecommendation.priorityIssues.length > 0 && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-sm font-medium text-red-700 mb-2">优先解决问题</div>
                        <div className="flex flex-wrap gap-2">
                          {trainingRecommendation.priorityIssues.map((issue: string, i: number) => (
                            <Badge key={i} variant="destructive">{issue}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 推荐训练 */}
                    {trainingRecommendation.recommendedSessions && trainingRecommendation.recommendedSessions.length > 0 && (
                      <div className="space-y-4">
                        {trainingRecommendation.recommendedSessions.map((session: any, idx: number) => (
                          <Card key={idx}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant={session.type === '整复训练' ? 'default' : 'secondary'}>
                                    {session.type}
                                  </Badge>
                                  <span className="font-medium">{session.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{session.duration}</span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-xs text-muted-foreground mb-3">建议频率: {session.frequency}</div>
                              
                              {session.goals && session.goals.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-xs font-medium mb-1">训练目标</div>
                                  <div className="flex flex-wrap gap-1">
                                    {session.goals.map((goal: string, i: number) => (
                                      <Badge key={i} variant="outline" className="text-xs">{goal}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                <div className="text-xs font-medium">训练动作</div>
                                {session.exercises && session.exercises.map((ex: any, i: number) => (
                                  <div key={i} className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                                    <div className="flex justify-between items-start">
                                      <span className="font-medium">{ex.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {ex.sets}组 × {ex.reps}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      休息: {ex.restTime} | {ex.notes}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {/* 预计时间线和关键要点 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {trainingRecommendation.estimatedTimeline && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-xs font-medium text-blue-700 mb-1">预计改善时间</div>
                          <div className="text-sm text-blue-600">{trainingRecommendation.estimatedTimeline}</div>
                        </div>
                      )}
                      {trainingRecommendation.keyPoints && trainingRecommendation.keyPoints.length > 0 && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-xs font-medium text-green-700 mb-1">关键要点</div>
                          <ul className="text-xs text-green-600 list-disc list-inside">
                            {trainingRecommendation.keyPoints.map((point: string, i: number) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* 注意事项 */}
                    {trainingRecommendation.cautions && trainingRecommendation.cautions.length > 0 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-xs font-medium text-orange-700 mb-1">注意事项</div>
                        <ul className="text-xs text-orange-600 list-disc list-inside">
                          {trainingRecommendation.cautions.map((caution: string, i: number) => (
                            <li key={i}>{caution}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 综合调理方案按钮 */}
            {(data?.faceDiagnosis || data?.tongueDiagnosis || data?.postureDiagnosis) && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Dumbbell className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-700 dark:text-green-300">综合调理方案</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        基于面诊、舌诊、体态综合分析，生成中西医结合的个性化调理方案
                      </p>
                    </div>
                    <Button 
                      onClick={fetchTreatmentPlan}
                      disabled={loadingTreatment}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      {loadingTreatment ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          生成方案
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 综合调理方案展示 */}
            {treatmentPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-green-500" />
                    综合调理方案
                  </CardTitle>
                  <CardDescription>中西医结合个性化调理建议</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="treatment">调理方案</TabsTrigger>
                      <TabsTrigger value="daily">每日清单</TabsTrigger>
                      <TabsTrigger value="diet">饮食建议</TabsTrigger>
                      <TabsTrigger value="cautions">注意事项</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="treatment" className="mt-4">
                      {treatmentPlan.phases && treatmentPlan.phases.length > 0 ? (
                        <div className="space-y-4">
                          {treatmentPlan.phases.map((phase, index) => (
                            <Card key={index}>
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">第{phase.phase}阶段</Badge>
                                    <span className="font-medium">{phase.name}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{phase.duration}</span>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {/* 阶段目标 */}
                                  {phase.goals && phase.goals.length > 0 && (
                                    <div>
                                      <div className="text-sm font-medium mb-1">阶段目标</div>
                                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                                        {phase.goals.map((goal, i) => <li key={i}>{goal}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {/* 整复训练 */}
                                  {phase.zhengfu && (
                                    <div>
                                      <div className="text-sm font-medium mb-1 flex items-center gap-1">
                                        <Target className="h-4 w-4 text-blue-500" />
                                        整复训练
                                      </div>
                                      <div className="text-xs text-muted-foreground mb-2">频率: {phase.zhengfu.frequency}</div>
                                      {phase.zhengfu.sessions && phase.zhengfu.sessions.map((session: any, i: number) => (
                                        <div key={i} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded mb-2">
                                          <div className="font-medium text-sm">{session.name}</div>
                                          {session.exercises && session.exercises.map((ex: any, j: number) => (
                                            <div key={j} className="text-xs text-muted-foreground mt-1">
                                              • {ex.name}: {ex.method?.substring(0, 50)}...
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* 本源训练 */}
                                  {phase.benyuan && (
                                    <div>
                                      <div className="text-sm font-medium mb-1 flex items-center gap-1">
                                        <Zap className="h-4 w-4 text-green-500" />
                                        本源训练
                                      </div>
                                      <div className="text-xs text-muted-foreground mb-2">频率: {phase.benyuan.frequency}</div>
                                      {phase.benyuan.sessions && phase.benyuan.sessions.map((session: any, i: number) => (
                                        <div key={i} className="p-2 bg-green-50 dark:bg-green-900/20 rounded mb-2">
                                          <div className="font-medium text-sm">{session.name}</div>
                                          {session.exercises && session.exercises.map((ex: any, j: number) => (
                                            <div key={j} className="text-xs text-muted-foreground mt-1">
                                              • {ex.name}: {ex.method?.substring(0, 50)}...
                                            </div>
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  
                                  {/* 中医调理 */}
                                  {phase.tcm && (
                                    <div>
                                      <div className="text-sm font-medium mb-1 flex items-center gap-1">
                                        <Heart className="h-4 w-4 text-red-500" />
                                        中医调理
                                      </div>
                                      {phase.tcm.acupressure && (
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded mb-2">
                                          <div className="text-xs font-medium">穴位按摩</div>
                                          <div className="text-xs text-muted-foreground">
                                            穴位: {phase.tcm.acupressure.points?.join(', ')}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            方法: {phase.tcm.acupressure.method}
                                          </div>
                                        </div>
                                      )}
                                      {phase.tcm.herbalTea && phase.tcm.herbalTea.length > 0 && (
                                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded mb-2">
                                          <div className="text-xs font-medium">代茶饮</div>
                                          <div className="text-xs text-muted-foreground">
                                            {phase.tcm.herbalTea.join('、')}
                                          </div>
                                        </div>
                                      )}
                                      {phase.tcm.dietaryTherapy && phase.tcm.dietaryTherapy.length > 0 && (
                                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                          <div className="text-xs font-medium">食疗建议</div>
                                          <div className="text-xs text-muted-foreground">
                                            {phase.tcm.dietaryTherapy.join('、')}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* 生活方式 */}
                                  {phase.lifestyle && (
                                    <div>
                                      <div className="text-sm font-medium mb-1">生活方式调整</div>
                                      {phase.lifestyle.posture && phase.lifestyle.posture.length > 0 && (
                                        <div className="text-xs text-muted-foreground mb-1">
                                          姿势: {phase.lifestyle.posture.join('; ')}
                                        </div>
                                      )}
                                      {phase.lifestyle.habits && phase.lifestyle.habits.length > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                          习惯: {phase.lifestyle.habits.join('; ')}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* 预期效果 */}
                                  {phase.expectedOutcome && (
                                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded">
                                      <div className="text-xs font-medium text-emerald-700">预期效果</div>
                                      <div className="text-xs text-emerald-600">{phase.expectedOutcome}</div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">暂无分阶段方案</div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="daily" className="mt-4">
                      {treatmentPlan.dailyRoutine ? (
                        <div className="space-y-4">
                          {treatmentPlan.dailyRoutine.morning && treatmentPlan.dailyRoutine.morning.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2 flex items-center gap-1">
                                <span className="text-lg">🌅</span> 早晨
                              </div>
                              {treatmentPlan.dailyRoutine.morning.map((item, i) => (
                                <div key={i} className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded mb-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{item.activity}</span>
                                    <span className="text-muted-foreground">{item.time}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">{item.purpose}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {treatmentPlan.dailyRoutine.daytime && treatmentPlan.dailyRoutine.daytime.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2 flex items-center gap-1">
                                <span className="text-lg">☀️</span> 白天
                              </div>
                              {treatmentPlan.dailyRoutine.daytime.map((item, i) => (
                                <div key={i} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded mb-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{item.activity}</span>
                                    <span className="text-muted-foreground">{item.time}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">{item.purpose}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {treatmentPlan.dailyRoutine.evening && treatmentPlan.dailyRoutine.evening.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2 flex items-center gap-1">
                                <span className="text-lg">🌙</span> 晚上
                              </div>
                              {treatmentPlan.dailyRoutine.evening.map((item, i) => (
                                <div key={i} className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded mb-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{item.activity}</span>
                                    <span className="text-muted-foreground">{item.time}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">{item.purpose}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {treatmentPlan.dailyRoutine.anytime && treatmentPlan.dailyRoutine.anytime.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2 flex items-center gap-1">
                                <span className="text-lg">⏰</span> 随时可行
                              </div>
                              {treatmentPlan.dailyRoutine.anytime.map((item, i) => (
                                <div key={i} className="p-2 bg-gray-50 dark:bg-gray-900/20 rounded mb-2">
                                  <div className="text-sm font-medium">{item.activity}</div>
                                  <div className="text-xs text-muted-foreground">{item.purpose}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">暂无每日清单</div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="diet" className="mt-4">
                      {treatmentPlan.dietaryGuidelines ? (
                        <div className="space-y-4">
                          {treatmentPlan.dietaryGuidelines.principles && treatmentPlan.dietaryGuidelines.principles.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2">饮食原则</div>
                              <ul className="text-sm text-muted-foreground list-disc list-inside">
                                {treatmentPlan.dietaryGuidelines.principles.map((p, i) => <li key={i}>{p}</li>)}
                              </ul>
                            </div>
                          )}
                          {treatmentPlan.dietaryGuidelines.recommended && treatmentPlan.dietaryGuidelines.recommended.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2 text-green-600">推荐食物</div>
                              <div className="flex flex-wrap gap-2">
                                {treatmentPlan.dietaryGuidelines.recommended.map((food, i) => (
                                  <Badge key={i} variant="outline" className="bg-green-50 text-green-700">{food}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {treatmentPlan.dietaryGuidelines.avoid && treatmentPlan.dietaryGuidelines.avoid.length > 0 && (
                            <div>
                              <div className="text-sm font-medium mb-2 text-red-600">避免食物</div>
                              <div className="flex flex-wrap gap-2">
                                {treatmentPlan.dietaryGuidelines.avoid.map((food, i) => (
                                  <Badge key={i} variant="outline" className="bg-red-50 text-red-700">{food}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">暂无饮食建议</div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="cautions" className="mt-4">
                      <div className="space-y-4">
                        {treatmentPlan.contraindications && treatmentPlan.contraindications.length > 0 && (
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-sm font-medium text-red-700 mb-2">禁忌事项</div>
                            <ul className="text-sm text-red-600 list-disc list-inside">
                              {treatmentPlan.contraindications.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                          </div>
                        )}
                        {treatmentPlan.medicalAdvice && treatmentPlan.medicalAdvice.length > 0 && (
                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-sm font-medium text-orange-700 mb-2">就医建议</div>
                            {treatmentPlan.medicalAdvice.map((advice, i) => (
                              <div key={i} className="mb-2 p-2 bg-white dark:bg-gray-800 rounded">
                                <div className="flex justify-between text-sm">
                                  <span>{advice.condition}</span>
                                  <Badge variant={advice.urgency === '立即' ? 'destructive' : 'secondary'}>
                                    {advice.urgency}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">建议科室: {advice.department}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* 五脏健康状态 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  五脏健康状态
                </CardTitle>
                <CardDescription>面诊与舌诊综合评估</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: 'heart', name: '心', icon: '❤️' },
                    { key: 'liver', name: '肝', icon: '🍃' },
                    { key: 'spleen', name: '脾', icon: '🌾' },
                    { key: 'lung', name: '肺', icon: '💨' },
                    { key: 'kidney', name: '肾', icon: '💧' },
                  ].map((organ) => {
                    const status = data.comprehensiveAnalysis.organStatus[organ.key];
                    const avgValue = status.face && status.tongue 
                      ? Math.round((status.face + status.tongue) / 2)
                      : status.face || status.tongue;
                    return (
                      <div key={organ.key} className="flex items-center gap-4">
                        <div className="w-12 text-center">
                          <div className="text-2xl">{organ.icon}</div>
                          <div className="text-sm">{organ.name}</div>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">面诊</div>
                            <div className={`text-lg font-bold ${status.face ? '' : 'text-gray-400'}`}>
                              {status.face || '-'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">舌诊</div>
                            <div className={`text-lg font-bold ${status.tongue ? '' : 'text-gray-400'}`}>
                              {status.tongue || '-'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">综合</div>
                            <div className={`text-lg font-bold ${
                              avgValue 
                                ? avgValue >= 80 ? 'text-green-600' 
                                  : avgValue >= 60 ? 'text-yellow-600' 
                                  : 'text-red-600'
                                : 'text-gray-400'
                            }`}>
                              {avgValue || '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 体质判断 */}
            {data.comprehensiveAnalysis.constitution && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    体质判断
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      {data.comprehensiveAnalysis.constitution.type}
                    </div>
                    {data.comprehensiveAnalysis.constitution.description && (
                      <div className="text-sm text-muted-foreground mt-2">
                        {data.comprehensiveAnalysis.constitution.description}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 健康建议 */}
            {data.comprehensiveAnalysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    健康改善建议
                  </CardTitle>
                  <CardDescription>基于综合分析生成的健康建议</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.comprehensiveAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          {index + 1}
                        </div>
                        <div className="flex-1 text-sm">{rec.text}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 详细报告 */}
            {(data.faceDiagnosis?.full_report || data.tongueDiagnosis?.full_report) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">详细诊断报告</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.faceDiagnosis?.full_report && (
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-teal-500 rounded text-white text-xs flex items-center justify-center">面</div>
                        面诊详细报告
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{data.faceDiagnosis.full_report}</pre>
                      </div>
                    </div>
                  )}
                  {data.tongueDiagnosis?.full_report && (
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded text-white text-xs flex items-center justify-center">舌</div>
                        舌诊详细报告
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{data.tongueDiagnosis.full_report}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 底部操作 */}
            <div className="flex justify-center gap-3 flex-wrap">
              <Button variant="outline" onClick={() => router.push('/health-progress')}>
                <TrendingUp className="h-4 w-4 mr-2" />改善进度
              </Button>
              <Button variant="outline" onClick={() => router.push('/diagnosis-history')}>
                历史记录
              </Button>
              <Button variant="outline" onClick={() => router.push('/posture-comparison')}>
                体态对比
              </Button>
              <Button variant="outline" onClick={() => router.push('/training-center')}>
                训练中心
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
