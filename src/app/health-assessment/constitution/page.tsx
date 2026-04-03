'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2, Home } from 'lucide-react';
import { CONSTITUTION_QUESTIONS, calculateConstitutionScore, determineConstitutionType } from '@/lib/constitution-questions';

function ConstitutionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  // 初始化时直接设置问题列表
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>(() => {
    // Fisher-Yates 洗牌算法打乱所有问题
    const allQuestions = Object.entries(CONSTITUTION_QUESTIONS).flatMap(([type, questions]) =>
      questions.map((q) => ({ ...q, constitutionType: type }))
    );

    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    console.log('初始化问题数量:', shuffled.length);
    return shuffled;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      router.push('/health-assessment');
    }
  }, [sessionId, router]);

  const currentQuestion = shuffledQuestions[currentIndex];
  const progress = shuffledQuestions.length > 0 ? ((currentIndex + 1) / shuffledQuestions.length) * 100 : 0;

  // 如果问题还没加载完成，显示加载状态或错误
  if (!currentQuestion || shuffledQuestions.length === 0) {
    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 border-4 border-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-900 font-medium mb-2">加载失败</p>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              重新加载
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载问卷...</p>
        </div>
      </div>
    );
  }

  const handleAnswer = (value: string) => {
    if (!currentQuestion || !currentQuestion.id) {
      console.error('currentQuestion is undefined or has no id');
      return;
    }
    const score = parseInt(value);
    setAnswers({ ...answers, [currentQuestion.id]: score });
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (!currentQuestion || !currentQuestion.id) {
      console.error('handleNext: currentQuestion is undefined or has no id', { currentIndex, shuffledQuestionsLength: shuffledQuestions.length });
      setError('出现错误，请刷新页面重试');
      return;
    }
    if (!answers[currentQuestion.id]) {
      setError('请先选择一个选项');
      return;
    }

    setError('');

    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 所有问题回答完毕，提交
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('开始提交体质问卷...');

      // 计算体质得分
      const scores = calculateConstitutionScore(answers);
      console.log('得分计算完成:', scores);

      const result = determineConstitutionType(scores);
      console.log('体质类型判定完成:', result);

      // 验证result对象
      if (!result || !result.primary || result.secondary === undefined || result.isBalanced === undefined) {
        throw new Error('体质分析结果格式错误');
      }

      // 保存体质问卷
      const response = await fetch('/api/constitution-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          answers,
          scores,
          primaryConstitution: result.primary,
          secondaryConstitutions: result.secondary,
          isBalanced: result.isBalanced,
        }),
      });

      const data = await response.json();
      console.log('API响应:', data);

      if (!data.success) {
        throw new Error(data.error || '保存失败');
      }

      // 验证questionnaireId存在（注意：questionnaireId在data.data中）
      if (!data.data || !data.data.questionnaireId) {
        console.error('API响应数据:', data);
        throw new Error('服务器未返回问卷ID');
      }

      const questionnaireId = data.data.questionnaireId;

      // 更新会话关联
      console.log('更新会话关联...');
      const sessionResponse = await fetch(`/api/assessment/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          constitutionQuestionnaireId: questionnaireId,
          currentStep: 'analysis',
        }),
      });

      if (!sessionResponse.ok) {
        const sessionError = await sessionResponse.json();
        throw new Error(sessionError.error || '更新会话失败');
      }

      setSaved(true);
      setTimeout(() => {
        router.push(`/health-assessment/analysis?sessionId=${sessionId}&userId=${userId}`);
      }, 1500);

    } catch (err) {
      console.error('提交失败:', err);
      setError(err instanceof Error ? err.message : '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              首页
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push(`/health-assessment/health?sessionId=${sessionId}&userId=${userId}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">体质问卷</h1>
          <div className="w-32"></div>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">✓</div>
            <span className="text-sm font-medium text-green-600">个人信息</span>
          </div>
          <div className="w-16 h-1 bg-green-600 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">✓</div>
            <span className="text-sm font-medium text-green-600">健康问卷</span>
          </div>
          <div className="w-16 h-1 bg-blue-600 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
            <span className="text-sm font-medium text-blue-600">体质问卷</span>
          </div>
          <div className="w-16 h-1 bg-gray-200 mx-2"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">4</div>
            <span className="text-sm text-gray-500">分析结果</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>进度</span>
            <span>{currentIndex + 1} / {shuffledQuestions.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* 问题卡片 */}
        {currentQuestion && (
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="text-2xl">
                问题 {currentIndex + 1}
              </CardTitle>
              <CardDescription>
                请根据您最近三个月的身体状况，选择最符合的选项
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 问题 */}
                <div className="text-xl font-medium text-gray-900">
                  {currentQuestion.question}
                </div>

                {/* 选项 */}
                <RadioGroup
                  onValueChange={handleAnswer}
                  disabled={loading || saved}
                >
                  <div className="space-y-3">
                    {[
                      { value: '1', label: '没有（根本不）' },
                      { value: '2', label: '很少（有一点）' },
                      { value: '3', label: '有时（一般）' },
                      { value: '4', label: '经常（明显）' },
                      { value: '5', label: '总是（非常）' },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={`option-${option.value}`}
                          disabled={loading || saved}
                        />
                        <Label
                          htmlFor={`option-${option.value}`}
                          className="flex-1 cursor-pointer text-lg"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                {/* 错误提示 */}
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 加载提示 */}
                {loading && (
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>正在分析您的体质...</span>
                  </div>
                )}

                {/* 成功提示 */}
                {saved && (
                  <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>分析完成！正在生成报告...</span>
                  </div>
                )}

                {/* 导航按钮 */}
                {!saved && (
                  <div className="flex gap-4 mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0 || loading}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      上一步
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={loading}
                      className="flex-1"
                    >
                      {currentIndex === shuffledQuestions.length - 1 ? (
                        <>
                          提交问卷
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          下一步
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 底部提示 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>所有问题都回答完毕后，系统将自动分析您的体质类型</p>
        </div>
      </div>
    </div>
  );
}

export default function ConstitutionQuestionnaireInAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    }>
      <ConstitutionContent />
    </Suspense>
  );
}
