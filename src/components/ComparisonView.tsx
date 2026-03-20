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
  AlertCircle,
  BarChart3,
  Target,
  Activity
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
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                综合评分对比
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
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-muted-foreground mb-1">历史记录</div>
                  <div className="text-4xl font-bold text-gray-700">{comparison.record2.overallScore}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(comparison.record2.timestamp).split(' ')[0]}
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className={`text-5xl font-bold flex items-center gap-1 ${
                    comparison.comparison.scoreChange > 0 ? 'text-green-500' :
                    comparison.comparison.scoreChange < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {comparison.comparison.scoreChange > 0 ? (
                      <ArrowUp className="h-8 w-8" />
                    ) : comparison.comparison.scoreChange < 0 ? (
                      <ArrowDown className="h-8 w-8" />
                    ) : (
                      <Minus className="h-8 w-8" />
                    )}
                    {Math.abs(comparison.comparison.scoreChange)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">评分变化</div>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-sm text-muted-foreground mb-1">最新记录</div>
                  <div className="text-4xl font-bold text-blue-600">{comparison.record1.overallScore}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(comparison.record1.timestamp).split(' ')[0]}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 问题变化汇总 */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="text-center p-4">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{comparison.comparison.issuesImproved.length}</div>
              <div className="text-xs text-muted-foreground">改善的问题</div>
            </Card>
            <Card className="text-center p-4">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{comparison.comparison.issuesResolved.length}</div>
              <div className="text-xs text-muted-foreground">已解决</div>
            </Card>
            <Card className="text-center p-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-orange-600">{comparison.comparison.issuesNew.length}</div>
              <div className="text-xs text-muted-foreground">新发现</div>
            </Card>
            <Card className="text-center p-4">
              <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{comparison.comparison.issuesWorsened.length}</div>
              <div className="text-xs text-muted-foreground">恶化</div>
            </Card>
          </div>
          
          {/* 问题变化详情 */}
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
          
          {/* 详细问题对比表格 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                全部问题对比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2">问题类型</th>
                      <th className="text-center py-3 px-2">历史状态</th>
                      <th className="text-center py-3 px-2">最新状态</th>
                      <th className="text-center py-3 px-2">变化</th>
                    </tr>
                  </thead>
                  <tbody>
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
                        <tr key={type} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">{issue1?.name || issue2?.name}</td>
                          <td className="text-center py-2 px-2">
                            {issue2 ? (
                              <Badge className={`${getSeverityColor(issue2.severity)} text-white`}>
                                {getSeverityText(issue2.severity)}
                              </Badge>
                            ) : (
                              <span className="text-green-600">无问题</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-2">
                            {issue1 ? (
                              <Badge className={`${getSeverityColor(issue1.severity)} text-white`}>
                                {getSeverityText(issue1.severity)}
                              </Badge>
                            ) : (
                              <span className="text-green-600">无问题</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-2">
                            {!issue2 && issue1 ? (
                              <span className="text-red-500 flex items-center justify-center gap-1">
                                <AlertCircle className="h-4 w-4" /> 新增
                              </span>
                            ) : issue2 && !issue1 ? (
                              <span className="text-green-500 flex items-center justify-center gap-1">
                                <CheckCircle2 className="h-4 w-4" /> 已解决
                              </span>
                            ) : change < 0 ? (
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
          
          {/* 角度数据对比 */}
          {comparison.record1.angles && comparison.record2.angles && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  关节角度对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-2">角度名称</th>
                        <th className="text-center py-2 px-2">历史值</th>
                        <th className="text-center py-2 px-2">最新值</th>
                        <th className="text-center py-2 px-2">变化</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Set([
                        ...Object.keys(comparison.record1.angles),
                        ...Object.keys(comparison.record2.angles)
                      ])).slice(0, 15).map(angle => {
                        const v1 = comparison.record1!.angles[angle];
                        const v2 = comparison.record2!.angles[angle];
                        const change = v1 - v2;
                        
                        return (
                          <tr key={angle} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2">{angle}</td>
                            <td className="text-center py-2 px-2">{v2?.toFixed(1) || '-'}°</td>
                            <td className="text-center py-2 px-2">{v1?.toFixed(1) || '-'}°</td>
                            <td className={`text-center py-2 px-2 font-medium ${
                              Math.abs(change) > 5 ? (change > 0 ? 'text-orange-500' : 'text-blue-500') : 'text-gray-500'
                            }`}>
                              {change > 0 ? '+' : ''}{change.toFixed(1)}°
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* 肌肉状态对比 */}
          {comparison.record1.muscles && comparison.record2.muscles && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  肌肉状态对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-red-600 mb-2">紧张肌肉变化</h4>
                    <div className="space-y-1">
                      {comparison.record1.muscles.tight.filter(m => !comparison.record2!.muscles?.tight.includes(m)).map(m => (
                        <div key={m} className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {m} (新增)
                        </div>
                      ))}
                      {comparison.record2.muscles.tight.filter(m => !comparison.record1!.muscles?.tight.includes(m)).map(m => (
                        <div key={m} className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> {m} (已缓解)
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-600 mb-2">无力肌肉变化</h4>
                    <div className="space-y-1">
                      {comparison.record1.muscles.weak.filter(m => !comparison.record2!.muscles?.weak.includes(m)).map(m => (
                        <div key={m} className="text-xs text-orange-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {m} (新增)
                        </div>
                      ))}
                      {comparison.record2.muscles.weak.filter(m => !comparison.record1!.muscles?.weak.includes(m)).map(m => (
                        <div key={m} className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> {m} (已恢复)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
