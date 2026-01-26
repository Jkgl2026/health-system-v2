'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, Sparkles, Flame, Target, Activity, Droplets, Heart, Zap, BookOpen, AlertCircle, User, Calendar } from 'lucide-react';
import { BODY_SYMPTOMS, HEALTH_ELEMENTS, TWENTY_ONE_COURSES, SEVEN_QUESTIONS } from '@/lib/health-data';
import Link from 'next/link';
import { getOrGenerateUserId } from '@/lib/user-context';
import { getUser } from '@/lib/api-client';

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

export default function MySolutionPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // 立即检查 localStorage，先显示内容
    const hasSymptoms = localStorage.getItem('selectedSymptoms');
    const hasBadHabits = localStorage.getItem('selectedHabitsRequirements');
    const hasSymptoms300 = localStorage.getItem('selectedSymptoms300');
    const hasTargetSymptoms = localStorage.getItem('targetSymptoms') || localStorage.getItem('targetSymptom');
    const hasChoice = localStorage.getItem('selectedChoice');

    setHasData(!!((hasSymptoms || hasBadHabits || hasSymptoms300) && hasTargetSymptoms && hasChoice));

    // 后台异步加载用户数据
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = getOrGenerateUserId();
      const userResponse = await getUser(userId);

      if (userResponse.success && userResponse.user) {
        setUserData(userResponse.user);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  // 计算综合健康评分（基于三种症状表）
  const calculateHealthScore = () => {
    const bodySymptoms = getSelectedSymptoms();
    const badHabits = JSON.parse(localStorage.getItem('selectedHabitsRequirements') || '[]');
    const symptoms300 = JSON.parse(localStorage.getItem('selectedSymptoms300') || '[]');

    // 计算健康评分（更科学的算法）
    // 基础分100分，根据不同类型症状权重扣分
    // 身体语言简表（高权重）：每项扣0.3分
    // 不良生活习惯（中权重）：每项扣0.2分
    // 300症状表（低权重）：每项扣0.1分
    const bodySymptomsScore = Math.max(0, bodySymptoms.length * 0.3);
    const badHabitsScore = Math.max(0, badHabits.length * 0.2);
    const symptoms300Score = Math.max(0, symptoms300.length * 0.1);
    const totalDeduction = bodySymptomsScore + badHabitsScore + symptoms300Score;

    return Math.max(0, Math.round(100 - totalDeduction));
  };

  const getSelectedSymptoms = () => {
    const savedSymptoms = localStorage.getItem('selectedSymptoms');
    if (!savedSymptoms) return [];
    const symptoms = JSON.parse(savedSymptoms);
    return symptoms
      .map((id: number) => BODY_SYMPTOMS.find(s => s.id === id))
      .filter((s): s is typeof BODY_SYMPTOMS[0] => s !== undefined);
  };

  const getTargetSymptoms = () => {
    const savedTarget = localStorage.getItem('targetSymptoms') || localStorage.getItem('targetSymptom');
    if (!savedTarget) return [];
    const targetSymptomArray = JSON.parse(savedTarget);
    if (!Array.isArray(targetSymptomArray)) return [];
    return targetSymptomArray
      .map((id: number) => BODY_SYMPTOMS.find(s => s.id === id))
      .filter((s): s is typeof BODY_SYMPTOMS[0] => s !== undefined);
  };

  const getSelectedChoice = () => {
    const savedChoice = localStorage.getItem('selectedChoice');
    return savedChoice || null;
  };

  const getPrimaryElements = () => {
    const selectedSymptoms = getSelectedSymptoms();
    const counts: Record<string, number> = {};
    (Object.keys(HEALTH_ELEMENTS) as Array<keyof typeof HEALTH_ELEMENTS>).forEach(key => {
      const element = HEALTH_ELEMENTS[key];
      const count = element.symptoms.filter(id => selectedSymptoms.some((s) => s.id === id)).length;
      if (count > 0) {
        counts[element.name] = count;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  };

  const getProductMatches = (): ProductMatch[] => {
    const primaryElements = getPrimaryElements();
    const matches: ProductMatch[] = [];

    const calculateMatchScore = (elementNames: string[]): number => {
      return primaryElements
        .filter(el => elementNames.includes(el.name))
        .reduce((sum, el) => sum + el.count, 0);
    };

    // 艾灸
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

    // 火灸
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

    // 正骨
    const zhengGuScore = calculateMatchScore(['循环', '气血']);
    const selectedSymptoms = getSelectedSymptoms();
    if (zhengGuScore > 0 || selectedSymptoms.some((s: any) => [30, 31, 32, 33, 34, 35].includes(s.id))) {
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

    // 空腹禅
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

    // 经络调理
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

    // 药王产品
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

    // 膏药
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

  const getCourseMatches = (): CourseMatch[] => {
    const primaryElements = getPrimaryElements();
    return TWENTY_ONE_COURSES.map(course => {
      let relevance: 'high' | 'medium' | 'low' = 'low';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">返回首页</span>
              </Link>
              <Badge variant="outline" className="text-sm">我的方案</Badge>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto border-2 border-yellow-200">
            <CardHeader className="text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">尚未完成健康自检</CardTitle>
              <CardDescription className="text-base mt-2">
                您需要先完成健康自检流程，才能查看您的个性化调理方案
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  请按照以下步骤完成健康自检：
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>填写个人信息</li>
                    <li>填写身体语言简表</li>
                    <li>选择重点改善的症状</li>
                    <li>完成健康要素分析</li>
                    <li>了解系统战役故事</li>
                    <li>选择适合的调理方案</li>
                  </ol>
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/personal-info')}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                开始健康自检
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const productMatches = getProductMatches();
  const courseMatches = getCourseMatches();
  const selectedChoice = getSelectedChoice();
  const primaryElements = getPrimaryElements();
  const selectedSymptoms = getSelectedSymptoms();
  const targetSymptoms = getTargetSymptoms();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回首页</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">我的方案</Badge>
              {userData?.name && (
                <Badge variant="secondary" className="text-sm flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {userData.name}
                </Badge>
              )}
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
                基于您的健康自检结果，为您量身定制的调理方案
              </CardDescription>
              {userData?.createdAt && (
                <div className="flex items-center justify-center mt-3 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  方案生成时间：{new Date(userData.createdAt).toLocaleDateString('zh-CN')}
                </div>
              )}
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
              {targetSymptoms.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    您重点改善的症状（{targetSymptoms.length}个）：
                  </h3>
                  <div className="space-y-1">
                    {targetSymptoms.map((symptom, index) => (
                      <p key={symptom.id} className="text-xl font-bold text-blue-700 dark:text-blue-400">
                        {index + 1}. {symptom.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 健康指标完成度 */}
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
                <h4 className="text-base font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                  健康指标完成度
                </h4>
                <div className="space-y-4">
                  {primaryElements.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {primaryElements.map((el, index) => {
                        return (
                          <div key={index} className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{el.name}</div>
                            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                              {el.count}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">项症状</div>
                          </div>
                        );
                      })}
                      {/* 健康评分 - 使用综合评分 */}
                      <div className="text-center p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm">
                        <div className="text-xs text-white/80 mb-1">健康评分</div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {calculateHealthScore()}
                        </div>
                        <div className="text-xs text-white/70">分（综合）</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                      <p className="text-sm">暂无健康指标数据</p>
                    </div>
                  )}
                  
                  {/* 整体进度 */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">整体健康改善进度</span>
                      <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                        {calculateHealthScore()}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${calculateHealthScore()}%` }}
                      >
                        {calculateHealthScore() > 10 && (
                          <span className="text-xs font-bold text-white">
                            {calculateHealthScore()}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      综合评分基于身体语言简表、不良生活习惯表、300症状表的科学分析
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 推荐调理产品 */}
        <section className="mb-12">
          <Card className="border-2 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-2xl">推荐调理产品</CardTitle>
              <CardDescription>根据您的健康要素分析，推荐以下调理产品</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productMatches.map((product, index) => {
                  const Icon = product.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow border-2">
                      <CardHeader>
                        <div className={`w-12 h-12 bg-gradient-to-br ${product.color} rounded-lg flex items-center justify-center mb-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {product.description}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">调理原理：</p>
                          <ul className="space-y-1">
                            {product.reasons.map((reason, idx) => (
                              <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                                <span className="text-green-500 mr-1">•</span>
                                {reason}
                              </li>
                            ))}
                          </ul>
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
              <CardTitle className="text-2xl">推荐学习课程</CardTitle>
              <CardDescription>根据您的健康状况，推荐以下学习课程</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseMatches.slice(0, 7).map((course) => {
                  const relevanceColors = {
                    high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                    low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                  };
                  const relevanceLabels = {
                    high: '高度推荐',
                    medium: '推荐学习',
                    low: '可选学习',
                  };

                  return (
                    <Card key={course.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            {course.module && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {course.module}
                              </Badge>
                            )}
                          </div>
                          <Badge className={relevanceColors[course.relevance]}>
                            {relevanceLabels[course.relevance]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {course.content}
                        </p>
                        {course.duration && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            课程时长：{course.duration}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 重要提示 */}
        <section className="mb-12">
          <Alert className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="mt-2">
              <p className="font-semibold text-gray-900 dark:text-white mb-2">
                重要提示
              </p>
              <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>• 请按照方案坚持调理，健康改善需要时间</li>
                <li>• 如在调理过程中出现好转反应，请继续坚持</li>
                <li>• 建议定期重新填写自检表，跟踪健康改善情况</li>
                <li>• 如有任何疑问，请咨询专业健康管理师</li>
              </ul>
            </AlertDescription>
          </Alert>
        </section>

        {/* 操作按钮 */}
        <section className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/personal-info')}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              重新自检
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              返回首页
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
