'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Activity, Heart, Brain, Wind, Droplets, 
  Target, TrendingUp, Calendar, BookOpen, Utensils, 
  Dumbbell, Smile, Moon, Sparkles, Shield, AlertTriangle,
  CheckCircle2, Info, Zap, Flame, Snowflake, Sun,
  Leaf, Cherry, Apple, Fish, Wheat, Coffee, Cookie,
  Thermometer, Clock, MapPin, Users, FileText, Database
} from 'lucide-react';

// 九大体质定义
const CONSTITUTION_TYPES = {
  PINGHE: '平和质',
  QIXU: '气虚质',
  YANGXU: '阳虚质',
  YINXU: '阴虚质',
  TANSHI: '痰湿质',
  SHIRE: '湿热质',
  XUEYU: '血瘀质',
  QIYU: '气郁质',
  TEBING: '特禀质'
} as const;

// 体质图标映射
const CONSTITUTION_ICONS = {
  [CONSTITUTION_TYPES.PINGHE]: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  [CONSTITUTION_TYPES.QIXU]: <Wind className="h-6 w-6 text-yellow-500" />,
  [CONSTITUTION_TYPES.YANGXU]: <Snowflake className="h-6 w-6 text-blue-500" />,
  [CONSTITUTION_TYPES.YINXU]: <Flame className="h-6 w-6 text-red-500" />,
  [CONSTITUTION_TYPES.TANSHI]: <Droplets className="h-6 w-6 text-orange-500" />,
  [CONSTITUTION_TYPES.SHIRE]: <Sun className="h-6 w-6 text-purple-500" />,
  [CONSTITUTION_TYPES.XUEYU]: <Heart className="h-6 w-6 text-pink-500" />,
  [CONSTITUTION_TYPES.QIYU]: <Brain className="h-6 w-6 text-indigo-500" />,
  [CONSTITUTION_TYPES.TEBING]: <AlertTriangle className="h-6 w-6 text-amber-500" />
} as const;

// 体质颜色映射
const CONSTITUTION_COLORS = {
  [CONSTITUTION_TYPES.PINGHE]: 'bg-green-100 text-green-800 border-green-300',
  [CONSTITUTION_TYPES.QIXU]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  [CONSTITUTION_TYPES.YANGXU]: 'bg-blue-100 text-blue-800 border-blue-300',
  [CONSTITUTION_TYPES.YINXU]: 'bg-red-100 text-red-800 border-red-300',
  [CONSTITUTION_TYPES.TANSHI]: 'bg-orange-100 text-orange-800 border-orange-300',
  [CONSTITUTION_TYPES.SHIRE]: 'bg-purple-100 text-purple-800 border-purple-300',
  [CONSTITUTION_TYPES.XUEYU]: 'bg-pink-100 text-pink-800 border-pink-300',
  [CONSTITUTION_TYPES.QIYU]: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  [CONSTITUTION_TYPES.TEBING]: 'bg-amber-100 text-amber-800 border-amber-300'
} as const;

interface ConstitutionAnalysis {
  primaryConstitution: string;
  secondaryConstitutions: string[];
  confidence: number;
  analysisDate: string;
  scores: {
    [key: string]: number;
  };
  features: {
    [key: string]: string[];
  };
  riskFactors: string[];
  improvementPotential: number;
}

interface ConstitutionDetail {
  type: string;
  description: string;
  characteristics: string[];
  causes: string[];
  symptoms: string[];
  diseases: string[];
  psychology: string[];
  adaptation: string[];
  dietary: {
    beneficial: string[];
    harmful: string[];
  };
  exercise: {
    recommended: string[];
    intensity: string;
    frequency: string;
  };
  lifestyle: {
    sleep: string[];
    environment: string[];
    habits: string[];
  };
  emotional: {
    characteristics: string[];
    management: string[];
  };
  seasonal: {
    spring: string;
    summer: string;
    autumn: string;
    winter: string;
  };
  tcm: {
    herbs: string[];
    acupoints: string[];
    therapy: string[];
  };
  prevention: {
    diseases: string[];
    warnings: string[];
    checkups: string[];
  };
}

