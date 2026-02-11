'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface RequirementData {
  id: string;
  userId: string;
  requirement1Completed: boolean;
  requirement2Completed: boolean;
  requirement3Completed: boolean;
  requirement4Completed: boolean;
  sevenQuestionsAnswers: Record<string, any> | null;
  sevenQuestionsAnswersType: string | null;
  sevenQuestionsAnswersKeys: string[];
  completedAt: string | null;
}

interface UserData {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  age: number | null;
  gender: string | null;
  createdAt: string;
}

export default function DebugSevenQuestionsByNamePage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ user: UserData; requirement: RequirementData | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!name.trim()) {
      setError('请输入用户姓名');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/check-seven-questions-by-name?name=${encodeURIComponent(name)}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setData(result);
      } else {
        setError(result.error || '查询失败');
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
            <CardTitle>按姓名查询七问数据</CardTitle>
            <CardDescription>输入用户姓名查看数据库中的七问数据</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入用户姓名（如：李四）"
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
              />
              <Button onClick={handleCheck} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                查询
              </Button>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
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
            {data.requirement ? (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements 数据</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <strong>Requirement ID：</strong> {data.requirement.id}
                  </div>
                  <div>
                    <strong>Completed At：</strong> {data.requirement.completedAt}
                  </div>
                  <div>
                    <strong>Requirement 1 Completed：</strong> {data.requirement.requirement1Completed ? '是' : '否'}
                  </div>
                  <div>
                    <strong>Requirement 2 Completed：</strong> {data.requirement.requirement2Completed ? '是' : '否'}
                  </div>
                  <div>
                    <strong>Requirement 3 Completed：</strong> {data.requirement.requirement3Completed ? '是' : '否'}
                  </div>
                  <div>
                    <strong>Requirement 4 Completed：</strong> {data.requirement.requirement4Completed ? '是' : '否'}
                  </div>

                  {/* 七问数据 */}
                  <div>
                    <strong>sevenQuestionsAnswers：</strong>
                    <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
                      {JSON.stringify(data.requirement.sevenQuestionsAnswers, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <strong>sevenQuestionsAnswersType：</strong> {data.requirement.sevenQuestionsAnswersType}
                  </div>
                  <div>
                    <strong>sevenQuestionsAnswersKeys：</strong>
                    <pre className="mt-2 p-4 bg-gray-100 rounded-lg">
                      {JSON.stringify(data.requirement.sevenQuestionsAnswersKeys, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertDescription>该用户没有 requirements 数据</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
