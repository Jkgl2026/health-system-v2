'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, RefreshCw, CheckCircle2, Info, AlertCircle } from 'lucide-react';

export default function SevenQuestionsGuidePage() {
  const [hasBackup, setHasBackup] = useState(false);

  useEffect(() => {
    // 检查是否有备份
    try {
      const backupStr = localStorage.getItem('sevenQuestionsBackup');
      setHasBackup(!!backupStr);
    } catch (err) {
      console.error('[七问引导] 检查备份失败:', err);
     }, 
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部说明 */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Info className="w-8 h-8 text-blue-600" />
              关于健康七问的重要通知
            </CardTitle>
            <CardDescription className="text-base">
              我们已修复了显示问题，请根据提示完成您的健康七问
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-300 bg-blue-50">
              <Info className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>问题说明：</strong><br />
                系统之前自动填充了默认答案（"用户未填写此问题"），这不是您的真实答案。<br />
                我们已清除了这些默认答案，现在请您恢复真实答案或重新填写。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 问题是什么 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>问题是什么？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>
                之前系统显示的答案"用户未填写此问题"是自动填充的默认值，不是您的真实答案。
              </AlertDescription>
            </Alert>

            <Alert className="border-green-300 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                我们已经清除了这些默认答案，现在显示正确的"未填写"状态。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 您需要做什么 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>您需要做什么？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 选项1：从备份恢复 */}
            {hasBackup ? (
              <div className="p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-green-900">
                    方式1：从备份恢复（推荐）
                  </h3>
                </div>
                <p className="text-sm text-green-800 mb-4">
                  我们检测到您的浏览器中有之前的七问答案备份，可以一键恢复。
                </p>
                <Button
                  onClick={() => window.location.href = '/client-restore-seven-questions'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  恢复我的真实答案
                </Button>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 border-2 border-gray-300 rounded-lg opacity-60">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-6 h-6 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    方式1：从备份恢复（暂无备份）
                  </h3>
                </div>
                <p className="text-sm text-gray-700">
                  未检测到您的浏览器中有七问答案备份。
                </p>
              </div>
            )}

            {/* 选项2：重新填写 */}
            <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-900">
                  方式2：重新填写健康七问
                </h3>
              </div>
              <p className="text-sm text-blue-800 mb-4">
                如果没有备份，或者想要重新填写，请点击下方按钮。
              </p>
              <Button
                onClick={() => window.location.href = '/analysis'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                去重新填写健康七问
              </Button>
            </div>

            {/* 选项3：联系管理员 */}
            <div className="p-6 bg-purple-50 border-2 border-purple-300 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-purple-900">
                  方式3：联系管理员
                </h3>
              </div>
              <p className="text-sm text-purple-800 mb-4">
                如果您无法自己操作，可以联系管理员帮助您补录。
              </p>
              <Button
                onClick={() => window.location.href = '/admin/seven-questions-manager'}
                variant="outline"
                className="w-full border-purple-300 hover:bg-purple-100"
              >
                <Info className="mr-2 h-4 w-4" />
                管理员手动补录
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 常见问题 */}
        <Card>
          <CardHeader>
            <CardTitle>常见问题</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Q: 为什么我的答案变成了"用户未填写此问题"？</h4>
              <p className="text-sm text-gray-700">
                这是系统自动填充的默认值，不是您的真实答案。我们已经清除了这些默认答案。
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Q: 我之前填写的答案还在吗？</h4>
              <p className="text-sm text-gray-700">
                如果您之前填写过且保存失败，答案可能保存在浏览器的localStorage中。点击"恢复我的真实答案"即可恢复。
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Q: 重新填写需要多长时间？</h4>
              <p className="text-sm text-gray-700">
                大约需要 5-10 分钟。系统会自动保存您的答案，不用担心丢失。
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Q: 填写后还会显示"未填写"吗？</h4>
              <p className="text-sm text-gray-700">
                不会。填写并保存成功后，系统会正确显示您的答案。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
