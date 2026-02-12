'use client';

import { Suspense } from 'react';
import { Clock, User, Activity, FileText, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Heart, Target, Zap, Shield, RefreshCw, ArrowRight, ArrowUp, ArrowDown, Minus, Calendar, Scale, Ruler, Weight, Info, Brain, Droplet, Wind, Flame, Snowflake, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getSymptomName, getSymptomCategoryName } from '@/lib/symptomMap';

interface UserDetail {
  user_id: number;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  waistline: number | null;
  hipline: number | null;
  blood_pressure_high: string | null;
  blood_pressure_low: string | null;
  blood_sugar: string | null;
  blood_fat: string | null;
  heart_rate: string | null;
  sleep_hours: number | null;
  exercise_hours: number | null;
  smoking: string | null;
  drinking: string | null;
  diet: string | null;
  chronic_disease: string | null;
  medication: string | null;
  family_history: string | null;
  symptoms: string | null;
  occupation: string | null;
  address: string | null;
  answer_content: string | null;
  analysis: string | null;
  health_status: string | null;
  health_score: number | null;
  self_check_completed: boolean;
  self_check_time: string | null;
  create_time: string;
  update_time: string;
  symptomCheckHistory: Array<{
    check_id: number;
    check_date: string;
    selected_symptoms: number[];
    target_symptoms: number[];
    total_score: number;
    qi_blood_score: number;
    circulation_score: number;
    toxins_score: number;
    blood_lipids_score: number;
    coldness_score: number;
    immunity_score: number;
    emotions_score: number;
    overall_health: number;
  }>;
}

interface HealthAnalysis {
  health_risk_assessment?: string;
  personalized_regimen?: string;
  improvement_path?: string;
  health_element_analysis?: string;
  plan_selection?: string;
  tcm_deep_analysis?: string;
  seven_questions?: string;
  element_completion?: string;
}

function UserDetailContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);

  const fetchUserDetail = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/user/detail?userId=${userId}`);
      const data = await response.json();

      if (data.code === 200) {
        setUser(data.data);
        setLastUpdateTime(new Date());
        setError('');
      } else {
        setError(data.msg || '获取用户详情失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserDetail();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchUserDetail]);

  const getHealthStatusColor = (status: string | null) => {
    switch (status) {
      case '优秀': return 'bg-green-500';
      case '良好': return 'bg-blue-500';
      case '一般': return 'bg-yellow-500';
      case '异常': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthStatusColorFromScore = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthStatusFromScore = (score: number) => {
    if (score >= 85) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '一般';
    return '异常';
  };

  // 解析健康分析数据
  const parseHealthAnalysis = (analysis: string | null): HealthAnalysis => {
    if (!analysis) return {};

    const result: HealthAnalysis = {};

    // 尝试解析JSON格式的分析数据
    try {
      const parsed = JSON.parse(analysis);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.assign(result, parsed);
      }
    } catch (e) {
      // 如果不是JSON，尝试按段落分割
      const sections = analysis.split(/\n\s*\n/);
      sections.forEach(section => {
        const lines = section.trim().split('\n');
        if (lines.length > 0) {
          const title = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();

          if (title.includes('风险评估') || title.includes('风险')) {
            result.health_risk_assessment = content;
          } else if (title.includes('调理') || title.includes('方案')) {
            result.personalized_regimen = content;
          } else if (title.includes('改善路径') || title.includes('路径')) {
            result.improvement_path = content;
          } else if (title.includes('要素') || title.includes('要素分析')) {
            result.health_element_analysis = content;
          } else if (title.includes('方案选择') || title.includes('选择')) {
            result.plan_selection = content;
          } else if (title.includes('中医') || title.includes('深入')) {
            result.tcm_deep_analysis = content;
          } else if (title.includes('七问') || title.includes('七')) {
            result.seven_questions = content;
          } else if (title.includes('完成') || title.includes('完成情况')) {
            result.element_completion = content;
          }
        }
      });
    }

    return result;
  };

  // 比较两次检查的差异
  const compareHealthRecords = (prev: any, curr: any) => {
    if (!prev || !curr) return null;

    const changes = {
      scoreChange: curr.total_score - prev.total_score,
      newSymptoms: curr.selected_symptoms?.filter((id: number) => !prev.selected_symptoms?.includes(id)) || [],
      improvedSymptoms: prev.selected_symptoms?.filter((id: number) => !curr.selected_symptoms?.includes(id)) || [],
      dimensionChanges: [
        { name: '气血', prev: prev.qi_blood_score, curr: curr.qi_blood_score },
        { name: '循环', prev: prev.circulation_score, curr: curr.circulation_score },
        { name: '毒素', prev: prev.toxins_score, curr: curr.toxins_score },
        { name: '血脂', prev: prev.blood_lipids_score, curr: curr.blood_lipids_score },
        { name: '寒气', prev: prev.coldness_score, curr: curr.coldness_score },
        { name: '免疫', prev: prev.immunity_score, curr: curr.immunity_score },
        { name: '情绪', prev: prev.emotions_score, curr: curr.emotions_score },
      ]
    };

    return changes;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">加载中...</div>;
  }

  if (error) {
    return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;
  }

  if (!user) {
    return <div className="text-red-500">用户不存在</div>;
  }

  // 解析 answer_content（健康七问）
  let answerContent = null;
  try {
    if (user.answer_content) {
      answerContent = JSON.parse(user.answer_content);
    }
  } catch (e) {
    answerContent = null;
  }

  // 解析 symptoms
  let parsedSymptoms = null;
  try {
    if (user.symptoms) {
      parsedSymptoms = JSON.parse(user.symptoms);
    }
  } catch (e) {
    parsedSymptoms = user.symptoms;
  }

  // 解析健康分析
  const healthAnalysis = parseHealthAnalysis(user.analysis);

  // 获取最近的几次检查（最多3次）
  const recentChecks = (user.symptomCheckHistory || []).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">用户详情</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              最后更新: {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : '-'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUserDetail}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            返回
          </Button>
        </div>
      </div>

      {/* 基本信息和BMI */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">姓名</p>
              <p className="text-xl font-bold text-gray-800">{user.name || '-'}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">年龄</p>
              <p className="text-xl font-bold text-gray-800">{user.age || '-'} 岁</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">性别</p>
              <p className="text-xl font-bold text-gray-800">{user.gender || '-'}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">BMI</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-800">{user.bmi ? Number(user.bmi).toFixed(1) : '-'}</p>
                {user.bmi && (
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    user.bmi < 18.5 ? 'bg-blue-100 text-blue-600' :
                    user.bmi < 24 ? 'bg-green-100 text-green-600' :
                    user.bmi < 28 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {user.bmi < 18.5 ? '偏瘦' :
                     user.bmi < 24 ? '正常' :
                     user.bmi < 28 ? '超重' : '肥胖'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 综合健康评分 */}
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Activity className="w-5 h-5" />
            综合健康评分
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 主评分 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">整体健康评分</h3>
                {user.health_status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getHealthStatusColor(user.health_status)}`}>
                    {user.health_status}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke={(user.health_score ?? 0) >= 80 ? '#10b981' : (user.health_score ?? 0) >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      strokeDasharray={`${(user.health_score ?? 0) * 2.83} 283`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-gray-800">{user.health_score || 0}</p>
                      <p className="text-sm text-gray-500">分</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {(user.health_score ?? 0) >= 85 ? '🎉 健康状态优秀，继续保持！' :
                   (user.health_score ?? 0) >= 70 ? '💪 健康状态良好，注意保持' :
                   (user.health_score ?? 0) >= 50 ? '⚠️ 健康状态一般，需要关注' :
                   '🚨 健康状态异常，需要重视'}
                </p>
              </div>
            </div>

            {/* 各维度评分 */}
            {recentChecks.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">各维度评分（最新检查）</h3>
                {[
                  { name: '气血循环', score: recentChecks[0].qi_blood_score, icon: Droplet, color: 'red' },
                  { name: '血液循环', score: recentChecks[0].circulation_score, icon: Heart, color: 'pink' },
                  { name: '毒素代谢', score: recentChecks[0].toxins_score, icon: Zap, color: 'yellow' },
                  { name: '血脂状况', score: recentChecks[0].blood_lipids_score, icon: Flame, color: 'orange' },
                  { name: '寒气状况', score: recentChecks[0].coldness_score, icon: Snowflake, color: 'blue' },
                  { name: '免疫力', score: recentChecks[0].immunity_score, icon: Shield, color: 'green' },
                  { name: '情绪状态', score: recentChecks[0].emotions_score, icon: Brain, color: 'purple' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <span className={`text-sm font-bold ${
                          item.score >= 80 ? 'text-green-600' :
                          item.score >= 60 ? 'text-blue-600' :
                          'text-red-600'
                        }`}>{item.score}分</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            item.score >= 80 ? 'bg-green-500' :
                            item.score >= 60 ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 个人多次详细对比（1-3次） */}
      {recentChecks.length > 1 && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <TrendingUp className="w-5 h-5" />
              健康趋势对比（{recentChecks.length}次记录）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentChecks.map((check, index) => {
                if (index === 0) return null;
                const changes = compareHealthRecords(recentChecks[index - 1], check);
                if (!changes) return null;

                return (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            第{index}次检查 vs 第{index + 1}次检查
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(recentChecks[index - 1].check_date).toLocaleDateString('zh-CN')} → {' '}
                            {new Date(check.check_date).toLocaleDateString('zh-CN')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {changes.scoreChange > 0 ? (
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <ArrowUp className="w-4 h-4" />
                            +{changes.scoreChange}分
                          </span>
                        ) : changes.scoreChange < 0 ? (
                          <span className="flex items-center gap-1 text-red-600 font-semibold">
                            <ArrowDown className="w-4 h-4" />
                            {changes.scoreChange}分
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-600 font-semibold">
                            <Minus className="w-4 h-4" />
                            0分
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 症状变化 */}
                    {(changes.newSymptoms.length > 0 || changes.improvedSymptoms.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {changes.newSymptoms.length > 0 && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              新增症状 ({changes.newSymptoms.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {changes.newSymptoms.slice(0, 5).map((id: number) => (
                                <span key={id} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                                  {getSymptomName(id)}
                                </span>
                              ))}
                              {changes.newSymptoms.length > 5 && (
                                <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs">
                                  +{changes.newSymptoms.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {changes.improvedSymptoms.length > 0 && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <p className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              改善症状 ({changes.improvedSymptoms.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {changes.improvedSymptoms.slice(0, 5).map((id: number) => (
                                <span key={id} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                  {getSymptomName(id)}
                                </span>
                              ))}
                              {changes.improvedSymptoms.length > 5 && (
                                <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs">
                                  +{changes.improvedSymptoms.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 各维度变化 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {changes.dimensionChanges.map((dim, dimIndex) => (
                        <div
                          key={dimIndex}
                          className={`p-2 rounded-lg text-center ${
                            dim.curr > dim.prev ? 'bg-green-100 border border-green-200' :
                            dim.curr < dim.prev ? 'bg-red-100 border border-red-200' :
                            'bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <p className="text-xs text-gray-600 mb-1">{dim.name}</p>
                          <div className="flex items-center justify-center gap-1">
                            {dim.curr > dim.prev && <ArrowUp className="w-3 h-3 text-green-600" />}
                            {dim.curr < dim.prev && <ArrowDown className="w-3 h-3 text-red-600" />}
                            <span className="text-sm font-bold text-gray-800">{dim.curr}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 调理建议 */}
                    {(changes.scoreChange < 0 || changes.newSymptoms.length > changes.improvedSymptoms.length) && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-1">
                          <Info className="w-4 h-4" />
                          调理建议
                        </p>
                        <p className="text-sm text-yellow-700">
                          {changes.scoreChange < 0 && '健康评分有所下降，建议及时调整生活方式，保持规律的作息和饮食。'}
                          {changes.newSymptoms.length > changes.improvedSymptoms.length &&
                           '新增症状较多，建议关注身体变化，适当增加运动量，改善饮食结构。'}
                          请保持积极心态，持续监测健康状况。
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 症状自检记录 */}
      <Card className="border-2 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Target className="w-5 h-5" />
            症状自检记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentChecks.length > 0 ? (
            <div className="space-y-4">
              {recentChecks.map((record, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedHistoryIndex === index
                      ? 'border-red-400 bg-red-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-red-300'
                  }`}
                  onClick={() => setSelectedHistoryIndex(selectedHistoryIndex === index ? null : index)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {index === 0 ? (
                          <Activity className="w-5 h-5 text-green-600" />
                        ) : (
                          <Calendar className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {index === 0 ? '最新检查' : `历史记录 ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.check_date).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        record.total_score >= 80 ? 'bg-green-100 text-green-700' :
                        record.total_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        得分: {record.total_score}
                      </span>
                      {selectedHistoryIndex === index ? (
                        <ArrowUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {selectedHistoryIndex === index && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      {/* 选中的症状 */}
                      {record.selected_symptoms && record.selected_symptoms.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            选中的症状（{record.selected_symptoms.length}项）：
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {record.selected_symptoms.map((symptomId) => (
                              <span
                                key={symptomId}
                                className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs border border-red-200"
                                title={`${getSymptomCategoryName(symptomId)} - ID: ${symptomId}`}
                              >
                                {getSymptomName(symptomId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 目标改善症状 */}
                      {record.target_symptoms && record.target_symptoms.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            目标改善症状（{record.target_symptoms.length}项）：
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {record.target_symptoms.map((symptomId) => (
                              <span
                                key={symptomId}
                                className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs border border-orange-200"
                                title={`${getSymptomCategoryName(symptomId)} - ID: ${symptomId}`}
                              >
                                {getSymptomName(symptomId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 各维度得分详情 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500">气血</p>
                          <p className="text-lg font-bold text-red-600">{record.qi_blood_score}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500">循环</p>
                          <p className="text-lg font-bold text-pink-600">{record.circulation_score}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500">毒素</p>
                          <p className="text-lg font-bold text-yellow-600">{record.toxins_score}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500">血脂</p>
                          <p className="text-lg font-bold text-orange-600">{record.blood_lipids_score}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500">寒气</p>
                          <p className="text-lg font-bold text-blue-600">{record.coldness_score}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500">免疫</p>
                          <p className="text-lg font-bold text-green-600">{record.immunity_score}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500">情绪</p>
                          <p className="text-lg font-bold text-purple-600">{record.emotions_score}</p>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-xs text-gray-500">整体</p>
                          <p className="text-lg font-bold text-gray-800">{record.overall_health}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>暂无症状自检记录</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 健康七问 */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Sparkles className="w-5 h-5" />
            健康七问
          </CardTitle>
        </CardHeader>
        <CardContent>
          {answerContent && Array.isArray(answerContent) ? (
            <div className="space-y-3">
              {answerContent.map((item: any, index: number) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">{item.question || `问题 ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">{item.answer || item.content || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : typeof answerContent === 'object' && answerContent !== null ? (
            <div className="space-y-3">
              {Object.entries(answerContent).map(([key, value]: [string, any], index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 mb-1">{key}</p>
                      <p className="text-sm text-gray-600">{String(value)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>暂无健康七问记录</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 健康状况分析模块 */}
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <FileText className="w-5 h-5" />
            健康状况分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 健康风险评估 */}
            {healthAnalysis.health_risk_assessment && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-xl border border-red-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  健康风险评估
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {healthAnalysis.health_risk_assessment}
                </p>
              </div>
            )}

            {/* 个性化调理方案 */}
            {healthAnalysis.personalized_regimen && (
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  个性化调理方案
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {healthAnalysis.personalized_regimen}
                </p>
              </div>
            )}

            {/* 健康改善路径 */}
            {healthAnalysis.improvement_path && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  健康改善路径
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {healthAnalysis.improvement_path}
                </p>
              </div>
            )}

            {/* 健康要素分析 */}
            {healthAnalysis.health_element_analysis && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  健康要素分析
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {healthAnalysis.health_element_analysis}
                </p>
              </div>
            )}

            {/* 方案选择 */}
            {healthAnalysis.plan_selection && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-xl border border-yellow-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  方案选择
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {healthAnalysis.plan_selection}
                </p>
              </div>
            )}

            {/* 中医深入分析 */}
            {healthAnalysis.tcm_deep_analysis && (
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 p-5 rounded-xl border border-indigo-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  中医深入分析
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {healthAnalysis.tcm_deep_analysis}
                </p>
              </div>
            )}

            {/* 四个要素完成情况 */}
            {healthAnalysis.element_completion && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-5 rounded-xl border border-teal-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  四个要素完成情况
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {healthAnalysis.element_completion}
                </p>
              </div>
            )}

            {/* 如果没有解析出任何子模块，显示完整的analysis */}
            {!Object.values(healthAnalysis).some(value => value) && user.analysis && (
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  健康分析报告
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {user.analysis}
                </p>
              </div>
            )}

            {!user.analysis && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>暂无健康分析报告</p>
                <p className="text-sm mt-1">请完成健康自检后生成分析报告</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 数据时间戳 */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>数据时间戳</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">创建时间</p>
              <p className="font-semibold text-gray-800">{new Date(user.create_time).toLocaleString('zh-CN')}</p>
            </div>
            <div>
              <p className="text-gray-500">更新时间</p>
              <p className="font-semibold text-gray-800">{new Date(user.update_time).toLocaleString('zh-CN')}</p>
            </div>
            <div>
              <p className="text-gray-500">自检时间</p>
              <p className="font-semibold text-gray-800">
                {user.self_check_time ? new Date(user.self_check_time).toLocaleString('zh-CN') : '未完成'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64">加载中...</div>}>
      <UserDetailContent />
    </Suspense>
  );
}
