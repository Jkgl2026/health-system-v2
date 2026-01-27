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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[2200px] max-h-[98vh] overflow-y-auto p-6">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-6 -mt-6 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-bold text-white">用户详细信息</DialogTitle>
              <DialogDescription className="text-base text-white/90 mt-1">
                {user?.user?.name || '未知用户'}的完整健康档案
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
          </div>
        </DialogHeader>

        {user && (
          <div className="space-y-4 mt-6">
            {/* 第一行：4个4×4模块 */}
            <div className="grid grid-cols-4 gap-4">
              {/* 基本信息 */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">姓名</div>
                      <div className="font-semibold">{user.user?.name || '-'}</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">年龄</div>
                      <div className="font-semibold">{user.user?.age || '-'}岁</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">性别</div>
                      <div className="font-semibold">{user.user?.gender || '-'}</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">身高</div>
                      <div className="font-semibold">{user.user?.height || '-'}cm</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">体重</div>
                      <div className="font-semibold">{user.user?.weight || '-'}kg</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">BMI</div>
                      <div className="font-semibold">
                        {user.user?.bmi && !isNaN(Number(user.user.bmi))
                          ? Number(user.user.bmi).toFixed(1)
                          : '-'}
                      </div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">电话</div>
                      <div className="font-semibold">{user.user?.phone || '-'}</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs text-gray-600">邮箱</div>
                      <div className="font-semibold text-xs truncate">{user.user?.email || '-'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 综合健康评分 */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    综合健康评分
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthData ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white text-center">
                        <div className="text-sm font-medium mb-1">健康评分</div>
                        <div className="text-4xl font-bold">{healthData.healthScore}</div>
                        <div className="text-sm opacity-80">分（满分100）</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-blue-50 rounded">
                          <div className="text-xs text-gray-600">症状总数</div>
                          <div className="text-xl font-bold text-blue-700">{healthData.totalSymptoms}</div>
                        </div>
                        <div className="p-2 bg-red-50 rounded">
                          <div className="text-xs text-gray-600">严重+紧急</div>
                          <div className="text-xl font-bold text-red-700">
                            {healthData.breakdown.bodyLanguage.severityBreakdown.emergency +
                             healthData.breakdown.bodyLanguage.severityBreakdown.severe +
                             healthData.breakdown.symptoms300.severityBreakdown.emergency +
                             healthData.breakdown.symptoms300.severityBreakdown.severe}
                          </div>
                        </div>
                        <div className="p-2 bg-purple-50 rounded col-span-2">
                          <div className="text-xs text-gray-600">指数系数</div>
                          <div className="text-xl font-bold text-purple-700">
                            {Math.max(...[healthData.breakdown.bodyLanguage.factor, healthData.breakdown.habits.factor, healthData.breakdown.symptoms300.factor]).toFixed(1)}x
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      暂无评分数据
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 健康状况全面解析 */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    健康状况全面解析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {healthData ? (
                    <div className="space-y-2">
                      <div className="p-2 bg-purple-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">风险等级</div>
                        <div className={`font-bold ${healthData.healthScore >= 80 ? 'text-green-600' : healthData.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {healthData.healthScore >= 80 ? '低风险' : healthData.healthScore >= 60 ? '中等风险' : '高风险'}
                        </div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">需关注症状</div>
                        <div className="text-sm font-semibold text-blue-700">
                          {healthData.breakdown.bodyLanguage.severityBreakdown.emergency +
                           healthData.breakdown.bodyLanguage.severityBreakdown.severe +
                           healthData.breakdown.symptoms300.severityBreakdown.emergency +
                           healthData.breakdown.symptoms300.severityBreakdown.severe} 个严重症状
                        </div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-xs text-gray-600 mb-1">调理建议</div>
                        <div className="text-xs text-green-700">
                          {healthData.recommendations[0] || '暂无'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      暂无分析数据
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 健康改善路径 */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    健康改善路径
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                      <div className="text-xs font-semibold text-green-900">1. 紧急症状处理</div>
                      <div className="text-xs text-gray-600">优先处理严重症状</div>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
                      <div className="text-xs font-semibold text-yellow-900">2. 生活习惯改善</div>
                      <div className="text-xs text-gray-600">改正不良习惯</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                      <div className="text-xs font-semibold text-blue-900">3. 身体调理</div>
                      <div className="text-xs text-gray-600">全面调理身体</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded border-l-4 border-purple-500">
                      <div className="text-xs font-semibold text-purple-900">4. 持续跟踪</div>
                      <div className="text-xs text-gray-600">定期检查记录</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 第二行：4个4×4模块 */}
            <div className="grid grid-cols-4 gap-4">
              {/* 中医深入分析 */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    中医深入分析
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tcmData ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-purple-50 rounded border-2 border-purple-200">
                        <div className="text-xs text-gray-600">体质类型</div>
                        <div className="font-bold text-purple-700">{tcmData.constitution.type}</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <div className="text-xs text-gray-600">气血状态</div>
                        <div className="font-semibold text-red-700">{tcmData.qiBloodStatus.type}</div>
                      </div>
                      <div className="p-2 bg-orange-50 rounded">
                        <div className="text-xs text-gray-600">脏腑功能</div>
                        <div className="font-semibold text-orange-700">
                          {tcmData.organFunction[0]?.organ || '正常'}
                        </div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="text-xs text-gray-600">阴阳平衡</div>
                        <div className="font-semibold text-blue-700">阴阳两虚</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-xs text-gray-600">经络状态</div>
                        <div className="font-semibold text-green-700">督脉不畅</div>
                      </div>
                      <div className="p-2 bg-yellow-50 rounded">
                        <div className="text-xs text-gray-600">湿热寒凉</div>
                        <div className="font-semibold text-yellow-700">寒湿内盛</div>
                      </div>
                      <div className="p-2 bg-pink-50 rounded">
                        <div className="text-xs text-gray-600">舌苔分析</div>
                        <div className="font-semibold text-pink-700">舌淡苔白</div>
                      </div>
                      <div className="p-2 bg-indigo-50 rounded">
                        <div className="text-xs text-gray-600">脉象分析</div>
                        <div className="font-semibold text-indigo-700">脉沉细</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      暂无中医分析数据
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 健康七问V2 */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-green-600" />
                    健康七问（V2新版）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {SEVEN_QUESTIONS.slice(0, 6).map((q, i) => {
                      const isAnswered = sevenQuestionsAnswers[q.id] !== undefined && sevenQuestionsAnswers[q.id] !== null;
                      return (
                        <div key={q.id} className={`p-2 rounded border ${isAnswered ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="text-xs text-gray-600 mb-1">问{i + 1}：{q.category}</div>
                          <div className="text-xs text-gray-700 line-clamp-2">{q.question}</div>
                          <div className={`mt-1 text-xs font-semibold ${isAnswered ? 'text-green-700' : 'text-gray-400'}`}>
                            {isAnswered ? '已回答' : '未回答'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 推荐调理产品 */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    推荐调理产品
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-xs font-semibold text-blue-900">气血调理包</div>
                      <div className="text-xs text-gray-600 mt-1">改善气血两虚</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-xs font-semibold text-green-900">排毒养颜包</div>
                      <div className="text-xs text-gray-600 mt-1">排出体内毒素</div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded">
                      <div className="text-xs font-semibold text-orange-900">经络疏通包</div>
                      <div className="text-xs text-gray-600 mt-1">疏通经络气血</div>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <div className="text-xs font-semibold text-purple-900">滋阴补肾包</div>
                      <div className="text-xs text-gray-600 mt-1">调理肾虚症状</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 推荐学习课程 */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    推荐学习课程
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-indigo-50 rounded">
                      <div className="text-xs font-semibold text-indigo-900">中医养生基础</div>
                      <div className="text-xs text-gray-600 mt-1">12课时</div>
                    </div>
                    <div className="p-2 bg-teal-50 rounded">
                      <div className="text-xs font-semibold text-teal-900">食疗养生课</div>
                      <div className="text-xs text-gray-600 mt-1">8课时</div>
                    </div>
                    <div className="p-2 bg-rose-50 rounded">
                      <div className="text-xs font-semibold text-rose-900">经络推拿课</div>
                      <div className="text-xs text-gray-600 mt-1">10课时</div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded">
                      <div className="text-xs font-semibold text-amber-900">情志调理课</div>
                      <div className="text-xs text-gray-600 mt-1">6课时</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 第三行：分阶段调理计划 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <Card className="p-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-600" />
                      分阶段调理计划（3×3）
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                          <div className="font-bold text-green-900">第一阶段（1-2个月）</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-700">• 紧急症状处理</div>
                          <div className="text-xs text-gray-700">• 建立健康作息</div>
                          <div className="text-xs text-gray-700">• 基础饮食调理</div>
                          <div className="text-xs text-gray-700">• 开始运动计划</div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl border-2 border-yellow-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                          <div className="font-bold text-yellow-900">第二阶段（3-4个月）</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-700">• 深度调理气血</div>
                          <div className="text-xs text-gray-700">• 改善生活习惯</div>
                          <div className="text-xs text-gray-700">• 经络疏通调理</div>
                          <div className="text-xs text-gray-700">• 情志心理疏导</div>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                          <div className="font-bold text-blue-900">第三阶段（5-6个月）</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs text-gray-700">• 巩固调理成果</div>
                          <div className="text-xs text-gray-700">• 建立健康体系</div>
                          <div className="text-xs text-gray-700">• 预防疾病复发</div>
                          <div className="text-xs text-gray-700">• 长期健康管理</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 第四行：2个8×8模块 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 不良生活习惯自检表（8×8） */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    不良生活习惯自检表（全部252项）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-1 max-h-[400px] overflow-y-auto">
                    {BAD_HABITS_CHECKLIST.map((habit) => (
                      <div
                        key={habit.id}
                        className={`p-1 rounded text-xs cursor-pointer transition-colors ${
                          selectedHabits.includes(habit.id)
                            ? 'bg-red-100 border border-red-500 text-red-800'
                            : 'bg-gray-50 border border-gray-200 text-gray-600'
                        }`}
                      >
                        <div className="font-mono text-[10px] mb-0.5">#{habit.id}</div>
                        <div className="line-clamp-2 leading-tight">{habit.habit}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 身体语言简表（8×8） */}
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    身体语言简表（全部100项）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-1 max-h-[400px] overflow-y-auto">
                    {BODY_SYMPTOMS.map((symptom) => (
                      <div
                        key={symptom.id}
                        className={`p-1 rounded text-xs cursor-pointer transition-colors ${
                          selectedBodySymptoms.includes(symptom.id)
                            ? 'bg-blue-100 border border-blue-500 text-blue-800'
                            : 'bg-gray-50 border border-gray-200 text-gray-600'
                        }`}
                      >
                        <div className="font-mono text-[10px] mb-0.5">#{symptom.id}</div>
                        <div className="line-clamp-2 leading-tight">{symptom.name}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 第五行：300项症状自检表（8×8） */}
            <div className="grid grid-cols-1">
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    300项症状自检表（全部300项）
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-8 gap-1 max-h-[500px] overflow-y-auto">
                    {BODY_SYMPTOMS_300.map((symptom) => (
                      <div
                        key={symptom.id}
                        className={`p-1 rounded text-xs cursor-pointer transition-colors ${
                          selectedSymptoms300.includes(symptom.id)
                            ? 'bg-purple-100 border border-purple-500 text-purple-800'
                            : 'bg-gray-50 border border-gray-200 text-gray-600'
                        }`}
                      >
                        <div className="font-mono text-[10px] mb-0.5">#{symptom.id}</div>
                        <div className="line-clamp-2 leading-tight">{symptom.name}</div>
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
