'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, RefreshCw, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

interface FixResult {
  success: boolean;
  message: string;
  fixedCount?: number;
  errorCount?: number;
  details?: any[];
}

export default function AutoFixSevenQuestionsPage() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAutoFix = async () => {
    setIsFixing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/auto-fix-seven-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '自动修复失败');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '自动修复失败');
      console.error('[自动修复] 失败:', err);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 头部说明 */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Zap className="w-8 h-8 text-yellow-500" />
              健康七问自动修复工具
            </CardTitle>
            <CardDescription className="text-base">
              一键自动修复所有用户的健康七问数据，无需手动补录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-blue-300 bg-blue-50">
              <Zap className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>功能说明：</strong><br />
                1. 自动检查所有用户的七问数据<br />
                2. 从 localStorage 备份中恢复丢失的七问答案<br />
                3. 自动修复数据格式问题<br />
                4. 批量处理，一次修复所有用户
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>操作面板</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleAutoFix}
                disabled={isFixing}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isFixing && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                <RefreshCw className="mr-2 h-5 w-5" />
                开始自动修复
              </Button>
              <Link href="/admin/seven-questions-manager">
                <Button variant="outline" size="lg">
                  查看七问管理工具
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 修复结果 */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                修复完成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 mb-1">成功修复</div>
                  <div className="text-3xl font-bold text-green-700">
                    {result.fixedCount || 0}
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 mb-1">修复失败</div>
                  <div className="text-3xl font-bold text-red-700">
                    {result.errorCount || 0}
                  </div>
                </div>
              </div>

              <Alert className="border-green-300 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  {result.message}
                </AlertDescription>
              </Alert>

              {result.details && result.details.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">修复详情：</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.details.map((detail, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          detail.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">
                              {detail.userName || detail.userId}
                            </div>
                            <div className="text-sm text-gray-600">
                              {detail.message}
                            </div>
                          </div>
                          {detail.success ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Link href="/admin/dashboard">
                  <Button className="w-full">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    返回后台管理查看结果
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
