'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Activity, Eye, Trash2, Calendar, 
  AlertCircle, Loader2, LogOut, User, Award
} from 'lucide-react';

interface PostureRecord {
  id: string;
  userId: string | null;
  score: number | null;
  grade: string | null;
  frontImageUrl: string | null;
  leftSideImageUrl: string | null;
  rightSideImageUrl: string | null;
  backImageUrl: string | null;
  bodyStructure: any;
  fasciaChainAnalysis: any;
  muscleAnalysis: any;
  breathingAssessment: any;
  alignmentAssessment: any;
  compensationPatterns: any;
  healthImpact: any;
  healthPrediction: any;
  treatmentPlan: any;
  createdAt: string;
}

export default function AdminPostureRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<PostureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PostureRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    fetchRecords();
  }, [router]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/posture-diagnosis?limit=100');
      const data = await response.json();
      if (data.success) {
        setRecords(data.data.records);
      } else {
        setError(data.error || '获取记录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = (record: PostureRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
  };

  const deleteRecord = async (record: PostureRecord) => {
    if (!confirm('确定要删除这条体态评估记录吗？')) return;
    try {
      const response = await fetch(`/api/posture-diagnosis/${record.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setRecords(records.filter(r => r.id !== record.id));
      } else {
        alert(data.error || '删除失败');
      }
    } catch {
      alert('网络错误');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    router.push('/admin/login');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">体态评估记录管理</h1>
              <p className="text-sm text-gray-500">查看和管理所有体态评估记录</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">总记录数</p>
                  <p className="text-2xl font-bold">{records.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均评分</p>
                  <p className="text-2xl font-bold">
                    {records.length > 0 
                      ? Math.round(records.reduce((sum, r) => sum + (r.score || 0), 0) / records.length)
                      : '-'}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">本周新增</p>
                  <p className="text-2xl font-bold">
                    {records.filter(r => {
                      const recordDate = new Date(r.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return recordDate >= weekAgo;
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">优秀率</p>
                  <p className="text-2xl font-bold">
                    {records.length > 0 
                      ? Math.round(records.filter(r => r.grade === 'A' || r.grade === 'B').length / records.length * 100)
                      : 0}%
                  </p>
                </div>
                <User className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 记录列表 */}
        <Card>
          <CardHeader>
            <CardTitle>体态评估记录</CardTitle>
            <CardDescription>共 {records.length} 条记录</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : records.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>评估时间</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>等级</TableHead>
                    <TableHead>照片情况</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(record.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{record.score || '-'}</span>
                          {record.score && (
                            <Progress value={record.score} className="w-16 h-2" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(record.grade)}>
                          {record.grade || '-'}级
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {record.frontImageUrl && <Badge variant="outline">正</Badge>}
                          {record.leftSideImageUrl && <Badge variant="outline">左</Badge>}
                          {record.rightSideImageUrl && <Badge variant="outline">右</Badge>}
                          {record.backImageUrl && <Badge variant="outline">背</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewDetail(record)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            查看
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteRecord(record)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无体态评估记录
              </div>
            )}
          </CardContent>
        </Card>

        {/* 详情弹窗 */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>体态评估详情</DialogTitle>
              <DialogDescription>
                评估时间: {selectedRecord && formatDate(selectedRecord.createdAt)}
              </DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                {/* 总体评分 */}
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-80">综合评分</p>
                        <p className="text-5xl font-bold">{selectedRecord.score || '-'}</p>
                        <Badge className={`${getGradeColor(selectedRecord.grade)} mt-2`}>
                          {selectedRecord.grade || '-'}级
                        </Badge>
                      </div>
                      <Activity className="h-16 w-16 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                {/* 详细信息 */}
                <Tabs defaultValue="structure">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="structure">身体结构</TabsTrigger>
                    <TabsTrigger value="fascia">筋膜链</TabsTrigger>
                    <TabsTrigger value="muscle">肌肉分析</TabsTrigger>
                    <TabsTrigger value="plan">调理方案</TabsTrigger>
                  </TabsList>

                  <TabsContent value="structure" className="space-y-2">
                    {selectedRecord.bodyStructure && Object.entries(selectedRecord.bodyStructure).map(([key, value]: [string, any]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{key}</span>
                          <Badge variant={value.severity === '无' ? 'secondary' : 'destructive'}>
                            {value.severity || '正常'}
                          </Badge>
                        </div>
                        {value.issues && value.issues.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {value.issues.map((issue: string, idx: number) => (
                              <p key={idx}>• {issue}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="fascia">
                    <div className="grid grid-cols-2 gap-2">
                      {selectedRecord.fasciaChainAnalysis && Object.entries(selectedRecord.fasciaChainAnalysis).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium capitalize mb-1">{key}</p>
                          <p className="text-sm text-gray-600">状态: {value.status || '正常'}</p>
                          <p className="text-sm text-gray-600">紧张: {value.tension || '正常'}</p>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="muscle" className="space-y-2">
                    {selectedRecord.muscleAnalysis?.tight && selectedRecord.muscleAnalysis.tight.length > 0 && (
                      <div>
                        <p className="font-medium text-red-600 mb-2">紧张肌肉</p>
                        {selectedRecord.muscleAnalysis.tight.map((item: any, idx: number) => (
                          <div key={idx} className="p-2 bg-red-50 rounded mb-1 text-sm">
                            {item.muscle} - {item.severity}
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedRecord.muscleAnalysis?.weak && selectedRecord.muscleAnalysis.weak.length > 0 && (
                      <div>
                        <p className="font-medium text-yellow-600 mb-2">无力肌肉</p>
                        {selectedRecord.muscleAnalysis.weak.map((item: any, idx: number) => (
                          <div key={idx} className="p-2 bg-yellow-50 rounded mb-1 text-sm">
                            {item.muscle} - {item.severity}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="plan" className="space-y-4">
                    {selectedRecord.treatmentPlan?.zhengfu && (
                      <div>
                        <p className="font-medium mb-2">整复训练</p>
                        <p className="text-sm text-gray-600">{selectedRecord.treatmentPlan.zhengfu.description}</p>
                      </div>
                    )}
                    {selectedRecord.treatmentPlan?.benyuan && (
                      <div>
                        <p className="font-medium mb-2">本源训练</p>
                        <p className="text-sm text-gray-600">{selectedRecord.treatmentPlan.benyuan.description}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
