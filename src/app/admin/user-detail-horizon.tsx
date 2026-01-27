'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Users, FileText, Activity, CheckCircle, AlertCircle, Eye, X, TrendingUp, Target, HelpCircle, RefreshCw, Sparkles, Flame, Heart, Zap, Droplets, BookOpen, AlertTriangle, Calculator, Info, PieChart, Shield, Star, Clock, Award, Globe, Leaf, TreePine, Menu, Utensils, Coffee, Car, Smartphone, Tv, Moon, Sun, Wind, Droplet, Thermometer, Apple, Salad, Fish, Milk, Wheat, Beef, Egg, Sprout, Dumbbell, HeartHandshake, Brain, Eye, Smile, LayoutGrid, ShoppingBag } from 'lucide-react';
import { SEVEN_QUESTIONS, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS, BODY_SYMPTOMS_300, TWENTY_ONE_COURSES, HEALTH_ELEMENTS } from '@/lib/health-data';

interface UserFullData {
  user: any;
  symptomChecks: any[];
  healthAnalysis: any[];
  userChoices: any[];
  requirements: any;
}

interface UserDetailHorizonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: UserFullData | null;
}

// 健康改善路径阶段
const HEALTH_IMPROVEMENT_STAGES = [
  {
    stage: 1,
    title: '急救调理期',
    duration: '1-2周',
    goal: '快速缓解症状',
    actions: [
      '补充气血，增强体力',
      '促进循环，缓解疼痛',
      '清热解毒，改善炎症',
      '祛湿散寒，改善体质'
    ]
  },
  {
    stage: 2,
    title: '修复恢复期',
    duration: '2-4周',
    goal: '修复受损组织',
    actions: [
      '强化脏腑功能',
      '恢复代谢平衡',
      '提升免疫力',
      '改善微循环'
    ]
  },
  {
    stage: 3,
    title: '巩固增强期',
    duration: '4-8周',
    goal: '巩固调理效果',
    actions: [
      '建立健康生活习惯',
      '稳定各项指标',
      '增强体质储备',
      '预防问题复发'
    ]
  },
  {
    stage: 4,
    title: '健康维护期',
    duration: '长期',
    goal: '维持健康状态',
    actions: [
      '定期自检监测',
      '保持健康生活方式',
      '及时调理轻微不适',
      '预防潜在健康风险'
    ]
  }
];

// 推荐调理产品
const RECOMMENDED_PRODUCTS = [
  {
    id: 1,
    name: '气血双补胶囊',
    category: '气血调理',
    benefits: '改善气血不足，增强体质',
    icon: Heart,
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 2,
    name: '活血通络贴',
    category: '循环改善',
    benefits: '促进血液循环，缓解疼痛',
    icon: Activity,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 3,
    name: '清湿排毒茶',
    category: '排毒养颜',
    benefits: '清除体内毒素，改善皮肤',
    icon: Leaf,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 4,
    name: '降脂调理片',
    category: '血脂调节',
    benefits: '调节血脂，保护心血管',
    icon: Shield,
    color: 'bg-purple-100 text-purple-600'
  }
];