export default function ConstitutionAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ConstitutionAnalysis | null>(null);
  const [constitutionDetails, setConstitutionDetails] = useState<Record<string, ConstitutionDetail>>({});
  const [history, setHistory] = useState<ConstitutionAnalysis[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // 加载体质分析数据
  useEffect(() => {
    loadConstitutionData();
  }, []);

  const loadConstitutionData = async () => {
    try {
      // 加载用户最新的体质分析
      const response = await fetch('/api/constitution-analysis');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalysis(data.analysis);
          setHistory(data.history || []);
          setConstitutionDetails(data.details || {});
        }
      }
    } catch (error) {
      console.error('加载体质分析失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      // 获取用户ID
      const userId = localStorage.getItem('userId');
      
      const response = await fetch('/api/constitution-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setHistory(data.history || []);
        setConstitutionDetails(data.details || {});
        setActiveTab('overview');
      } else {
        alert('体质分析失败：' + data.error);
      }
    } catch (error) {
      console.error('体质分析失败:', error);
      alert('体质分析失败，请稍后重试');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">加载体质分析数据...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">体质分析</h1>
                <p className="text-sm text-gray-500">九大体质深度分析系统</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/health-progress')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                健康进度
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/health-profile')}
              >
                <Database className="h-4 w-4 mr-2" />
                健康档案
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {!analysis ? (
          // 初始状态：开始分析
          <Card className="max-w-3xl mx-auto border-2 border-purple-200 dark:border-purple-900">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-500" />
                中医体质分析
              </CardTitle>
              <CardDescription>
                基于多维度数据融合，全面分析您的中医体质类型
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>体质分析说明</AlertTitle>
                <AlertDescription>
                  本系统将通过以下维度综合分析您的体质：
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>AI面诊：通过面部特征识别体质征象</li>
                    <li>AI舌诊：通过舌象判断体质倾向</li>
                    <li>AI体态：通过体态特征分析体质</li>
                    <li>症状分析：基于症状判断体质类型</li>
                    <li>生活方式：生活习惯对体质的影响</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Wind className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">气虚质</div>
                  <div className="text-xs text-gray-600">气虚乏力</div>
                </div>
                <div className="text-center p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <Snowflake className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">阳虚质</div>
                  <div className="text-xs text-gray-600">阳虚畏寒</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <Flame className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">阴虚质</div>
                  <div className="text-xs text-gray-600">阴虚内热</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Droplets className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">痰湿质</div>
                  <div className="text-xs text-gray-600">痰湿重浊</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Sun className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">湿热质</div>
                  <div className="text-xs text-gray-600">湿热内蕴</div>
                </div>
                <div className="text-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">血瘀质</div>
                  <div className="text-xs text-gray-600">血瘀阻滞</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <Brain className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">气郁质</div>
                  <div className="text-xs text-gray-600">气郁不舒</div>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">特禀质</div>
                  <div className="text-xs text-gray-600">过敏体质</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-sm font-medium">平和质</div>
                  <div className="text-xs text-gray-600">健康体质</div>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    开始体质分析
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // 分析结果
          <div className="space-y-6">
            {/* 总体概览 */}
            <Card className="border-2 border-purple-200 dark:border-purple-900">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    体质分析结果
                  </div>
                  <Badge className={CONSTITUTION_COLORS[analysis.primaryConstitution as keyof typeof CONSTITUTION_COLORS]}>
                    {analysis.primaryConstitution}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  分析日期：{new Date(analysis.analysisDate).toLocaleDateString('zh-CN')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-7 mb-6">
                    <TabsTrigger value="overview">总体</TabsTrigger>
                    <TabsTrigger value="detail">详情</TabsTrigger>
                    <TabsTrigger value="diet">饮食</TabsTrigger>
                    <TabsTrigger value="exercise">运动</TabsTrigger>
                    <TabsTrigger value="lifestyle">生活</TabsTrigger>
                    <TabsTrigger value="tcm">中医</TabsTrigger>
                    <TabsTrigger value="history">历史</TabsTrigger>
                  </TabsList>

                  {/* 总体概览 */}
                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* 主体质 */}
                      <Card className="md:col-span-1 border-2 border-purple-300 dark:border-purple-700">
                        <CardHeader>
                          <CardTitle className="text-lg">主体质</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-center mb-4">
                            <div className="text-center">
                              <div className="text-6xl mb-2">
                                {CONSTITUTION_ICONS[analysis.primaryConstitution as keyof typeof CONSTITUTION_ICONS]}
                              </div>
                              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                {analysis.primaryConstitution}
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              置信度
                            </div>
                            <div className="text-3xl font-bold text-green-600">
                              {analysis.confidence}%
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 体质评分 */}
                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-lg">九大体质评分</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(analysis.scores).map(([type, score]) => (
                              <div key={type}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="flex items-center gap-2">
                                    {CONSTITUTION_ICONS[type as keyof typeof CONSTITUTION_ICONS]}
                                    <span className="font-medium">{type}</span>
                                  </span>
                                  <span className="text-gray-600">{score}分</span>
                                </div>
                                <Progress value={score} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 次要体质 */}
                    {analysis.secondaryConstitutions && analysis.secondaryConstitutions.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-500" />
                            次要体质倾向
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {analysis.secondaryConstitutions.map((type, index) => (
                              <Badge
                                key={index}
                                className={CONSTITUTION_COLORS[type as keyof typeof CONSTITUTION_COLORS]}
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* 特征分析 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">体质特征分析</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(analysis.features || {}).map(([category, features]) => (
                            <div key={category}>
                              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">{category}</h4>
                              <div className="flex flex-wrap gap-2">
                                {features.map((feature: string, idx: number) => (
                                  <Badge key={idx} variant="outline">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* 风险因子 */}
                    {analysis.riskFactors && analysis.riskFactors.length > 0 && (
                      <Alert className="border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20">
                        <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <AlertTitle className="text-orange-800 dark:text-orange-300">
                          健康风险因子
                        </AlertTitle>
                        <AlertDescription className="text-orange-700 dark:text-orange-400">
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {analysis.riskFactors.map((factor, index) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* 改善潜力 */}
                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              体质改善潜力
                            </div>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {analysis.improvementPotential}%
                            </div>
                          </div>
                          <TrendingUp className="h-12 w-12 text-green-500" />
                        </div>
                        <Progress value={analysis.improvementPotential} className="mt-4" />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 详细信息 */}
                  <TabsContent value="detail" className="space-y-6">
                    {constitutionDetails[analysis.primaryConstitution] && (
                      <ConstitutionDetailView constitution={constitutionDetails[analysis.primaryConstitution]} />
                    )}
                  </TabsContent>

                  {/* 饮食调理 */}
                  <TabsContent value="diet" className="space-y-6">
                    {constitutionDetails[analysis.primaryConstitution] && (
                      <DietaryView constitution={constitutionDetails[analysis.primaryConstitution]} />
                    )}
                  </TabsContent>

                  {/* 运动调理 */}
                  <TabsContent value="exercise" className="space-y-6">
                    {constitutionDetails[analysis.primaryConstitution] && (
                      <ExerciseView constitution={constitutionDetails[analysis.primaryConstitution]} />
                    )}
                  </TabsContent>

                  {/* 生活调理 */}
                  <TabsContent value="lifestyle" className="space-y-6">
                    {constitutionDetails[analysis.primaryConstitution] && (
                      <LifestyleView constitution={constitutionDetails[analysis.primaryConstitution]} />
                    )}
                  </TabsContent>

                  {/* 中医调理 */}
                  <TabsContent value="tcm" className="space-y-6">
                    {constitutionDetails[analysis.primaryConstitution] && (
                      <TCMView constitution={constitutionDetails[analysis.primaryConstitution]} />
                    )}
                  </TabsContent>

                  {/* 历史记录 */}
                  <TabsContent value="history" className="space-y-6">
                    <HistoryView history={history} onAnalyze={handleAnalyze} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// 体质详细视图
function ConstitutionDetailView({ constitution }: { constitution: ConstitutionDetail }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            体质描述
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">{constitution.description}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">体质特征</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {constitution.characteristics.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">形成原因</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {constitution.causes.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">常见症状</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {constitution.symptoms.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">易患疾病</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {constitution.diseases.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">心理特征</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {constitution.psychology.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Brain className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">适应能力</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {constitution.adaptation.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Activity className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 饮食调理视图
function DietaryView({ constitution }: { constitution: ConstitutionDetail }) {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-green-200 dark:border-green-900">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-green-500" />
            宜吃食物
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {constitution.dietary.beneficial.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <Apple className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-red-200 dark:border-red-900">
        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-red-500" />
            忌吃食物
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {constitution.dietary.harmful.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 运动调理视图
function ExerciseView({ constitution }: { constitution: ConstitutionDetail }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-500" />
            推荐运动
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {constitution.exercise.recommended.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">运动强度</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{constitution.exercise.intensity}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">运动频率</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{constitution.exercise.frequency}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 生活调理视图
function LifestyleView({ constitution }: { constitution: ConstitutionDetail }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-500" />
            睡眠建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {constitution.lifestyle.sleep.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-500" />
            环境建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {constitution.lifestyle.environment.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <Leaf className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">日常习惯</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {constitution.lifestyle.habits.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-pink-500" />
            情志调摄
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">情绪特征</h4>
              <ul className="space-y-2">
                {constitution.emotional.characteristics.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Brain className="h-4 w-4 text-pink-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">情绪管理</h4>
              <ul className="space-y-2">
                {constitution.emotional.management.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            季节养生
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">春季</h4>
              <p className="text-sm">{constitution.seasonal.spring}</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-medium mb-2 text-red-700 dark:text-red-300">夏季</h4>
              <p className="text-sm">{constitution.seasonal.summer}</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <h4 className="font-medium mb-2 text-amber-700 dark:text-amber-300">秋季</h4>
              <p className="text-sm">{constitution.seasonal.autumn}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-700 dark:text-blue-300">冬季</h4>
              <p className="text-sm">{constitution.seasonal.winter}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 中医调理视图
function TCMView({ constitution }: { constitution: ConstitutionDetail }) {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-amber-200 dark:border-amber-900">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-500" />
            中药调理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {constitution.tcm.herbs.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
              >
                <Leaf className="h-4 w-4 text-amber-600" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-red-200 dark:border-red-900">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-500" />
            穴位按摩
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {constitution.tcm.acupoints.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
              >
                <Activity className="h-4 w-4 text-red-500" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            疗法建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {constitution.tcm.therapy.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-2 border-orange-200 dark:border-orange-900">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-500" />
            疾病预防
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">易患疾病</h4>
              <ul className="space-y-2">
                {constitution.prevention.diseases.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">预警信号</h4>
              <ul className="space-y-2">
                {constitution.prevention.warnings.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-gray-700 dark:text-gray-300">体检建议</h4>
              <ul className="space-y-2">
                {constitution.prevention.checkups.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 历史记录视图
function HistoryView({ history, onAnalyze }: { history: ConstitutionAnalysis[], onAnalyze: () => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              体质分析历史
            </div>
            <Button onClick={onAnalyze} size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              新建分析
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">暂无历史记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <Card key={index} className="border-l-4 border-purple-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={CONSTITUTION_COLORS[record.primaryConstitution as keyof typeof CONSTITUTION_COLORS]}>
                          {record.primaryConstitution}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(record.analysisDate).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        置信度：{record.confidence}%
                      </div>
                    </div>
                    <Progress value={record.improvementPotential} className="mt-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      改善潜力：{record.improvementPotential}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
