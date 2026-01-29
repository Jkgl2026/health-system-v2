'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function DiagnoseSevenQuestionsPage() {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnose = async () => {
    if (!name.trim() && !userId.trim()) {
      setError('请输入用户姓名或用户ID');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const params = new URLSearchParams();
      if (name.trim()) params.append('name', name);
      if (userId.trim()) params.append('userId', userId);

      const response = await fetch(`/api/diagnose-seven-questions?${params.toString()}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setData(result);
      } else {
        setError(result.error || '诊断失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>七问数据诊断工具</CardTitle>
            <CardDescription>输入用户姓名或用户ID，查看数据库中存储的七问数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">用户姓名</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="如：李四"
                  onKeyDown={(e) => e.key === 'Enter' && handleDiagnose()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">用户ID</label>
                <Input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="如：550e8400-e29b-..."
                  onKeyDown={(e) => e.key === 'Enter' && handleDiagnose()}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleDiagnose} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                开始诊断
              </Button>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {data && (
          <div className="space-y-6">
            {/* 用户信息 */}
            <Card>
              <CardHeader>
                <CardTitle>用户信息</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
                  {JSON.stringify(data.user, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {/* Requirements 数据 */}
            {data.requirements && data.requirements.length > 0 ? (
              data.requirements.map((req: any, index: number) => (
                <Card key={req.id}>
                  <CardHeader>
                    <CardTitle>Requirements 记录 #{index + 1}</CardTitle>
                    <CardDescription>
                      更新时间：{req.updatedAt} | 完成时间：{req.completedAt || '未完成'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <strong>要求1：</strong> {req.requirement1Completed ? '✅ 完成' : '❌ 未完成'}
                      </div>
                      <div>
                        <strong>要求2：</strong> {req.requirement2Completed ? '✅ 完成' : '❌ 未完成'}
                      </div>
                      <div>
                        <strong>要求3：</strong> {req.requirement3Completed ? '✅ 完成' : '❌ 未完成'}
                      </div>
                      <div>
                        <strong>要求4：</strong> {req.requirement4Completed ? '✅ 完成' : '❌ 未完成'}
                      </div>
                    </div>

                    {/* 七问数据 */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <strong>sevenQuestionsAnswers：</strong>
                        {req.sevenQuestionsAnswers ? (
                          <span className="text-green-600">✅ 有数据</span>
                        ) : (
                          <span className="text-red-600">❌ 无数据</span>
                        )}
                      </div>
                      {req.sevenQuestionsAnswers ? (
                        <>
                          <div className="mb-2">
                            <strong>数据类型：</strong> {req.sevenQuestionsAnswersType}
                          </div>
                          <div className="mb-2">
                            <strong>Keys：</strong> {req.sevenQuestionsAnswersKeys.join(', ') || '无'}
                          </div>
                          <div>
                            <strong>完整数据：</strong>
                            <pre className="mt-2 p-4 bg-green-50 border-2 border-green-200 rounded-lg overflow-auto max-h-96">
                              {JSON.stringify(req.sevenQuestionsAnswers, null, 2)}
                            </pre>
                          </div>
                        </>
                      ) : (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            该记录中没有 sevenQuestionsAnswers 数据，这就是后台显示"未填写"的原因！
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>该用户没有 requirements 数据</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
