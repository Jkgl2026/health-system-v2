'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, AlertCircle, Activity, Info } from 'lucide-react';
import { CONSTITUTION_QUESTIONS, CONSTITUTION_NAMES, calculateConstitutionScore, determineConstitutionType } from '@/lib/constitution-questions';

export default function ConstitutionQuestionnairePage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // 获取所有问题（平铺）
  const allQuestions = Object.entries(CONSTITUTION_QUESTIONS).flatMap(([type, questions]) =>
    questions.map(q => ({ ...q, constitutionType: type }))
  );

  // 随机打乱问题顺序（让用户不知道属于哪种体质）
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([]);

  // 初始化时打乱问题顺序
  useEffect(() => {
    const shuffled = [...allQuestions];
    // Fisher-Yates 洗牌算法
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledQuestions(shuffled);
  }, []);

  // 加载已保存的答案
  useEffect(() => {
    const saved = localStorage.getItem('constitutionQuestionnaire');
    if (saved) {
      setAnswers(JSON.parse(saved));
    }
  }, []);

  // 保存答案
  useEffect(() => {
    localStorage.setItem('constitutionQuestionnaire', JSON.stringify(answers));
  }, [answers]);

  // 计算完成进度
  const calculateProgress = () => {
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / allQuestions.length) * 100);
  };

  // 处理答案变化
  const handleAnswerChange = (questionId: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));

    // 自动跳到下一题
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // 提交问卷
  const handleSubmit = async () => {
    setIsLoading(true);

    // 模拟分析延迟
    await new Promise(resolve => setTimeout(resolve, 2000));

    const scores = calculateConstitutionScore(answers);
    const constitutionType = determineConstitutionType(scores);

    setResult({
      scores,
      constitutionType
    });
    setShowResult(true);
    setIsLoading(false);
  };

  // 重置问卷
  const handleReset = () => {
    setAnswers({});
    setShowResult(false);
    setResult(null);
    setCurrentQuestionIndex(0);
    localStorage.removeItem('constitutionQuestionnaire');
  };

  // 查看详细分析
  const handleViewDetails = () => {
    localStorage.setItem('constitutionQuestionnaireResult', JSON.stringify(result));
    router.push('/constitution-analysis');
  };

  if (showResult && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* 顶部导航 */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => setShowResult(false)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回问卷
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 结果标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full mb-4 animate-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              您的中医体质是：<span className="text-orange-600 dark:text-orange-400">{result.constitutionType.primary}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              基于中医体质分类与判定标准，共分析 {allQuestions.length} 个维度
            </p>
          </div>

          {/* 主要体质 */}
          <Card className="mb-6 border-4 border-orange-300 dark:border-orange-700 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <CardTitle className="text-2xl flex items-center gap-3">
                <CheckCircle className="w-8 h-8" />
                {result.constitutionType.primary}
              </CardTitle>
              <CardDescription className="text-orange-100 text-base">
                {result.constitutionType.isBalanced
                  ? '恭喜您！您的体质类型为平和质，这是健康的体质状态。继续保持良好的生活习惯！'
                  : '您属于偏颇体质，建议按照以下调理方案进行针对性调理。'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">体质得分</div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {result.scores[Object.keys(result.scores).find(key =>
                      CONSTITUTION_NAMES[key as keyof typeof CONSTITUTION_NAMES] === result.constitutionType.primary
                    ) || 0]}分
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">问题回答</div>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {Object.keys(answers).length}/{allQuestions.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 次要体质 */}
          {result.constitutionType.secondary.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-500" />
                  兼夹体质
                </CardTitle>
                <CardDescription>
                  除了主要体质外，您还兼有以下体质特征
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {result.constitutionType.secondary.map((type: string, index: number) => (
                    <div
                      key={index}
                      className="px-6 py-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 text-orange-800 dark:text-orange-100 rounded-full text-base font-semibold shadow-md"
                    >
                      {type}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 详细分析提示 */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                超级详细分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  我们为您准备了超级详细的体质分析报告，包括：
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    '体质特征详解',
                    '成因分析',
                    '典型症状',
                    '易患疾病',
                    '心理特征',
                    '适应能力',
                    '饮食调理方案',
                    '运动指导',
                    '生活习惯建议',
                    '情绪管理',
                    '中医调理',
                    '预防措施'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 h-14 text-base"
            >
              重新测试
            </Button>
            <Button
              onClick={handleViewDetails}
              className="flex-1 h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-base"
            >
              查看超级详细分析
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">加载问卷中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                中医体质辨识
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                基于标准中医体质分类，共 {allQuestions.length} 个问题
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {currentQuestionIndex + 1}/{allQuestions.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">进度</div>
            </div>
          </div>

          <Progress value={calculateProgress()} className="h-3" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* 说明卡片 */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
              <div>
                <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                  填写说明
                </CardTitle>
                <CardDescription className="text-blue-800 dark:text-blue-200 mt-2">
                  <div className="space-y-2 text-sm">
                    <p>• 请根据您<strong>最近3个月</strong>的实际感受进行回答</p>
                    <p>• 每个问题有5个选项，请选择最符合您情况的选项</p>
                    <p>• 问题会自动跳转，无需手动操作</p>
                    <p>• 回答完所有问题后，系统会自动分析您的体质</p>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 问题卡片 */}
        <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-lg">
          <CardContent className="pt-8 pb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                问题 {currentQuestionIndex + 1}
              </h2>
              <p className="text-2xl text-gray-800 dark:text-gray-200 leading-relaxed">
                {currentQuestion?.question}
              </p>
            </div>

            <RadioGroup
              value={answers[currentQuestion?.id]?.toString() || ''}
              onValueChange={(value) =>
                handleAnswerChange(currentQuestion.id, parseInt(value))
              }
              className="space-y-3"
            >
              {[
                { value: 1, label: '没有', description: '完全没有这种情况' },
                { value: 2, label: '很少', description: '偶尔出现，频率很低' },
                { value: 3, label: '有时', description: '有时会出现，一般情况' },
                { value: 4, label: '经常', description: '经常出现，较为频繁' },
                { value: 5, label: '总是', description: '总是如此，持续存在' }
              ].map((option) => (
                <div
                  key={option.value}
                  className={`relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${answers[currentQuestion?.id] === option.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                    }`}
                  onClick={() => handleAnswerChange(currentQuestion.id, option.value)}
                >
                  <RadioGroupItem
                    value={option.value.toString()}
                    id={`${currentQuestion.id}_${option.value}`}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`${currentQuestion.id}_${option.value}`}
                      className="cursor-pointer font-semibold text-gray-900 dark:text-white"
                    >
                      {option.label}
                    </Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* 导航按钮 */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一题
          </Button>
          <Button
            onClick={() => setCurrentQuestionIndex(Math.min(shuffledQuestions.length - 1, currentQuestionIndex + 1))}
            disabled={currentQuestionIndex === shuffledQuestions.length - 1}
          >
            下一题
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* 提交按钮 */}
        {Object.keys(answers).length === allQuestions.length && (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full mt-6 h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-lg"
          >
            {isLoading ? (
              <>
                <Clock className="w-5 h-5 mr-2 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                提交分析
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
