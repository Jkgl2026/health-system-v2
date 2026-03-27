'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Loader2, Download, FileSpreadsheet, FileJson } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ComprehensiveReportPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    userId: '',
  });
  const [exportFormat, setExportFormat] = useState('word');
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
          exportFormat: exportFormat,
          userName: userInfo.name,
          comprehensiveData: result,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userInfo.name || '用户'}_综合健康报告_${new Date().toISOString().split('T')[0]}.${exportFormat === 'word' ? 'docx' : exportFormat === 'excel' ? 'xlsx' : 'json'}`;
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">综合健康报告</h1>
          <p className="text-muted-foreground">整合所有检测结果生成综合报告</p>
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
                <CardDescription>选择格式导出报告</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Select value={exportFormat} onValueChange={setExportFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择导出格式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="word">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Word 文档
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Excel 表格
                          </div>
                        </SelectItem>
                        <SelectItem value="json">
                          <div className="flex items-center gap-2">
                            <FileJson className="h-4 w-4" />
                            JSON 数据
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleExport}
                    disabled={exporting}
                    size="lg"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        导出中...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        导出报告
                      </>
                    )}
                  </Button>
                </div>
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
