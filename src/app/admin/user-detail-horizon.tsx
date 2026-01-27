'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users,
  Activity,
  TrendingUp,
  Target,
  Sparkles,
  HelpCircle,
  Shield,
  BookOpen,
  AlertCircle,
  FileText,
  ChevronLeft,
  Calendar,
  Phone,
  Mail,
  Ruler,
  Weight,
  Heart,
  Brain,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { SEVEN_QUESTIONS, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS, BODY_SYMPTOMS_300 } from '@/lib/health-data';
import { calculateComprehensiveHealthScore } from '@/lib/health-score-calculator';

interface UserDetailHorizonProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailHorizon({ user, open, onOpenChange }: UserDetailHorizonProps) {
  const router = useRouter();

  // 获取最新症状检查
  const getLatestSymptomCheck = () => {
    if (!user?.symptomChecks || user.symptomChecks.length === 0) return null;
    return user.symptomChecks[0];
  };

  // 计算综合健康评分
  const calculateHealthScore = () => {
    if (!user) return null;

    const latestSymptomCheck = getLatestSymptomCheck();
    const badHabits = user.requirements?.badHabitsChecklist || [];
    const symptoms300 = user.requirements?.symptoms300Checklist || [];

    const bodySymptomIds = latestSymptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || [];
    const habitIds = Array.isArray(badHabits) ? badHabits.map((id: any) => parseInt(id)) : [];
    const symptom300Ids = Array.isArray(symptoms300) ? symptoms300.map((id: any) => parseInt(id)) : [];

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

  // 中医深入分析
  const analyzeTCMHealth = () => {
    if (!user) return null;

    const latestSymptomCheck = getLatestSymptomCheck();
    const badHabits = user.requirements?.badHabitsChecklist || [];
    const symptoms300 = user.requirements?.symptoms300Checklist || [];

    const bodySymptomIds = latestSymptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || [];
    const habitIds = Array.isArray(badHabits) ? badHabits.map((id: any) => parseInt(id)) : [];
    const symptom300Ids = Array.isArray(symptoms300) ? symptoms300.map((id: any) => parseInt(id)) : [];

    const totalSymptoms = bodySymptomIds.length + habitIds.length + symptom300Ids.length;

    // 体质辨识
    const getConstitution = () => {
      if (totalSymptoms < 10) return { type: '平和质', color: 'green', desc: '阴阳气血调和，体态适中' };
      if (totalSymptoms < 20) return { type: '气虚质', color: 'blue', desc: '元气不足，疲乏无力' };
      if (totalSymptoms < 30) return { type: '痰湿质', color: 'yellow', desc: '体内湿气重，体型肥胖' };
      if (totalSymptoms < 40) return { type: '湿热质', color: 'orange', desc: '湿热内蕴，面垢油光' };
      return { type: '血瘀质', color: 'red', desc: '气血运行不畅，肤色晦暗' };
    };

    // 气血状态分析
    const getQiBloodStatus = () => {
      const hasFatigue = bodySymptomIds.some((id: number) => [1, 3, 4, 14, 58].includes(id));
      const hasShortness = bodySymptomIds.some((id: number) => [40, 48].includes(id));
      const hasPalpitation = bodySymptomIds.some((id: number) => [49].includes(id));

      if (hasFatigue && hasShortness) return { type: '气血两虚', color: 'red' };
      if (hasFatigue && bodySymptomIds.some((id: number) => [55, 57].includes(id))) return { type: '气虚血瘀', color: 'orange' };
      if (hasPalpitation && bodySymptomIds.some((id: number) => [76, 80].includes(id))) return { type: '气血瘀滞', color: 'pink' };
      return { type: '气血充盈', color: 'green' };
    };

    return {
      constitution: getConstitution(),
      qiBloodStatus: getQiBloodStatus(),
      totalSymptoms,
    };
  };

  const healthData = calculateHealthScore();
  const tcmData = analyzeTCMHealth();

  // 获取健康七问答案
  const sevenQuestionsAnswers = user?.requirements?.sevenQuestionsAnswers || {};

  // 获取选中的习惯
  const selectedHabits = Array.isArray(user?.requirements?.badHabitsChecklist)
    ? user.requirements.badHabitsChecklist.map((id: any) => parseInt(id))
    : [];

  // 获取选中的身体语言症状
  const latestSymptomCheck = getLatestSymptomCheck();
  const selectedBodySymptoms = latestSymptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || [];

  // 获取选中的300症状
  const selectedSymptoms300 = Array.isArray(user?.requirements?.symptoms300Checklist)
    ? user.requirements.symptoms300Checklist.map((id: any) => parseInt(id))
    : [];

  // 将 BAD_HABITS_CHECKLIST 对象转换为扁平数组
  const allBadHabits = Object.values(BAD_HABITS_CHECKLIST).flat();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[2560px] max-h-[100vh] overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <DialogHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 -mx-6 -mt-6 px-6 py-4 sticky top-0 z-50 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-4xl font-bold text-white tracking-wide">用户健康档案</DialogTitle>
              <div className="text-xl text-white/90 mt-2 font-medium">
                {user?.user?.name || '未知用户'} - 完整健康评估报告
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/25 text-white border-white/40 hover:bg-white/35 text-xl px-6 py-3 shadow-lg"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ChevronLeft className="w-6 h-6 mr-2" />
              返回列表
            </Button>
          </div>
        </DialogHeader>

        {user && (
          <div className="space-y-4 mt-6">
            {/* ==================== 用户基本信息与健康数据 ==================== */}
            <div className="space-y-6">
              {/* 基本信息（全宽） */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl border-2 border-blue-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3 text-blue-800">
                    <Users className="w-8 h-8" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-4 rounded-xl border-2 border-blue-300 shadow">
                        <div className="text-lg text-gray-600 mb-2 font-semibold">姓名</div>
                        <div className="text-2xl font-bold text-gray-900">{user.user?.name || '-'}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-2 border-blue-300 shadow">
                        <div className="text-lg text-gray-600 mb-2 font-semibold">年龄</div>
                        <div className="text-2xl font-bold text-gray-900">{user.user?.age || '-'}岁</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-2 border-blue-300 shadow">
                        <div className="text-lg text-gray-600 mb-2 font-semibold">性别</div>
                        <div className="text-2xl font-bold text-gray-900">{user.user?.gender || '-'}</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-2 border-blue-300 shadow">
                        <div className="text-lg text-gray-600 mb-2 font-semibold">BMI</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {user.user?.bmi && !isNaN(Number(user.user.bmi))
                            ? Number(user.user.bmi).toFixed(1)
                            : '-'}
                        </div>
                      </div>
                      <div className="col-span-2 bg-white p-4 rounded-xl border-2 border-blue-300 shadow flex gap-4">
                        <div className="flex-1">
                          <div className="text-lg text-gray-600 mb-2 font-semibold">身高</div>
                          <div className="text-2xl font-bold text-gray-900">{user.user?.height || '-'}cm</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-lg text-gray-600 mb-2 font-semibold">体重</div>
                          <div className="text-2xl font-bold text-gray-900">{user.user?.weight || '-'}kg</div>
                        </div>
                      </div>
                      <div className="col-span-2 bg-white p-4 rounded-xl border-2 border-blue-300 shadow">
                        <div className="text-lg text-gray-600 mb-2 font-semibold">联系电话</div>
                        <div className="text-2xl font-bold text-gray-900">{user.user?.phone || '-'}</div>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>

              {/* 综合健康评分（全宽） */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl border-2 border-green-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-green-800">
                      <Activity className="w-8 h-8" />
                      健康评分
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-center h-full">
                    {healthData ? (
                      <div className="text-center">
                        <div className="bg-white p-6 rounded-2xl border-2 border-green-300 shadow mb-4">
                          <div className="text-xl font-bold text-green-700 mb-2">综合评分</div>
                          <div className="text-7xl font-black text-green-600 mb-2">{healthData.healthScore}</div>
                          <div className="text-xl font-semibold text-green-700">分</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-4 rounded-xl border-3 border-blue-200">
                            <div className="text-xl text-gray-600 mb-2">症状总数</div>
                            <div className="text-2xl font-bold text-blue-700">{healthData.totalSymptoms}</div>
                          </div>
                          <div className="bg-white p-4 rounded-xl border-3 border-red-200">
                            <div className="text-xl text-gray-600 mb-2">严重症状</div>
                            <div className="text-2xl font-bold text-red-700">
                              {healthData.breakdown.bodyLanguage.severityBreakdown.emergency +
                               healthData.breakdown.bodyLanguage.severityBreakdown.severe +
                               healthData.breakdown.symptoms300.severityBreakdown.emergency +
                               healthData.breakdown.symptoms300.severityBreakdown.severe}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-3xl font-semibold">
                        暂无评分数据
                      </div>
                    )}
                  </CardContent>
                </Card>

              {/* 健康状况全面解析（全宽） */}
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 shadow-xl border-2 border-purple-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-purple-800">
                      <TrendingUp className="w-8 h-8" />
                      健康解析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {healthData ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border-2 border-purple-300 shadow-lg">
                          <div className="text-2xl text-gray-700 mb-3 font-bold">风险等级</div>
                          <div className={`text-2xl font-bold ${healthData.healthScore >= 80 ? 'text-green-600' : healthData.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {healthData.healthScore >= 80 ? '低风险' : healthData.healthScore >= 60 ? '中等风险' : '高风险'}
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-blue-300 shadow-lg">
                          <div className="text-xl text-gray-700 mb-3 font-bold">风险因素</div>
                          <div className="text-2xl font-bold text-blue-700">
                            {healthData.totalSymptoms} 个症状
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border-2 border-green-300 shadow-lg">
                          <div className="text-xl text-gray-700 mb-2 font-bold">首要建议</div>
                          <div className="text-lg text-green-700 font-semibold leading-relaxed">
                            {healthData.recommendations[0] || '暂无'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-3xl font-semibold">
                        暂无分析数据
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 健康改善路径（全宽） */}
              <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-100 shadow-xl border-2 border-orange-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-orange-800">
                      <Target className="w-8 h-8" />
                      改善路径
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-xl border-l-6 border-green-500 border-2 shadow-lg">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">1</div>
                          <div className="text-xl font-bold text-green-900">紧急处理</div>
                        </div>
                        <div className="text-lg text-gray-700">优先处理严重症状</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-l-6 border-yellow-500 border-2 shadow-lg">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xl font-bold">2</div>
                          <div className="text-xl font-bold text-yellow-900">习惯改善</div>
                        </div>
                        <div className="text-lg text-gray-700">改正不良习惯</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-l-6 border-blue-500 border-2 shadow-lg">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">3</div>
                          <div className="text-xl font-bold text-blue-900">身体调理</div>
                        </div>
                        <div className="text-lg text-gray-700">全面调理身体</div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border-l-6 border-purple-500 border-2 shadow-lg">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">4</div>
                          <div className="text-xl font-bold text-purple-900">持续跟踪</div>
                        </div>
                        <div className="text-lg text-gray-700">定期检查记录</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              {/* 中医深入分析（全宽） */}
              <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-100 shadow-xl border-2 border-pink-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-pink-800">
                      <Sparkles className="w-8 h-8" />
                      中医分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tcmData ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-5 rounded-2xl border-3 border-pink-300 shadow-lg">
                          <div className="text-xl text-gray-600 mb-2 font-semibold">体质类型</div>
                          <div className="text-xl font-bold">{tcmData.constitution.type}</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border-3 border-red-300 shadow-lg">
                          <div className="text-xl text-gray-600 mb-2 font-semibold">气血状态</div>
                          <div className="text-xl font-bold text-red-700">{tcmData.qiBloodStatus.type}</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border-3 border-purple-300 shadow-lg">
                          <div className="text-xl text-gray-600 mb-2 font-semibold">阴阳平衡</div>
                          <div className="text-xl font-bold text-purple-700">阴阳两虚</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border-3 border-blue-300 shadow-lg">
                          <div className="text-xl text-gray-600 mb-2 font-semibold">经络状态</div>
                          <div className="text-xl font-bold text-blue-700">督脉不畅</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border-3 border-green-300 shadow-lg">
                          <div className="text-xl text-gray-600 mb-2 font-semibold">湿热寒凉</div>
                          <div className="text-xl font-bold text-green-700">寒湿内盛</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border-3 border-yellow-300 shadow-lg">
                          <div className="text-xl text-gray-600 mb-2 font-semibold">舌苔脉象</div>
                          <div className="text-xl font-bold text-yellow-700">舌淡苔白</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-3xl font-semibold">
                        暂无中医分析数据
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ==================== 健康七问V2 ==================== */}
            <Card className="p-6 bg-gradient-to-br from-teal-50 to-cyan-100 shadow-xl border-2 border-teal-200">
              <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-teal-800">
                      <HelpCircle className="w-8 h-8" />
                      健康七问（V2）
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      {SEVEN_QUESTIONS.slice(0, 6).map((q, i) => {
                        const isAnswered = sevenQuestionsAnswers[q.id] !== undefined && sevenQuestionsAnswers[q.id] !== null;
                        return (
                          <div key={q.id} className={`p-4 rounded-xl border-2 shadow-lg ${isAnswered ? 'bg-white border-green-400' : 'bg-gray-50 border-gray-300'}`}>
                            <div className="text-2xl text-gray-600 mb-3 font-bold flex items-center gap-3">
                              <span className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold">{i + 1}</span>
                              {q.category}
                            </div>
                            <div className="text-xl text-gray-800 line-clamp-2 font-semibold mb-3">{q.question}</div>
                            <div className={`text-xl font-bold`}>
                              {isAnswered ? '✓ 已回答' : '✗ 未回答'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

            {/* 推荐调理产品（全宽） */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-100 shadow-xl border-2 border-indigo-200">
              <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-indigo-800">
                      <Shield className="w-8 h-8" />
                      推荐调理产品
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white p-8 rounded-2xl border-3 border-blue-300 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <Heart className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-blue-900">气血调理包</div>
                        <div className="text-2xl text-gray-600 leading-relaxed">改善气血两虚，提升整体活力</div>
                      </div>
                      <div className="bg-white p-8 rounded-2xl border-3 border-green-300 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-green-900">排毒养颜包</div>
                        <div className="text-2xl text-gray-600 leading-relaxed">清除体内毒素，恢复肌肤光彩</div>
                      </div>
                      <div className="bg-white p-8 rounded-2xl border-3 border-orange-300 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <Activity className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-orange-900">经络疏通包</div>
                        <div className="text-2xl text-gray-600 leading-relaxed">疏通经络气血，改善循环</div>
                      </div>
                      <div className="bg-white p-8 rounded-2xl border-3 border-purple-300 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <Brain className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-purple-900">滋阴补肾包</div>
                        <div className="text-2xl text-gray-600 leading-relaxed">调理肾虚症状，固本培元</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            {/* 推荐学习课程（全宽） */}
            <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-100 shadow-xl border-2 border-rose-200">
              <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3 text-rose-800">
                      <BookOpen className="w-8 h-8" />
                      推荐学习课程
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white p-8 rounded-2xl border-3 border-indigo-300 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-2xl font-bold text-indigo-900">中医养生基础</div>
                          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-xl font-bold">12课时</div>
                        </div>
                        <div className="text-2xl text-gray-600">系统学习中医养生理论</div>
                      </div>
                      <div className="bg-white p-8 rounded-2xl border-3 border-teal-300 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-2xl font-bold text-teal-900">食疗养生课</div>
                          <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-xl font-bold">8课时</div>
                        </div>
                        <div className="text-2xl text-gray-600">掌握饮食调理方法</div>
                      </div>
                      <div className="bg-white p-8 rounded-2xl border-3 border-rose-300 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-2xl font-bold text-rose-900">经络推拿课</div>
                          <div className="bg-rose-100 text-rose-800 px-4 py-2 rounded-full text-xl font-bold">10课时</div>
                        </div>
                        <div className="text-2xl text-gray-600">学习经络按摩技巧</div>
                      </div>
                      <div className="bg-white p-8 rounded-2xl border-3 border-amber-300 shadow-xl hover:shadow-2xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-2xl font-bold text-amber-900">情志调理课</div>
                          <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-xl font-bold">6课时</div>
                        </div>
                        <div className="text-2xl text-gray-600">情绪管理与心理调适</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* ==================== 分阶段调理计划 ==================== */}
            <div className="space-y-6">
              {/* 第一阶段 */}
              <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl border-2 border-green-200">
                <CardHeader className="pb-8">
                  <CardTitle className="text-4xl font-bold flex items-center gap-6 text-green-800">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl">
                      <span className="text-5xl font-black text-white">1</span>
                    </div>
                    第一阶段
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-8 rounded-3xl border-3 border-green-300 shadow-xl mb-6">
                    <div className="text-2xl font-bold text-green-900 mb-3">调理周期：1-2个月</div>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-green-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">紧急症状处理</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-green-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">建立健康作息</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-green-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">基础饮食调理</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-green-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">开始运动计划</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 第二阶段 */}
              <Card className="p-8 bg-gradient-to-br from-yellow-50 to-amber-100 shadow-xl border-2 border-yellow-200">
                <CardHeader className="pb-8">
                  <CardTitle className="text-4xl font-bold flex items-center gap-6 text-yellow-800">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-3xl flex items-center justify-center shadow-xl">
                      <span className="text-5xl font-black text-white">2</span>
                    </div>
                    第二阶段
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-8 rounded-3xl border-3 border-yellow-300 shadow-xl mb-6">
                    <div className="text-2xl font-bold text-yellow-900 mb-3">调理周期：3-4个月</div>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-yellow-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">深度调理气血</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-yellow-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">改善生活习惯</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-yellow-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">经络疏通调理</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-yellow-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">情志心理疏导</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 第三阶段 */}
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl border-2 border-blue-200">
                <CardHeader className="pb-8">
                  <CardTitle className="text-4xl font-bold flex items-center gap-6 text-blue-800">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
                      <span className="text-5xl font-black text-white">3</span>
                    </div>
                    第三阶段
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-8 rounded-3xl border-3 border-blue-300 shadow-xl mb-6">
                    <div className="text-2xl font-bold text-blue-900 mb-3">调理周期：5-6个月</div>
                    <div className="space-y-5">
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-blue-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">巩固调理成果</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-blue-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">建立健康体系</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-blue-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">预防疾病复发</div>
                      </div>
                      <div className="flex items-start gap-4">
                        <CheckCircle className="w-8 h-8 text-blue-600 mt-2 flex-shrink-0" />
                        <div className="text-2xl text-gray-700 font-semibold">长期健康管理</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ==================== 不良生活习惯自检表 ==================== */}
            <Card className="p-8 bg-gradient-to-br from-red-50 to-orange-100 shadow-xl border-2 border-red-200">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-6 text-red-800">
                  <AlertCircle className="w-16 h-16" />
                  不良生活习惯自检表（全部252项）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-4 bg-white rounded-xl border-2">
                  {allBadHabits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`p-6 rounded-xl text-xl cursor-pointer transition-all border-3 shadow-lg ${
                        selectedHabits.includes(habit.id)
                          ? 'bg-red-100 border-red-500 text-red-800 shadow-xl'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:shadow-xl hover:border-gray-300'
                      }`}
                    >
                      <div className="font-mono text-base mb-3 font-bold">#{habit.id}</div>
                      <div className="line-clamp-2 leading-tight text-xl font-semibold">{habit.habit}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ==================== 身体语言简表 ==================== */}
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-100 shadow-xl border-2 border-blue-200">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-6 text-blue-800">
                  <FileText className="w-16 h-16" />
                  身体语言简表（全部100项）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 max-h-[400px] overflow-y-auto p-4 bg-white rounded-xl border-2">
                  {BODY_SYMPTOMS.map((symptom) => (
                    <div
                      key={symptom.id}
                      className={`p-6 rounded-xl text-xl cursor-pointer transition-all border-3 shadow-lg ${
                        selectedBodySymptoms.includes(symptom.id)
                          ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-xl'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:shadow-xl hover:border-gray-300'
                      }`}
                    >
                      <div className="font-mono text-base mb-3 font-bold">#{symptom.id}</div>
                      <div className="line-clamp-2 leading-tight text-xl font-semibold">{symptom.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ==================== 300项症状自检表 ==================== */}
            <Card className="p-8 bg-gradient-to-br from-purple-50 to-violet-100 shadow-xl border-2 border-purple-200">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-6 text-purple-800">
                  <FileText className="w-16 h-16" />
                  300项症状自检表（全部300项）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 max-h-[500px] overflow-y-auto p-4 bg-white rounded-xl border-2">
                  {BODY_SYMPTOMS_300.map((symptom) => (
                    <div
                      key={symptom.id}
                      className={`p-5 rounded-xl text-lg cursor-pointer transition-all border-3 shadow-lg ${
                        selectedSymptoms300.includes(symptom.id)
                          ? 'bg-purple-100 border-purple-500 text-purple-800 shadow-xl'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:shadow-xl hover:border-gray-300'
                      }`}
                    >
                      <div className="font-mono text-sm mb-2 font-bold">#{symptom.id}</div>
                      <div className="line-clamp-2 leading-tight text-xl font-semibold">{symptom.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