// 格式化日期
const formatDate = (dateStr: string | Date | null) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function UserDetailHorizon({ open, onOpenChange, userData }: UserDetailHorizonProps) {
  const [loading, setLoading] = useState(false);
  const [showTCMDetails, setShowTCMDetails] = useState(false);

  // 获取最新的身体语言检查
  const getLatestSymptomCheck = () => {
    if (!userData || !userData.symptomChecks || userData.symptomChecks.length === 0) return null;
    return userData.symptomChecks[userData.symptomChecks.length - 1];
  };

  // 获取最新的健康要素分析
  const getLatestHealthAnalysis = () => {
    if (!userData || !userData.healthAnalysis || userData.healthAnalysis.length === 0) return null;
    return userData.healthAnalysis[userData.healthAnalysis.length - 1];
  };

  // 中医深入分析
  const analyzeTCMHealth = () => {
    if (!userData) return null;

    const latestSymptomCheck = getLatestSymptomCheck();
    const badHabits = userData.requirements?.badHabitsChecklist || [];
    const symptoms300 = userData.requirements?.symptoms300Checklist || [];

    const bodySymptomIds = latestSymptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || [];
    const habitIds = Array.isArray(badHabits) ? badHabits.map((id: any) => parseInt(id)) : [];
    const symptom300Ids = Array.isArray(symptoms300) ? symptoms300.map((id: any) => parseInt(id)) : [];

    const totalSymptoms = bodySymptomIds.length + habitIds.length + symptom300Ids.length;

    // 体质辨识
    const getConstitution = () => {
      if (totalSymptoms < 10) return { type: '平和质', color: 'green', desc: '阴阳气血调和，体态适中，面色红润，精力充沛' };
      if (totalSymptoms < 20) return { type: '气虚质', color: 'blue', desc: '元气不足，疲乏无力，气短懒言，易出汗，易感冒' };
      if (totalSymptoms < 30) return { type: '痰湿质', color: 'yellow', desc: '体内湿气重，体型肥胖，胸闷痰多，身重不爽' };
      if (totalSymptoms < 40) return { type: '湿热质', color: 'orange', desc: '湿热内蕴，面垢油光，易生痤疮，口苦口臭，大便黏滞' };
      return { type: '血瘀质', color: 'red', desc: '气血运行不畅，肤色晦暗，易有瘀斑，痛经，舌质紫暗' };
    };

    // 气血状态分析
    const getQiBloodStatus = () => {
      const hasFatigue = bodySymptomIds.some(id => [1, 3, 4, 14, 58].includes(id));
      const hasShortness = bodySymptomIds.some(id => [40, 48].includes(id));
      const hasPalpitation = bodySymptomIds.some(id => [49].includes(id));

      if (hasFatigue && hasShortness) return { type: '气血两虚', color: 'red', desc: '面色苍白，乏力少气，心悸失眠，动则气喘' };
      if (hasFatigue && bodySymptomIds.some(id => [55, 57].includes(id))) return { type: '气虚血瘀', color: 'orange', desc: '气短乏力，舌质紫暗，身体疼痛，月经不调' };
      if (hasPalpitation && bodySymptomIds.some(id => [76, 80].includes(id))) return { type: '气血瘀滞', color: 'pink', desc: '胸胁胀痛，月经不调，舌有瘀斑，心悸怔忡' };
      return { type: '气血充盈', color: 'green', desc: '面色红润，精力充沛，舌质淡红，脉象有力' };
    };

    // 脏腑功能评估
    const getOrganFunction = () => {
      const organs = [];
      
      if (bodySymptomIds.some(id => [49, 50, 5, 10].includes(id))) {
        organs.push({ organ: '心', status: '异常', color: 'red', symptoms: '心悸、失眠、多梦' });
      }
      if (bodySymptomIds.some(id => [6, 16, 17, 19, 85].includes(id))) {
        organs.push({ organ: '肝', status: '异常', color: 'orange', symptoms: '易怒、头晕、眼干、视力模糊' });
      }
      if (bodySymptomIds.some(id => [41, 42, 43, 86, 87, 88, 89, 90].includes(id))) {
        organs.push({ organ: '脾', status: '异常', color: 'yellow', symptoms: '消化不良、腹胀、便溏、口干口苦' });
      }
      if (bodySymptomIds.some(id => [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].includes(id))) {
        organs.push({ organ: '肺', status: '异常', color: 'blue', symptoms: '咳嗽、气短、易感冒、鼻炎' });
      }
      if (bodySymptomIds.some(id => [25, 55, 62, 63, 67].includes(id))) {
        organs.push({ organ: '肾', status: '异常', color: 'purple', symptoms: '腰酸、耳鸣、畏寒、夜尿多' });
      }

      if (organs.length === 0) {
        organs.push({ organ: '五脏', status: '正常', color: 'green', symptoms: '五脏功能正常' });
      }

      return organs;
    };

    // 经络状态
    const getMeridianStatus = () => {
      const meridians = [];

      if (bodySymptomIds.some(id => [62, 59].includes(id))) {
        meridians.push({ meridian: '督脉', status: '不畅', color: 'red', desc: '脊柱问题、阳气不足、颈腰疼痛' });
      }
      if (bodySymptomIds.some(id => [76, 77, 78, 79, 80, 81, 82, 83, 84].includes(id))) {
        meridians.push({ meridian: '任脉', status: '不畅', color: 'pink', desc: '妇科问题、消化问题、月经失调' });
      }
      if (bodySymptomIds.some(id => [55, 56, 57, 58].includes(id))) {
        meridians.push({ meridian: '冲脉', status: '不畅', color: 'orange', desc: '月经问题、气血失调、四肢问题' });
      }
      if (bodySymptomIds.some(id => [63, 91, 96].includes(id))) {
        meridians.push({ meridian: '带脉', status: '不畅', color: 'yellow', desc: '腰腹问题、湿气重、体型肥胖' });
      }

      if (meridians.length === 0) {
        meridians.push({ meridian: '经络', status: '通畅', color: 'green', desc: '经络通畅，气血运行正常' });
      }

      return meridians;
    };

    // 阴阳平衡
    const getYinYangBalance = () => {
      const hasColdSymptoms = bodySymptomIds.some(id => [4, 5, 42, 55].includes(id));
      const hasHeatSymptoms = bodySymptomIds.some(id => [16, 35, 36, 37, 95].includes(id));

      if (hasColdSymptoms && hasHeatSymptoms) return { type: '阴阳两虚', color: 'purple', desc: '时而怕冷时而怕热，自汗盗汗，脉象细数' };
      if (hasHeatSymptoms) return { type: '阳盛阴衰', color: 'red', desc: '面红目赤，烦躁易怒，便秘尿黄，舌红苔黄' };
      if (hasColdSymptoms) return { type: '阴盛阳衰', color: 'blue', desc: '面色苍白，畏寒肢冷，精神萎靡，舌淡苔白' };
      return { type: '阴阳平衡', color: 'green', desc: '正常状态，阴阳协调' };
    };

    // 湿热寒凉
    const getColdHeatDampness = () => {
      const hasCold = bodySymptomIds.some(id => [4, 5, 42, 55].includes(id));
      const hasHeat = bodySymptomIds.some(id => [16, 35, 36, 37, 41, 95].includes(id));
      const hasDampness = bodySymptomIds.some(id => [11, 39, 68, 69, 70, 91].includes(id));
      const hasDryness = bodySymptomIds.some(id => [16, 42, 53].includes(id));

      if (hasCold && hasDampness) return { type: '寒湿', color: 'blue', desc: '寒湿内盛，关节冷痛，身体困重，舌淡苔腻' };
      if (hasHeat && hasDampness) return { type: '湿热', color: 'orange', desc: '湿热内蕴，面垢油光，口苦口臭，大便黏滞' };
      if (hasCold) return { type: '寒证', color: 'cyan', desc: '畏寒肢冷，面色苍白，舌淡苔白，脉沉紧' };
      if (hasHeat) return { type: '热证', color: 'red', desc: '发热面赤，口渴喜冷饮，舌红苔黄，脉数有力' };
      if (hasDampness) return { type: '湿证', color: 'yellow', desc: '头重如裹，胸闷腹胀，舌苔厚腻，身体困重' };
      if (hasDryness) return { type: '燥证', color: 'amber', desc: '口干咽燥，皮肤干燥，便干尿少，舌红少津' };
      return { type: '平和', color: 'green', desc: '寒热适中，无明显异常' };
    };

    return {
      constitution: getConstitution(),
      qiBloodStatus: getQiBloodStatus(),
      organFunction: getOrganFunction(),
      meridianStatus: getMeridianStatus(),
      yinYangBalance: getYinYangBalance(),
      coldHeatDampness: getColdHeatDampness(),
      totalSymptoms,
    };
  };

  // 计算综合健康评分
  const calculateHealthScore = () => {
    if (!userData) return null;

    const latestSymptomCheck = getLatestSymptomCheck();
    const badHabits = userData.requirements?.badHabitsChecklist || [];
    const symptoms300 = userData.requirements?.symptoms300Checklist || [];

    const bodySymptomIds = latestSymptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || [];
    const habitIds = Array.isArray(badHabits) ? badHabits.map((id: any) => parseInt(id)) : [];
    const symptom300Ids = Array.isArray(symptoms300) ? symptoms300.map((id: any) => parseInt(id)) : [];

    const { calculateComprehensiveHealthScore } = require('@/lib/health-score-calculator');
    const result = calculateComprehensiveHealthScore({
      bodySymptomIds,
      habitIds,
      symptom300Ids,
    });

    return {
      healthScore: result.healthScore,
      bodySymptomsCount: bodySymptomIds.length,
      badHabitsCount: habitIds.length,
      symptoms300Count: symptom300Ids.length,
      totalSymptoms: bodySymptomIds.length + habitIds.length + symptom300Ids.length,
      breakdown: result.breakdown,
      recommendations: result.recommendations,
      healthStatus: result.healthStatus,
      totalDeduction: result.totalDeduction,
    };
  };

  const tcmAnalysis = analyzeTCMHealth();
  const healthScore = calculateHealthScore();
  const latestHealthAnalysis = getLatestHealthAnalysis();

  if (!userData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1800px] max-h-[95vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">用户详细信息</DialogTitle>
          <DialogDescription>
            {userData.user?.name || '未知用户'}的完整健康数据
          </DialogDescription>
        </DialogHeader>

        {/* 横向布局容器 */}
        <div className="space-y-3">
          
          {/* 第一行：4个4×4模块 */}
          <div className="grid grid-cols-4 gap-3">
            {/* 基本信息模块 */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">姓名</span>
                    <span className="font-semibold">{userData.user?.name || '-'}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">年龄</span>
                    <span className="font-semibold">{userData.user?.age || '-'}岁</span>
                  </div>
                  <div className="flex flex-col p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">性别</span>
                    <span className="font-semibold">{userData.user?.gender || '-'}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">手机号</span>
                    <span className="font-semibold">{userData.user?.phone || '-'}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">身高</span>
                    <span className="font-semibold">{userData.user?.height || '-'}cm</span>
                  </div>
                  <div className="flex flex-col p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">体重</span>
                    <span className="font-semibold">{userData.user?.weight || '-'}kg</span>
                  </div>
                  <div className="flex flex-col p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">BMI</span>
                    <span className="font-semibold">{userData.user?.bmi || '-'}</span>
                  </div>
                  <div className="flex flex-col p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">注册时间</span>
                    <span className="font-semibold text-xs">{formatDate(userData.user?.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 综合健康评分模块 */}
            <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-100 border-violet-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-600" />
                  综合健康评分
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {healthScore ? (
                  <div className="text-center space-y-3">
                    <div className="relative w-24 h-24 mx-auto">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle
                          cx="48" cy="48" r="40"
                          stroke={healthScore.healthScore >= 80 ? '#10b981' : healthScore.healthScore >= 60 ? '#3b82f6' : healthScore.healthScore >= 40 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 - (251.2 * healthScore.healthScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{healthScore.healthScore}</span>
                      </div>
                    </div>
                    <Badge className={healthScore.healthScore >= 80 ? 'bg-green-500' : healthScore.healthScore >= 60 ? 'bg-blue-500' : healthScore.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}>
                      {healthScore.healthStatus}
                    </Badge>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>身体语言: {healthScore.bodySymptomsCount}项</div>
                      <div>不良习惯: {healthScore.badHabitsCount}项</div>
                      <div>症状300: {healthScore.symptoms300Count}项</div>
                      <div>总症状: {healthScore.totalSymptoms}项</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    暂无评分数据
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 健康状况全面解析模块 */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  健康状况解析
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {healthScore && healthScore.breakdown ? (
                  <div className="space-y-2">
                    <div className="p-2 bg-red-50 rounded border-l-4 border-red-500">
                      <div className="text-xs text-gray-600">气血状况</div>
                      <div className="font-semibold text-red-600">{healthScore.breakdown.qiAndBlood.score}分</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                      <div className="text-xs text-gray-600">循环状况</div>
                      <div className="font-semibold text-blue-600">{healthScore.breakdown.circulation.score}分</div>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
                      <div className="text-xs text-gray-600">毒素积累</div>
                      <div className="font-semibold text-yellow-600">{healthScore.breakdown.toxins.score}分</div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded border-l-4 border-orange-500">
                      <div className="text-xs text-gray-600">血脂状况</div>
                      <div className="font-semibold text-orange-600">{healthScore.breakdown.bloodLipids.score}分</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    暂无分析数据
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 健康改善路径模块 */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  改善路径
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {HEALTH_IMPROVEMENT_STAGES.map((stage) => (
                    <div key={stage.stage} className={`p-2 rounded border-2 ${stage.stage === 1 ? 'border-blue-500 bg-blue-50' : stage.stage === 2 ? 'border-green-500 bg-green-50' : stage.stage === 3 ? 'border-yellow-500 bg-yellow-50' : 'border-purple-500 bg-purple-50'}`}>
                      <div className="font-bold text-xs text-gray-900">阶段{stage.stage}</div>
                      <div className="text-xs font-semibold text-gray-700">{stage.title}</div>
                      <div className="text-xs text-gray-500">{stage.duration}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 第二行：4个4×4模块 */}
          <div className="grid grid-cols-4 gap-3">
            {/* 中医深入分析模块 */}
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    中医深入分析
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTCMDetails(!showTCMDetails)}
                  >
                    {showTCMDetails ? <X className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {tcmAnalysis ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded shadow-sm">
                      <div className="text-xs text-gray-500">体质辨识</div>
                      <Badge className={`mt-1 bg-${tcmAnalysis.constitution.color}-500`}>
                        {tcmAnalysis.constitution.type}
                      </Badge>
                      <div className="text-xs text-gray-600 mt-1">{tcmAnalysis.constitution.desc.substring(0, 20)}...</div>
                    </div>
                    <div className="p-2 bg-white rounded shadow-sm">
                      <div className="text-xs text-gray-500">气血状态</div>
                      <Badge className={`mt-1 bg-${tcmAnalysis.qiBloodStatus.color}-500`}>
                        {tcmAnalysis.qiBloodStatus.type}
                      </Badge>
                      <div className="text-xs text-gray-600 mt-1">{tcmAnalysis.qiBloodStatus.desc.substring(0, 20)}...</div>
                    </div>
                    <div className="p-2 bg-white rounded shadow-sm">
                      <div className="text-xs text-gray-500">阴阳平衡</div>
                      <Badge className={`mt-1 bg-${tcmAnalysis.yinYangBalance.color}-500`}>
                        {tcmAnalysis.yinYangBalance.type}
                      </Badge>
                      <div className="text-xs text-gray-600 mt-1">{tcmAnalysis.yinYangBalance.desc.substring(0, 20)}...</div>
                    </div>
                    <div className="p-2 bg-white rounded shadow-sm">
                      <div className="text-xs text-gray-500">湿热寒凉</div>
                      <Badge className={`mt-1 bg-${tcmAnalysis.coldHeatDampness.color}-500`}>
                        {tcmAnalysis.coldHeatDampness.type}
                      </Badge>
                      <div className="text-xs text-gray-600 mt-1">{tcmAnalysis.coldHeatDampness.desc.substring(0, 20)}...</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    暂无中医分析数据
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 健康七问V2模块 */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                  健康七问V2
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {SEVEN_QUESTIONS.slice(0, 6).map((q) => {
                    const answer = userData.requirements?.sevenQuestionsAnswers?.[String(q.id)];
                    const isAnswered = answer !== undefined && answer !== null;
                    return (
                      <div key={q.id} className="flex items-center gap-2 text-xs">
                        {isAnswered ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`truncate ${isAnswered ? 'text-gray-900' : 'text-gray-400'}`}>
                          {q.question}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 推荐调理产品模块 */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-pink-600" />
                  推荐产品
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2">
                  {RECOMMENDED_PRODUCTS.map((product) => (
                    <div key={product.id} className={`p-2 rounded ${product.color}`}>
                      <div className="flex items-center gap-1">
                        <product.icon className="w-3 h-3" />
                        <div className="text-xs font-semibold">{product.name}</div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{product.category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 第三行：课程和调理计划 */}
          <div className="grid grid-cols-4 gap-3">
            {/* 推荐学习课程模块 */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  推荐课程
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {TWENTY_ONE_COURSES.slice(0, 4).map((course) => (
                    <div key={course.id} className="p-2 bg-indigo-50 rounded">
                      <div className="text-xs font-semibold text-gray-900">{course.title}</div>
                      <div className="text-xs text-gray-500">{course.duration || '30分钟'}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 分阶段调理计划模块 */}
            <Card className="p-4 col-span-3">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-600" />
                  分阶段调理计划
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-4 gap-3">
                  {HEALTH_IMPROVEMENT_STAGES.map((stage) => (
                    <div key={stage.stage} className={`p-3 rounded-lg border-2 ${stage.stage === 1 ? 'border-blue-500 bg-blue-50' : stage.stage === 2 ? 'border-green-500 bg-green-50' : stage.stage === 3 ? 'border-yellow-500 bg-yellow-50' : 'border-purple-500 bg-purple-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-sm text-gray-900">阶段{stage.stage}</div>
                        <Badge variant="outline" className="text-xs">{stage.duration}</Badge>
                      </div>
                      <div className="font-semibold text-sm text-gray-700 mb-2">{stage.title}</div>
                      <div className="text-xs text-gray-500 mb-2">目标：{stage.goal}</div>
                      <div className="space-y-1">
                        {stage.actions.slice(0, 2).map((action, idx) => (
                          <div key={idx} className="flex items-start gap-1 text-xs text-gray-600">
                            <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 第四行：2个8×8模块 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 不良生活习惯自检表模块 */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  不良生活习惯自检表
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-8 gap-1 text-xs">
                  {BAD_HABITS_CHECKLIST.map((habit) => {
                    const isChecked = userData.requirements?.badHabitsChecklist?.includes(habit.id);
                    return (
                      <div
                        key={habit.id}
                        className={`p-1.5 rounded text-center cursor-pointer transition-colors ${
                          isChecked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                        title={habit.habit}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {habit.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>已选择：{userData.requirements?.badHabitsChecklist?.length || 0}项</span>
                  <span>总计：{BAD_HABITS_CHECKLIST.length}项</span>
                </div>
              </CardContent>
            </Card>

            {/* 身体语言简表模块 */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  身体语言简表
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-8 gap-1 text-xs">
                  {BODY_SYMPTOMS.map((symptom) => {
                    const isChecked = getLatestSymptomCheck()?.checkedSymptoms?.includes(String(symptom.id));
                    return (
                      <div
                        key={symptom.id}
                        className={`p-1.5 rounded text-center cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                        title={`${symptom.name} - ${symptom.category}`}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {symptom.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>已选择：{getLatestSymptomCheck()?.checkedSymptoms?.length || 0}项</span>
                  <span>总计：{BODY_SYMPTOMS.length}项</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 第五行：300症状表 */}
          <div className="grid grid-cols-1 gap-3">
            {/* 300项症状自检表模块 */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  300项症状自检表
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-8 gap-1 text-xs max-h-60 overflow-y-auto">
                  {BODY_SYMPTOMS_300.map((symptom) => {
                    const isChecked = userData.requirements?.symptoms300Checklist?.includes(symptom.id);
                    return (
                      <div
                        key={symptom.id}
                        className={`p-1.5 rounded text-center cursor-pointer transition-colors ${
                          isChecked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                        title={`${symptom.name} - ${symptom.category}`}
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {symptom.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>已选择：{userData.requirements?.symptoms300Checklist?.length || 0}项</span>
                  <span>总计：{BODY_SYMPTOMS_300.length}项</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
