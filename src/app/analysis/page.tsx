'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BODY_SYMPTOMS, HEALTH_ELEMENTS, SEVEN_QUESTIONS } from '@/lib/health-data';
import Link from 'next/link';

interface QuestionAnswer {
  questionId: number;
  answer: string;
}

export default function AnalysisPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [targetSymptom, setTargetSymptom] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<'elements' | 'questions'>('elements');
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const savedSymptoms = localStorage.getItem('selectedSymptoms');
    const savedTarget = localStorage.getItem('targetSymptom');
    if (savedSymptoms) {
      setSelectedSymptoms(JSON.parse(savedSymptoms));
    }
    if (savedTarget) {
      setTargetSymptom(parseInt(savedTarget));
    }
  }, []);

  // 计算每个健康要素的症状数量
  const getElementSymptomCount = (elementKey: keyof typeof HEALTH_ELEMENTS) => {
    const element = HEALTH_ELEMENTS[elementKey];
    return element.symptoms.filter(id => selectedSymptoms.includes(id)).length;
  };

  // 按症状数量排序健康要素
  const sortedElements = (Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>)
    .sort((a, b) => getElementSymptomCount(b) - getElementSymptomCount(a));

  // 获取目标症状
  const getTargetSymptom = () => {
    return BODY_SYMPTOMS.find(s => s.id === targetSymptom);
  };

  // 处理回答保存
  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const newAnswers = [...prev];
        newAnswers[existing] = { questionId, answer };
        return newAnswers;
      }
      return [...prev, { questionId, answer }];
    });
  };

  // 下一题
  const handleNext = () => {
    if (currentQuestionIndex < SEVEN_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // 保存答案并跳转到系统战役故事
      localStorage.setItem('sevenAnswers', JSON.stringify(answers));
      window.location.href = '/story';
    }
  };

  // 上一题
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // 获取当前答案
  const getCurrentAnswer = () => {
    const currentQuestion = SEVEN_QUESTIONS[currentQuestionIndex];
    return answers.find(a => a.questionId === currentQuestion.id)?.answer || '';
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
                {currentStep === 'elements' ? '健康要素分析' : '持续跟进七问'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 健康要素归类 */}
        {currentStep === 'elements' && (
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
                      您重点关注改善的症状：
                    </h3>
                    <p className="text-xl font-medium text-blue-700 dark:text-blue-400">
                      {getTargetSymptom()!.name}
                    </p>
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

            <div className="text-center">
              <Button
                onClick={() => setCurrentStep('questions')}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                开始详细分析
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* 持续跟进落实健康的七问 */}
        {currentStep === 'questions' && (
          <div className="max-w-3xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl">持续跟进落实健康的七问</CardTitle>
                <CardDescription>
                  通过详细的问题了解症状的具体情况，帮助我们找到根本原因
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    问题 {currentQuestionIndex + 1} / {SEVEN_QUESTIONS.length}
                  </span>
                  <Badge variant="outline">
                    针对症状：{getTargetSymptom()?.name}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${((currentQuestionIndex + 1) / SEVEN_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                    {currentQuestionIndex + 1}
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-2">
                      {SEVEN_QUESTIONS[currentQuestionIndex].question}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {SEVEN_QUESTIONS[currentQuestionIndex].description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="请详细回答这个问题，越详细越好..."
                  value={getCurrentAnswer()}
                  onChange={(e) => handleAnswerChange(SEVEN_QUESTIONS[currentQuestionIndex].id, e.target.value)}
                  className="min-h-[150px] mb-6"
                />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    上一题
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    {currentQuestionIndex === SEVEN_QUESTIONS.length - 1 ? (
                      <>
                        完成分析
                        <CheckCircle2 className="w-5 h-5 ml-2" />
                      </>
                    ) : (
                      <>
                        下一题
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 问题列表 */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                问题列表
              </h3>
              <div className="space-y-2">
                {SEVEN_QUESTIONS.map((q, index) => (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      index === currentQuestionIndex
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : index < currentQuestionIndex
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${
                        index === currentQuestionIndex
                          ? 'bg-gradient-to-br from-blue-500 to-green-500'
                          : index < currentQuestionIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}>
                        {index < currentQuestionIndex ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className="text-sm">
                        {q.question}
                      </span>
                      {answers.find(a => a.questionId === q.id) && (
                        <Badge variant="secondary" className="ml-auto">已回答</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
