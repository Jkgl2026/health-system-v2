'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, FileText, Activity, Heart, AlertCircle, Loader2,
  Calendar, TrendingUp, Lightbulb
} from 'lucide-react';

interface ComprehensiveData {
  faceDiagnosis: any;
  tongueDiagnosis: any;
  comprehensiveAnalysis: {
    overallScore: number | null;
    organStatus: Record<string, { face: number | null; tongue: number | null }>;
    constitution: { type: string; description?: string } | null;
    recommendations: Array<{ text: string }>;
  };
  healthProfile: any;
  generatedAt: string;
}

export default function ComprehensiveReportPage() {
  const router = useRouter();
  const [data, setData] = useState<ComprehensiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/comprehensive-report');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || '获取报告失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { label: '优秀', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 80) return { label: '良好', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 70) return { label: '一般', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 60) return { label: '欠佳', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: '需关注', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />返回
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">综合健康报告</h1>
              <p className="text-sm text-muted-foreground">面诊与舌诊综合分析</p>
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
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
        ) : !data ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无数据</p>
              <p className="text-sm mt-2">请先进行面诊或舌诊</p>
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={() => router.push('/tongue-diagnosis')}>开始舌诊</Button>
                <Button variant="outline" onClick={() => router.push('/face-diagnosis')}>开始面诊</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 报告头部 */}
            <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-80">综合健康评分</div>
                    <div className="text-5xl font-bold mt-2">
                      {data.comprehensiveAnalysis.overallScore || '-'}
                    </div>
                    {data.comprehensiveAnalysis.overallScore && (
                      <div className={`text-lg mt-2 ${
                        getScoreLevel(data.comprehensiveAnalysis.overallScore).color.replace('text-', 'text-')
                      }`}>
                        {getScoreLevel(data.comprehensiveAnalysis.overallScore).label}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm opacity-80">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="h-4 w-4" />
                      报告生成时间
                    </div>
                    <div className="mt-1">{formatDate(data.generatedAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 诊断来源 */}
            <div className="grid grid-cols-2 gap-4">
              <Card className={data.faceDiagnosis ? '' : 'opacity-50'}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold">
                      面
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">面诊分析</div>
                      <div className="text-xs text-muted-foreground">
                        {data.faceDiagnosis 
                          ? `评分: ${data.faceDiagnosis.score || '-'} | ${formatDate(data.faceDiagnosis.created_at)}`
                          : '暂无数据'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className={data.tongueDiagnosis ? '' : 'opacity-50'}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                      舌
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">舌诊分析</div>
                      <div className="text-xs text-muted-foreground">
                        {data.tongueDiagnosis 
                          ? `评分: ${data.tongueDiagnosis.score || '-'} | ${formatDate(data.tongueDiagnosis.created_at)}`
                          : '暂无数据'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 五脏健康状态 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  五脏健康状态
                </CardTitle>
                <CardDescription>面诊与舌诊综合评估</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { key: 'heart', name: '心', icon: '❤️' },
                    { key: 'liver', name: '肝', icon: '🍃' },
                    { key: 'spleen', name: '脾', icon: '🌾' },
                    { key: 'lung', name: '肺', icon: '💨' },
                    { key: 'kidney', name: '肾', icon: '💧' },
                  ].map((organ) => {
                    const status = data.comprehensiveAnalysis.organStatus[organ.key];
                    const avgValue = status.face && status.tongue 
                      ? Math.round((status.face + status.tongue) / 2)
                      : status.face || status.tongue;
                    return (
                      <div key={organ.key} className="flex items-center gap-4">
                        <div className="w-12 text-center">
                          <div className="text-2xl">{organ.icon}</div>
                          <div className="text-sm">{organ.name}</div>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">面诊</div>
                            <div className={`text-lg font-bold ${status.face ? '' : 'text-gray-400'}`}>
                              {status.face || '-'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">舌诊</div>
                            <div className={`text-lg font-bold ${status.tongue ? '' : 'text-gray-400'}`}>
                              {status.tongue || '-'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">综合</div>
                            <div className={`text-lg font-bold ${
                              avgValue 
                                ? avgValue >= 80 ? 'text-green-600' 
                                  : avgValue >= 60 ? 'text-yellow-600' 
                                  : 'text-red-600'
                                : 'text-gray-400'
                            }`}>
                              {avgValue || '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 体质判断 */}
            {data.comprehensiveAnalysis.constitution && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    体质判断
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                      {data.comprehensiveAnalysis.constitution.type}
                    </div>
                    {data.comprehensiveAnalysis.constitution.description && (
                      <div className="text-sm text-muted-foreground mt-2">
                        {data.comprehensiveAnalysis.constitution.description}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 健康建议 */}
            {data.comprehensiveAnalysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    健康改善建议
                  </CardTitle>
                  <CardDescription>基于综合分析生成的健康建议</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.comprehensiveAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          {index + 1}
                        </div>
                        <div className="flex-1 text-sm">{rec.text}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 详细报告 */}
            {(data.faceDiagnosis?.full_report || data.tongueDiagnosis?.full_report) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">详细诊断报告</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.faceDiagnosis?.full_report && (
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-teal-500 rounded text-white text-xs flex items-center justify-center">面</div>
                        面诊详细报告
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{data.faceDiagnosis.full_report}</pre>
                      </div>
                    </div>
                  )}
                  {data.tongueDiagnosis?.full_report && (
                    <div>
                      <div className="text-sm font-medium mb-2 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded text-white text-xs flex items-center justify-center">舌</div>
                        舌诊详细报告
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{data.tongueDiagnosis.full_report}</pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 底部操作 */}
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.push('/health-progress')}>
                <TrendingUp className="h-4 w-4 mr-2" />查看改善进度
              </Button>
              <Button variant="outline" onClick={() => router.push('/diagnosis-history')}>
                查看历史记录
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
