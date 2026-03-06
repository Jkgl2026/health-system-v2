'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, FileText, Eye, Trash2, Calendar, Activity, 
  AlertCircle, Loader2, LogOut, Filter
} from 'lucide-react';

interface DiagnosisRecord {
  id: string;
  user_id: string | null;
  score: number | null;
  constitution: any;
  created_at: string;
  type: 'face' | 'tongue';
}

export default function AdminDiagnosisRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'face' | 'tongue'>('all');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      router.push('/admin/login');
      return;
    }
    fetchRecords();
  }, [router, filterType]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const typeParam = filterType !== 'all' ? `&type=${filterType}` : '';
      const response = await fetch(`/api/diagnosis-history?limit=100${typeParam}`);
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
      } else {
        setError(data.error || '获取记录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (record: DiagnosisRecord) => {
    try {
      const response = await fetch(`/api/diagnosis-history/${record.id}?type=${record.type}`);
      const data = await response.json();
      if (data.success) {
        setSelectedRecord(data.data);
        setShowDetail(true);
      }
    } catch {
      alert('获取详情失败');
    }
  };

  const deleteRecord = async (record: DiagnosisRecord) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    try {
      const response = await fetch(`/api/diagnosis-history/${record.id}?type=${record.type}`, {
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

  const getTypeBadge = (type: string) => {
    return type === 'face' 
      ? <Badge className="bg-cyan-500">面诊</Badge>
      : <Badge className="bg-purple-500">舌诊</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">诊断记录管理</h1>
                <p className="text-sm text-muted-foreground">面诊与舌诊记录</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Button 
                  variant={filterType === 'all' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  全部
                </Button>
                <Button 
                  variant={filterType === 'face' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('face')}
                >
                  面诊
                </Button>
                <Button 
                  variant={filterType === 'tongue' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setFilterType('tongue')}
                >
                  舌诊
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>诊断记录列表</CardTitle>
            <CardDescription>共 {records.length} 条记录</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无记录
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>类型</TableHead>
                    <TableHead>评分</TableHead>
                    <TableHead>体质判断</TableHead>
                    <TableHead>诊断时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getTypeBadge(record.type)}</TableCell>
                      <TableCell>
                        <span className="font-bold text-lg">{record.score || '-'}</span>
                      </TableCell>
                      <TableCell>
                        {record.constitution?.type || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(record.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => viewDetail(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteRecord(record)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 详情对话框 */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedRecord?.type === 'face' ? '面诊' : '舌诊'}详情
              </DialogTitle>
              <DialogDescription>
                {selectedRecord && formatDate(selectedRecord.created_at)}
              </DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                {selectedRecord.score !== null && (
                  <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white text-center">
                    <div className="text-sm opacity-80">综合评分</div>
                    <div className="text-4xl font-bold">{selectedRecord.score}</div>
                  </div>
                )}
                {selectedRecord.organ_status && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-500" />
                      五脏状态
                    </h4>
                    <div className="grid grid-cols-5 gap-2 text-center text-sm">
                      {['heart', 'liver', 'spleen', 'lung', 'kidney'].map((organ) => (
                        <div key={organ} className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                          <div className="text-muted-foreground">
                            {organ === 'heart' ? '心' : organ === 'liver' ? '肝' : organ === 'spleen' ? '脾' : organ === 'lung' ? '肺' : '肾'}
                          </div>
                          <div className="font-bold text-indigo-600">
                            {selectedRecord.organ_status[organ] || '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h4 className="font-medium mb-2">完整报告</h4>
                  <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-auto max-h-96">
                    {selectedRecord.full_report}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
