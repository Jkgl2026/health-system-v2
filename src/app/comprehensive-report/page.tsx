'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, Download, ArrowLeft } from 'lucide-react';

export default function ComprehensiveReportPage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    userId: '',
  });
  const [exporting, setExporting] = useState(false);

  const handleGenerate = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/comprehensive-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userInfo.userId || 'default',
          userInfo,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async () => {
    if (!result) return;

    setExporting(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportType: 'comprehensive',
          userName: userInfo.name,
          comprehensiveData: result,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userInfo.name || '用户'}_综合健康报告_${new Date().toISOString().split('T')[0]}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert('导出失败：' + error.error);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回首页
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold mb-2">综合健康报告</h1>
            <p className="text-muted-foreground">整合所有检测结果生成综合报告</p>
          </div>
        </div>

        {!result ? (
          <Card>
            <CardHeader>
              <CardTitle>生成综合报告</CardTitle>
              <CardDescription>基于所有检测结果生成综合健康评估</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">姓名</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-md"
                  placeholder="请输入姓名"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={analyzing || !userInfo.name}
                className="w-full"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    生成报告
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>综合健康报告</CardTitle>
                <CardDescription>
                  综合评分：{result.overallScore}分 - {result.healthStatus === 'excellent' ? '优秀' : result.healthStatus === 'good' ? '良好' : result.healthStatus === 'fair' ? '一般' : '需关注'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">{result.fullReport}</pre>
              </CardContent>
            </Card>

            {/* 导出功能 */}
            <Card>
              <CardHeader>
                <CardTitle>导出报告</CardTitle>
                <CardDescription>将报告导出为Word文档</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  size="lg"
                  className="w-full"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      导出中...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      导出Word文档
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Button onClick={() => setResult(null)} variant="outline" className="w-full">
              重新生成
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
