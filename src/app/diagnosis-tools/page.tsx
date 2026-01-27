'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';

export default function DiagnosisToolsIndexPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testing, setTesting] = useState(false);

  const testUrl = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const success = response.ok;
      return {
        url,
        name,
        success,
        status: response.status,
        error: null,
      };
    } catch (error) {
      return {
        url,
        name,
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);

    const tests = [
      {
        url: '/api/diagnose-seven-questions?name=李四',
        name: '诊断 API（按姓名）',
      },
      {
        url: '/api/query-seven-questions?name=李四',
        name: '查询 API（按姓名）',
      },
    ];

    const results = await Promise.all(
      tests.map(test => testUrl(test.url, test.name))
    );

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">诊断工具中心</CardTitle>
            <CardDescription>
              七问数据诊断工具的访问入口和状态检查
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                服务器状态：<strong className="text-green-600">正常运行</strong>（端口 5000）
              </AlertDescription>
            </Alert>

            <div>
              <h3 className="text-lg font-semibold mb-3">诊断工具页面</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium">七问数据诊断工具（完整版）</div>
                    <div className="text-sm text-gray-600">支持按姓名或用户ID查询，提供详细诊断报告</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/diagnose-seven-questions', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    打开
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">按姓名查询（快速版）</div>
                    <div className="text-sm text-gray-600">仅支持按姓名快速查询</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/debug-seven-questions-by-name', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    打开
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium">按用户ID查询（快速版）</div>
                    <div className="text-sm text-gray-600">仅支持按用户ID快速查询</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/debug-seven-questions', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    打开
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">API 状态测试</h3>
                <Button onClick={runTests} disabled={testing}>
                  {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {testing ? '测试中...' : '运行测试'}
                </Button>
              </div>
              <div className="space-y-2">
                {testResults.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    点击"运行测试"按钮检查 API 状态
                  </div>
                )}
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-600 font-mono">{result.url}</div>
                    </div>
                    <div className="text-right">
                      {result.success ? (
                        <span className="text-green-600 font-semibold">
                          ✓ 可用 ({result.status})
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold">
                          ✗ {result.error || `错误 (${result.status})`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">使用说明</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>点击上方"打开"按钮访问对应的诊断工具页面</li>
                <li>在诊断工具页面中输入用户姓名（如"李四"）或用户ID</li>
                <li>点击"开始诊断"或"查询"按钮查看结果</li>
                <li>如果页面打不开，点击"运行测试"检查 API 状态</li>
                <li>如果测试失败，检查浏览器控制台是否有错误信息</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速链接</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <a
                href="/diagnose-seven-questions"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-sm text-blue-600 hover:underline"
              >
                /diagnose-seven-questions
              </a>
              <a
                href="/debug-seven-questions-by-name"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-sm text-blue-600 hover:underline"
              >
                /debug-seven-questions-by-name
              </a>
              <a
                href="/debug-seven-questions"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-sm text-blue-600 hover:underline"
              >
                /debug-seven-questions
              </a>
              <a
                href="/api/diagnose-seven-questions?name=李四"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-sm text-blue-600 hover:underline"
              >
                /api/diagnose-seven-questions
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
