'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle2, ArrowRight, ChevronLeft, BookOpen } from 'lucide-react';
import { BAD_HABITS_CHECKLIST } from '@/lib/health-data';
import Link from 'next/link';

export default function HabitsPage() {
  const [selectedHabits, setSelectedHabits] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState<'intro' | 'select' | 'confirm'>('intro');
  const [formData, setFormData] = useState({
    profession: '',
    currentHealth: '',
    mainSymptoms: '',
    remarks: '',
  });

  const handleHabitToggle = (id: number) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedHabits(newSelected);
  };

  const handleContinue = () => {
    if (currentStep === 'intro') {
      setCurrentStep('select');
    } else if (currentStep === 'select') {
      setCurrentStep('confirm');
    } else if (currentStep === 'confirm') {
      // 保存到localStorage并跳转到下一页
      localStorage.setItem('selectedHabits', JSON.stringify([...selectedHabits]));
      localStorage.setItem('habitsFormData', JSON.stringify(formData));
      window.location.href = '/choices';
    }
  };

  const handleSelectAll = () => {
    const allHabitIds = Object.values(BAD_HABITS_CHECKLIST).flat().map(h => h.id);
    setSelectedHabits(new Set(allHabitIds));
  };

  const handleClearAll = () => {
    setSelectedHabits(new Set());
  };

  const getElementSummary = () => {
    const summary: Record<string, number> = {};

    Object.keys(BAD_HABITS_CHECKLIST).forEach(category => {
      summary[category] = 0;
    });

    Object.keys(BAD_HABITS_CHECKLIST).forEach(category => {
      BAD_HABITS_CHECKLIST[category as keyof typeof BAD_HABITS_CHECKLIST].forEach(habit => {
        if (selectedHabits.has(habit.id)) {
          summary[category]++;
        }
      });
    });

    return summary;
  };

  const elementSummary = getElementSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/story" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                已选择 {selectedHabits.size} 项习惯
              </span>
              {selectedHabits.size > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 第一步：介绍页面 */}
        {currentStep === 'intro' && (
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-orange-100 dark:border-orange-900">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">健康要素对应的不良生活习惯表</CardTitle>
                    <CardDescription className="text-base mt-1">
                      找到导致健康问题出现的原因，然后改掉坏习惯
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    请诚实勾选您的生活习惯。这些习惯可能是导致您健康问题的根本原因。
                    只有找到病因，改掉坏习惯，身体才能真正恢复健康。
                  </AlertDescription>
                </Alert>

                {/* 基本信息表单 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    请填写您的基本信息
                  </h3>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        您的职业 *
                      </label>
                      <Input
                        placeholder="请填写您的职业"
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">职业可能影响生活习惯和健康风险</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        目前身体状况（顾客自述）*
                      </label>
                      <Textarea
                        placeholder="请描述您目前的身体状况"
                        value={formData.currentHealth}
                        onChange={(e) => setFormData({ ...formData, currentHealth: e.target.value })}
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">简要描述您目前的整体健康状况</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        您目前最想解决的症状 *
                      </label>
                      <Textarea
                        placeholder="请列出您最想解决的症状，可多选"
                        value={formData.mainSymptoms}
                        onChange={(e) => setFormData({ ...formData, mainSymptoms: e.target.value })}
                        rows={2}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">选择3-5个最困扰您的症状</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        备注
                      </label>
                      <Textarea
                        placeholder="其他需要补充说明的情况"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        rows={2}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">可以补充其他相关信息</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    为什么要填写不良生活习惯表？
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">1</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>找病因：</strong>真正的病因都在生活里，只有找到病因才能从根本上解决问题。
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-600 dark:text-red-400 text-sm font-bold">2</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>改习惯：</strong>找到导致问题出现的原因，然后把坏习惯改掉，再养成一些好习惯。
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-yellow-600 dark:text-yellow-400 text-sm font-bold">3</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>防复发：</strong>如果习惯不改，医生治不好您的病，我也没有办法给您调好。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
                    ⚠️ 重要提醒：
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    医院的治疗往往只针对症状，而不解决根本原因。我们需要找到问题的根源，
                    从根本上改善健康状况。
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    *注：本表只作为参考，如果您有任何身体不适，请尽快咨询医生。紧急情况，请遵医嘱。
                  </p>
                </div>

                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  开始填写
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 第二步：选择习惯页面 */}
        {currentStep === 'select' && (
          <div className="max-w-5xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">请勾选您的生活习惯</CardTitle>
                <CardDescription>
                  诚实地评估自己的生活，找到可能导致健康问题的习惯
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    已选择 {selectedHabits.size} 项习惯
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={handleSelectAll}>
                      全选
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleClearAll}>
                      清空
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(Object.keys(BAD_HABITS_CHECKLIST) as Array<keyof typeof BAD_HABITS_CHECKLIST>).map((category) => {
              const habits = BAD_HABITS_CHECKLIST[category];
              return (
                <Card key={category} className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{category}</span>
                        <Badge variant="secondary">
                          {habits.filter(h => selectedHabits.has(h.id)).length} / {habits.length}
                        </Badge>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {habits.map((habit) => (
                        <div
                          key={habit.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedHabits.has(habit.id)
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                          }`}
                          onClick={() => handleHabitToggle(habit.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={`habit-${habit.id}`}
                              checked={selectedHabits.has(habit.id)}
                              onChange={() => handleHabitToggle(habit.id)}
                              className="mt-1 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <label
                                htmlFor={`habit-${habit.id}`}
                                className="text-sm font-medium cursor-pointer select-none block"
                                onClick={(e) => e.preventDefault()}
                              >
                                {habit.habit}
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                影响：{habit.impact}
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

            <div className="flex justify-center mt-8">
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                继续下一步
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* 第三步：确认页面 */}
        {currentStep === 'confirm' && (
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-green-100 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-2xl">不良生活习惯分析</CardTitle>
                <CardDescription>
                  根据您选择的习惯，分析需要改善的健康要素
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    以下分析显示了您需要重点关注和改善的健康要素。
                    改善这些要素将有助于您的健康恢复。
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(Object.keys(elementSummary) as Array<keyof typeof elementSummary>).map((key) => {
                    const count = elementSummary[key];
                    const maxCount = BAD_HABITS_CHECKLIST[key as keyof typeof BAD_HABITS_CHECKLIST].length;
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    const severity = percentage > 75 ? 'high' : percentage > 50 ? 'medium' : 'low';
                    const severityColors = {
                      high: 'bg-red-500',
                      medium: 'bg-orange-500',
                      low: 'bg-yellow-500',
                    };

                    return (
                      <Card key={key} className={`border-2 ${severity === 'high' ? 'border-red-300 dark:border-red-700' : severity === 'medium' ? 'border-orange-300 dark:border-orange-700' : 'border-yellow-300 dark:border-yellow-700'}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{key}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${severityColors[severity]} text-white text-2xl font-bold mb-2`}>
                              {count}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              项习惯需改善
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-2">
                    💡 改善建议：
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    建议您按照"21天养成一个好习惯"的原则，每次选择1-2个习惯进行改善。
                    每天坚持，21天后会有明显改善。
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    查看调理方案
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
