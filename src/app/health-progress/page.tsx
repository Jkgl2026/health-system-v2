'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, TrendingUp, Activity, Loader2, AlertCircle,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

interface ProgressData {
  totalRecords: number;
  faceRecords: number;
  tongueRecords: number;
  scoreTrend: Array<{ date: string; score: number; type: string }>;
  organTrend: Record<string, Array<{ date: string; value: number }>>;
  constitutionDistribution: Array<{ type: string; count: number }>;
  latestScores: { face: number | null; tongue: number | null; overall: number | null };
  improvement: { from: number; to: number; change: number; percent: number } | null;
}

export default function HealthProgressPage() {
  const router = useRouter();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/health-progress');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || '获取数据失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const maxScore = data?.scoreTrend ? Math.max(...data.scoreTrend.map(s => s.score || 0), 100) : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />返回
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">健康改善进度</h1>
              <p className="text-sm text-muted-foreground">追踪您的健康变化趋势</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4 max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : !data || data.totalRecords === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无健康数据</p>
              <p className="text-sm mt-2">进行舌诊或面诊后，可以看到改善趋势</p>
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={() => router.push('/tongue-diagnosis')}>开始舌诊</Button>
                <Button variant="outline" onClick={() => router.push('/face-diagnosis')}>开始面诊</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 综合评分卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-sm opacity-80">最新综合评分</div>
                  <div className="text-4xl font-bold mt-2">{data.latestScores.overall || '-'}</div>
                  <div className="text-sm opacity-80 mt-1">分</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground">面诊记录</div>
                  <div className="text-3xl font-bold mt-2 text-cyan-600">{data.faceRecords}</div>
                  <div className="text-sm text-muted-foreground mt-1">次</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-sm text-muted-foreground">舌诊记录</div>
                  <div className="text-3xl font-bold mt-2 text-purple-600">{data.tongueRecords}</div>
                  <div className="text-sm text-muted-foreground mt-1">次</div>
                </CardContent>
              </Card>
            </div>

            {/* 改善情况 */}
            {data.improvement && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" />
                    健康改善情况
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">首次检测</div>
                      <div className="text-3xl font-bold">{data.improvement.from}</div>
                    </div>
                    <div className="flex items-center">
                      {data.improvement.change > 0 ? (
                        <ArrowUpRight className="h-8 w-8 text-green-500" />
                      ) : data.improvement.change < 0 ? (
                        <ArrowDownRight className="h-8 w-8 text-red-500" />
                      ) : (
                        <Minus className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">最新检测</div>
                      <div className="text-3xl font-bold">{data.improvement.to}</div>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <span className={`text-lg font-semibold ${
                      data.improvement.change > 0 ? 'text-green-600' : 
                      data.improvement.change < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {data.improvement.change > 0 ? '提升' : data.improvement.change < 0 ? '下降' : '持平'} 
                      {Math.abs(data.improvement.percent)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 评分趋势图 */}
            {data.scoreTrend.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">评分趋势</CardTitle>
                  <CardDescription>您的健康评分变化趋势</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-48">
                    {/* Y轴标签 */}
                    <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-muted-foreground">
                      <span>{maxScore}</span>
                      <span>{Math.round(maxScore / 2)}</span>
                      <span>0</span>
                    </div>
                    {/* 图表区域 */}
                    <div className="ml-10 h-40 relative border-l border-b border-gray-200">
                      {data.scoreTrend.map((item, index) => (
                        <div
                          key={index}
                          className="absolute bottom-0 flex flex-col items-center"
                          style={{ left: `${(index / Math.max(data.scoreTrend.length - 1, 1)) * 90 + 5}%` }}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${
                              item.type === 'face' ? 'bg-cyan-500' : 'bg-purple-500'
                            }`}
                            title={`${item.date}: ${item.score}分`}
                          />
                          <div
                            className={`w-0.5 ${
                              item.type === 'face' ? 'bg-cyan-400' : 'bg-purple-400'
                            }`}
                            style={{ height: `${(item.score / maxScore) * 140}px` }}
                          />
                        </div>
                      ))}
                    </div>
                    {/* X轴标签 */}
                    <div className="ml-10 flex justify-between text-xs text-muted-foreground mt-2">
                      {data.scoreTrend.length > 0 && (
                        <>
                          <span>{data.scoreTrend[0].date}</span>
                          {data.scoreTrend.length > 1 && (
                            <span>{data.scoreTrend[data.scoreTrend.length - 1].date}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500" />
                      <span>面诊</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span>舌诊</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 体质分布 */}
            {data.constitutionDistribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">体质判断分布</CardTitle>
                  <CardDescription>历次检测的体质判断结果</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.constitutionDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-24 text-sm">{item.type}</div>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                            style={{ width: `${(item.count / data.totalRecords) * 100}%` }}
                          />
                        </div>
                        <div className="w-8 text-sm text-right">{item.count}次</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 五脏状态趋势 */}
            {Object.values(data.organTrend).some(arr => arr.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">五脏健康趋势</CardTitle>
                  <CardDescription>心、肝、脾、肺、肾的健康状态变化</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    {[
                      { key: 'heart', name: '心', color: 'bg-red-500' },
                      { key: 'liver', name: '肝', color: 'bg-green-500' },
                      { key: 'spleen', name: '脾', color: 'bg-yellow-500' },
                      { key: 'lung', name: '肺', color: 'bg-blue-500' },
                      { key: 'kidney', name: '肾', color: 'bg-purple-500' },
                    ].map((organ) => {
                      const trend = data.organTrend[organ.key] || [];
                      const latest = trend.length > 0 ? trend[trend.length - 1].value : null;
                      const first = trend.length > 0 ? trend[0].value : null;
                      const change = latest && first ? latest - first : 0;
                      return (
                        <div key={organ.key} className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className={`w-6 h-6 ${organ.color} rounded-full mx-auto mb-2`} />
                          <div className="text-sm font-medium">{organ.name}</div>
                          <div className="text-lg font-bold mt-1">{latest || '-'}</div>
                          {change !== 0 && (
                            <div className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {change > 0 ? '+' : ''}{change}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 查看历史记录 */}
            <div className="text-center">
              <Button variant="outline" onClick={() => router.push('/diagnosis-history')}>
                查看全部历史记录
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
