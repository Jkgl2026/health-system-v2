'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  getAllRecords, 
  compareRecords, 
  AssessmentRecord 
} from '@/lib/progress-tracker';
import { 
  ArrowUp, 
  ArrowDown, 
  Minus,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ComparisonViewProps {
  onCompare?: (record1: AssessmentRecord, record2: AssessmentRecord) => void;
}

export default function ComparisonView({ onCompare }: ComparisonViewProps) {
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [selectedId1, setSelectedId1] = useState<string>('');
  const [selectedId2, setSelectedId2] = useState<string>('');
  const [comparison, setComparison] = useState<ReturnType<typeof compareRecords> | null>(null);
  
  // 加载记录
  useEffect(() => {
    const loaded = getAllRecords();
    setRecords(loaded);
    
    if (loaded.length >= 2) {
      setSelectedId1(loaded[0].id);
      setSelectedId2(loaded[1].id);
    }
  }, []);
  
  // 执行对比
  useEffect(() => {
    if (selectedId1 && selectedId2 && selectedId1 !== selectedId2) {
      const result = compareRecords(selectedId1, selectedId2);
      setComparison(result);
    }
  }, [selectedId1, selectedId2]);
  
  // 格式化日期
  const formatDate = (timestamp: string) => {
    return format(parseISO(timestamp), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
  };
  
  // 严重程度颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-500';
      case 'moderate': return 'bg-orange-500';
      case 'mild': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  // 严重程度文本
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'severe': return '重度';
      case 'moderate': return '中度';
      case 'mild': return '轻度';
      default: return '正常';
    }
  };
  
  if (records.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>至少需要2次评估记录才能进行对比</p>
          <p className="text-sm mt-1">当前仅有 {records.length} 次记录</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 选择对比记录 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">选择对比记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">最新记录</label>
              <Select value={selectedId1} onValueChange={setSelectedId1}>
                <SelectTrigger>
                  <SelectValue placeholder="选择记录" />
                </SelectTrigger>
                <SelectContent>
                  {records.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {formatDate(record.timestamp)} - {record.overallScore}分
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">历史记录</label>
              <Select value={selectedId2} onValueChange={setSelectedId2}>
                <SelectTrigger>
                  <SelectValue placeholder="选择记录" />
                </SelectTrigger>
                <SelectContent>
                  {records.map((record) => (
                    <SelectItem key={record.id} value={record.id} disabled={record.id === selectedId1}>
                      {formatDate(record.timestamp)} - {record.overallScore}分
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 对比结果 */}
      {comparison && comparison.record1 && comparison.record2 && (
        <div className="space-y-4">
          {/* 评分对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                综合评分变化
                {comparison.comparison.scoreChange > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : comparison.comparison.scoreChange < 0 ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : (
                  <Minus className="h-5 w-5 text-gray-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">历史记录</div>
                  <div className="text-3xl font-bold">{comparison.record2.overallScore}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(comparison.record2.timestamp).split(' ')[0]}
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className={`text-4xl font-bold flex items-center gap-1 ${
                    comparison.comparison.scoreChange > 0 ? 'text-green-500' :
                    comparison.comparison.scoreChange < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {comparison.comparison.scoreChange > 0 ? (
                      <ArrowUp className="h-6 w-6" />
                    ) : comparison.comparison.scoreChange < 0 ? (
                      <ArrowDown className="h-6 w-6" />
                    ) : (
                      <Minus className="h-6 w-6" />
                    )}
                    {Math.abs(comparison.comparison.scoreChange)}
                  </div>
                  <div className="text-sm text-muted-foreground">变化</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">最新记录</div>
                  <div className="text-3xl font-bold">{comparison.record1.overallScore}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(comparison.record1.timestamp).split(' ')[0]}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 问题变化 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 改善的问题 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  改善的问题
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.comparison.issuesImproved.length > 0 ? (
                  <div className="space-y-2">
                    {comparison.comparison.issuesImproved.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Badge className="bg-green-100 text-green-700">改善</Badge>
                        {issue}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无改善的问题</p>
                )}
              </CardContent>
            </Card>
            
            {/* 新出现的问题 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  新出现的问题
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.comparison.issuesNew.length > 0 ? (
                  <div className="space-y-2">
                    {comparison.comparison.issuesNew.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Badge className="bg-orange-100 text-orange-700">新增</Badge>
                        {issue}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">没有新问题出现</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* 已解决 vs 恶化 */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  已解决的问题
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.comparison.issuesResolved.length > 0 ? (
                  <div className="space-y-2">
                    {comparison.comparison.issuesResolved.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        {issue}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无已解决的问题</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  恶化的问题
                </CardTitle>
              </CardHeader>
              <CardContent>
                {comparison.comparison.issuesWorsened.length > 0 ? (
                  <div className="space-y-2">
                    {comparison.comparison.issuesWorsened.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-red-700">
                        <XCircle className="h-4 w-4" />
                        {issue}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">没有问题恶化</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* 详细问题对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">详细问题对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">问题类型</th>
                      <th className="text-center py-2">历史</th>
                      <th className="text-center py-2">最新</th>
                      <th className="text-center py-2">变化</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 合并所有问题类型 */}
                    {Array.from(new Set([
                      ...comparison.record1.issues.map(i => i.type),
                      ...comparison.record2.issues.map(i => i.type)
                    ])).map(type => {
                      const issue1 = comparison.record1!.issues.find(i => i.type === type);
                      const issue2 = comparison.record2!.issues.find(i => i.type === type);
                      
                      const severityMap = { mild: 1, moderate: 2, severe: 3 };
                      const s1 = issue1 ? severityMap[issue1.severity as keyof typeof severityMap] : 0;
                      const s2 = issue2 ? severityMap[issue2.severity as keyof typeof severityMap] : 0;
                      const change = s2 - s1;
                      
                      return (
                        <tr key={type} className="border-b">
                          <td className="py-2">{issue1?.name || issue2?.name}</td>
                          <td className="text-center py-2">
                            {issue2 ? (
                              <Badge className={`${getSeverityColor(issue2.severity)} text-white`}>
                                {getSeverityText(issue2.severity)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="text-center py-2">
                            {issue1 ? (
                              <Badge className={`${getSeverityColor(issue1.severity)} text-white`}>
                                {getSeverityText(issue1.severity)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="text-center py-2">
                            {change < 0 ? (
                              <span className="text-green-500 flex items-center justify-center gap-1">
                                <ArrowDown className="h-4 w-4" /> 改善
                              </span>
                            ) : change > 0 ? (
                              <span className="text-red-500 flex items-center justify-center gap-1">
                                <ArrowUp className="h-4 w-4" /> 恶化
                              </span>
                            ) : (
                              <span className="text-muted-foreground">无变化</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
