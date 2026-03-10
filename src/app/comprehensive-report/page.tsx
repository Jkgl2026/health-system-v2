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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, FileText, Activity, Heart, AlertCircle, Loader2,
  Calendar, TrendingUp, Lightbulb, User, Target, Zap, RefreshCw,
  Wind, GitBranch, Brain, ClipboardList, Timer, Dumbbell,
  Flame, Droplets, Sparkles, Eye, ChevronRight, CheckCircle2,
  Phone, Utensils, Bike, Moon, Sun, Apple, Coffee, Salad,
  BookOpen, ShoppingBag, Package, CalendarDays, ListChecks
} from 'lucide-react';
import { BODY_SYMPTOMS, HEALTH_ELEMENTS, TWENTY_ONE_COURSES, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS_300 } from '@/lib/health-data';
import { calculateComprehensiveHealthScore } from '@/lib/health-score-calculator';

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
  diagnosis?: any;
  phases: any[];
  dailyRoutine?: any;
  dietaryGuidelines?: any;
  exercisePlan?: any[];
  lifestyleAdvice?: any[];
  contraindications?: string[];
  medicalAdvice?: any[];
}

interface ProductMatch {
  name: string;
  description: string;
  icon: any;
  color: string;
  matchScore: number;
  reasons: string[];
}

interface CourseMatch {
  id: number;
  title: string;
  content: string;
  duration: string;
  module?: string;
  relevance: 'high' | 'medium' | 'low';
}

interface SymptomCheckData {
  userInfo: any;
  bodySymptomIds: number[];
  bodySymptomNames: string[];
  badHabitIds: number[];
  badHabitNames: string[];
  symptoms300Ids: number[];
  symptoms300Names: string[];
  targetSymptomIds: number[];
  targetSymptomNames: string[];
  selectedChoice: string;
  healthScore: number;
  totalSymptoms: number;
}

// 症状分类统计
interface CategoryStats {
  [key: string]: {
    count: number;
    total: number;
    symptoms: string[];
  };
}

