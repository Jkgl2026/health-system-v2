'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import {
  CONSTITUTION_QUESTIONS,
  CONSTITUTION_NAMES,
  calculateConstitutionScore,
  determineConstitutionType,
  getAllQuestions
} from '@/lib/constitution-questions';

export default function ConstitutionQuestionnairePage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState('PINGHE');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    const totalQuestions = getAllQuestions().length;
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / totalQuestions) * 100);
  };

  // 处理答案变化
  const handleAnswerChange = (questionId: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  // 提交问卷
  const handleSubmit = async () => {
    setIsLoading(true);

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
    localStorage.removeItem('constitutionQuestionnaire');
  };

  // 查看详细分析
  const handleViewDetails = () => {
    // 将结果保存到体质分析
    localStorage.setItem('constitutionQuestionnaireResult', JSON.stringify(result));
    router.push('/constitution-analysis');
  };

  // 问卷标签
  const tabList = [
    { value: 'PINGHE', label: '平和质' },
    { value: 'QIXU', label: '气虚质' },
    { value: 'YANGXU', label: '阳虚质' },
    { value: 'YINXU', label: '阴虚质' },
    { value: 'TANSHI', label: '痰湿质' },
    { value: 'SHIRE', label: '湿热质' },
    { value: 'XUEYU', label: '血瘀质' },
    { value: 'QIYU', label: '气郁质' },
    { value: 'TEBING', label: '特禀质' }
  ];

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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              体质辨识结果
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              基于中医体质分类与判定标准
            </p>
          </div>

          {/* 主要体质 */}
          <Card className="mb-6 border-2 border-orange-200 dark:border-orange-800">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <CardTitle className="text-2xl">
                您的主要体质：{result.constitutionType.primary}
              </CardTitle>
              <CardDescription className="text-orange-100">
                {result.constitutionType.isBalanced
                  ? '恭喜您！您的体质类型为平和质，属于健康的体质状态。'
                  : '您属于偏颇体质，建议进行针对性的调理。'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 次要体质 */}
          {result.constitutionType.secondary.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">兼夹体质</CardTitle>
                <CardDescription>
                  除了主要体质外，您还兼有以下体质特征
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.constitutionType.secondary.map((type: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 rounded-full text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 评分详情 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">各项体质得分</CardTitle>
              <CardDescription>
                得分越高，该体质特征越明显（转化分）
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(result.scores).map(([type, score]) => {
                  const constitutionName = CONSTITUTION_NAMES[type as keyof typeof CONSTITUTION_NAMES];
                  const isPrimary = constitutionName === result.constitutionType.primary;
                  const isSecondary = result.constitutionType.secondary.includes(constitutionName);

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${isPrimary ? 'text-orange-600 dark:text-orange-400 font-bold' : ''}`}>
                          {constitutionName}
                          {isPrimary && ' (主要)'}
                          {isSecondary && ' (兼夹)'}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{score}分</span>
                      </div>
                      <Progress
                        value={score}
                        className={isPrimary ? 'h-3' : 'h-2'}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 体质解读 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">体质解读</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                {result.constitutionType.isBalanced ? (
                  <div>
                    <p className="mb-3">
                      <strong className="text-green-600 dark:text-green-400">平和质</strong>是健康的体质状态，表现为：
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>阴阳气血调和</li>
                      <li>体态适中，面色红润</li>
                      <li>精力充沛，不易疲劳</li>
                      <li>适应能力强，耐受寒热</li>
                      <li>睡眠良好，饮食正常</li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      建议继续保持良好的生活习惯，定期进行健康检查。
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="mb-3">
                      <strong>偏颇体质</strong>提示您的身体处于亚健康状态或容易患某种疾病的风险较高。
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-3">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">温馨提示</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        建议您查看详细的体质分析报告，了解您的体质特征、成因、易患疾病，并获取个性化的调理方案。
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              重新测试
            </Button>
            <Button
              onClick={handleViewDetails}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              查看详细分析
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
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
                中医体质辨识问卷
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                基于《中医体质分类与判定》标准
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {calculateProgress()}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">完成进度</div>
            </div>
          </div>

          <Progress value={calculateProgress()} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                    <p>• <strong>没有</strong> = 1分，<strong>很少</strong> = 2分，<strong>有时</strong> = 3分，<strong>经常</strong> = 4分，<strong>总是</strong> = 5分</p>
                    <p>• 回答完所有问题后，点击"提交分析"查看结果</p>
                  </div>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 问卷标签 */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 gap-1 h-auto">
            {tabList.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs py-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* 问卷内容 */}
          {tabList.map(tab => {
            const questions = CONSTITUTION_QUESTIONS[tab.value as keyof typeof CONSTITUTION_QUESTIONS];

            return (
              <TabsContent key={tab.value} value={tab.value}>
                <Card>
                  <CardHeader>
                    <CardTitle>{tab.label}</CardTitle>
                    <CardDescription>
                      共 {questions.length} 个问题
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {questions.map((question, index) => (
                        <div key={question.id} className="space-y-3">
                          <Label className="text-base font-medium">
                            {index + 1}. {question.question}
                          </Label>
                          <RadioGroup
                            value={answers[question.id]?.toString() || ''}
                            onValueChange={(value) =>
                              handleAnswerChange(question.id, parseInt(value))
                            }
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                              {[1, 2, 3, 4, 5].map(score => (
                                <div key={score} className="flex items-center space-x-2">
                                  <RadioGroupItem value={score.toString()} id={`${question.id}_${score}`} />
                                  <Label
                                    htmlFor={`${question.id}_${score}`}
                                    className="cursor-pointer text-sm"
                                  >
                                    {score === 1 ? '没有' :
                                     score === 2 ? '很少' :
                                     score === 3 ? '有时' :
                                     score === 4 ? '经常' : '总是'}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* 底部操作栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t shadow-lg p-4">
          <div className="container mx-auto max-w-4xl flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={Object.keys(answers).length === 0}
              className="flex-1"
            >
              重置问卷
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < getAllQuestions().length || isLoading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  提交分析
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 底部占位，避免内容被操作栏遮挡 */}
        <div className="h-24"></div>
      </div>
    </div>
  );
}
