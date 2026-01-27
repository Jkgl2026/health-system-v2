'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function DebugSevenQuestionsPage() {
  const [userId, setUserId] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!userId) {
      alert('请输入用户ID');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/debug/requirements/${userId}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('获取数据失败:', error);
      alert('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>调试：查看用户七问数据</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="输入用户ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <Button onClick={fetchData} disabled={loading}>
                {loading ? '加载中...' : '查询'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {data && (
          <Card>
            <CardHeader>
              <CardTitle>查询结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <strong>用户ID：</strong> {data.userId}
                </div>
                <div>
                  <strong>requirements：</strong>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(data.requirements, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>sevenQuestionsAnswers：</strong>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(data.sevenQuestionsAnswers, null, 2)}
                  </pre>
                </div>
                <div>
                  <strong>sevenQuestionsAnswersType：</strong> {data.sevenQuestionsAnswersType}
                </div>
                <div>
                  <strong>sevenQuestionsAnswersKeys：</strong>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-lg">
                    {JSON.stringify(data.sevenQuestionsAnswersKeys, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
