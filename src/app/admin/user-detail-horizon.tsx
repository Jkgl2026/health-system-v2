'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Activity, TrendingUp, Target, Sparkles, HelpCircle, Shield, BookOpen, AlertCircle, FileText, RefreshCw, ChevronLeft } from 'lucide-react';
import { SEVEN_QUESTIONS, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS, BODY_SYMPTOMS_300 } from '@/lib/health-data';
import { calculateComprehensiveHealthScore } from '@/lib/health-score-calculator';

interface UserDetailHorizonProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailHorizon({ user, open, onOpenChange }: UserDetailHorizonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 格式化日期
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
      if (totalSymptoms < 10) return { type: '平和质', color: 'green', desc: '阴阳气血调和，体态适中，面色红润，精力充沛' };
      if (totalSymptoms < 20) return { type: '气虚质', color: 'blue', desc: '元气不足，疲乏无力，气短懒言，易出汗，易感冒' };
      if (totalSymptoms < 30) return { type: '痰湿质', color: 'yellow', desc: '体内湿气重，体型肥胖，胸闷痰多，身重不爽' };
      if (totalSymptoms < 40) return { type: '湿热质', color: 'orange', desc: '湿热内蕴，面垢油光，易生痤疮，口苦口臭，大便黏滞' };
      return { type: '血瘀质', color: 'red', desc: '气血运行不畅，肤色晦暗，易有瘀斑，痛经，舌质紫暗' };
    };

    // 气血状态分析
    const getQiBloodStatus = () => {
      const hasFatigue = bodySymptomIds.some((id: number) => [1, 3, 4, 14, 58].includes(id));
      const hasShortness = bodySymptomIds.some((id: number) => [40, 48].includes(id));
      const hasPalpitation = bodySymptomIds.some((id: number) => [49].includes(id));

      if (hasFatigue && hasShortness) return { type: '气血两虚', color: 'red', desc: '面色苍白，乏力少气，心悸失眠，动则气喘' };
      if (hasFatigue && bodySymptomIds.some((id: number) => [55, 57].includes(id))) return { type: '气虚血瘀', color: 'orange', desc: '气短乏力，舌质紫暗，身体疼痛，月经不调' };
      if (hasPalpitation && bodySymptomIds.some((id: number) => [76, 80].includes(id))) return { type: '气血瘀滞', color: 'pink', desc: '胸胁胀痛，月经不调，舌有瘀斑，心悸怔忡' };
      return { type: '气血充盈', color: 'green', desc: '面色红润，精力充沛，舌质淡红，脉象有力' };
    };

    // 脏腑功能评估
    const getOrganFunction = () => {
      const organs: any[] = [];

      if (bodySymptomIds.some((id: number) => [49, 50, 5, 10].includes(id))) {
        organs.push({ organ: '心', status: '异常', color: 'red', symptoms: '心悸、失眠、多梦' });
      }
      if (bodySymptomIds.some((id: number) => [6, 16, 17, 19, 85].includes(id))) {
        organs.push({ organ: '肝', status: '异常', color: 'orange', symptoms: '易怒、头晕、眼干、视力模糊' });
      }
      if (bodySymptomIds.some((id: number) => [41, 42, 43, 86, 87, 88, 89, 90].includes(id))) {
        organs.push({ organ: '脾', status: '异常', color: 'yellow', symptoms: '消化不良、腹胀、便溏、口干口苦' });
      }
      if (bodySymptomIds.some((id: number) => [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].includes(id))) {
        organs.push({ organ: '肺', status: '异常', color: 'blue', symptoms: '咳嗽、气短、易感冒、鼻炎' });
      }
      if (bodySymptomIds.some((id: number) => [25, 55, 62, 63, 67].includes(id))) {
        organs.push({ organ: '肾', status: '异常', color: 'purple', symptoms: '腰酸、耳鸣、畏寒、夜尿多' });
      }

      if (organs.length === 0) {
        organs.push({ organ: '五脏', status: '正常', color: 'green', symptoms: '五脏功能正常' });
      }

      return organs;
    };

    return {
      constitution: getConstitution(),
      qiBloodStatus: getQiBloodStatus(),
      organFunction: getOrganFunction(),
      totalSymptoms,
    };
  };

  const healthData = calculateHealthScore();
  const tcmData = analyzeTCMHealth();

  // 获取健康七问答案
  const getSevenQuestionsAnswers = () => {
    return user?.requirements?.sevenQuestionsAnswers || {};
  };

  const sevenQuestionsAnswers = getSevenQuestionsAnswers();

  // 获取选中的习惯
  const getSelectedHabits = () => {
    return Array.isArray(user?.requirements?.badHabitsChecklist)
      ? user.requirements.badHabitsChecklist.map((id: any) => parseInt(id))
      : [];
  };

  // 获取选中的身体语言症状
  const getSelectedBodySymptoms = () => {
    const latestSymptomCheck = getLatestSymptomCheck();
    return latestSymptomCheck?.checkedSymptoms?.map((id: string) => parseInt(id)) || [];
  };

  // 获取选中的300症状
  const getSelectedSymptoms300 = () => {
    return Array.isArray(user?.requirements?.symptoms300Checklist)
      ? user.requirements.symptoms300Checklist.map((id: any) => parseInt(id))
      : [];
  };

  const selectedHabits = getSelectedHabits();
  const selectedBodySymptoms = getSelectedBodySymptoms();
  const selectedSymptoms300 = getSelectedSymptoms300();

  // 将 BAD_HABITS_CHECKLIST 对象转换为扁平数组
  const allBadHabits = Object.values(BAD_HABITS_CHECKLIST).flat();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[100vw] max-w-[3560px] max-h-[1000vh] overflow-y-auto p-12 bg-gray-50">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-12 -mt-12 px-12 py-10 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-6xl font-bold text-white">用户详细信息</DialogTitle>
              <DialogDescription className="text-2xl text-white/90 mt-3">
                {user?.user?.name || '未知用户'}的完整健康档案
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-2xl px-10 py-5"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ChevronLeft className="w-7 h-7 mr-3" />
              返回列表
            </Button>
          </div>
        </DialogHeader>

        {user && (
          <div className="space-y-10 mt-12">
            {/* 第一行：4个4×4模块 */}
            <div className="grid grid-cols-4 gap-10">
              {/* 基本信息 */}
              <Card className="p-10 shadow-xl border-3">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <Users className="w-12 h-12 text-blue-600" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-blue-50 rounded-lg border-3 border-blue-200">
                      <div className="text-sm text-gray-600 mb-3 font-medium">姓名</div>
                      <div className="text-4xl font-bold text-gray-900">{user.user?.name || '-'}</div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-lg border-3 border-blue-200">
                      <div className="text-lg text-gray-600 mb-3 font-medium">年龄</div>
                      <div className="text-4xl font-bold text-gray-900">{user.user?.age || '-'}岁</div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-lg border-3 border-blue-200">
                      <div className="text-lg text-gray-600 mb-3 font-medium">性别</div>
                      <div className="text-4xl font-bold text-gray-900">{user.user?.gender || '-'}</div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-lg border-3 border-blue-200">
                      <div className="text-lg text-gray-600 mb-3 font-medium">身高</div>
                      <div className="text-4xl font-bold text-gray-900">{user.user?.height || '-'}cm</div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-lg border-3 border-blue-200">
                      <div className="text-lg text-gray-600 mb-3 font-medium">体重</div>
                      <div className="text-4xl font-bold text-gray-900">{user.user?.weight || '-'}kg</div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-lg border-3 border-blue-200">
                      <div className="text-lg text-gray-600 mb-3 font-medium">BMI</div>
                      <div className="text-4xl font-bold text-gray-900">
                        {user.user?.bmi && !isNaN(Number(user.user.bmi))
                          ? Number(user.user.bmi).toFixed(1)
                          : '-'}
                      </div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-lg border-3 border-blue-200">
                      <div className="text-lg text-gray-600 mb-3 font-medium">电话</div>
                      <div className="text-3xl font-bold text-gray-900">{user.user?.phone || '-'}</div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-lg border-3 border-blue-200">
                      <div className="text-lg text-gray-600 mb-3 font-medium">邮箱</div>
                      <div className="text-lg font-bold text-gray-900 truncate">{user.user?.email || '-'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 综合健康评分 */}
              <Card className="p-10 shadow-xl border-3">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <Activity className="w-12 h-12 text-green-600" />
                    综合健康评分
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthData ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white text-center shadow-xl">
                        <div className="text-xl font-semibold mb-3">健康评分</div>
                        <div className="text-9xl font-bold mb-2">{healthData.healthScore}</div>
                        <div className="text-2xl opacity-90">分（满分100）</div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
                          <div className="text-lg text-gray-600 mb-3 font-medium">症状总数</div>
                          <div className="text-4xl font-bold text-blue-700">{healthData.totalSymptoms}</div>
                        </div>
                        <div className="p-5 bg-red-50 rounded-lg border-2 border-red-200">
                          <div className="text-lg text-gray-600 mb-3 font-medium">严重+紧急</div>
                          <div className="text-4xl font-bold text-red-700">
                            {healthData.breakdown.bodyLanguage.severityBreakdown.emergency +
                             healthData.breakdown.bodyLanguage.severityBreakdown.severe +
                             healthData.breakdown.symptoms300.severityBreakdown.emergency +
                             healthData.breakdown.symptoms300.severityBreakdown.severe}
                          </div>
                        </div>
                        <div className="p-5 bg-purple-50 rounded-lg border-2 border-purple-200 col-span-2">
                          <div className="text-lg text-gray-600 mb-3 font-medium">指数系数</div>
                          <div className="text-4xl font-bold text-purple-700">
                            {Math.max(...[healthData.breakdown.bodyLanguage.factor, healthData.breakdown.habits.factor, healthData.breakdown.symptoms300.factor]).toFixed(1)}x
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-xl">
                      暂无评分数据
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 健康状况全面解析 */}
              <Card className="p-10 shadow-xl border-3">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <TrendingUp className="w-12 h-12 text-purple-600" />
                    健康状况全面解析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthData ? (
                    <div className="space-y-4">
                      <div className="p-5 bg-purple-50 rounded-lg border-2 border-purple-200">
                        <div className="text-lg text-gray-700 mb-2 font-bold">风险等级</div>
                        <div className={`text-3xl font-bold ${healthData.healthScore >= 80 ? 'text-green-600' : healthData.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {healthData.healthScore >= 80 ? '低风险' : healthData.healthScore >= 60 ? '中等风险' : '高风险'}
                        </div>
                      </div>
                      <div className="p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <div className="text-lg text-gray-700 mb-2 font-bold">需关注症状</div>
                        <div className="text-xl font-semibold text-blue-700">
                          {healthData.breakdown.bodyLanguage.severityBreakdown.emergency +
                           healthData.breakdown.bodyLanguage.severityBreakdown.severe +
                           healthData.breakdown.symptoms300.severityBreakdown.emergency +
                           healthData.breakdown.symptoms300.severityBreakdown.severe} 个严重症状
                        </div>
                      </div>
                      <div className="p-5 bg-green-50 rounded-lg border-2 border-green-200">
                        <div className="text-lg text-gray-700 mb-2 font-bold">调理建议</div>
                        <div className="text-base text-green-700 leading-relaxed">
                          {healthData.recommendations[0] || '暂无'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-xl">
                      暂无分析数据
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 健康改善路径 */}
              <Card className="p-10 shadow-xl border-3">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <Target className="w-12 h-12 text-orange-600" />
                    健康改善路径
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500 border-2">
                      <div className="text-xl font-bold text-green-900 mb-2">1. 紧急症状处理</div>
                      <div className="text-base text-gray-600">优先处理严重症状</div>
                    </div>
                    <div className="p-5 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 border-2">
                      <div className="text-xl font-bold text-yellow-900 mb-2">2. 生活习惯改善</div>
                      <div className="text-base text-gray-600">改正不良习惯</div>
                    </div>
                    <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500 border-2">
                      <div className="text-xl font-bold text-blue-900 mb-2">3. 身体调理</div>
                      <div className="text-base text-gray-600">全面调理身体</div>
                    </div>
                    <div className="p-5 bg-purple-50 rounded-lg border-l-4 border-purple-500 border-2">
                      <div className="text-xl font-bold text-purple-900 mb-2">4. 持续跟踪</div>
                      <div className="text-base text-gray-600">定期检查记录</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 第二行：4个4×4模块 */}
            <div className="grid grid-cols-4 gap-10">
              {/* 中医深入分析 */}
              <Card className="p-10 shadow-xl border-3">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                    中医深入分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tcmData ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                        <div className="text-base text-gray-600 mb-2 font-medium">体质类型</div>
                        <div className="text-2xl font-bold text-purple-700">{tcmData.constitution.type}</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                        <div className="text-base text-gray-600 mb-2 font-medium">气血状态</div>
                        <div className="text-2xl font-bold text-red-700">{tcmData.qiBloodStatus.type}</div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
                        <div className="text-base text-gray-600 mb-2 font-medium">脏腑功能</div>
                        <div className="text-xl font-bold text-orange-700">
                          {tcmData.organFunction[0]?.organ || '正常'}
                        </div>
                      </div>
                      <div className="p-6 bg-blue-50 rounded-lg border-3 border-blue-300">
                        <div className="text-base text-gray-600 mb-2 font-medium">阴阳平衡</div>
                        <div className="text-2xl font-bold text-blue-700">阴阳两虚</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                        <div className="text-base text-gray-600 mb-2 font-medium">经络状态</div>
                        <div className="text-2xl font-bold text-green-700">督脉不畅</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                        <div className="text-base text-gray-600 mb-2 font-medium">湿热寒凉</div>
                        <div className="text-2xl font-bold text-yellow-700">寒湿内盛</div>
                      </div>
                      <div className="p-4 bg-pink-50 rounded-lg border-2 border-pink-300">
                        <div className="text-base text-gray-600 mb-2 font-medium">舌苔分析</div>
                        <div className="text-2xl font-bold text-pink-700">舌淡苔白</div>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-300">
                        <div className="text-base text-gray-600 mb-2 font-medium">脉象分析</div>
                        <div className="text-2xl font-bold text-indigo-700">脉沉细</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-xl">
                      暂无中医分析数据
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 健康七问V2 */}
              <Card className="p-10 shadow-xl border-3">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <HelpCircle className="w-12 h-12 text-green-600" />
                    健康七问（V2新版）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    {SEVEN_QUESTIONS.slice(0, 6).map((q, i) => {
                      const isAnswered = sevenQuestionsAnswers[q.id] !== undefined && sevenQuestionsAnswers[q.id] !== null;
                      return (
                        <div key={q.id} className={`p-4 rounded-lg border-2 ${isAnswered ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}`}>
                          <div className="text-base text-gray-600 mb-2 font-medium">问{i + 1}：{q.category}</div>
                          <div className="text-base text-gray-800 line-clamp-2 font-semibold">{q.question}</div>
                          <div className={`mt-2 text-lg font-bold ${isAnswered ? 'text-green-700' : 'text-gray-400'}`}>
                            {isAnswered ? '已回答' : '未回答'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 推荐调理产品 */}
              <Card className="p-10 shadow-xl border-3">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <Shield className="w-12 h-12 text-blue-600" />
                    推荐调理产品
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="text-xl font-bold text-blue-900 mb-2">气血调理包</div>
                      <div className="text-base text-gray-600 mt-2">改善气血两虚</div>
                    </div>
                    <div className="p-5 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="text-xl font-bold text-green-900 mb-2">排毒养颜包</div>
                      <div className="text-base text-gray-600 mt-2">排出体内毒素</div>
                    </div>
                    <div className="p-5 bg-orange-50 rounded-lg border-2 border-orange-200">
                      <div className="text-xl font-bold text-orange-900 mb-2">经络疏通包</div>
                      <div className="text-base text-gray-600 mt-2">疏通经络气血</div>
                    </div>
                    <div className="p-5 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div className="text-xl font-bold text-purple-900 mb-2">滋阴补肾包</div>
                      <div className="text-base text-gray-600 mt-2">调理肾虚症状</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 推荐学习课程 */}
              <Card className="p-10 shadow-xl border-3">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <BookOpen className="w-12 h-12 text-indigo-600" />
                    推荐学习课程
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                      <div className="text-xl font-bold text-indigo-900 mb-2">中医养生基础</div>
                      <div className="text-base text-gray-600 mt-2">12课时</div>
                    </div>
                    <div className="p-5 bg-teal-50 rounded-lg border-2 border-teal-200">
                      <div className="text-xl font-bold text-teal-900 mb-2">食疗养生课</div>
                      <div className="text-base text-gray-600 mt-2">8课时</div>
                    </div>
                    <div className="p-5 bg-rose-50 rounded-lg border-2 border-rose-200">
                      <div className="text-xl font-bold text-rose-900 mb-2">经络推拿课</div>
                      <div className="text-base text-gray-600 mt-2">10课时</div>
                    </div>
                    <div className="p-5 bg-amber-50 rounded-lg border-2 border-amber-200">
                      <div className="text-xl font-bold text-amber-900 mb-2">情志调理课</div>
                      <div className="text-base text-gray-600 mt-2">6课时</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 第三行：分阶段调理计划 */}
            <div className="grid grid-cols-4 gap-10">
              <div className="col-span-4">
                <Card className="p-10 shadow-xl border-3">
                  <CardHeader>
                    <CardTitle className="text-3xl flex items-center gap-4">
                      <Target className="w-12 h-12 text-cyan-600" />
                      分阶段调理计划
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-8">
                      <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border-2 border-green-300 shadow-md">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <div className="text-3xl font-bold text-white">1</div>
                          </div>
                          <div className="text-3xl font-bold text-green-900">第一阶段</div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-2xl text-gray-800 font-semibold mb-4">1-2个月</div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">紧急症状处理</div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">建立健康作息</div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">基础饮食调理</div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">开始运动计划</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl border-2 border-yellow-300 shadow-md">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <div className="text-3xl font-bold text-white">2</div>
                          </div>
                          <div className="text-3xl font-bold text-yellow-900">第二阶段</div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-2xl text-gray-800 font-semibold mb-4">3-4个月</div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">深度调理气血</div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">改善生活习惯</div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">经络疏通调理</div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">情志心理疏导</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-blue-300 shadow-md">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <div className="text-3xl font-bold text-white">3</div>
                          </div>
                          <div className="text-3xl font-bold text-blue-900">第三阶段</div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-2xl text-gray-800 font-semibold mb-4">5-6个月</div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">巩固调理成果</div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">建立健康体系</div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">预防疾病复发</div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="text-xl text-gray-700">长期健康管理</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 第四行：2个8×8模块 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 不良生活习惯自检表（8×8） */}
              <Card className="p-10 shadow-xl border-3">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-4">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                    不良生活习惯自检表（全部252项）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-3 max-h-[600px] overflow-y-auto p-4 bg-white rounded-lg border-2">
                    {allBadHabits.map((habit) => (
                      <div
                        key={habit.id}
                        className={`p-3 rounded-lg text-sm cursor-pointer transition-all border-2 ${
                          selectedHabits.includes(habit.id)
                            ? 'bg-red-100 border-red-500 text-red-800 shadow-md'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:shadow-md'
                        }`}
                      >
                        <div className="font-mono text-xs mb-2 font-bold">#{habit.id}</div>
                        <div className="line-clamp-2 leading-tight text-base">{habit.habit}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 身体语言简表（8×8） */}
              <Card className="p-6 shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <FileText className="w-12 h-12 text-blue-600" />
                    身体语言简表（全部100项）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-3 max-h-[600px] overflow-y-auto p-4 bg-white rounded-lg border-2">
                    {BODY_SYMPTOMS.map((symptom) => (
                      <div
                        key={symptom.id}
                        className={`p-3 rounded-lg text-sm cursor-pointer transition-all border-2 ${
                          selectedBodySymptoms.includes(symptom.id)
                            ? 'bg-blue-100 border-blue-500 text-blue-800 shadow-md'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:shadow-md'
                        }`}
                      >
                        <div className="font-mono text-xs mb-2 font-bold">#{symptom.id}</div>
                        <div className="line-clamp-2 leading-tight text-base">{symptom.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 第五行：300项症状自检表（8×8） */}
            <div className="grid grid-cols-1">
              <Card className="p-6 shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <FileText className="w-12 h-12 text-purple-600" />
                    300项症状自检表（全部300项）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-3 max-h-[800px] overflow-y-auto p-4 bg-white rounded-lg border-2">
                    {BODY_SYMPTOMS_300.map((symptom) => (
                      <div
                        key={symptom.id}
                        className={`p-3 rounded-lg text-sm cursor-pointer transition-all border-2 ${
                          selectedSymptoms300.includes(symptom.id)
                            ? 'bg-purple-100 border-purple-500 text-purple-800 shadow-md'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:shadow-md'
                        }`}
                      >
                        <div className="font-mono text-xs mb-2 font-bold">#{symptom.id}</div>
                        <div className="line-clamp-2 leading-tight text-base">{symptom.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
