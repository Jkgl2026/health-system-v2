'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, RefreshCw, Download, Upload, ArrowRight } from 'lucide-react';
import { getOrGenerateUserId } from '@/lib/user-context';
import { saveRequirements } from '@/lib/api-client';
import Link from 'next/link';
import { SEVEN_QUESTIONS } from '@/lib/health-data';

interface BackupData {
  answers: Array<{ questionId: number; answer: string }>;
  timestamp: string;
  userId: string;
}

export default function UserRestoreSevenQuestionsPage() {
  const [userId, setUserId] = useState<string>('');
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取用户ID
    setUserId(getOrGenerateUserId());

    // 检查是否有七问答案的备份
    try {
      const backupStr = localStorage.getItem('sevenQuestionsBackup');
      if (backupStr) {
        const backup = JSON.parse(backupStr) as BackupData;
        setBackupData(backup);
        console.log('[恢复七问] 找到备份:', backup);
      } else {
        console.log('[恢复七问] 没有找到备份');
      }
    } catch (err) {
      console.error('[恢复七问] 读取备份失败:', err);
    }
  }, []);

  const handleRestore = async () => {
    if (!backupData || !userId) {
      setError('没有可恢复的备份数据');
      return;
    }

    setIsRestoring(true);
    setError(null);
    setRestoreResult(null);

    try {
      // 构建七问答案数据
      const sevenQuestionsAnswers: Record<string, any> = {};
      backupData.answers.forEach(a => {
        sevenQuestionsAnswers[a.questionId.toString()] = {
          answer: a.answer,
          date: backupData.timestamp,
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

      // 清除本地备份
      localStorage.removeItem('sevenQuestionsBackup');
      localStorage.removeItem('sevenQuestionsSaveError');

      setRestoreResult({
        success: true,
        message: '七问答案已成功恢复到数据库！',
        answersCount: backupData.answers.length,
      });

      setBackupData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '恢复失败');
      console.error('[恢复七问] 失败:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDownloadBackup = () => {
    if (!backupData) return;

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seven-questions-backup-${userId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部说明 */}
        <Card className="mb-8 border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Download className="w-8 h-8 text-green-600" />
              恢复健康七问答案
            </CardTitle>
            <CardDescription className="text-base">
              自动检测并恢复您填写的健康七问答案
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-green-300 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-900">
                <strong>功能说明：</strong><br />
                如果您之前填写了健康七问但保存失败，系统会自动检测并恢复您的答案。
              </AlertDescription>
            </Alert>

            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">当前用户ID：</div>
              <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                {userId || '加载中...'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 检测结果 */}
        {backupData ? (
          <Card className="mb-6 border-2 border-green-400 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                找到备份数据
              </CardTitle>
              <CardDescription>
                检测到您之前的七问答案备份，可以一键恢复
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600 mb-1">备份时间</div>
                  <div className="font-medium">
                    {new Date(backupData.timestamp).toLocaleString('zh-CN')}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-sm text-gray-600 mb-1">答案数量</div>
                  <div className="font-medium">
                    {backupData.answers.length} / {SEVEN_QUESTIONS.length}
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">备份内容：</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {backupData.answers.map((answer, index) => {
                    const question = SEVEN_QUESTIONS.find(q => q.id === answer.questionId);
                    return (
                      <div key={index} className="p-3 bg-white rounded-lg border">
                        <div className="font-medium text-sm mb-1">
                          问题{index + 1}: {question?.question}
                        </div>
                        <div className="text-sm text-gray-700">
                          {answer.answer || '（未填写）'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleRestore}
                  disabled={isRestoring}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {isRestoring && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  <Upload className="mr-2 h-5 w-5" />
                  恢复到数据库
                </Button>
                <Button
                  onClick={handleDownloadBackup}
                  variant="outline"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  下载备份
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-2 border-gray-300 bg-gray-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                未找到备份数据
              </CardTitle>
              <CardDescription>
                没有检测到之前的七问答案备份
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  如果您之前填写了七问答案但保存失败，您可以：
                </AlertDescription>
              </Alert>

              <div className="mt-4 space-y-3">
                <Link href="/analysis" className="block">
                  <Button className="w-full">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    重新填写健康七问
                  </Button>
                </Link>

                <Link href="/admin/seven-questions-manager" className="block">
                  <Button variant="outline" className="w-full">
                    管理员手动补录
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 恢复结果 */}
        {restoreResult && restoreResult.success && (
          <Card className="border-2 border-green-400 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                恢复成功
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-green-300 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  {restoreResult.message}
                </AlertDescription>
              </Alert>

              <div className="mt-4 pt-4 border-t">
                <Link href="/my-solution">
                  <Button className="w-full">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    查看我的健康方案
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
