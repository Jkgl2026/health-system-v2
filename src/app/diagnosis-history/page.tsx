'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, Heart, History, Eye, Trash2, 
  Calendar, Activity, AlertCircle, Loader2
} from 'lucide-react';

interface DiagnosisRecord {
  id: string;
  user_id: string | null;
  score: number | null;
  constitution: any;
  created_at: string;
  type: 'face' | 'tongue';
}

export default function DiagnosisHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const type = searchParams.get('type') || 'all';

  useEffect(() => {
    fetchRecords();
  }, [type]);

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/diagnosis-history?type=${type}&limit=50`);
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
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/diagnosis-history/${record.id}?type=${record.type}`);
      const data = await response.json();
      if (data.success) {
        setSelectedRecord(data.data);
      }
    } catch {
      alert('获取详情失败');
    } finally {
      setLoadingDetail(false);
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
        if (selectedRecord?.id === record.id) {
          setSelectedRecord(null);
        }
      } else {
        alert(data.error || '删除失败');
      }
    } catch {
      alert('网络错误');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => type === 'face' ? '面诊' : '舌诊';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-1" />返回
              </Button>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <History className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">诊断历史记录</h1>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant={type === 'all' ? 'default' : 'outline'} size="sm"
                onClick={() => router.push('/diagnosis-history?type=all')}>
                全部
              </Button>
              <Button variant={type === 'face' ? 'default' : 'outline'} size="sm"
                onClick={() => router.push('/diagnosis-history?type=face')}>
                面诊
              </Button>
              <Button variant={type === 'tongue' ? 'default' : 'outline'} size="sm"
                onClick={() => router.push('/diagnosis-history?type=tongue')}>
                舌诊
              </Button>
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
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无诊断记录</p>
              <p className="text-sm mt-2">进行舌诊或面诊后，记录将显示在这里</p>
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={() => router.push('/tongue-diagnosis')}>开始舌诊</Button>
                <Button variant="outline" onClick={() => router.push('/face-diagnosis')}>开始面诊</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {records.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        record.type === 'face' 
                          ? 'bg-gradient-to-br from-cyan-500 to-teal-500' 
                          : 'bg-gradient-to-br from-purple-500 to-pink-500'
                      }`}>
                        <span className="text-white font-bold">{record.type === 'face' ? '面' : '舌'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getTypeLabel(record.type)}记录</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                            {record.score !== null ? `${record.score}分` : '未评分'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(record.created_at)}
                        </div>
                        {record.constitution?.type && (
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            体质：{record.constitution.type}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => viewDetail(record)}>
                        <Eye className="h-4 w-4 mr-1" />查看
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteRecord(record)} 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 详情弹窗 */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedRecord.type === 'face' ? '面诊' : '舌诊'}详情
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}>关闭</Button>
                </div>
                <CardDescription>
                  {formatDate(selectedRecord.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRecord.score !== null && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white text-center">
                    <div className="text-sm opacity-80">综合评分</div>
                    <div className="text-4xl font-bold">{selectedRecord.score}</div>
                  </div>
                )}
                {selectedRecord.organ_status && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-500" />
                      五脏状态
                    </h4>
                    <div className="grid grid-cols-5 gap-2 text-center text-sm">
                      {['heart', 'liver', 'spleen', 'lung', 'kidney'].map((organ) => (
                        <div key={organ} className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                          <div className="text-muted-foreground">{organ === 'heart' ? '心' : organ === 'liver' ? '肝' : organ === 'spleen' ? '脾' : organ === 'lung' ? '肺' : '肾'}</div>
                          <div className="font-bold text-indigo-600">{selectedRecord.organ_status[organ] || '-'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm">
                    {selectedRecord.full_report}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
