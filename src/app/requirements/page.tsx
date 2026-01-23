'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, BookOpen, ClipboardCheck, Users, GraduationCap, ArrowRight } from 'lucide-react';
import { FOUR_REQUIREMENTS, BAD_HABITS_CHECKLIST, BODY_SYMPTOMS_300 } from '@/lib/health-data';
import Link from 'next/link';

export default function RequirementsPage() {
  const [selectedHabits, setSelectedHabits] = useState<Set<number>>(new Set());
  const [selectedSymptoms300, setSelectedSymptoms300] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'req1' | 'req2' | 'req3' | 'req4'>('overview');

  const handleHabitToggle = (id: number) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedHabits(newSelected);
  };

  const handleSymptom300Toggle = (id: number) => {
    const newSelected = new Set(selectedSymptoms300);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSymptoms300(newSelected);
  };

  const handleContinue = () => {
    // 保存到localStorage并跳转到下一页
    localStorage.setItem('selectedHabitsRequirements', JSON.stringify([...selectedHabits]));
    localStorage.setItem('selectedSymptoms300', JSON.stringify([...selectedSymptoms300]));
    window.location.href = '/choices';
  };

  const habitCategories = Object.keys(BAD_HABITS_CHECKLIST) as Array<keyof typeof BAD_HABITS_CHECKLIST>;

  // 按类别分组300项症状
  const symptoms300ByCategory = BODY_SYMPTOMS_300.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, typeof BODY_SYMPTOMS_300>);

  const symptomCategories300 = Object.keys(symptoms300ByCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/habits" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                四个要求
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tab导航 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {[
              { key: 'overview', label: '总览', icon: BookOpen },
              { key: 'req1', label: '要求1', icon: ClipboardCheck },
              { key: 'req2', label: '要求2', icon: ClipboardCheck },
              { key: 'req3', label: '要求3', icon: Users },
              { key: 'req4', label: '要求4', icon: GraduationCap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 总览页面 */}
        {activeTab === 'overview' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-2xl text-center">调理服务的四个要求</CardTitle>
                <CardDescription className="text-base text-center">
                  为了确保调理效果，需要您配合完成以下四个要求
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>重要提醒：</strong>如果您无法完成这四个要求，我也不能给您调理。
                    这些要求是调理成功的基础，缺一不可。
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  {Object.keys(FOUR_REQUIREMENTS).map((key, index) => {
                    const req = FOUR_REQUIREMENTS[key as keyof typeof FOUR_REQUIREMENTS];
                    return (
                      <Card
                        key={key}
                        className="cursor-pointer hover:shadow-lg transition-all border-2 border-gray-200 dark:border-gray-700"
                        onClick={() => setActiveTab(`req${index + 1}` as any)}
                      >
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <CardTitle className="text-xl">{req.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 dark:text-gray-300">{req.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 要求1：找病因 - 不良生活习惯表 */}
        {activeTab === 'req1' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <Card className="border-2 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{FOUR_REQUIREMENTS.requirement1.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {FOUR_REQUIREMENTS.requirement1.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>警告：</strong>{FOUR_REQUIREMENTS.requirement1.warning}
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>说明：</strong>{FOUR_REQUIREMENTS.requirement1.details}
                  </p>
                </div>

                {/* 核心公式 */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg border-2 border-blue-200 dark:border-blue-800 text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    疾病 = 坏习惯 + 时间
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    健康 = 好习惯 + 时间
                  </p>
                  <p className="text-base text-gray-700 dark:text-gray-300 mt-4">
                    养成一个好习惯可以抵消一些坏习惯
                  </p>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    已选择 {selectedHabits.size} 项习惯
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const allIds = habitCategories.flatMap(cat => BAD_HABITS_CHECKLIST[cat].map(h => h.id));
                        setSelectedHabits(new Set(allIds));
                      }}
                    >
                      全选
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedHabits(new Set())}
                    >
                      清空
                    </Button>
                  </div>
                </div>

                {/* 不良生活习惯表 */}
                {habitCategories.map((category) => {
                  const habits = BAD_HABITS_CHECKLIST[category];
                  return (
                    <Card key={category} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>{category}</span>
                          <Badge variant="secondary">
                            {habits.filter(h => selectedHabits.has(h.id)).length} / {habits.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {habits.map((habit) => (
                            <div
                              key={habit.id}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedHabits.has(habit.id)
                                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                              }`}
                              onClick={() => handleHabitToggle(habit.id)}
                            >
                              <div className="flex items-start space-x-2">
                                <Checkbox
                                  id={`habit-req-${habit.id}`}
                                  checked={selectedHabits.has(habit.id)}
                                  onChange={() => handleHabitToggle(habit.id)}
                                  className="mt-1 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <label
                                    htmlFor={`habit-req-${habit.id}`}
                                    className="text-xs font-medium cursor-pointer select-none block"
                                  >
                                    {habit.habit}
                                  </label>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {habit.impact}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 要求2：建立身体恢复档案 - 300项身体语言自检表 */}
        {activeTab === 'req2' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <Card className="border-2 border-green-100 dark:border-green-900">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{FOUR_REQUIREMENTS.requirement2.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {FOUR_REQUIREMENTS.requirement2.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>说明：</strong>{FOUR_REQUIREMENTS.requirement2.details}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>预期效果：</strong>{FOUR_REQUIREMENTS.requirement2.benefit}
                  </p>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    已选择 {selectedSymptoms300.size} / {BODY_SYMPTOMS_300.length} 项症状
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSymptoms300(new Set(BODY_SYMPTOMS_300.map(s => s.id)))}
                    >
                      全选
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedSymptoms300(new Set())}
                    >
                      清空
                    </Button>
                  </div>
                </div>

                {/* 300项身体语言自检表 */}
                {symptomCategories300.map((category) => {
                  const symptoms = symptoms300ByCategory[category];
                  return (
                    <Card key={category} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <span>{category}</span>
                          <Badge variant="secondary">
                            {symptoms.filter(s => selectedSymptoms300.has(s.id)).length} / {symptoms.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {symptoms.map((symptom) => (
                            <div
                              key={symptom.id}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedSymptoms300.has(symptom.id)
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                              }`}
                              onClick={() => handleSymptom300Toggle(symptom.id)}
                            >
                              <div className="flex items-start space-x-2">
                                <Checkbox
                                  id={`symptom300-${symptom.id}`}
                                  checked={selectedSymptoms300.has(symptom.id)}
                                  onChange={() => handleSymptom300Toggle(symptom.id)}
                                  className="mt-1 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <label
                                    htmlFor={`symptom300-${symptom.id}`}
                                    className="text-xs font-medium cursor-pointer select-none block"
                                  >
                                    {symptom.name}
                                  </label>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {symptom.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 要求3：跟着学习健康观念 */}
        {activeTab === 'req3' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-purple-100 dark:border-purple-900">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{FOUR_REQUIREMENTS.requirement3.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {FOUR_REQUIREMENTS.requirement3.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>说明：</strong>{FOUR_REQUIREMENTS.requirement3.details}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">学习的好处：</h4>
                  {FOUR_REQUIREMENTS.requirement3.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                    </div>
                  ))}
                </div>

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    每堂课只有十来分钟，不会耽误太多时间，但能帮您更好地理解和配合调理。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 要求4：学会健康自我管理 */}
        {activeTab === 'req4' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-orange-100 dark:border-orange-900">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{FOUR_REQUIREMENTS.requirement4.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {FOUR_REQUIREMENTS.requirement4.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>说明：</strong>{FOUR_REQUIREMENTS.requirement4.details}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>原因：</strong>{FOUR_REQUIREMENTS.requirement4.reason}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>预期效果：</strong>{FOUR_REQUIREMENTS.requirement4.benefit}
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    我的目标是让每个家庭都有一个懂健康的人，这样您就真的没必要什么事都来找我。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 下一步按钮 */}
        {activeTab !== 'overview' && (
          <div className="text-center space-y-4">
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              确认完成四个要求
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
            <div>
              <Link href="/choices">
                <Button variant="outline" size="lg">
                  跳过，直接查看选择
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
