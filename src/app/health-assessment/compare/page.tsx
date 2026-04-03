'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calendar, TrendingUp, BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Session {
  id: string;
  sessionName: string;
  createdAt: string;
  completedAt: string | null;
  personalInfo: {
    name: string;
  } | null;
  healthAnalysis?: any;
  constitutionResult?: any;
}

export default function ComparePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('health_app_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
      loadSessions(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadSessions = async (uid: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/assessment/sessions?userId=${uid}&status=completed`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || '获取历史记录失败');
      }
      setSessions(data.data.records);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (sessionId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(sessionId)) {
        return prev.filter((id) => id !== sessionId);
      } else if (prev.length < 3) {
        return [...prev, sessionId];
      }
      return prev;
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getRiskLabel = (value: number) => {
    if (value < 0.3) return { label: '低风险', color: 'text-green-600' };
    if (value < 0.6) return { label: '中等风险', color: 'text-yellow-600' };
    return { label: '高风险', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/health-assessment/history')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">对比分析</h1>
              <p className="text-gray-600">选择2-3次评估记录进行对比</p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/health-assessment')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            开始新评估
          </Button>
        </div>

        {/* 提示 */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            请选择 2-3 次评估记录进行对比分析，最多可选择 3 条记录
          </AlertDescription>
        </Alert>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 评估记录列表 */}
        <div className="space-y-4 mb-8">
          {sessions.map((session) => (
            <Card key={session.id} className={`shadow-lg border-2 cursor-pointer transition-all ${
              selectedIds.includes(session.id)
                ? 'border-blue-500 bg-blue-50'
                : 'hover:shadow-xl'
            }`} onClick={() => handleToggleSelect(session.id)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedIds.includes(session.id)}
                      disabled={
                        !selectedIds.includes(session.id) && selectedIds.length >= 3
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <div className="text-lg font-semibold mb-1">
                        {session.sessionName || '健康评估'}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(session.completedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    已完成
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 对比结果 */}
        {selectedIds.length >= 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">对比结果</h2>

            {/* 总体健康指数对比 */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  总体健康指数对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {selectedIds.map((id) => {
                    const session = sessions.find((s) => s.id === id);
                    const healthScore = session?.healthAnalysis?.overallHealth || 70;
                    return (
                      <div key={id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">
                          {formatDate(session?.completedAt)}
                        </div>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {healthScore}
                        </div>
                        <div className="text-xs text-gray-500">健康指数</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 体质类型对比 */}
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle>体质类型对比</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {selectedIds.map((id) => {
                    const session = sessions.find((s) => s.id === id);
                    const primary = session?.constitutionResult?.primary || '平和质';
                    return (
                      <div key={id} className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-2">
                          {formatDate(session?.completedAt)}
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {primary}
                        </div>
                        <div className="text-xs text-gray-500">主要体质</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 变化趋势 */}
            <Card className="shadow-lg border-2 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle>变化趋势分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-lg text-gray-900 mb-2">
                    健康状况
                    {selectedIds.length === 2 && (() => {
                      const first = sessions.find((s) => s.id === selectedIds[0]);
                      const second = sessions.find((s) => s.id === selectedIds[1]);
                      const diff = (second?.healthAnalysis?.overallHealth || 0) - (first?.healthAnalysis?.overallHealth || 0);
                      if (diff > 0) return `提升了 ${diff} 分`;
                      if (diff < 0) return `下降了 ${Math.abs(diff)} 分`;
                      return '保持稳定';
                    })()}
                  </p>
                  <p className="text-sm text-gray-600">
                    建议继续保持健康的生活方式，定期进行健康评估
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 底部提示 */}
        {selectedIds.length === 0 && (
          <Card className="shadow-lg border-2">
            <CardContent className="py-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-lg text-gray-900">
                  请选择至少 2 条评估记录进行对比
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