export default function ComprehensiveReportPage() {
  const router = useRouter();
  const [data, setData] = useState<ComprehensiveData | null>(null);
  const [symptomData, setSymptomData] = useState<SymptomCheckData | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [trainingRecommendation, setTrainingRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTreatment, setLoadingTreatment] = useState(false);
  const [loadingTraining, setLoadingTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // 1. 从localStorage加载症状自检数据
    loadSymptomData();
    
    // 2. 从API加载AI诊断数据
    await fetchReport();
    
    setLoading(false);
  };

  const loadSymptomData = () => {
    try {
      const savedUserInfo = localStorage.getItem('userInfo');
      const savedBodySymptoms = localStorage.getItem('selectedSymptoms');
      const savedBadHabits = localStorage.getItem('selectedHabitsRequirements');
      const savedSymptoms300 = localStorage.getItem('selectedSymptoms300');
      const savedTarget = localStorage.getItem('targetSymptoms') || localStorage.getItem('targetSymptom');
      const savedChoice = localStorage.getItem('selectedChoice');

      const userInfo = savedUserInfo ? JSON.parse(savedUserInfo) : null;
      const bodySymptomIds = savedBodySymptoms ? JSON.parse(savedBodySymptoms) : [];
      const badHabitIds = savedBadHabits ? JSON.parse(savedBadHabits) : [];
      const symptoms300Ids = savedSymptoms300 ? JSON.parse(savedSymptoms300) : [];
      const targetSymptomIds = savedTarget ? JSON.parse(savedTarget) : [];
      const selectedChoice = savedChoice || '';

      // 计算健康评分
      const scoreResult = calculateComprehensiveHealthScore({
        bodySymptomIds,
        habitIds: badHabitIds,
        symptom300Ids: symptoms300Ids,
      });

      // 获取症状名称
      const bodySymptomNames = bodySymptomIds
        .map((id: number) => BODY_SYMPTOMS.find(s => s.id === id)?.name)
        .filter(Boolean) as string[];

      const badHabitNames = badHabitIds
        .map((id: number) => {
          for (const category of Object.keys(BAD_HABITS_CHECKLIST)) {
            const habits = (BAD_HABITS_CHECKLIST as Record<string, { id: number; habit: string }[]>)[category];
            const habit = habits?.find(h => h.id === id);
            if (habit) return habit.habit;
          }
          return null;
        })
        .filter(Boolean) as string[];

      const symptoms300Names = symptoms300Ids
        .map((id: number) => BODY_SYMPTOMS_300.find(s => s.id === id)?.name)
        .filter(Boolean) as string[];

      const targetSymptomNames = targetSymptomIds
        .map((id: number) => BODY_SYMPTOMS.find(s => s.id === id)?.name)
        .filter(Boolean) as string[];

      setSymptomData({
        userInfo,
        bodySymptomIds,
        bodySymptomNames,
        badHabitIds,
        badHabitNames,
        symptoms300Ids,
        symptoms300Names,
        targetSymptomIds,
        targetSymptomNames,
        selectedChoice,
        healthScore: scoreResult.healthScore,
        totalSymptoms: bodySymptomIds.length + badHabitIds.length + symptoms300Ids.length,
      });
    } catch (err) {
      console.error('加载症状数据失败:', err);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await fetch('/api/comprehensive-report');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch {
      console.error('获取AI诊断报告失败');
    }
  };

  const fetchTreatmentPlan = async () => {
    if (!data?.postureDiagnosis && !data?.faceDiagnosis && !data?.tongueDiagnosis) {
      alert('请先完成至少一项AI诊断');
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

  // 获取症状分类统计
  const getSymptomCategoryStats = (): CategoryStats => {
    const stats: CategoryStats = {};
    
    symptomData?.bodySymptomIds.forEach(id => {
      const symptom = BODY_SYMPTOMS.find(s => s.id === id);
      if (symptom) {
        const category = symptom.category || '其他';
        if (!stats[category]) {
          stats[category] = { count: 0, total: 0, symptoms: [] };
        }
        stats[category].count++;
        stats[category].symptoms.push(symptom.name);
      }
    });

    // 计算每个类别的总数
    BODY_SYMPTOMS.forEach(symptom => {
      const category = symptom.category || '其他';
      if (!stats[category]) {
        stats[category] = { count: 0, total: 0, symptoms: [] };
      }
      stats[category].total++;
    });

    return stats;
  };

  // 获取习惯分类统计
  const getHabitCategoryStats = (): CategoryStats => {
    const stats: CategoryStats = {};
    
    symptomData?.badHabitIds.forEach(id => {
      for (const [category, habits] of Object.entries(BAD_HABITS_CHECKLIST)) {
        const habit = (habits as { id: number; habit: string }[]).find(h => h.id === id);
        if (habit) {
          if (!stats[category]) {
            stats[category] = { count: 0, total: 0, symptoms: [] };
          }
          stats[category].count++;
          stats[category].symptoms.push(habit.habit);
          break;
        }
      }
    });

    // 计算每个类别的总数
    for (const [category, habits] of Object.entries(BAD_HABITS_CHECKLIST)) {
      if (!stats[category]) {
        stats[category] = { count: 0, total: 0, symptoms: [] };
      }
      stats[category].total = (habits as any[]).length;
    }

    return stats;
  };

  // 获取五行分析
  const getPrimaryElements = () => {
    if (!symptomData?.bodySymptomIds) return [];
    const counts: Record<string, number> = {};
    (Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>).forEach(key => {
      const element = HEALTH_ELEMENTS[key];
      const count = element.symptoms.filter(id => symptomData.bodySymptomIds.includes(id)).length;
      if (count > 0) {
        counts[element.name] = count;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  // 获取产品推荐
  const getProductMatches = (): ProductMatch[] => {
    const primaryElements = getPrimaryElements();
    if (primaryElements.length === 0) return [];
    
    const matches: ProductMatch[] = [];
    
    const calculateMatchScore = (elementNames: string[]): number => {
      return primaryElements
        .filter(el => elementNames.includes(el.name))
        .reduce((sum, el) => sum + el.count, 0);
    };

    // 艾灸
    const aiJiuScore = calculateMatchScore(['气血', '寒凉', '循环']);
    if (aiJiuScore > 0) {
      matches.push({
        name: '艾灸调理',
        description: '通过艾灸穴位，温通经络，调和气血，驱寒除湿',
        icon: Activity,
        color: 'from-orange-500 to-red-500',
        matchScore: aiJiuScore,
        reasons: ['温通经络，促进气血运行', '驱寒除湿，改善寒凉体质', '增强免疫力', '调理慢性炎症']
      });
    }

    // 火灸
    const huoJiuScore = calculateMatchScore(['气血', '毒素', '循环']);
    if (huoJiuScore > 0) {
      matches.push({
        name: '火灸调理',
        description: '以火之力，温阳散寒，活血化瘀，祛除体内毒素',
        icon: Flame,
        color: 'from-red-500 to-orange-600',
        matchScore: huoJiuScore,
        reasons: ['强力活血化瘀', '温阳补气', '祛除毒素', '改善循环']
      });
    }

    // 正骨
    const zhengGuScore = calculateMatchScore(['循环', '气血']);
    if (zhengGuScore > 0) {
      matches.push({
        name: '正骨调理',
        description: '通过手法矫正骨骼位置，恢复脊柱生理曲度',
        icon: Target,
        color: 'from-blue-500 to-purple-500',
        matchScore: zhengGuScore,
        reasons: ['矫正骨骼位置', '解除神经压迫', '改善循环', '矫正体态']
      });
    }

    // 空腹禅
    const kongFuChanScore = calculateMatchScore(['情绪', '毒素', '气血', '血脂']);
    if (kongFuChanScore > 0) {
      matches.push({
        name: '空腹禅调理',
        description: '通过空腹禅修，净化身心，清理毒素，调和气血',
        icon: Heart,
        color: 'from-green-500 to-teal-500',
        matchScore: kongFuChanScore,
        reasons: ['净化身心', '调和气血', '平衡情绪', '改善睡眠']
      });
    }

    // 经络调理
    const jingLiaoScore = calculateMatchScore(['循环', '气血', '毒素']);
    if (jingLiaoScore > 0) {
      matches.push({
        name: '经络调理',
        description: '通过疏通经络，促进气血运行，清除淤堵',
        icon: Zap,
        color: 'from-yellow-500 to-orange-500',
        matchScore: jingLiaoScore,
        reasons: ['疏通经络', '清除淤堵', '调和脏腑', '缓解疼痛']
      });
    }

    // 药王产品
    matches.push({
      name: '药王产品',
      description: '传统药王配方产品，针对性调理您的健康问题',
      icon: Droplets,
      color: 'from-green-600 to-emerald-500',
      matchScore: primaryElements[0]?.count || 1,
      reasons: ['天然药材', '传统配方', '标本兼治', '个性化定制']
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  };

  // 获取课程推荐
  const getCourseMatches = (): CourseMatch[] => {
    const primaryElements = getPrimaryElements();
    return TWENTY_ONE_COURSES.map(course => {
      let relevance: 'high' | 'medium' | 'low' = 'medium';
      
      const primaryElementNames = primaryElements.map(el => el.name);
      if (primaryElementNames.some(e => course.title.includes(e))) {
        relevance = 'high';
      }
      
      return { ...course, relevance };
    }).sort((a, b) => {
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.relevance] - order[a.relevance];
    });
  };

  // 生成分阶段调理计划
  const getPhasedTreatmentPlan = () => {
    const primaryElements = getPrimaryElements();
    const mainElement = primaryElements[0]?.name || '气血';
    
    return [
      {
        phase: 1,
        name: '调理期',
        duration: '1-2周',
        goals: ['疏通经络', '缓解主要症状', '调整作息'],
        activities: ['基础经络疏通', '温和运动', '饮食调整'],
        products: ['艾灸调理', '经络调理'],
      },
      {
        phase: 2,
        name: '恢复期',
        duration: '2-4周',
        goals: ['修复受损组织', '增强体质', '巩固效果'],
        activities: ['针对性运动', '营养补充', '心理调适'],
        products: ['火灸调理', '药王产品'],
      },
      {
        phase: 3,
        name: '巩固期',
        duration: '1-2周',
        goals: ['稳定健康状态', '建立良好习惯', '预防复发'],
        activities: ['长期运动计划', '健康饮食', '定期复查'],
        products: ['空腹禅调理', '正骨调理'],
      },
    ];
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

  const primaryElements = getPrimaryElements();
  const productMatches = getProductMatches();
  const courseMatches = getCourseMatches();
  const symptomCategoryStats = getSymptomCategoryStats();
  const habitCategoryStats = getHabitCategoryStats();
  const phasedPlan = getPhasedTreatmentPlan();

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
              <p className="text-sm text-muted-foreground">症状自检 + AI诊断综合分析</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2">加载中...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="overview">总览</TabsTrigger>
              <TabsTrigger value="symptoms">症状自检</TabsTrigger>
              <TabsTrigger value="diagnosis">AI诊断</TabsTrigger>
              <TabsTrigger value="treatment">调理方案</TabsTrigger>
              <TabsTrigger value="recommendations">推荐</TabsTrigger>
            </TabsList>

            {/* 总览Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* 用户基本信息 */}
              {symptomData?.userInfo && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      用户基本信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xl font-bold text-blue-600 truncate">{symptomData.userInfo.name || '未填写'}</div>
                        <div className="text-sm text-muted-foreground">姓名</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{symptomData.userInfo.age || '--'}</div>
                        <div className="text-sm text-muted-foreground">年龄</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{symptomData.userInfo.gender || '--'}</div>
                        <div className="text-sm text-muted-foreground">性别</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{symptomData.userInfo.bmi || '--'}</div>
                        <div className="text-sm text-muted-foreground">BMI</div>
                      </div>
                      <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                        <div className="text-lg font-bold text-pink-600 truncate">{symptomData.userInfo.phone || '未填写'}</div>
                        <div className="text-sm text-muted-foreground">电话</div>
                      </div>
                    </div>
                    {symptomData.userInfo.height && symptomData.userInfo.weight && (
                      <div className="mt-3 text-sm text-muted-foreground text-center">
                        身高: {symptomData.userInfo.height}cm | 体重: {symptomData.userInfo.weight}kg
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 健康评分 */}
              {symptomData && (
                <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm opacity-80 mb-1">综合健康评分</div>
                        <div className="text-5xl font-bold">{symptomData.healthScore}</div>
                        <div className="text-sm opacity-80 mt-1">
                          基于{symptomData.totalSymptoms}项症状数据计算
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-white/20 text-white text-lg px-4 py-1">
                          {getScoreLevel(symptomData.healthScore).label}
                        </Badge>
                        <div className="mt-2 text-sm opacity-80">
                          {symptomData.selectedChoice && `选择方案: ${symptomData.selectedChoice}`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 核心健康指标 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    核心健康指标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{symptomData?.bodySymptomNames.length || 0}</div>
                      <div className="text-sm text-muted-foreground">身体症状</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{symptomData?.badHabitNames.length || 0}</div>
                      <div className="text-sm text-muted-foreground">不良习惯</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{symptomData?.symptoms300Names.length || 0}</div>
                      <div className="text-sm text-muted-foreground">详细症状</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{symptomData?.targetSymptomNames.length || 0}</div>
                      <div className="text-sm text-muted-foreground">重点关注</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 重点症状 */}
              {symptomData?.targetSymptomNames && symptomData.targetSymptomNames.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-red-500" />
                      重点关注的症状
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {symptomData.targetSymptomNames.map((name, i) => (
                        <Badge key={i} variant="destructive" className="text-sm">{name}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 五行分析 */}
              {primaryElements.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      五行健康分析
                    </CardTitle>
                    <CardDescription>根据症状分布分析您的健康元素倾向</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {primaryElements.map((el, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-20 text-sm font-medium">{el.name}</div>
                          <Progress value={el.count * 10} className="flex-1" />
                          <div className="text-sm text-muted-foreground">{el.count}项</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI诊断快速入口 */}
              {(data?.faceDiagnosis || data?.tongueDiagnosis || data?.postureDiagnosis) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      AI诊断结果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {data.faceDiagnosis && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                          <Activity className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                          <div className="text-sm font-medium">面诊</div>
                          <div className="text-xs text-muted-foreground">评分: {data.faceDiagnosis.score || '--'}</div>
                        </div>
                      )}
                      {data.tongueDiagnosis && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                          <Heart className="h-6 w-6 mx-auto text-red-500 mb-1" />
                          <div className="text-sm font-medium">舌诊</div>
                          <div className="text-xs text-muted-foreground">评分: {data.tongueDiagnosis.score || '--'}</div>
                        </div>
                      )}
                      {data.postureDiagnosis && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                          <Target className="h-6 w-6 mx-auto text-green-500 mb-1" />
                          <div className="text-sm font-medium">体态</div>
                          <div className="text-xs text-muted-foreground">{data.postureDiagnosis.grade || '--'}级</div>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" className="w-full mt-3" onClick={() => setActiveTab('diagnosis')}>
                      查看详细诊断
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* 快捷操作 */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/diagnosis-history')}>
                  历史记录
                </Button>
                <Button variant="outline" onClick={() => router.push('/posture-comparison')}>
                  体态对比
                </Button>
              </div>
            </TabsContent>

            {/* 症状自检Tab */}
            <TabsContent value="symptoms" className="space-y-4">
              {/* 分类统计 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    症状分类统计
                  </CardTitle>
                  <CardDescription>按身体系统分类的症状分布情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(symptomCategoryStats)
                      .filter(([, stats]) => stats.count > 0)
                      .sort((a, b) => b[1].count - a[1].count)
                      .slice(0, 8)
                      .map(([category, stats]) => (
                      <div key={category} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{category}</span>
                          <Badge variant={stats.count > 3 ? 'destructive' : 'secondary'}>
                            {stats.count}/{stats.total}
                          </Badge>
                        </div>
                        <Progress value={(stats.count / stats.total) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 习惯分类统计 */}
              {Object.keys(habitCategoryStats).filter(k => habitCategoryStats[k].count > 0).length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      不良习惯分类
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(habitCategoryStats)
                        .filter(([, stats]) => stats.count > 0)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([category, stats]) => (
                        <div key={category} className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-900/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{category}</span>
                            <Badge variant="outline" className="bg-orange-100 text-orange-700">
                              {stats.count}项
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 100项身体语言简表 */}
              {symptomData?.bodySymptomNames && symptomData.bodySymptomNames.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      身体语言简表（100项）
                    </CardTitle>
                    <CardDescription>
                      已选择 <Badge variant="secondary">{symptomData.bodySymptomNames.length}</Badge> 项
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="flex flex-wrap gap-2">
                        {symptomData.bodySymptomNames.map((name, i) => {
                          const symptom = BODY_SYMPTOMS.find(s => s.name === name);
                          const isTarget = symptomData.targetSymptomIds.includes(symptom?.id || 0);
                          return (
                            <Badge 
                              key={i} 
                              variant={isTarget ? 'destructive' : 'outline'} 
                              className={isTarget ? '' : 'bg-blue-50 text-blue-700'}
                            >
                              {isTarget && <Target className="h-3 w-3 mr-1" />}
                              {name}
                            </Badge>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* 252项不良生活习惯 */}
              {symptomData?.badHabitNames && symptomData.badHabitNames.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      不良生活习惯（252项）
                    </CardTitle>
                    <CardDescription>
                      已选择 <Badge variant="secondary">{symptomData.badHabitNames.length}</Badge> 项
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="flex flex-wrap gap-2">
                        {symptomData.badHabitNames.map((name, i) => (
                          <Badge key={i} variant="outline" className="bg-orange-50 text-orange-700">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* 300项症状表 */}
              {symptomData?.symptoms300Names && symptomData.symptoms300Names.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      详细症状表（300项）
                    </CardTitle>
                    <CardDescription>
                      已选择 <Badge variant="secondary">{symptomData.symptoms300Names.length}</Badge> 项
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="flex flex-wrap gap-2">
                        {symptomData.symptoms300Names.map((name, i) => (
                          <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {(!symptomData || (symptomData.bodySymptomNames.length === 0 && symptomData.badHabitNames.length === 0 && symptomData.symptoms300Names.length === 0)) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-muted-foreground">暂无症状自检数据</p>
                    <Button className="mt-4" onClick={() => router.push('/')}>去自检</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* AI诊断Tab */}
            <TabsContent value="diagnosis" className="space-y-4">
              {/* 面诊结果 */}
              {data?.faceDiagnosis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      面诊分析
                    </CardTitle>
                    <CardDescription>
                      {data.faceDiagnosis.createdAt && `评估时间: ${formatDate(data.faceDiagnosis.createdAt)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.faceDiagnosis.imageUrl && (
                        <img src={data.faceDiagnosis.imageUrl} alt="面诊图片" className="w-full max-w-xs mx-auto rounded-lg" />
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">{data.faceDiagnosis.score || '--'}</div>
                          <div className="text-sm text-muted-foreground">评分</div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">{data.faceDiagnosis.constitution?.type || '--'}</div>
                          <div className="text-sm text-muted-foreground">体质</div>
                        </div>
                      </div>
                      {data.faceDiagnosis.fullReport && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm whitespace-pre-wrap">
                          {data.faceDiagnosis.fullReport.substring(0, 500)}...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 舌诊结果 */}
              {data?.tongueDiagnosis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      舌诊分析
                    </CardTitle>
                    <CardDescription>
                      {data.tongueDiagnosis.createdAt && `评估时间: ${formatDate(data.tongueDiagnosis.createdAt)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.tongueDiagnosis.imageUrl && (
                        <img src={data.tongueDiagnosis.imageUrl} alt="舌诊图片" className="w-full max-w-xs mx-auto rounded-lg" />
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-red-600">{data.tongueDiagnosis.score || '--'}</div>
                          <div className="text-sm text-muted-foreground">评分</div>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-red-600">{data.tongueDiagnosis.constitution?.type || '--'}</div>
                          <div className="text-sm text-muted-foreground">体质</div>
                        </div>
                      </div>
                      {data.tongueDiagnosis.fullReport && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm whitespace-pre-wrap">
                          {data.tongueDiagnosis.fullReport.substring(0, 500)}...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 体态评估结果 */}
              {data?.postureDiagnosis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      体态评估
                    </CardTitle>
                    <CardDescription>
                      {data.postureDiagnosis.createdAt && `评估时间: ${formatDate(data.postureDiagnosis.createdAt)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{data.postureDiagnosis.score || '--'}</div>
                          <div className="text-sm text-muted-foreground">评分</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{data.postureDiagnosis.grade || '--'}</div>
                          <div className="text-sm text-muted-foreground">等级</div>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                          <div className="text-xl font-bold text-green-600">{data.postureDiagnosis.bodyStructure ? Object.keys(data.postureDiagnosis.bodyStructure).length : 0}</div>
                          <div className="text-sm text-muted-foreground">问题数</div>
                        </div>
                      </div>
                      {data.postureDiagnosis.bodyStructure && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(data.postureDiagnosis.bodyStructure)
                            .filter(([, value]: [string, any]) => value.severity && value.severity !== '无')
                            .slice(0, 6)
                            .map(([key, value]: [string, any]) => (
                              <Badge key={key} variant="outline" className="bg-red-50 text-red-700">
                                {key}: {value.severity}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI差异标注图 */}
              {data?.postureDiagnosis?.imageUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-500" />
                      AI差异标注图
                    </CardTitle>
                    <CardDescription>体态问题可视化分析</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={data.postureDiagnosis.imageUrl} 
                      alt="体态标注图" 
                      className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                    />
                    {data.postureDiagnosis.compensationPatterns && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm font-medium mb-2">补偿模式分析:</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(data.postureDiagnosis.compensationPatterns)
                            .filter(([, value]: [string, any]) => value?.present)
                            .map(([key, value]: [string, any]) => (
                              <Badge key={key} variant="outline">
                                {value?.description || key}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {(!data?.faceDiagnosis && !data?.tongueDiagnosis && !data?.postureDiagnosis) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Brain className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-muted-foreground">暂无AI诊断数据</p>
                    <p className="text-sm text-muted-foreground mt-2">请先完成面诊、舌诊或体态评估</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 调理方案Tab */}
            <TabsContent value="treatment" className="space-y-4">
              {/* 生成调理方案按钮 */}
              {(data?.faceDiagnosis || data?.tongueDiagnosis || data?.postureDiagnosis) && !treatmentPlan && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
                  <CardContent className="p-6 text-center">
                    <Dumbbell className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">生成综合调理方案</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      基于面诊、舌诊、体态评估综合分析，生成中西医结合的个性化调理方案
                    </p>
                    <Button onClick={fetchTreatmentPlan} disabled={loadingTreatment}>
                      {loadingTreatment ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      生成方案
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* 综合调理建议 */}
              {treatmentPlan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-green-500" />
                      综合调理建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {treatmentPlan.phases?.map((phase: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-green-600">第{phase.phase}阶段</Badge>
                            <span className="text-sm text-muted-foreground">{phase.duration}</span>
                          </div>
                          <div className="font-medium mb-1">{phase.name}</div>
                          {phase.goals && (
                            <div className="text-sm text-muted-foreground">
                              <span className="font-medium">目标: </span>{phase.goals.join(', ')}
                            </div>
                          )}
                          {phase.activities && (
                            <div className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">活动: </span>{phase.activities.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 饮食调理方案 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-orange-500" />
                    饮食调理方案
                  </CardTitle>
                  <CardDescription>根据您的体质和症状推荐饮食建议</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="font-medium">推荐食物</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700"><Salad className="h-3 w-3 mr-1" />新鲜蔬菜</Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700"><Apple className="h-3 w-3 mr-1" />水果</Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700">粗粮</Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700">优质蛋白</Badge>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          <span className="font-medium">忌口食物</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-red-50 text-red-700"><Coffee className="h-3 w-3 mr-1" />咖啡浓茶</Badge>
                          <Badge variant="outline" className="bg-red-50 text-red-700">辛辣刺激</Badge>
                          <Badge variant="outline" className="bg-red-50 text-red-700">油腻食物</Badge>
                          <Badge variant="outline" className="bg-red-50 text-red-700">生冷食物</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="font-medium mb-2">饮食原则</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 三餐规律，细嚼慢咽</li>
                        <li>• 清淡为主，少盐少油</li>
                        <li>• 多喝温水，促进代谢</li>
                        <li>• 晚餐七分饱，避免夜宵</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 运动调理方案 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bike className="h-5 w-5 text-blue-500" />
                    运动调理方案
                  </CardTitle>
                  <CardDescription>适合您当前体质的运动建议</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <Sun className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                        <div className="font-medium">有氧运动</div>
                        <div className="text-sm text-muted-foreground mt-1">快走、慢跑、游泳</div>
                        <div className="text-sm text-blue-600 mt-1">每周3-5次，30分钟/次</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <Dumbbell className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                        <div className="font-medium">力量训练</div>
                        <div className="text-sm text-muted-foreground mt-1">核心训练、体态矫正</div>
                        <div className="text-sm text-blue-600 mt-1">每周2-3次，20分钟/次</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <Wind className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <div className="font-medium">放松拉伸</div>
                        <div className="text-sm text-muted-foreground mt-1">瑜伽、太极、拉伸</div>
                        <div className="text-sm text-blue-600 mt-1">每天10-15分钟</div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-medium mb-2">运动注意事项</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 循序渐进，避免过度劳累</li>
                        <li>• 运动前热身，运动后拉伸</li>
                        <li>• 保持呼吸顺畅，不要憋气</li>
                        <li>• 如有不适立即停止</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 生活习惯建议 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    生活习惯建议
                  </CardTitle>
                  <CardDescription>改善日常习惯，促进健康恢复</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Moon className="h-5 w-5 text-indigo-500" />
                        <span className="font-medium">睡眠管理</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 晚上11点前入睡</li>
                        <li>• 保证7-8小时睡眠</li>
                        <li>• 睡前避免使用电子设备</li>
                        <li>• 保持卧室安静、黑暗</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">作息规律</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 定时起床，不赖床</li>
                        <li>• 午休不超过30分钟</li>
                        <li>• 避免长时间久坐</li>
                        <li>• 每小时起身活动5分钟</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">饮水建议</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 每天饮水1500-2000ml</li>
                        <li>• 早起一杯温水</li>
                        <li>• 少量多次饮用</li>
                        <li>• 避免饭后立即大量饮水</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        <span className="font-medium">情绪管理</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 保持心情愉悦</li>
                        <li>• 学会压力释放</li>
                        <li>• 适当参加社交活动</li>
                        <li>• 培养兴趣爱好</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(!data?.faceDiagnosis && !data?.tongueDiagnosis && !data?.postureDiagnosis) && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-muted-foreground">请先完成AI诊断以生成调理方案</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 推荐Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              {/* 个性化推荐说明 */}
              <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">个性化推荐说明</h3>
                      <p className="text-sm text-muted-foreground">
                        以下推荐基于您的症状自检数据和AI诊断结果综合分析得出。我们根据您的五行体质倾向、
                        主要健康问题以及生活习惯，为您精选了最适合的调理产品和健康课程。
                        推荐按匹配度排序，匹配度越高表示越适合您当前的健康状况。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 您的选择方案 */}
              {symptomData?.selectedChoice && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ListChecks className="h-5 w-5 text-green-500" />
                      您的选择方案
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-lg">{symptomData.selectedChoice}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        这是您在自检过程中选择的调理方案方向，我们已据此为您优化了推荐内容。
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 分阶段调理计划 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-blue-500" />
                    分阶段调理计划
                  </CardTitle>
                  <CardDescription>系统化的健康调理路线图</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {phasedPlan.map((phase, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              phase.phase === 1 ? 'bg-blue-500' : 
                              phase.phase === 2 ? 'bg-green-500' : 'bg-purple-500'
                            }`}>
                              第{phase.phase}阶段
                            </Badge>
                            <span className="font-medium">{phase.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{phase.duration}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">目标</div>
                            <div className="flex flex-wrap gap-1">
                              {phase.goals.map((goal, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{goal}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">活动</div>
                            <div className="flex flex-wrap gap-1">
                              {phase.activities.map((activity, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{activity}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">推荐产品</div>
                            <div className="flex flex-wrap gap-1">
                              {phase.products.map((product, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700">{product}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 产品推荐 */}
              {productMatches.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-yellow-500" />
                      产品推荐
                    </CardTitle>
                    <CardDescription>根据您的症状分析，为您推荐以下调理方案</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {productMatches.slice(0, 6).map((product, idx) => (
                        <div key={idx} className={`p-4 rounded-lg bg-gradient-to-r ${product.color} text-white`}>
                          <div className="flex items-start gap-3">
                            <product.icon className="h-8 w-8 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{product.name}</div>
                                <Badge className="bg-white/20 text-white">
                                  匹配度 {Math.min(95, product.matchScore * 10)}%
                                </Badge>
                              </div>
                              <div className="text-sm opacity-90 mt-1">{product.description}</div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {product.reasons.slice(0, 3).map((reason, i) => (
                                  <span key={i} className="text-xs bg-white/20 px-2 py-1 rounded">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 课程推荐 */}
              {courseMatches.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      课程推荐
                    </CardTitle>
                    <CardDescription>21门健康课程，助您改善健康状况</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      <div className="space-y-2">
                        {courseMatches.slice(0, 15).map((course, idx) => (
                          <div 
                            key={idx} 
                            className={`p-3 rounded-lg border ${
                              course.relevance === 'high' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                              course.relevance === 'medium' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                              'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{course.title}</span>
                              </div>
                              <Badge variant={
                                course.relevance === 'high' ? 'default' : 
                                course.relevance === 'medium' ? 'secondary' : 'outline'
                              }>
                                {course.relevance === 'high' ? '强烈推荐' : 
                                 course.relevance === 'medium' ? '推荐' : '可选'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {course.duration}
                              </span>
                              {course.module && (
                                <span className="flex items-center gap-1">
                                  <GitBranch className="h-3 w-3" />
                                  {course.module}
                                </span>
                              )}
                            </div>
                            {course.content && (
                              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {course.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {productMatches.length === 0 && courseMatches.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Lightbulb className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-muted-foreground">完成症状自检后可查看个性化推荐</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

// 添加缺失的图标导入
function BarChart3({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 3v18h18"/>
      <path d="M18 17V9"/>
      <path d="M13 17V5"/>
      <path d="M8 17v-3"/>
    </svg>
  );
}
