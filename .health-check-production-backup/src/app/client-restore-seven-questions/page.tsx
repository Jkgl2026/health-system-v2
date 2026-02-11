'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, RefreshCw, ArrowRight, Info, Trash2 } from 'lucide-react';
import { getOrGenerateUserId } from '@/lib/user-context';
import { saveRequirements } from '@/lib/api-client';
import { SEVEN_QUESTIONS } from '@/lib/health-data';

interface BackupData {
  answers: Array<{ questionId: number; answer: string }>;
  timestamp: string;
  userId: string;
}

interface LocalStorageData {
  sevenQuestionsBackup?: BackupData;
  sevenQuestionsSaveError?: any;
}

export default function ClientRestoreSevenQuestionsPage() {
  const [userId, setUserId] = useState<string>('');
  const [backupData, setBackupData] = useState<BackupData | null>(null);
  const [saveError, setSaveError] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取用户ID
    setUserId(getOrGenerateUserId());

    // 检查localStorage中的数据
    checkLocalStorageData();
  }, []);

  const checkLocalStorageData = () => {
    try {
      // 检查七问备份
      const backupStr = localStorage.getItem('sevenQuestionsBackup');
      if (backupStr) {
        const backup = JSON.parse(backupStr) as BackupData;
        setBackupData(backup);
        console.log('[客户端恢复] 找到七问备份:', backup);
      }

      // 检查保存错误记录
      const errorStr = localStorage.getItem('sevenQuestionsSaveError');
      if (errorStr) {
        const err = JSON.parse(errorStr);
        setSaveError(err);
        console.log('[客户端恢复] 找到保存错误记录:', err);
      }

      // 检查selectedSymptoms（用于判断是否开始过健康自检）
      const symptomsStr = localStorage.getItem('selectedSymptoms');
      console.log('[客户端恢复] 症状数据:', symptomsStr ? '有' : '无');

    } catch (err) {
      console.error('[客户端恢复] 读取localStorage失败:', err);
    }
  };

  const handleRestoreFromBackup = async () => {
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
      setSaveError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '恢复失败');
      console.error('[客户端恢复] 失败:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearBackup = () => {
    localStorage.removeItem('sevenQuestionsBackup');
    localStorage.removeItem('sevenQuestionsSaveError');
    setBackupData(null);
    setSaveError(null);
    setError(null);
    alert('本地备份已清除');
  };

  const handleGoToRefill = () => {
    // 清除默认答案，重新填写
    localStorage.removeItem('sevenQuestionsBackup');
    localStorage.removeItem('sevenQuestionsSaveError');
    window.location.href = '/analysis';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* 头部说明 */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <RefreshCw className="w-8 h-8 text-blue-600" />
              恢复真实的健康七问答案
            </CardTitle>
            <CardDescription className="text-base">
              自动检测并恢复您之前填写的健康七问真实答案
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-300 bg-blue-50 mb-4">
              <Info className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>问题说明：</strong><br />
                系统之前自动填充了默认答案（"用户未填写此问题"），这不是您的真实答案。<br />
                如果您之前填写过七问，可以在这里恢复真实的答案。
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

        {/* 本地数据状态 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 备份数据 */}
          <Card className={backupData ? "border-2 border-green-400 bg-green-50" : "border-2 border-gray-300 bg-gray-50"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {backupData ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
                七问答案备份
              </CardTitle>
            </CardHeader>
            <CardContent>
              {backupData ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded">
                      <div className="text-xs text-gray-600">备份时间</div>
                      <div className="text-sm font-medium">
                        {new Date(backupData.timestamp).toLocaleString('zh-CN')}
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded">
                      <div className="text-xs text-gray-600">答案数量</div>
                      <div className="text-sm font-medium">
                        {backupData.answers.length} / {SEVEN_QUESTIONS.length}
                      </div>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {backupData.answers.slice(0, 3).map((answer, index) => {
                      const question = SEVEN_QUESTIONS.find(q => q.id === answer.questionId);
                      return (
                        <div key={index} className="p-2 bg-white rounded text-xs">
                          <div className="font-medium mb-1">问题{index + 1}: {question?.question}</div>
                          <div className="text-gray-700">{answer.answer || '（未填写）'}</div>
                        </div>
                      );
                    })}
                    {backupData.answers.length > 3 && (
                      <div className="text-xs text-center text-gray-500">
                        还有 {backupData.answers.length - 3} 个答案...
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleRestoreFromBackup}
                    disabled={isRestoring}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isRestoring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    恢复这个备份
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">没有找到备份</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 保存错误记录 */}
          <Card className={saveError ? "border-2 border-yellow-400 bg-yellow-50" : "border-2 border-gray-300 bg-gray-50"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {saveError ? (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                )}
                保存错误记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              {saveError ? (
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded">
                    <div className="text-xs text-gray-600 mb-1">错误时间</div>
                    <div className="text-sm font-medium">
                      {new Date(saveError.timestamp).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <div className="text-xs text-gray-600 mb-1">错误信息</div>
                    <div className="text-sm font-medium text-red-600">
                      {saveError.message}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded">
                    <div className="text-xs text-gray-600 mb-1">答案数量</div>
                    <div className="text-sm font-medium">
                      {saveError.answersCount} 个
                    </div>
                  </div>

                  <Alert className="border-yellow-300 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-900 text-sm">
                      检测到保存失败的记录，可能是因为网络问题。答案可能仍在本地备份中。
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">没有保存错误记录</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 清除备份 */}
        {(backupData || saveError) && (
          <Card className="mb-6 border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trash2 className="w-6 h-6 text-red-600" />
                清除本地数据
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-red-300 bg-red-50 mb-3">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-900 text-sm">
                  如果您确定不需要恢复，可以清除所有本地备份数据。
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleClearBackup}
                variant="outline"
                className="w-full border-red-300 hover:bg-red-100"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                清除所有本地备份
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 重新填写 */}
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRight className="w-6 h-6 text-blue-600" />
              重新填写健康七问
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-300 bg-blue-50 mb-3">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                如果没有备份，或者备份不是您想要的，可以重新填写七问。
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleGoToRefill}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              去重新填写健康七问
            </Button>
          </CardContent>
        </Card>

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

              <div className="mt-4 pt-4 border-t space-y-2">
                <Button className="w-full" onClick={() => window.location.href = '/my-solution'}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  查看我的健康方案
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
