'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  getProgressTrend, 
  getIssueTrend, 
  getStatistics,
  getAngleTrend 
} from '@/lib/progress-tracker';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Calendar,
  Award
} from 'lucide-react';

interface ProgressChartProps {
  days?: number;
}

export default function ProgressChart({ days = 30 }: ProgressChartProps) {
  // 获取趋势数据
  const trendData = useMemo(() => getProgressTrend(days), [days]);
  const issueTrend = useMemo(() => getIssueTrend(), []);
  const statistics = useMemo(() => getStatistics(), []);
  const angleTrend = useMemo(() => getAngleTrend(), []);
  
  // 准备图表数据
  const chartData = useMemo(() => {
    return trendData.dates.map((date, i) => ({
      date,
      score: trendData.scores[i],
    }));
  }, [trendData]);
  
  return (
    <div className="space-y-6">
      {/* 统计摘要 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">总评估次数</span>
            </div>
            <div className="text-2xl font-bold">{statistics.totalAssessments}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm">平均评分</span>
            </div>
            <div className="text-2xl font-bold">{statistics.averageScore}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Award className="h-4 w-4" />
              <span className="text-sm">最高评分</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{statistics.highestScore}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              {trendData.improvement > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : trendData.improvement < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-gray-500" />
              )}
              <span className="text-sm text-muted-foreground">改善趋势</span>
            </div>
            <div className={`text-2xl font-bold ${
              trendData.improvement > 0 ? 'text-green-500' : 
              trendData.improvement < 0 ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {trendData.improvement > 0 ? '+' : ''}{trendData.improvement.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 评分趋势图 */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">评分趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* 问题改善趋势 */}
      {issueTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">问题改善趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {issueTrend.map((item, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm">{item.issue}</span>
                  <Badge className={
                    item.trend === 'improving' ? 'bg-green-500' :
                    item.trend === 'worsening' ? 'bg-red-500' :
                    'bg-gray-500'
                  }>
                    {item.trend === 'improving' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {item.trend === 'worsening' && <TrendingDown className="h-3 w-3 mr-1" />}
                    {item.trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
                    {item.trend === 'improving' ? '改善中' : 
                     item.trend === 'worsening' ? '恶化中' : '稳定'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 角度变化趋势 */}
      {angleTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">关键角度变化</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={angleTrend[0]?.records || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* 角度列表 */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {angleTrend.slice(0, 6).map((angle, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="truncate">{angle.angle}</span>
                  <span className={`
                    ${angle.change > 0 ? 'text-green-500' : 
                      angle.change < 0 ? 'text-red-500' : 'text-gray-500'}
                  `}>
                    {angle.change > 0 ? '+' : ''}{angle.change.toFixed(1)}°
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 最常见问题 */}
      {statistics.mostCommonIssue && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">最常见问题</div>
                <div className="text-lg font-medium">{statistics.mostCommonIssue.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">出现次数</div>
                <div className="text-lg font-bold text-orange-500">
                  {statistics.mostCommonIssue.count}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
