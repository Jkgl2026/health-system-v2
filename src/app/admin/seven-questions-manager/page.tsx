'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, AlertCircle, CheckCircle2, Save, RefreshCw, Search, Edit, Plus } from 'lucide-react';
import { SEVEN_QUESTIONS } from '@/lib/health-data';
import { saveRequirements, getUser } from '@/lib/api-client';

interface UserData {
  user: any;
  requirements: any;
  sevenQuestionsData: Record<string, any> | null;
}

export default function SevenQuestionsManagerPage() {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 加载用户数据
  const handleLoad = async () => {
    if (!userId.trim()) {
      setError('请输入用户ID');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUserData(null);

    try {
      // 获取用户信息
      const userResponse = await getUser(userId);
      if (!userResponse.success || !userResponse.user) {
        setError('用户不存在');
        return;
      }

      // 获取requirements数据
      const response = await fetch(`/api/requirements?userId=${userId}`);
      const reqData = await response.json();

      if (!response.ok) {
        setError('获取requirements数据失败: ' + (reqData.error || '未知错误'));
        return;
      }

      const requirement = reqData.requirement || null;

      // 提取七问答案
      let sevenQuestionsData = null;
      if (requirement?.sevenQuestionsAnswers) {
        sevenQuestionsData = requirement.sevenQuestionsAnswers;
      }

      // 初始化答案编辑状态
      const initialAnswers: Record<number, string> = {};
      if (sevenQuestionsData) {
        Object.entries(sevenQuestionsData).forEach(([key, value]: [string, any]) => {
          const questionId = parseInt(key);
          if (!isNaN(questionId) && value) {
            initialAnswers[questionId] = typeof value === 'string' ? value : value.answer || '';
          }
        });
      }

      setAnswers(initialAnswers);

      setUserData({
        user: userResponse.user,
        requirements: requirement,
        sevenQuestionsData,
      });

      // 检查是否有七问数据
      if (!sevenQuestionsData) {
        setError('该用户还没有填写健康七问，可以手动补录');
      } else {
        setSuccess('加载成功，已找到用户的七问数据');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      console.error('[七问管理] 加载失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 保存七问答案
  const handleSave = async () => {
    if (!userId.trim()) {
      setError('用户ID不能为空');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 构建七问答案数据
      const sevenQuestionsAnswers: Record<string, any> = {};
      SEVEN_QUESTIONS.forEach((q) => {
        const answerText = answers[q.id] || '';
        sevenQuestionsAnswers[q.id.toString()] = {
          answer: answerText,
          date: new Date().toISOString(),
        };
      });

      // 保存到数据库
      const response = await saveRequirements({
        userId,
        sevenQuestionsAnswers,
      });

      if (!response.success) {
        throw new Error('保存失败: ' + (response.error || '未知错误'));
      }

      // 刷新数据
      await handleLoad();
      setIsEditing(false);
      setSuccess('七问答案保存成功！');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
      console.error('[七问管理] 保存失败:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // 清空答案
  const handleClearAnswers = () => {
    const clearedAnswers: Record<number, string> = {};
    SEVEN_QUESTIONS.forEach(q => {
      clearedAnswers[q.id] = '';
    });
    setAnswers(clearedAnswers);
  };

  // 批量检查所有缺少七问数据的用户
  const [isBatchChecking, setIsBatchChecking] = useState(false);
  const [missingUsers, setMissingUsers] = useState<any[]>([]);

  const handleBatchCheck = async () => {
    setIsBatchChecking(true);
    setMissingUsers([]);

    try {
      const response = await fetch('/api/admin/find-users-missing-seven-questions');
      const data = await response.json();

      if (data.success) {
        setMissingUsers(data.users);
        setSuccess(`找到 ${data.users.length} 个缺少七问数据的用户`);
      } else {
        setError(data.error || '批量检查失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '批量检查失败');
    } finally {
      setIsBatchChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-6 h-6" />
              健康七问数据管理工具
            </CardTitle>
            <CardDescription>
              查看和补录用户的健康七问数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 单个用户查询 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="输入用户ID"
                    onKeyDown={(e) => e.key === 'Enter' && handleLoad()}
                  />
                </div>
                <Button onClick={handleLoad} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Search className="mr-2 h-4 w-4" />
                  查询
                </Button>
                {userData && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    补录/编辑
                  </Button>
                )}
                <Button onClick={() => {
                  setUserId('');
                  setUserData(null);
                  setError(null);
                  setSuccess(null);
                  setAnswers({});
                }} variant="ghost">
                  清空
                </Button>
              </div>

              {/* 批量检查 */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-gray-700">
                      批量检查缺少七问数据的用户
                    </div>
                    <div className="text-xs text-gray-500">
                      查找所有已创建用户但未填写健康七问的账号
                    </div>
                  </div>
                  <Button
                    onClick={handleBatchCheck}
                    disabled={isBatchChecking}
                    variant="outline"
                  >
                    {isBatchChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <RefreshCw className="mr-2 h-4 w-4" />
                    批量检查
                  </Button>
                </div>

                {missingUsers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      找到 {missingUsers.length} 个缺少七问数据的用户：
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {missingUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <div className="font-medium">{u.name || '未命名'}</div>
                            <div className="text-xs text-gray-500">{u.id}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setUserId(u.id);
                              handleLoad();
                            }}
                          >
                            查看详情
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 用户数据展示 */}
        {userData && (
          <Card>
            <CardHeader>
              <CardTitle>用户信息</CardTitle>
              <CardDescription>
                {userData.user.name} (ID: {userData.user.id})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 七问数据状态 */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50 border">
                <div className="flex items-center gap-2 mb-2">
                  <strong>七问数据状态：</strong>
                  {userData.sevenQuestionsData ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-green-600">已填写</span>
                      <Badge variant="outline">{Object.keys(userData.sevenQuestionsData).length}/7</Badge>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-600">未填写</span>
                    </>
                  )}
                </div>

                {userData.sevenQuestionsData && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                      查看原始数据
                    </summary>
                    <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto max-h-60">
                      {JSON.stringify(userData.sevenQuestionsData, null, 2)}
                    </pre>
                  </details>
                )}
              </div>

              {/* 七问答案展示/编辑 */}
              <div className="space-y-6">
                {SEVEN_QUESTIONS.map((q, index) => {
                  const answer = isEditing ? answers[q.id] || '' : (
                    userData.sevenQuestionsData?.[q.id.toString()]?.answer ||
                    userData.sevenQuestionsData?.[q.id] ||
                    ''
                  );
                  const hasAnswer = !!answer;

                  return (
                    <div key={index} className={`p-4 rounded-lg border ${hasAnswer ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${hasAnswer ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg mb-1">{q.question}</div>
                          <div className="text-sm text-gray-600 mb-2">{q.description}</div>
                        </div>
                      </div>
                      <div className="ml-11">
                        {isEditing ? (
                          <Textarea
                            value={answers[q.id] || ''}
                            onChange={(e) => {
                              setAnswers(prev => ({
                                ...prev,
                                [q.id]: e.target.value
                              }));
                            }}
                            placeholder="请输入回答..."
                            className="min-h-[100px]"
                          />
                        ) : (
                          <div className={`p-3 rounded ${hasAnswer ? 'bg-white border border-green-300' : 'bg-gray-100 border border-gray-300'}`}>
                            {hasAnswer ? (
                              <div className="text-gray-800">{answer}</div>
                            ) : (
                              <div className="text-gray-400 italic">未填写</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 编辑模式操作按钮 */}
              {isEditing && (
                <div className="mt-6 flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    保存答案
                  </Button>
                  <Button onClick={handleClearAnswers} variant="outline">
                    清空所有答案
                  </Button>
                  <Button onClick={() => {
                    setIsEditing(false);
                    // 恢复原始数据
                    const originalAnswers: Record<number, string> = {};
                    if (userData.sevenQuestionsData) {
                      Object.entries(userData.sevenQuestionsData).forEach(([key, value]: [string, any]) => {
                        const questionId = parseInt(key);
                        if (!isNaN(questionId) && value) {
                          originalAnswers[questionId] = typeof value === 'string' ? value : value.answer || '';
                        }
                      });
                    }
                    setAnswers(originalAnswers);
                  }} variant="ghost">
                    取消编辑
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
