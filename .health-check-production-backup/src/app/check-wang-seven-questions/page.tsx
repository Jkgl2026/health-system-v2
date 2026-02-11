'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';

const TEST_USER_ID = '885f952b-3b93-442b-ad62-2153ff338d9c';

export default function CheckUserSevenQuestions() {
  const [backupData, setBackupData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLocalStorage();
  }, []);

  const checkLocalStorage = () => {
    // 检查七问备份
    const backup = localStorage.getItem('sevenQuestionsBackup');
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        setBackupData(parsed);
      } catch (error) {
        console.error('解析备份数据失败:', error);
      }
    }

    // 检查用户数据
    const userBackup = localStorage.getItem('userData');
    if (userBackup) {
      try {
        const parsed = JSON.parse(userBackup);
        setUserData(parsed);
      } catch (error) {
        console.error('解析用户数据失败:', error);
      }
    }
  };

  const recoverFromBackup = async () => {
    if (!backupData) return;

    setLoading(true);
    try {
      const response = await fetch('/api/recover-local-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: TEST_USER_ID,
          data: backupData,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('恢复成功！请刷新页面查看结果。');
      } else {
        alert('恢复失败：' + (result.error || '未知错误'));
      }
    } catch (error) {
      alert('恢复失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const clearBackup = () => {
    localStorage.removeItem('sevenQuestionsBackup');
    localStorage.removeItem('userData');
    setBackupData(null);
    setUserData(null);
    alert('本地存储已清除');
  };

  const saveTestAnswers = async () => {
    setLoading(true);
    try {
      const testAnswers = {
        answers: [
          { questionId: 1, answer: '每周都会犯一次，通常在疲劳后' },
          { questionId: 2, answer: '每次持续1-2小时' },
          { questionId: 3, answer: '头晕、心慌、手脚发凉' },
          { questionId: 4, answer: '尝试过吃药、按摩，效果不明显' },
          { questionId: 5, answer: '从去年开始，工作压力大时加重' },
          { questionId: 6, answer: '休息、放松心情时会减轻' },
          { questionId: 7, answer: '昨天下午加班后出现，特别累' },
        ],
        timestamp: new Date().toISOString(),
        userId: TEST_USER_ID,
      };

      const response = await fetch('/api/recover-local-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: TEST_USER_ID,
          data: testAnswers,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('测试答案保存成功！请刷新后台页面查看结果。');
      } else {
        alert('保存失败：' + (result.error || '未知错误'));
      }
    } catch (error) {
      alert('保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          用户七问答案检查工具
        </h1>

        <Alert className="mb-6 border-blue-300 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            <strong>用户ID：</strong>{TEST_USER_ID}
          </AlertDescription>
        </Alert>

        {/* 本地存储检查 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>本地存储检查</CardTitle>
          </CardHeader>
          <CardContent>
            {backupData ? (
              <div className="space-y-4">
                <Alert className="border-green-300 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-900">
                    找到七问答案备份！时间：{new Date(backupData.timestamp).toLocaleString('zh-CN')}
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold mb-2">答案详情：</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                    {JSON.stringify(backupData.answers, null, 2)}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button onClick={recoverFromBackup} disabled={loading}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {loading ? '恢复中...' : '从备份恢复到数据库'}
                  </Button>
                  <Button variant="destructive" onClick={clearBackup}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    清除本地备份
                  </Button>
                </div>
              </div>
            ) : (
              <Alert className="border-red-300 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-900">
                  本地存储中没有找到七问答案备份
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 手动保存测试答案 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>手动保存测试答案</CardTitle>
            <CardDescription>
              如果用户的七问答案丢失，可以手动保存测试答案进行验证
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={saveTestAnswers} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {loading ? '保存中...' : '保存测试答案到数据库'}
            </Button>
          </CardContent>
        </Card>

        {/* 用户数据 */}
        {userData && (
          <Card>
            <CardHeader>
              <CardTitle>用户数据</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
