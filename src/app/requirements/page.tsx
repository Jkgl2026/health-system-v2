'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ArrowRight, CheckCircle2, AlertCircle, BookOpen, ClipboardCheck, Users, GraduationCap, Lock, Unlock } from 'lucide-react';
import { FOUR_REQUIREMENTS, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS_300 } from '@/lib/health-data';
import { getOrGenerateUserId } from '@/lib/user-context';
import Link from 'next/link';

// 页面步骤类型
type Step = 'overview' | 'req1-2' | 'req3' | 'req4';

export default function RequirementsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedHabits, setSelectedHabits] = useState<Set<number>>(new Set());
  const [selectedSymptoms300, setSelectedSymptoms300] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState<Step>('overview');

  // 记录用户已访问过的页面
  const [visitedSteps, setVisitedSteps] = useState<Set<Step>>(new Set(['overview']));

  // 记录每个步骤的完成状态
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  const handleHabitToggle = (id: number) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedHabits(newSelected);
  };

  // 从 localStorage 恢复之前的数据 - 优化为异步加载
  useEffect(() => {
    // 优先设置loading为false，立即显示UI骨架
    setLoading(false);

    // 异步加载数据，避免阻塞UI渲染
    const timer = setTimeout(() => {
      try {
        const savedHabits = localStorage.getItem('selectedHabitsRequirements');
        const savedSymptoms300 = localStorage.getItem('selectedSymptoms300');

        if (savedHabits) {
          const habits = JSON.parse(savedHabits);
          setSelectedHabits(new Set(habits));
          console.log('[RequirementsPage] 恢复已选择的不良习惯:', habits.length);
        }

        if (savedSymptoms300) {
          const symptoms = JSON.parse(savedSymptoms300);
          setSelectedSymptoms300(new Set(symptoms));
          console.log('[RequirementsPage] 恢复已选择的300症状:', symptoms.length);
        }
      } catch (error) {
        console.error('[RequirementsPage] 恢复数据失败:', error);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleSymptom300Toggle = (id: number) => {
    const newSelected = new Set(selectedSymptoms300);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSymptoms300(newSelected);
  };

  // 切换步骤
  const handleStepChange = (step: Step) => {
    // 标记当前步骤为已访问
    setVisitedSteps(prev => new Set([...prev, step]));

    // 如果要跳转的步骤是要求1+2，检查是否已完成
    if (step === 'req1-2') {
      setVisitedSteps(prev => new Set([...prev, step]));
    }
    // 如果要跳转的步骤是要求3，检查是否已完成要求1+2
    if (step === 'req3') {
      if (visitedSteps.has('req1-2')) {
        setVisitedSteps(prev => new Set([...prev, step]));
      }
    }
    // 如果要跳转的步骤是要求4，检查是否已完成要求3
    if (step === 'req4') {
      if (visitedSteps.has('req3')) {
        setVisitedSteps(prev => new Set([...prev, step]));
      }
    }

    setActiveStep(step);
  };

  // 检查用户是否可以继续下一步
  const canContinue = visitedSteps.has('req1-2') && visitedSteps.has('req3') && visitedSteps.has('req4');

  const handleContinue = async () => {
    if (!canContinue) {
      alert('请先完成所有四个要求的阅读！');
      return;
    }

    try {
      // 获取用户ID
      const userId = getOrGenerateUserId();

      // 保存到localStorage（备用）
      localStorage.setItem('selectedHabitsRequirements', JSON.stringify([...selectedHabits]));
      localStorage.setItem('selectedSymptoms300', JSON.stringify([...selectedSymptoms300]));

      // 保存到数据库
      const response = await fetch('/api/user/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          badHabitsChecklist: [...selectedHabits],
          symptoms300Checklist: [...selectedSymptoms300],
        }),
      });

      if (response.ok) {
        window.location.href = '/recovery';
      } else {
        const error = await response.json();
        console.error('保存失败:', error);
        alert('保存失败，请重试：' + (error.error || '未知错误'));
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请检查网络连接后重试');
    }
  };

  const habitCategories = Object.keys(BAD_HABITS_CHECKLIST) as Array<keyof typeof BAD_HABITS_CHECKLIST>;

  // 使用useMemo缓存300项症状的分组计算
  const symptoms300ByCategory = useMemo(() => {
    return BODY_SYMPTOMS_300.reduce((acc, symptom) => {
      if (!acc[symptom.category]) {
        acc[symptom.category] = [];
      }
      acc[symptom.category].push(symptom);
      return acc;
    }, {} as Record<string, typeof BODY_SYMPTOMS_300>);
  }, []);

  const symptomCategories300 = Object.keys(symptoms300ByCategory);

  // 定义步骤顺序
  const steps: { key: Step; label: string; icon: any }[] = [
    { key: 'overview', label: '总览', icon: BookOpen },
    { key: 'req1-2', label: '要求1-2', icon: ClipboardCheck },
    { key: 'req3', label: '要求3', icon: Users },
    { key: 'req4', label: '要求4', icon: GraduationCap },
  ];

  // 获取当前步骤的索引
  const currentStepIndex = steps.findIndex(s => s.key === activeStep);

  // 检查步骤是否已访问
  const isStepVisited = (step: Step) => visitedSteps.has(step);

  // 检查步骤是否可访问
  const isStepAccessible = (step: Step, index: number) => {
    // 总览总是可访问
    if (step === 'overview') return true;
    // 要求1-2总是可访问（看完总览后）
    if (step === 'req1-2') return visitedSteps.has('overview');
    // 要求3需要先看要求1-2
    if (step === 'req3') return visitedSteps.has('req1-2');
    // 要求4需要先看要求3
    if (step === 'req4') return visitedSteps.has('req3');
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/choices" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                四个要求
              </Badge>
              <Badge variant={canContinue ? "default" : "secondary"} className="text-sm">
                {visitedSteps.size}/4 完成
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 顶部 Tab 导航 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border-2 border-blue-200 dark:border-blue-800">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const accessible = isStepAccessible(step.key, index);
              const visited = isStepVisited(step.key);
              const active = activeStep === step.key;

              return (
                <button
                  key={step.key}
                  onClick={() => accessible && handleStepChange(step.key)}
                  disabled={!accessible}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all relative ${
                    active
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg scale-105'
                      : accessible
                      ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-bold">{step.label}</span>
                  {visited && active && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {!accessible && (
                    <Lock className="w-4 h-4 absolute -top-1 -right-1 bg-gray-400 rounded-full p-0.5 text-white" />
                  )}
                  {accessible && visited && !active && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 总览页面 */}
        {activeStep === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl text-center font-bold">调理服务的四个要求</CardTitle>
                <CardDescription className="text-base md:text-lg text-center">
                  为了确保调理效果，需要您配合完成以下四个要求
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-base md:text-lg">
                    <strong className="text-red-700 dark:text-red-300">重要提醒：</strong>如果您无法完成这四个要求，我也不能给您调理。
                    这些要求是调理成功的基础，缺一不可。
                    <br />
                    <strong className="text-red-600 dark:text-red-400 mt-2 block text-lg md:text-xl">请务必按顺序阅读完成所有四个要求！</strong>
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4 md:gap-6">
                  <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader>
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl flex-shrink-0">
                          1
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-bold">要求1：找病因 - 不良生活习惯表</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">{FOUR_REQUIREMENTS.requirement1.description}</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
                    <CardHeader>
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl flex-shrink-0">
                          2
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-bold">要求2：找病根 - 300症状自检表</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">{FOUR_REQUIREMENTS.requirement2.description}</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                    <CardHeader>
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl flex-shrink-0">
                          3
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-bold">{FOUR_REQUIREMENTS.requirement3.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">{FOUR_REQUIREMENTS.requirement3.description}</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                    <CardHeader>
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl md:text-2xl flex-shrink-0">
                          4
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-bold">{FOUR_REQUIREMENTS.requirement4.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">{FOUR_REQUIREMENTS.requirement4.description}</p>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-base md:text-lg text-yellow-900 dark:text-yellow-100">
                    <strong className="text-yellow-800 dark:text-yellow-200">下一步：</strong>请点击下方导航或"要求1-2"按钮，开始详细阅读并填写要求1和要求2。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 要求1+2：找病因和找病根 */}
        {activeStep === 'req1-2' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* 要求1：找病因 */}
            <Card className="border-2 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-extrabold">{FOUR_REQUIREMENTS.requirement1.title}</CardTitle>
                    <CardDescription className="text-lg mt-1">
                      {FOUR_REQUIREMENTS.requirement1.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-base md:text-lg">
                    <strong className="text-red-700 dark:text-red-300">警告：</strong>{FOUR_REQUIREMENTS.requirement1.warning}
                  </AlertDescription>
                </Alert>

                <div className="p-5 md:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    <strong className="text-blue-800 dark:text-blue-200">说明：</strong>{FOUR_REQUIREMENTS.requirement1.details}
                  </p>
                </div>

                {/* 核心公式 */}
                <div className="p-6 md:p-8 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-800 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    疾病 = 坏习惯 + 时间
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    健康 = 好习惯 + 时间
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mt-4 font-medium">
                    养成一个好习惯可以抵消一些坏习惯
                  </p>
                </div>

                {/* 不良习惯表 */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium">
                      已选择 <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedHabits.size}</span> 项习惯
                    </p>
                    <div className="space-x-2">
                      <Button variant="outline" size="default" className="text-base" onClick={() => {
                        const allHabitIds = Object.values(BAD_HABITS_CHECKLIST).flat().map(h => h.id);
                        setSelectedHabits(new Set(allHabitIds));
                      }}>
                        全选
                      </Button>
                      <Button variant="outline" size="default" className="text-base" onClick={() => setSelectedHabits(new Set())}>
                        清空
                      </Button>
                    </div>
                  </div>

                  {habitCategories.map(category => (
                    <Card key={category} className="border-2 border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800">
                        <CardTitle className="text-xl md:text-2xl font-bold">{category}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {BAD_HABITS_CHECKLIST[category].map(habit => (
                            <div key={habit.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
                              <Checkbox
                                id={`habit-${habit.id}`}
                                checked={selectedHabits.has(habit.id)}
                                onCheckedChange={() => handleHabitToggle(habit.id)}
                                className="mt-1 w-5 h-5"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`habit-${habit.id}`}
                                  className="text-sm md:text-base text-gray-700 dark:text-gray-300 cursor-pointer font-medium leading-relaxed block mb-1"
                                >
                                  {habit.habit}
                                </label>
                                {habit.impact && (
                                  <p className="text-xs md:text-sm text-red-600 dark:text-red-400 mt-1 leading-relaxed">
                                    {habit.impact}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 要求2：找病根 */}
            <Card className="border-2 border-purple-100 dark:border-purple-900">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-extrabold">{FOUR_REQUIREMENTS.requirement2.title}</CardTitle>
                    <CardDescription className="text-lg mt-1">
                      {FOUR_REQUIREMENTS.requirement2.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
                  <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <AlertDescription className="text-base md:text-lg">
                    <strong className="text-purple-700 dark:text-purple-300">说明：</strong>{FOUR_REQUIREMENTS.requirement2.details}
                  </AlertDescription>
                </Alert>

                {/* 300症状表 */}
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-medium">
                      已选择 <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedSymptoms300.size}</span> 项症状
                    </p>
                    <div className="space-x-2">
                      <Button variant="outline" size="default" className="text-base" onClick={() => {
                        const allSymptomIds = BODY_SYMPTOMS_300.map(s => s.id);
                        setSelectedSymptoms300(new Set(allSymptomIds));
                      }}>
                        全选
                      </Button>
                      <Button variant="outline" size="default" className="text-base" onClick={() => setSelectedSymptoms300(new Set())}>
                        清空
                      </Button>
                    </div>
                  </div>

                  {symptomCategories300.map(category => (
                    <Card key={category} className="border-2 border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-800">
                        <CardTitle className="text-xl md:text-2xl font-bold">{category}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {symptoms300ByCategory[category].map(symptom => (
                            <div key={symptom.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-800">
                              <Checkbox
                                id={`symptom300-${symptom.id}`}
                                checked={selectedSymptoms300.has(symptom.id)}
                                onCheckedChange={() => handleSymptom300Toggle(symptom.id)}
                                className="mt-1 w-5 h-5"
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`symptom300-${symptom.id}`}
                                  className="text-sm md:text-base text-gray-700 dark:text-gray-300 cursor-pointer font-medium leading-relaxed block mb-1"
                                >
                                  {symptom.name}
                                </label>
                                {symptom.description && (
                                  <p className="text-xs md:text-sm text-purple-600 dark:text-purple-400 leading-relaxed">
                                    {symptom.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 要求3：相信调理 */}
        {activeStep === 'req3' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-green-100 dark:border-green-900">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-3xl md:text-4xl font-extrabold">{FOUR_REQUIREMENTS.requirement3.title}</CardTitle>
                    <CardDescription className="text-lg md:text-xl mt-2">
                      {FOUR_REQUIREMENTS.requirement3.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-base md:text-lg">
                    <strong className="text-green-700 dark:text-green-300">重要：</strong>{FOUR_REQUIREMENTS.requirement3.details}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 md:space-y-6">
                  <div className="p-4 md:p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-3 md:mb-4 text-lg md:text-xl font-bold text-gray-900 dark:text-white">相信调理的原因</h4>
                    <ul className="space-y-2 md:space-y-3 text-base md:text-lg text-gray-700 dark:text-gray-300">
                      <li>• 身体有强大的自我修复能力</li>
                      <li>• 找到病因，对症调理，效果显著</li>
                      <li>• 无数成功案例证明了调理的有效性</li>
                      <li>• 坚持调理，给身体足够的时间恢复</li>
                    </ul>
                  </div>

                  <div className="p-4 md:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-3 md:mb-4 text-lg md:text-xl font-bold text-gray-900 dark:text-white">如何建立信心</h4>
                    <ul className="space-y-2 md:space-y-3 text-base md:text-lg text-gray-700 dark:text-gray-300">
                      <li>• 学习健康知识，了解调理原理</li>
                      <li>• 观察身体变化，感受进步</li>
                      <li>• 与导师沟通，获得鼓励和指导</li>
                      <li>• 保持积极心态，相信自己能够恢复</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 要求4：学习知识 */}
        {activeStep === 'req4' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-orange-100 dark:border-orange-900">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-3xl md:text-4xl font-extrabold">{FOUR_REQUIREMENTS.requirement4.title}</CardTitle>
                    <CardDescription className="text-lg md:text-xl mt-2">
                      {FOUR_REQUIREMENTS.requirement4.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
                  <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-base md:text-lg">
                    <strong className="text-orange-700 dark:text-orange-300">重要：</strong>{FOUR_REQUIREMENTS.requirement4.details}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 md:space-y-6">
                  <div className="p-4 md:p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold mb-3 md:mb-4 text-lg md:text-xl font-bold text-gray-900 dark:text-white">学习内容</h4>
                    <ul className="space-y-2 md:space-y-3 text-base md:text-lg text-gray-700 dark:text-gray-300">
                      <li>• 系统战役故事 - 了解七个健康要素</li>
                      <li>• 健康要素原理 - 深入理解每个要素</li>
                      <li>• 好转反应 - 理解调理过程中的反应</li>
                      <li>• 恢复速度8要素 - 加快恢复的方法</li>
                      <li>• 21堂必修课程 - 系统学习健康管理</li>
                      <li>• 发心感悟 - 树立正确的健康观念</li>
                    </ul>
                  </div>

                  <div className="p-4 md:p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-3 md:mb-4 text-lg md:text-xl font-bold text-gray-900 dark:text-white">学习建议</h4>
                    <ul className="space-y-2 md:space-y-3 text-base md:text-lg text-gray-700 dark:text-gray-300">
                      <li>• 认真阅读每一章节，不要跳跃</li>
                      <li>• 做好笔记，记录重要知识点</li>
                      <li>• 理论结合实践，将知识转化为行动</li>
                      <li>• 有疑问及时向导师请教</li>
                      <li>• 反复学习，加深理解和记忆</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* 底部导航 - 固定在底部 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-lg z-50">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
            {/* 导航按钮 */}
            <div className="flex justify-center md:justify-start flex-1 overflow-x-auto pb-2 md:pb-0">
              <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 md:p-1.5">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const accessible = isStepAccessible(step.key, index);
                  const visited = isStepVisited(step.key);
                  const active = activeStep === step.key;

                  return (
                    <button
                      key={step.key}
                      onClick={() => accessible && handleStepChange(step.key)}
                      disabled={!accessible}
                      className={`flex items-center space-x-1.5 md:space-x-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg transition-all whitespace-nowrap ${
                        active
                          ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md'
                          : accessible
                          ? 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-600'
                          : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs md:text-sm font-bold">{step.label}</span>
                      {visited && active && (
                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                      {!accessible && (
                        <Lock className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                      {accessible && visited && !active && (
                        <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {!canContinue && (
                <Alert className="flex-1 max-w-md border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 py-2 md:py-2.5">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-xs md:text-sm text-yellow-900 dark:text-yellow-100">
                    请完成所有四个要求后才能继续
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleContinue}
                disabled={!canContinue}
                size="lg"
                className={`text-sm md:text-base px-4 md:px-6 ${
                  canContinue
                    ? 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                继续下一步
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
