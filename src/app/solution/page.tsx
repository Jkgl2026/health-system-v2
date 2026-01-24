'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, CheckCircle2, Sparkles, AlertTriangle, ArrowRight, BookOpen, Flame, Target, Activity, Droplets, Heart, Zap } from 'lucide-react';
import { BODY_SYMPTOMS, HEALTH_ELEMENTS, TWENTY_ONE_COURSES } from '@/lib/health-data';
import Link from 'next/link';

interface ProductMatch {
  name: string;
  description: string;
  icon: any;
  color: string;
  matchScore: number;
  reasons: string[];
}

interface CourseMatch {
  id: number;
  title: string;
  content: string;
  duration: string;
  module?: string;
  relevance: 'high' | 'medium' | 'low';
}

export default function SolutionPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<number[]>([]);
  const [targetSymptom, setTargetSymptom] = useState<number | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [selectedHabits, setSelectedHabits] = useState<number[]>([]);

  useEffect(() => {
    const savedSymptoms = localStorage.getItem('selectedSymptoms');
    const savedTarget = localStorage.getItem('targetSymptom');
    const savedChoice = localStorage.getItem('selectedChoice');
    const savedHabits = localStorage.getItem('selectedHabitsRequirements');

    if (savedSymptoms) {
      setSelectedSymptoms(JSON.parse(savedSymptoms));
    }
    if (savedTarget) {
      setTargetSymptom(parseInt(savedTarget));
    }
    if (savedChoice) {
      setSelectedChoice(savedChoice);
    }
    if (savedHabits) {
      setSelectedHabits(JSON.parse(savedHabits));
    }
  }, []);

  const getTargetSymptom = () => {
    return BODY_SYMPTOMS.find(s => s.id === targetSymptom);
  };

  // 计算主要健康要素
  const getPrimaryElements = () => {
    const counts: Record<string, number> = {};
    (Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>).forEach(key => {
      const element = HEALTH_ELEMENTS[key];
      const count = element.symptoms.filter(id => selectedSymptoms.includes(id)).length;
      if (count > 0) {
        counts[element.name] = count;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  };

  const primaryElements = getPrimaryElements();

  // 产品匹配逻辑
  const getProductMatches = (): ProductMatch[] => {
    const matches: ProductMatch[] = [];

    // 艾灸 - 适合气血、寒凉、循环问题
    const aiJiuScore = calculateMatchScore(['气血', '寒凉', '循环']);
    if (aiJiuScore > 0) {
      matches.push({
        name: '艾灸调理',
        description: '通过艾灸穴位，温通经络，调和气血，驱寒除湿，改善寒凉和气血不足问题',
        icon: Activity,
        color: 'from-orange-500 to-red-500',
        matchScore: aiJiuScore,
        reasons: [
          '温通经络，促进气血运行',
          '驱寒除湿，改善寒凉体质',
          '增强免疫力，提升身体自愈能力',
          '调理慢性炎症，缓解疼痛'
        ]
      });
    }

    // 火灸 - 适合气血、毒素、循环问题
    const huoJiuScore = calculateMatchScore(['气血', '毒素', '循环']);
    if (huoJiuScore > 0) {
      matches.push({
        name: '火灸调理',
        description: '以火之力，温阳散寒，活血化瘀，祛除体内毒素和淤堵',
        icon: Flame,
        color: 'from-red-500 to-orange-600',
        matchScore: huoJiuScore,
        reasons: [
          '强力活血化瘀，疏通经络',
          '温阳补气，提升身体能量',
          '祛除毒素，净化体内环境',
          '改善循环，促进新陈代谢'
        ]
      });
    }

    // 正骨 - 适合骨骼、肌肉、循环问题
    const zhengGuScore = calculateMatchScore(['循环', '气血']);
    if (zhengGuScore > 0 || selectedSymptoms.some(s => [30, 31, 32, 33, 34, 35].includes(s))) {
      matches.push({
        name: '正骨调理',
        description: '通过手法矫正骨骼位置，恢复脊柱生理曲度，改善神经受压和循环障碍',
        icon: Target,
        color: 'from-blue-500 to-purple-500',
        matchScore: zhengGuScore + 1,
        reasons: [
          '矫正骨骼位置，恢复脊柱健康',
          '解除神经压迫，缓解疼痛',
          '改善循环，促进气血运行',
          '矫正体态，提升整体健康'
        ]
      });
    }

    // 空腹禅 - 身心调理，适合情绪、毒素、气血问题
    const kongFuChanScore = calculateMatchScore(['情绪', '毒素', '气血', '血脂']);
    if (kongFuChanScore > 0) {
      matches.push({
        name: '空腹禅调理',
        description: '通过空腹禅修，净化身心，清理毒素，调和气血，平衡情绪',
        icon: Heart,
        color: 'from-green-500 to-teal-500',
        matchScore: kongFuChanScore,
        reasons: [
          '净化身心，清理体内毒素',
          '调和气血，提升生命能量',
          '平衡情绪，释放心理压力',
          '改善睡眠，提升整体健康'
        ]
      });
    }

    // 经络调理 - 适合循环、气血、毒素问题
    const jingLiaoScore = calculateMatchScore(['循环', '气血', '毒素']);
    if (jingLiaoScore > 0) {
      matches.push({
        name: '经络调理',
        description: '通过疏通经络，促进气血运行，清除淤堵，恢复身体平衡',
        icon: Zap,
        color: 'from-yellow-500 to-orange-500',
        matchScore: jingLiaoScore,
        reasons: [
          '疏通经络，恢复气血运行',
          '清除淤堵，改善循环',
          '调和脏腑功能，增强免疫力',
          '缓解疼痛，提升生活质量'
        ]
      });
    }

    // 药王产品 - 综合调理
    const yaoWangScore = primaryElements.length > 0 ? primaryElements[0].count : 0;
    matches.push({
      name: '药王产品',
      description: '传统药王配方产品，针对性调理您的健康问题，标本兼治',
      icon: Droplets,
      color: 'from-green-600 to-emerald-500',
      matchScore: yaoWangScore,
      reasons: [
        '天然药材，安全有效',
        '传统配方，传承千年',
        '标本兼治，综合调理',
        '个性化定制，精准调理'
      ]
    });

    // 膏药 - 局部调理
    const gaoYaoScore = calculateMatchScore(['气血', '循环', '寒凉']);
    matches.push({
      name: '膏药调理',
      description: '外用膏药，直达病灶，活血化瘀，消炎止痛，方便使用',
      icon: Activity,
      color: 'from-brown-500 to-orange-500',
      matchScore: gaoYaoScore,
      reasons: [
        '直达病灶，快速起效',
        '活血化瘀，消炎止痛',
        '方便使用，随时调理',
        '天然成分，安全可靠'
      ]
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  };

  const calculateMatchScore = (elementNames: string[]): number => {
    return primaryElements
      .filter(el => elementNames.includes(el.name))
      .reduce((sum, el) => sum + el.count, 0);
  };

  // 课程匹配逻辑
  const getCourseMatches = (): CourseMatch[] => {
    return TWENTY_ONE_COURSES.map(course => {
      let relevance: 'high' | 'medium' | 'low' = 'low';

      // 根据健康要素匹配课程
      if (primaryElements.length > 0) {
        const primaryElementNames = primaryElements.map(el => el.name);

        if (primaryElementNames.includes('气血') && course.title.includes('气血')) {
          relevance = 'high';
        } else if (primaryElementNames.includes('循环') && course.title.includes('循环')) {
          relevance = 'high';
        } else if (primaryElementNames.includes('毒素') && course.title.includes('毒素')) {
          relevance = 'high';
        } else if (primaryElementNames.includes('寒凉') && course.title.includes('寒')) {
          relevance = 'high';
        } else if (primaryElementNames.includes('免疫') && course.title.includes('免疫')) {
          relevance = 'high';
        } else if (primaryElementNames.includes('情绪') && course.title.includes('情绪')) {
          relevance = 'high';
        } else if (primaryElementNames.includes('血脂') && course.title.includes('血脂')) {
          relevance = 'high';
        } else {
          relevance = 'medium';
        }
      }

      return { ...course, relevance };
    }).sort((a, b) => {
      const relevanceOrder = { high: 3, medium: 2, low: 1 };
      return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
    });
  };

  const productMatches = getProductMatches();
  const courseMatches = getCourseMatches();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/recovery-speed" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回上一步</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                健康管理方案
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 欢迎信息 */}
        <section className="mb-12">
          <Card className="border-2 border-green-100 dark:border-green-900">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">您的个性化健康管理方案</CardTitle>
              <CardDescription className="text-base mt-2">
                恭喜您完成了健康自检流程！根据您的情况，为您量身定制以下方案
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* 您的健康状况总结 */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">您的健康状况总结</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 重点症状 */}
              {targetSymptom && getTargetSymptom() && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    您重点改善的症状：
                  </h3>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {getTargetSymptom()!.name}
                  </p>
                </div>
              )}

              {/* 症状统计 - 使用柱状图 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 症状总数柱状图 */}
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <h4 className="text-base font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-600" />
                    症状总数统计
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">症状数量</span>
                      <span className="text-2xl font-bold text-green-700 dark:text-green-400">{selectedSymptoms.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${Math.min(selectedSymptoms.length * 2, 100)}%` }}
                      >
                        <span className="text-xs font-bold text-white">{Math.min(selectedSymptoms.length * 2, 100)}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      基于身体语言简表100项症状
                    </p>
                  </div>
                </div>

                {/* 主要健康要素柱状图 */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                  <h4 className="text-base font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    主要健康要素分布
                  </h4>
                  {primaryElements.length > 0 ? (
                    <div className="space-y-3">
                      {primaryElements.map((el, index) => {
                        const maxCount = Math.max(...primaryElements.map(e => e.count));
                        const percentage = (el.count / maxCount) * 100;
                        const colors = [
                          'from-red-500 to-red-600',
                          'from-blue-500 to-blue-600',
                          'from-yellow-500 to-yellow-600',
                          'from-orange-500 to-orange-600',
                          'from-cyan-500 to-cyan-600',
                          'from-green-500 to-green-600',
                          'from-purple-500 to-purple-600',
                        ];
                        const colorClass = colors[index % colors.length];

                        return (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-gray-900 dark:text-white">{el.name}</span>
                              <span className="font-bold text-purple-700 dark:text-purple-400">{el.count} 项</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                              <div
                                className={`bg-gradient-to-r ${colorClass} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                                style={{ width: `${percentage}%` }}
                              >
                                {percentage > 15 && (
                                  <span className="text-xs font-bold text-white">{percentage.toFixed(0)}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                      <p className="text-sm">暂无主要健康要素数据</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 选择方案 */}
              {selectedChoice && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    您选择的方案：
                  </h4>
                  <p className="text-lg font-medium text-orange-700 dark:text-orange-400">
                    {selectedChoice === 'choice1' ? '自我调理' : selectedChoice === 'choice2' ? '产品调理' : '系统调理'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 推荐调理产品 */}
        <section className="mb-12">
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Target className="w-6 h-6 text-blue-500 mr-2" />
                推荐调理产品
              </CardTitle>
              <CardDescription>
                根据您的健康要素分析，为您推荐以下调理产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productMatches.map((product, index) => {
                  const Icon = product.icon;
                  return (
                    <Card key={index} className="border-2 border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${product.color} rounded-lg flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs mt-1">
                              匹配度: {Math.min(95, 70 + product.matchScore * 5)}%
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          {product.description}
                        </p>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">调理作用：</p>
                          {product.reasons.map((reason, idx) => (
                            <p key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                              <span className="text-green-500 mr-1">•</span>
                              {reason}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 推荐学习课程 */}
        <section className="mb-12">
          <Card className="border-2 border-purple-100 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <BookOpen className="w-6 h-6 text-purple-500 mr-2" />
                推荐学习课程
              </CardTitle>
              <CardDescription>
                根据您的情况，重点学习以下课程
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseMatches.slice(0, 9).map((course) => (
                  <Card key={course.id} className="border border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          第{course.id}课
                        </Badge>
                        {course.relevance === 'high' && (
                          <Badge className="text-xs bg-red-500">重点</Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {course.content}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        📚 {course.duration} | {course.module}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 重要提示 */}
        <section className="mb-12">
          <Alert className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="mt-2">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                重要提示
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                以上调理方案仅供参考，具体调理方法和产品选择请咨询专业调理导师。
                调理过程中如出现不适，请及时暂停并寻求专业指导。
              </p>
            </AlertDescription>
          </Alert>
        </section>

        {/* 下一步 */}
        <section className="text-center">
          <Card className="border-2 border-green-100 dark:border-green-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  恭喜您完成了整个健康自检流程！
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                现在请根据以上方案，开始您的健康管理之旅。如有任何疑问，请及时联系您的调理导师。
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                onClick={() => window.location.href = '/courses'}
              >
                学习21堂必修课程
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
