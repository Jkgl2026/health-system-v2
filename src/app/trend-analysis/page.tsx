'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, 
  Activity, Heart, Loader2, FileText, BarChart3
} from 'lucide-react';

interface TrendData {
  category: string;
  trend: 'improving' | 'stable' | 'declining';
  change: number;
  startDate: string;
  endDate: string;
  records: {
    date: string;
    value: number;
    unit: string;
  }[];
  summary: string;
  prediction?: string;
}

interface TrendAnalysisResult {
  overallTrend: {
    status: 'improving' | 'stable' | 'declining';
    summary: string;
  };
  trends: TrendData[];
  recommendations: string[];
  nextCheckDate: string;
}

export default function TrendAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrendAnalysisResult | null>(null);
  const [questionnaireId, setQuestionnaireId] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trend-analysis${questionnaireId ? `?questionnaireId=${questionnaireId}` : ''}`);
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert('分析失败：' + data.error);
      }
    } catch (error) {
      console.error('分析失败:', error);
      alert('分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case 'stable':
        return <Minus className="h-5 w-5 text-blue-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '改善';
      case 'declining':
        return '下降';
      case 'stable':
        return '稳定';
      default:
        return '未知';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'bg-green-500';
      case 'declining':
        return 'bg-red-500';
      case 'stable':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">健康趋势分析</h1>
                <p className="text-sm text-gray-500">追踪健康数据变化趋势</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/health-profile')}
              >
                健康档案
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/comprehensive-report')}
              >
                <FileText className="h-4 w-4 mr-2" />
                综合报告
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {!result ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-500" />
                开始趋势分析
              </CardTitle>
              <CardDescription>
                分析您的健康数据随时间的变化趋势，识别改善、稳定或下降的领域
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  💡 趋势分析需要至少2次以上的健康记录数据
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  系统将分析您的健康指标、检测评分等数据的变化趋势，并提供预测和建议
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  问卷ID（可选）
                </label>
                <input
                  type="text"
                  value={questionnaireId}
                  onChange={(e) => setQuestionnaireId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="如未填写，系统将分析所有可用数据"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    开始趋势分析
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 总体趋势 */}
            <Card className="border-2 border-blue-200 dark:border-blue-900">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(result.overallTrend.status)}
                    总体健康趋势
                  </div>
                  <Badge className={`text-white ${getTrendColor(result.overallTrend.status)}`}>
                    {getTrendText(result.overallTrend.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {result.overallTrend.summary}
                </p>
              </CardContent>
            </Card>

            {/* 各领域趋势 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  各领域趋势分析
                </h2>
                <Badge variant="outline">
                  共 {result.trends.length} 个领域
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.trends.map((trend, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{trend.category}</CardTitle>
                        <Badge
                          variant={
                            trend.trend === 'improving' ? 'default' :
                            trend.trend === 'declining' ? 'destructive' : 'secondary'
                          }
                          className="flex items-center gap-1"
                        >
                          {getTrendIcon(trend.trend)}
                          {getTrendText(trend.trend)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(trend.startDate).toLocaleDateString('zh-CN')} - {' '}
                        {new Date(trend.endDate).toLocaleDateString('zh-CN')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* 简单的折线图模拟 */}
                        <div className="relative h-20 bg-gray-50 dark:bg-gray-800 rounded p-2">
                          <div className="flex items-end justify-between h-full gap-1">
                            {trend.records.map((record, idx) => {
                              const max = Math.max(...trend.records.map(r => r.value));
                              const min = Math.min(...trend.records.map(r => r.value));
                              const range = max - min || 1;
                              const height = ((record.value - min) / range) * 80;
                              return (
                                <div
                                  key={idx}
                                  className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                                  style={{ height: `${Math.max(height, 5)}%` }}
                                >
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {record.value} {record.unit}
                                    <div className="text-xs text-gray-400">{new Date(record.date).toLocaleDateString('zh-CN')}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 变化幅度 */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">变化幅度</span>
                          <span className={`font-semibold ${
                            trend.change > 0 ? 'text-green-600' : 
                            trend.change < 0 ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                          </span>
                        </div>

                        {/* 摘要 */}
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {trend.summary}
                        </p>

                        {/* 预测 */}
                        {trend.prediction && (
                          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                            <p className="text-xs text-purple-800 dark:text-purple-300">
                              🔮 预测：{trend.prediction}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 建议 */}
            <Card>
              <CardHeader>
                <CardTitle>改善建议</CardTitle>
                <CardDescription>
                  基于趋势分析的个性化建议
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 下次检查日期 */}
            <Card className="border-2 border-green-200 dark:border-green-900">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-green-500" />
                  下次检查建议
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {new Date(result.nextCheckDate).toLocaleDateString('zh-CN')}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    建议在此日期前再次进行健康检测，以便持续追踪健康趋势
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push('/health-profile')}
              >
                查看健康档案
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/risk-assessment')}
              >
                风险评估
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/comprehensive-report')}
              >
                综合报告
              </Button>
              <Button
                onClick={() => {
                  setResult(null);
                  setQuestionnaireId('');
                }}
              >
                重新分析
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
