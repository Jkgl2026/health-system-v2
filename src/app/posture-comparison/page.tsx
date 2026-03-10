'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Calendar, TrendingUp, TrendingDown, Minus,
  Activity, Award, Clock, ChevronRight, Eye, GitCompare,
  Download, Maximize2, Image as ImageIcon
} from 'lucide-react';
import PostureAnnotationCanvas from '@/components/PostureAnnotationCanvas';

interface PostureRecord {
  id: string;
  createdAt: string;
  score: number;
  grade: string;
  frontImageUrl: string;
  leftSideImageUrl: string;
  rightSideImageUrl: string;
  backImageUrl: string;
  bodyStructure: any;
}

interface Comparison {
  id: string;
  currentRecordId: string;
  previousRecordId: string;
  scoreChange: number;
  improvements: any[];
  deteriorations: any[];
  stableItems: any[];
  createdAt: string;
}

export default function PostureComparisonPage() {
  const router = useRouter();
  const [records, setRecords] = useState<PostureRecord[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  useEffect(() => {
    fetchRecords();
    fetchComparisons();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/posture-diagnosis');
      const data = await response.json();
      if (data.success) {
        setRecords(data.data.records);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  const fetchComparisons = async () => {
    try {
      const response = await fetch('/api/posture-comparison');
      const data = await response.json();
      if (data.success) {
        setComparisons(data.data.comparisons);
      }
    } catch (error) {
      console.error('Failed to fetch comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (selectedRecords.length !== 2) {
      alert('请选择两条记录进行对比');
      return;
    }

    try {
      const response = await fetch('/api/posture-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRecordId: selectedRecords[0],
          previousRecordId: selectedRecords[1],
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setComparisonResult(data.data);
      }
    } catch (error) {
      console.error('Failed to compare:', error);
    }
  };

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else if (prev.length < 2) {
        return [...prev, recordId];
      } else {
        return [prev[1], recordId];
      }
    });
    setComparisonResult(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'E': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="hover:bg-purple-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">历史对比</h1>
              <p className="text-sm text-gray-500">追踪体态变化 · 评估训练效果</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：记录列表 */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>评估记录</span>
                    <Badge variant="outline">
                      已选择 {selectedRecords.length}/2
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    选择两条记录进行对比分析
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {records.length > 0 ? (
                    records.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => toggleRecordSelection(record.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRecords.includes(record.id)
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">
                              {formatDate(record.createdAt)}
                            </span>
                          </div>
                          <Badge className={`${getGradeColor(record.grade)} text-white`}>
                            {record.grade}级
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gray-800">
                            {record.score}
                          </span>
                          <span className="text-sm text-gray-500">综合评分</span>
                        </div>
                        <Progress value={record.score} className="h-2 mt-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      暂无评估记录
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 对比按钮 */}
              <Button
                onClick={handleCompare}
                disabled={selectedRecords.length !== 2}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600"
              >
                <GitCompare className="h-4 w-4 mr-2" />
                开始对比
              </Button>
            </div>

            {/* 右侧：对比结果 */}
            <div className="space-y-4">
              {comparisonResult ? (
                <>
                  {/* AI差异标注图 */}
                  {comparisonResult.currentRecord && comparisonResult.previousRecord && (
                    <Card className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ImageIcon className="h-5 w-5 text-purple-500" />
                          AI差异标注图
                        </CardTitle>
                        <CardDescription>MediaPipe骨骼检测 + Vision语义分析</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="front">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="front">正面</TabsTrigger>
                            <TabsTrigger value="leftSide">左侧</TabsTrigger>
                            <TabsTrigger value="rightSide">右侧</TabsTrigger>
                            <TabsTrigger value="back">背面</TabsTrigger>
                          </TabsList>
                          
                          {['front', 'leftSide', 'rightSide', 'back'].map((angle) => (
                            <TabsContent key={angle} value={angle} className="mt-4">
                              <PostureAnnotationCanvas
                                mode="comparison"
                                beforeImage={comparisonResult.previousRecord[`${angle}ImageUrl`]}
                                afterImage={comparisonResult.currentRecord[`${angle}ImageUrl`]}
                                beforeData={{
                                  score: comparisonResult.previousRecord.score,
                                  grade: comparisonResult.previousRecord.grade,
                                  bodyStructure: comparisonResult.previousRecord.bodyStructure,
                                }}
                                afterData={{
                                  score: comparisonResult.currentRecord.score,
                                  grade: comparisonResult.currentRecord.grade,
                                  bodyStructure: comparisonResult.currentRecord.bodyStructure,
                                }}
                                improvements={comparisonResult.improvements?.map((item: any) => ({
                                  area: item.item,
                                  change: item.change,
                                })) || []}
                                deteriorations={comparisonResult.deteriorations?.map((item: any) => ({
                                  area: item.item,
                                  change: item.change,
                                })) || []}
                                angle={angle as 'front' | 'leftSide' | 'rightSide' | 'back'}
                                width={600}
                                height={450}
                                showAnalysis={true}
                              />
                            </TabsContent>
                          ))}
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* 评分变化 */}
                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardHeader>
                      <CardTitle>评分变化</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center gap-4">
                        {comparisonResult.scoreChange > 0 ? (
                          <TrendingUp className="h-12 w-12 text-green-300" />
                        ) : comparisonResult.scoreChange < 0 ? (
                          <TrendingDown className="h-12 w-12 text-red-300" />
                        ) : (
                          <Minus className="h-12 w-12 text-gray-300" />
                        )}
                        <div className="text-center">
                          <div className="text-4xl font-bold">
                            {comparisonResult.scoreChange > 0 ? '+' : ''}
                            {comparisonResult.scoreChange}
                          </div>
                          <p className="text-sm text-purple-100">评分变化</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 改善项目 */}
                  {comparisonResult.improvements && comparisonResult.improvements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                          <TrendingUp className="h-5 w-5" />
                          改善项目
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {comparisonResult.improvements.map((item: any, idx: number) => (
                          <div key={idx} className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-green-800">
                                {item.item}
                              </span>
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                {item.change}
                              </Badge>
                            </div>
                            <p className="text-xs text-green-600">
                              之前: {item.previous} → 现在: {item.current}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* 恶化项目 */}
                  {comparisonResult.deteriorations && comparisonResult.deteriorations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                          <TrendingDown className="h-5 w-5" />
                          需关注项目
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {comparisonResult.deteriorations.map((item: any, idx: number) => (
                          <div key={idx} className="bg-red-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-red-800">
                                {item.item}
                              </span>
                              <Badge variant="secondary" className="bg-red-100 text-red-700">
                                {item.change}
                              </Badge>
                            </div>
                            <p className="text-xs text-red-600">
                              之前: {item.previous} → 现在: {item.current}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* 整体评估 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>整体评估</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{comparisonResult.overallAssessment}</p>
                      {comparisonResult.recommendations && comparisonResult.recommendations.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="font-medium text-sm">建议：</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {comparisonResult.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 mt-0.5 text-purple-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>选择两条记录后点击"开始对比"</p>
                    <p className="text-sm mt-2">查看体态变化趋势</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
