'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ArrowRight, CheckCircle2, AlertCircle, BookOpen, ClipboardCheck, Users, GraduationCap } from 'lucide-react';
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
    // 保存到localStorage
    localStorage.setItem('selectedHabitsRequirements', JSON.stringify([...selectedHabits]));
    localStorage.setItem('selectedSymptoms300', JSON.stringify([...selectedSymptoms300]));
    window.location.href = '/recovery';
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
            <Link href="/choices" className="flex items-center space-x-2">
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
          <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border-2 border-blue-200 dark:border-blue-800">
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
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-lg scale-105'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-base font-bold">{tab.label}</span>
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

                <div className="text-center mt-8">
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    继续下一步
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
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

                {/* 不良习惯表 */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      已选择 {selectedHabits.size} 项习惯
                    </p>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        const allHabitIds = Object.values(BAD_HABITS_CHECKLIST).flat().map(h => h.id);
                        setSelectedHabits(new Set(allHabitIds));
                      }}>
                        全选
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedHabits(new Set())}>
                        清空
                      </Button>
                    </div>
                  </div>

                  {habitCategories.map(category => (
                    <Card key={category} className="border border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {BAD_HABITS_CHECKLIST[category].map(habit => (
                            <div key={habit.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                              <Checkbox
                                id={`habit-${habit.id}`}
                                checked={selectedHabits.has(habit.id)}
                                onCheckedChange={() => handleHabitToggle(habit.id)}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`habit-${habit.id}`}
                                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                  {habit.habit}
                                </label>
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

        {/* 要求2：详细了解 - 300个症状 */}
        {activeTab === 'req2' && (
          <div className="max-w-6xl mx-auto space-y-6">
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
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>说明：</strong>{FOUR_REQUIREMENTS.requirement2.details}
                  </AlertDescription>
                </Alert>

                {/* 300症状表 */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      已选择 {selectedSymptoms300.size} 项症状
                    </p>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        const allSymptomIds = BODY_SYMPTOMS_300.map(s => s.id);
                        setSelectedSymptoms300(new Set(allSymptomIds));
                      }}>
                        全选
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedSymptoms300(new Set())}>
                        清空
                      </Button>
                    </div>
                  </div>

                  {symptomCategories300.map(category => (
                    <Card key={category} className="border border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {symptoms300ByCategory[category].map(symptom => (
                            <div key={symptom.id} className="flex items-start space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                              <Checkbox
                                id={`symptom300-${symptom.id}`}
                                checked={selectedSymptoms300.has(symptom.id)}
                                onCheckedChange={() => handleSymptom300Toggle(symptom.id)}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={`symptom300-${symptom.id}`}
                                  className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer"
                                >
                                  {symptom.name}
                                </label>
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
        {activeTab === 'req3' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-green-100 dark:border-green-900">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    3
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-extrabold">{FOUR_REQUIREMENTS.requirement3.title}</CardTitle>
                    <CardDescription className="text-lg mt-1">
                      {FOUR_REQUIREMENTS.requirement3.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <AlertDescription>
                    <strong>重要：</strong>{FOUR_REQUIREMENTS.requirement3.details}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">相信调理的原因</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• 身体有强大的自我修复能力</li>
                      <li>• 找到病因，对症调理，效果显著</li>
                      <li>• 无数成功案例证明了调理的有效性</li>
                      <li>• 坚持调理，给身体足够的时间恢复</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">如何建立信心</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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
        {activeTab === 'req4' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-orange-100 dark:border-orange-900">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    4
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-extrabold">{FOUR_REQUIREMENTS.requirement4.title}</CardTitle>
                    <CardDescription className="text-lg mt-1">
                      {FOUR_REQUIREMENTS.requirement4.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <AlertDescription>
                    <strong>重要：</strong>{FOUR_REQUIREMENTS.requirement4.details}
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">学习内容</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                      <li>• 系统战役故事 - 了解七个健康要素</li>
                      <li>• 健康要素原理 - 深入理解每个要素</li>
                      <li>• 好转反应 - 理解调理过程中的反应</li>
                      <li>• 恢复速度8要素 - 加快恢复的方法</li>
                      <li>• 21堂必修课程 - 系统学习健康管理</li>
                      <li>• 发心感悟 - 树立正确的健康观念</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">学习建议</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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

        {/* 底部导航 */}
        {activeTab !== 'overview' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4">
            <div className="container mx-auto flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setActiveTab('overview')}
              >
                返回总览
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                继续下一步
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
