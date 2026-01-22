'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { BODY_SYMPTOMS } from '@/lib/health-data';
import { getOrGenerateUserId } from '@/lib/user-context';
import { saveSymptomCheck } from '@/lib/api-client';
import Link from 'next/link';

export default function CheckPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState<'intro' | 'select' | 'confirm'>('intro');
  const [targetSymptom, setTargetSymptom] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

// 按类别分组症状
  const symptomsByCategory = BODY_SYMPTOMS.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, typeof BODY_SYMPTOMS>);

  const categories = Object.keys(symptomsByCategory);

  const handleSymptomToggle = (id: number) => {
    const newSelected = new Set(selectedSymptoms);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSymptoms(newSelected);
  };

  const handleSelectCategory = (category: string) => {
    const categorySymptoms = symptomsByCategory[category];
    const newSelected = new Set(selectedSymptoms);
    categorySymptoms.forEach(symptom => {
      newSelected.add(symptom.id);
    });
    setSelectedSymptoms(newSelected);
  };

  const handleDeselectCategory = (category: string) => {
    const categorySymptoms = symptomsByCategory[category];
    const newSelected = new Set(selectedSymptoms);
    categorySymptoms.forEach(symptom => {
      newSelected.delete(symptom.id);
    });
    setSelectedSymptoms(newSelected);
  };

  const handleContinue = async () => {
    if (currentStep === 'intro') {
      setCurrentStep('select');
    } else if (currentStep === 'select') {
      if (selectedSymptoms.size === 0) {
        alert('请至少选择一项症状，这样才能为您提供有针对性的健康分析。');
        return;
      }
      setCurrentStep('confirm');
    } else if (currentStep === 'confirm') {
      if (!targetSymptom) {
        alert('请选择一个您最想改善的症状，这样我们可以为您提供更精准的分析。');
        return;
      }

      // 保存到 localStorage
      localStorage.setItem('selectedSymptoms', JSON.stringify([...selectedSymptoms]));
      localStorage.setItem('targetSymptom', targetSymptom.toString());

      // 保存到数据库
      setIsSaving(true);
      try {
        const userId = getOrGenerateUserId();
        const symptomsArray = [...selectedSymptoms];
        const totalScore = symptomsArray.length;

        // 计算各要素得分
        const elementScores: Record<string, number> = {
          气血: 0,
          循环: 0,
          毒素: 0,
          血脂: 0,
          寒凉: 0,
          免疫: 0,
          情绪: 0,
        };

        symptomsArray.forEach(symptomId => {
          const symptom = BODY_SYMPTOMS.find(s => s.id === symptomId);
          if (symptom) {
            symptom.elements.forEach(element => {
              if (elementScores[element] !== undefined) {
                elementScores[element] += 1;
              }
            });
          }
        });

        await saveSymptomCheck({
          userId,
          checkedSymptoms: symptomsArray.map(id => id.toString()),
          totalScore,
          elementScores,
        });
      } catch (error) {
        console.error('保存症状自检数据失败:', error);
        // 即使保存失败也继续，不阻塞用户体验
      } finally {
        setIsSaving(false);
        window.location.href = '/analysis';
      }
    }
  };

  const isCategoryAllSelected = (category: string) => {
    return symptomsByCategory[category].every(s => selectedSymptoms.has(s.id));
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categorySymptoms = symptomsByCategory[category];
    const selectedCount = categorySymptoms.filter(s => selectedSymptoms.has(s.id)).length;
    return selectedCount > 0 && selectedCount < categorySymptoms.length;
  };

  const getTargetSymptom = () => {
    return BODY_SYMPTOMS.find(s => s.id === targetSymptom);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回首页</span>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                已选择 {selectedSymptoms.size} 项症状
              </span>
              {selectedSymptoms.size > 0 && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 第一步：介绍页面 */}
        {currentStep === 'intro' && (
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-2xl text-center">身体语言自检表</CardTitle>
                <CardDescription className="text-base text-center font-semibold text-orange-600 dark:text-orange-400">
                  一张表格就是一个生命，请您认真对待！
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    请仔细回忆过去半年内出现的症状，哪怕是偶尔发生也要勾选。
                    这些症状是身体给我们的信号，早期发现问题才能更好地改善。
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    为什么要填写身体语言简表？
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">1</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>早期发现：</strong>很多大病早期都是通过症状表现的，
                        早期发现问题才能更好地预防和调理。
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-400 text-sm font-bold">2</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>全面了解：</strong>100项症状覆盖身体各个系统，
                        帮助您全面了解自己的健康状况。
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">3</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <strong>精准分析：</strong>根据您的症状，分析背后的健康要素，
                        找出问题的根本原因。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>温馨提示：</strong>这个简表是我们健康行业的专业工具，
                    用于帮助老百姓找问题的。不同于西医的仪器检查和中医的望闻问切，
                    我们通过症状来找出影响健康的要素，从而更好地恢复健康。
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    *注：本表只作为参考，如果您有任何身体不适，请尽快咨询医生。紧急情况，请遵医嘱。
                  </p>
                </div>

                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                >
                  开始填写
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 第二步：选择症状页面 */}
        {currentStep === 'select' && (
          <div className="max-w-5xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">请勾选您半年内出现过的症状</CardTitle>
                <CardDescription>
                  点击复选框选择症状，可以按类别快速选择
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress
                  value={(selectedSymptoms.size / BODY_SYMPTOMS.length) * 100}
                  className="mb-4"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  已选择 {selectedSymptoms.size} / {BODY_SYMPTOMS.length} 项
                </p>
              </CardContent>
            </Card>

            {categories.map((category) => (
              <Card key={category} className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-lg">{category}</CardTitle>
                      {isCategoryAllSelected(category) && (
                        <Badge variant="default" className="bg-green-500">
                          已全选
                        </Badge>
                      )}
                      {isCategoryPartiallySelected(category) && (
                        <Badge variant="secondary">
                          {symptomsByCategory[category].filter(s => selectedSymptoms.has(s.id)).length} / {symptomsByCategory[category].length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectCategory(category)}
                      >
                        全选
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeselectCategory(category)}
                      >
                        清空
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {symptomsByCategory[category].map((symptom) => (
                      <div
                        key={symptom.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedSymptoms.has(symptom.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                        onClick={() => handleSymptomToggle(symptom.id)}
                      >
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id={`symptom-${symptom.id}`}
                            checked={selectedSymptoms.has(symptom.id)}
                            onChange={() => handleSymptomToggle(symptom.id)}
                            className="mt-1 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`symptom-${symptom.id}`}
                              className="text-sm font-medium cursor-pointer select-none block"
                              onClick={(e) => e.preventDefault()}
                            >
                              {symptom.name}
                            </label>
                            {symptom.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {symptom.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center mt-8">
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    继续下一步
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 第三步：确认页面 */}
        {currentStep === 'confirm' && (
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-green-100 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-2xl">选择重点改善的症状</CardTitle>
                <CardDescription>
                  症状很多，没法一个个讲。请您从已选择的症状中，选择一个最想改善的
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    选择一个最困扰您的症状，我们会针对这个症状进行深入分析，
                    找出背后的健康要素和原因，为您提供针对性的解决方案。
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    您选择的症状（共 {selectedSymptoms.size} 项）：
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                    {Array.from(selectedSymptoms).map(id => {
                      const symptom = BODY_SYMPTOMS.find(s => s.id === id);
                      return symptom ? (
                        <div
                          key={id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                            targetSymptom === id
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-500'
                              : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                          }`}
                          onClick={() => setTargetSymptom(id)}
                        >
                          <span className="text-sm">{symptom.name}</span>
                          {targetSymptom === id && (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mt-1" />
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {targetSymptom && getTargetSymptom() && (
                  <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      您选择重点改善的症状：
                    </h4>
                    <p className="text-xl font-medium text-green-700 dark:text-green-400 mb-2">
                      {getTargetSymptom()!.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      在接下来的步骤中，我们将针对这个症状进行深入分析，
                      了解它背后的健康要素，为您提供有针对性的解决方案。
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  开始深入分析
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
