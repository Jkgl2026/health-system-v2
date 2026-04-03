'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Calendar, Activity, CheckCircle2, TrendingUp, Trash2, Share2, BarChart3, Home } from 'lucide-react';

interface Session {
  id: string;
  sessionName: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  healthQuestionnaireId: string | null;
  constitutionQuestionnaireId: string | null;
  healthAnalysisId: string | null;
  personalInfo: {
    name: string;
    age: string;
    gender: string;
  } | null;
}

export default function HistoryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleNewAssessment = () => {
    router.push('/health-assessment');
  };

  const handleViewResult = (sessionId: string) => {
    router.push(`/health-assessment/result?sessionId=${sessionId}`);
  };

  const handleCompare = () => {
    router.push('/health-assessment/compare');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载历史记录...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              首页
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push('/health-assessment')}
            >
              返回
            </Button>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">健康评估历史</h1>
            <p className="text-gray-600">查看您所有的健康评估记录</p>
          </div>
          <div className="flex gap-2">
            {sessions.length > 0 && (
              <Button variant="outline" onClick={handleCompare}>
                <BarChart3 className="mr-2 h-4 w-4" />
                对比分析
              </Button>
            )}
            <Button onClick={handleNewAssessment} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              新建评估
            </Button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 无记录提示 */}
        {sessions.length === 0 && !error && (
          <Card className="shadow-lg border-2">
            <CardContent className="py-12">
              <div className="text-center">
                <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无评估记录</h3>
                <p className="text-gray-600 mb-6">
                  您还没有完成任何健康评估，开始您的第一次评估吧！
                </p>
                <Button onClick={handleNewAssessment} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  开始评估
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 历史记录列表 */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{session.sessionName || '健康评估'}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(session.completedAt)}</span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      已完成
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 个人信息摘要 */}
                    {session.personalInfo && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm">
                          <span className="text-gray-600">{session.personalInfo.name}</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-600">{session.personalInfo.age}岁</span>
                          <span className="mx-2">•</span>
                          <span className="text-gray-600">{session.personalInfo.gender === 'male' ? '男' : '女'}</span>
                        </div>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      {session.healthQuestionnaireId && session.constitutionQuestionnaireId ? (
                        // 两个问卷都完成了，显示查看详情
                        <Button
                          onClick={() => handleViewResult(session.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          查看详情
                        </Button>
                      ) : (
                        // 问卷未完成，显示继续评估
                        <Button
                          onClick={() => router.push(`/health-assessment?sessionId=${session.id}`)}
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                          size="sm"
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          继续评估
                        </Button>
                      )}
                      {session.healthQuestionnaireId && session.constitutionQuestionnaireId && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 统计信息 */}
        {sessions.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-4">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{sessions.length}</div>
                  <div className="text-sm text-gray-600">总评估次数</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {sessions.filter(s => s.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">已完成</div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {sessions.length > 0 ? '100%' : '0%'}
                  </div>
                  <div className="text-sm text-gray-600">完成率</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
