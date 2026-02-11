'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, ArrowLeft, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOrGenerateUserId } from '@/lib/user-context';
import { getUser } from '@/lib/api-client';

interface HealthAnalysis {
  id: string;
  qiAndBlood: number | null;
  circulation: number | null;
  toxins: number | null;
  bloodLipids: number | null;
  coldness: number | null;
  immunity: number | null;
  emotions: number | null;
  overallHealth: number | null;
  analyzedAt: Date;
}

interface User {
  id: string;
  name: string | null | undefined;
  phone: string | null | undefined;
  email: string | null | undefined;
  age: number | null | undefined;
  gender: string | null | undefined;
}

export default function HealthAnalysisResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [healthAnalyses, setHealthAnalyses] = useState<HealthAnalysis[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const userId = getOrGenerateUserId();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await getUser(userId);
      if (response.success && response.user) {
        setUser(response.user);
        // 模拟获取健康要素分析数据
        // 实际项目中应该从API获取
        const mockAnalyses: HealthAnalysis[] = [
          {
            id: '1',
            qiAndBlood: 9,
            circulation: 2,
            toxins: 1,
            bloodLipids: 1,
            coldness: 2,
            immunity: null,
            emotions: 1,
            overallHealth: 15,
            analyzedAt: new Date(),
          },
        ];
        setHealthAnalyses(mockAnalyses);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentAnalysis = healthAnalyses[currentIndex] || null;

  const getHealthScoreColor = (score: number | null, max: number = 20) => {
    if (score === null) return 'bg-gray-500';
    const percentage = (score / max) * 100;
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 60) return 'bg-orange-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHealthStatus = (score: number | null) => {
    if (score === null) return { text: '暂无数据', color: 'text-gray-500' };
    if (score <= 5) return { text: '优秀', color: 'text-green-600' };
    if (score <= 10) return { text: '良好', color: 'text-blue-600' };
    if (score <= 15) return { text: '一般', color: 'text-yellow-600' };
    return { text: '需要注意', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/story')}>
              <ArrowLeft className="w-5 h-5 mr-2 text-gray-600" />
              <span className="text-gray-600">返回</span>
            </Button>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {user?.name || '用户'}的健康分析结果
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">健康要素分析结果</h1>
          <p className="text-gray-600">根据您的症状选择，系统分析了您的健康状况</p>
        </div>

        {/* 健康要素分析结果 */}
        {currentAnalysis ? (
          <Card className="mb-8 border-2 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-green-900">
                    分析结果 #{currentIndex + 1}
                  </CardTitle>
                  <CardDescription className="text-green-700 mt-1">
                    {currentAnalysis.analyzedAt.toLocaleString('zh-CN')}
                  </CardDescription>
                </div>
                {healthAnalyses.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      {currentIndex + 1} / {healthAnalyses.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentIndex(Math.min(healthAnalyses.length - 1, currentIndex + 1))}
                      disabled={currentIndex === healthAnalyses.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* 七个要素的得分 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 气血 */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-red-600">气血</div>
                    {currentAnalysis.qiAndBlood !== null && (
                      <span className={`text-xs px-2 py-1 rounded ${getHealthStatus(currentAnalysis.qiAndBlood).color}`}>
                        {getHealthStatus(currentAnalysis.qiAndBlood).text}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-red-700 mb-2">
                    {currentAnalysis.qiAndBlood || '—'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getHealthScoreColor(currentAnalysis.qiAndBlood)}`}
                      style={{ width: `${Math.min(100, ((currentAnalysis.qiAndBlood || 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">营养输送能力</div>
                </div>

                {/* 循环 */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-orange-600">循环</div>
                    {currentAnalysis.circulation !== null && (
                      <span className={`text-xs px-2 py-1 rounded ${getHealthStatus(currentAnalysis.circulation).color}`}>
                        {getHealthStatus(currentAnalysis.circulation).text}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-orange-700 mb-2">
                    {currentAnalysis.circulation || '—'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getHealthScoreColor(currentAnalysis.circulation)}`}
                      style={{ width: `${Math.min(100, ((currentAnalysis.circulation || 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">微循环通畅程度</div>
                </div>

                {/* 毒素 */}
                <div className="bg-gradient-to-br from-yellow-50 to-lime-50 p-5 rounded-lg border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-yellow-600">毒素</div>
                    {currentAnalysis.toxins !== null && (
                      <span className={`text-xs px-2 py-1 rounded ${getHealthStatus(currentAnalysis.toxins).color}`}>
                        {getHealthStatus(currentAnalysis.toxins).text}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-yellow-700 mb-2">
                    {currentAnalysis.toxins || '—'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getHealthScoreColor(currentAnalysis.toxins)}`}
                      style={{ width: `${Math.min(100, ((currentAnalysis.toxins || 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">体内垃圾毒素积累</div>
                </div>

                {/* 血脂 */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-5 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-green-600">血脂</div>
                    {currentAnalysis.bloodLipids !== null && (
                      <span className={`text-xs px-2 py-1 rounded ${getHealthStatus(currentAnalysis.bloodLipids).color}`}>
                        {getHealthStatus(currentAnalysis.bloodLipids).text}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {currentAnalysis.bloodLipids || '—'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getHealthScoreColor(currentAnalysis.bloodLipids)}`}
                      style={{ width: `${Math.min(100, ((currentAnalysis.bloodLipids || 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">血液中油脂含量</div>
                </div>

                {/* 寒凉 */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-600">寒凉</div>
                    {currentAnalysis.coldness !== null && (
                      <span className={`text-xs px-2 py-1 rounded ${getHealthStatus(currentAnalysis.coldness).color}`}>
                        {getHealthStatus(currentAnalysis.coldness).text}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {currentAnalysis.coldness || '—'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getHealthScoreColor(currentAnalysis.coldness)}`}
                      style={{ width: `${Math.min(100, ((currentAnalysis.coldness || 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">体内寒湿气程度</div>
                </div>

                {/* 免疫 */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-purple-600">免疫</div>
                    {currentAnalysis.immunity !== null && (
                      <span className={`text-xs px-2 py-1 rounded ${getHealthStatus(currentAnalysis.immunity).color}`}>
                        {getHealthStatus(currentAnalysis.immunity).text}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-purple-700 mb-2">
                    {currentAnalysis.immunity || '—'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getHealthScoreColor(currentAnalysis.immunity)}`}
                      style={{ width: `${Math.min(100, ((currentAnalysis.immunity || 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">身体自我防护能力</div>
                </div>

                {/* 情绪 */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-5 rounded-lg border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-pink-600">情绪</div>
                    {currentAnalysis.emotions !== null && (
                      <span className={`text-xs px-2 py-1 rounded ${getHealthStatus(currentAnalysis.emotions).color}`}>
                        {getHealthStatus(currentAnalysis.emotions).text}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-pink-700 mb-2">
                    {currentAnalysis.emotions || '—'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getHealthScoreColor(currentAnalysis.emotions)}`}
                      style={{ width: `${Math.min(100, ((currentAnalysis.emotions || 0) / 20) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">心理状态和情绪管理</div>
                </div>

                {/* 整体健康 */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-600">整体健康</div>
                    {currentAnalysis.overallHealth !== null && (
                      <span className={`text-xs px-2 py-1 rounded ${getHealthStatus(currentAnalysis.overallHealth).color}`}>
                        {getHealthStatus(currentAnalysis.overallHealth).text}
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold text-gray-700 mb-2">
                    {currentAnalysis.overallHealth || '—'}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div
                      className={`h-2.5 rounded-full transition-all ${getHealthScoreColor(currentAnalysis.overallHealth, 100)}`}
                      style={{ width: `${Math.min(100, ((currentAnalysis.overallHealth || 0) / 100) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">综合健康评分</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-12 text-center">
              <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无分析结果</h3>
              <p className="text-gray-500">您还没有完成健康要素分析，请先填写症状自检表</p>
              <Button
                className="mt-4"
                onClick={() => router.push('/check')}
              >
                开始健康分析
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 说明卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>健康要素说明</CardTitle>
            <CardDescription>了解各项健康要素的含义和重要性</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h4 className="font-semibold text-red-800 mb-1">气血</h4>
                <p className="text-sm text-gray-600">营养的输送能力，影响身体各器官的功能</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <h4 className="font-semibold text-orange-800 mb-1">循环</h4>
                <p className="text-sm text-gray-600">微循环系统的通畅程度，影响营养输送和垃圾排出</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <h4 className="font-semibold text-yellow-800 mb-1">毒素</h4>
                <p className="text-sm text-gray-600">体内垃圾毒素的积累，从轻微症状到严重疾病逐步发展</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-800 mb-1">血脂</h4>
                <p className="text-sm text-gray-600">血液中的油脂含量，影响心血管健康</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
