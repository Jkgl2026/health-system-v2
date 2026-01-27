'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { ErrorAlert } from '@/components/ui/error-alert';
import { BODY_SYMPTOMS, HEALTH_ELEMENTS } from '@/lib/health-data';
import { getOrGenerateUserId } from '@/lib/user-context';
import { saveHealthAnalysis, createUser, getUser } from '@/lib/api-client';
import Link from 'next/link';

export default function AnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [targetSymptom, setTargetSymptom] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<any>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // 优先设置loading为false，立即显示UI骨架
    setLoading(false);

    // 异步加载数据，避免阻塞UI渲染
    const timer = setTimeout(() => {
      try {
        const savedSymptoms = localStorage.getItem('selectedSymptoms');
        const savedTarget = localStorage.getItem('targetSymptoms');
        if (savedSymptoms) {
          setSelectedSymptoms(JSON.parse(savedSymptoms));
        }
        if (savedTarget) {
          const targetSymptomArray = JSON.parse(savedTarget);
          // 如果是数组，取第一个作为主要目标症状（向后兼容）
          setTargetSymptom(Array.isArray(targetSymptomArray) ? targetSymptomArray[0] || null : parseInt(savedTarget));
        }
      } catch (error) {
        console.error('Failed to load analysis data:', error);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 计算每个健康要素的症状数量
  const getElementSymptomCount = useMemo(() => {
    return (elementKey: keyof typeof HEALTH_ELEMENTS) => {
      const element = HEALTH_ELEMENTS[elementKey];
      return element.symptoms.filter(id => selectedSymptoms.includes(id)).length;
    };
  }, [selectedSymptoms]);

  // 按症状数量排序健康要素
  const sortedElements = useMemo(() => {
    return (Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>)
      .sort((a, b) => getElementSymptomCount(b) - getElementSymptomCount(a));
  }, [getElementSymptomCount]);

  // 获取目标症状
  const getTargetSymptom = useMemo(() => {
    return () => BODY_SYMPTOMS.find(s => s.id === targetSymptom);
  }, [targetSymptom]);

  // 获取所有目标症状（用于显示）
  const getTargetSymptoms = useMemo(() => {
    return () => {
      const savedTarget = localStorage.getItem('targetSymptoms');
      if (!savedTarget) return [];
      const targetSymptomArray = JSON.parse(savedTarget);
      if (!Array.isArray(targetSymptomArray)) return [];
      return targetSymptomArray
        .map(id => BODY_SYMPTOMS.find(s => s.id === id))
        .filter(Boolean);
    };
  }, []);

  // 保存健康要素分析
  const handleSaveAnalysis = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const userId = getOrGenerateUserId();
      console.log('[健康要素保存] 开始保存，userId:', userId);

      // 确保用户存在
      const userResponse = await getUser(userId);
      if (!userResponse.success || !userResponse.user) {
        console.log('[健康要素保存] 用户不存在，创建新用户');
        const createResponse = await createUser({
          name: null,
          phone: null,
          email: null,
          age: null,
          gender: null,
        });

        // 检查用户创建是否成功
        if (!createResponse.success || !createResponse.user) {
          throw new Error('用户创建失败，无法保存数据');
        }
        console.log('[健康要素保存] 用户创建成功，ID:', createResponse.user.id);
      }

      // 计算各要素得分
      const analysisData = {
        userId,
        qiAndBlood: getElementSymptomCount('气血'),
        circulation: getElementSymptomCount('循环'),
        toxins: getElementSymptomCount('毒素'),
        bloodLipids: getElementSymptomCount('血脂'),
        coldness: getElementSymptomCount('寒凉'),
        immunity: getElementSymptomCount('免疫'),
        emotions: getElementSymptomCount('情绪'),
        overallHealth: selectedSymptoms.length,
      };

      console.log('[健康要素保存] 保存健康要素分析:', analysisData);
      await saveHealthAnalysis(analysisData);
      console.log('[健康要素保存] 健康要素分析保存成功');

      // 保存成功后显示成功提示
      setSaveError(null);
      setSaveSuccess(true);
      setIsSaving(false);

      // 延迟1秒后跳转，让用户看到成功提示
      setTimeout(() => {
        router.push('/story');
      }, 1000);
    } catch (error) {
      console.error('[健康要素保存] 保存失败:', error);

      const errorDetails = {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        userId: getOrGenerateUserId(),
      };
      console.error('[健康要素保存] 错误详情:', errorDetails);

      setSaveError({
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/check" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                健康要素分析
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 健康要素归类 */}
        <div className="max-w-5xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">症状与健康要素归类</CardTitle>
              <CardDescription>
                您的症状已经归类到以下健康要素中，让我们了解影响健康的根本原因
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  我们不是医生，不去治病。但是如果能够把跟健康相关的这些要素找到的话，
                  就方便我们把得病的原因和生活当中的不良习惯都能找到，这样更有利于恢复健康。
                </AlertDescription>
              </Alert>

              {targetSymptom && getTargetSymptom() && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    您重点关注改善的症状（{getTargetSymptoms().length}个）：
                  </h3>
                  <div className="space-y-1">
                    {getTargetSymptoms().map((symptom, index) => (
                      <p key={symptom?.id} className="text-xl font-medium text-blue-700 dark:text-blue-400">
                        {index + 1}. {symptom?.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {sortedElements.map((elementKey) => {
              const element = HEALTH_ELEMENTS[elementKey];
              const symptomCount = getElementSymptomCount(elementKey);
              if (symptomCount === 0) return null;

              return (
                <Card key={elementKey} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{element.name}</CardTitle>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        {symptomCount} 项
                      </Badge>
                    </div>
                    <CardDescription>{element.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          相关症状：
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {element.symptoms
                            .filter(id => selectedSymptoms.includes(id))
                            .map(id => {
                              const symptom = BODY_SYMPTOMS.find(s => s.id === id);
                              return symptom ? (
                                <Badge key={id} variant="secondary">
                                  {symptom.name}
                                </Badge>
                              ) : null;
                            })}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>原理：</strong>
                          {element.principle}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 保存成功提示 */}
          {saveSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>保存成功！</strong> 您的健康要素分析已成功保存。
              </AlertDescription>
            </Alert>
          )}

          {/* 保存失败提示 */}
          {saveError && (
            <ErrorAlert
              title="保存健康要素分析失败"
              error={saveError}
              onRetry={() => {
                setSaveError(null);
                handleSaveAnalysis();
              }}
            />
          )}

          {/* 保存按钮 */}
          <div className="text-center">
            <Button
              onClick={handleSaveAnalysis}
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
                  完成分析，继续
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
