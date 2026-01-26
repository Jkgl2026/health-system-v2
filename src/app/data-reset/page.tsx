'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, RefreshCw, Download, Upload, AlertTriangle, CheckCircle2, Home } from 'lucide-react';
import { clearAllFormData, getFormDataSummary, exportAllFormData, importFormData } from '@/lib/formDataManager';
import Link from 'next/link';

export default function DataResetPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClearAll = () => {
    if (confirm('确定要清除所有已保存的表单数据吗？此操作不可恢复！')) {
      setIsClearing(true);
      try {
        clearAllFormData();
        setMessage({ type: 'success', text: '所有表单数据已清除' });
      } catch (error) {
        setMessage({ type: 'error', text: '清除数据失败' });
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const data = exportAllFormData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `健康自检数据备份_${new Date().toLocaleDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: '数据导出成功' });
    } catch (error) {
      setMessage({ type: 'error', text: '数据导出失败' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importFormData(content);
        if (success) {
          setMessage({ type: 'success', text: '数据导入成功，请刷新页面查看' });
        } else {
          setMessage({ type: 'error', text: '数据导入失败，请检查文件格式' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: '数据导入失败' });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const dataSummary = getFormDataSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 头部 */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">返回首页</span>
            </Link>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">数据管理</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* 说明卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">数据管理工具</CardTitle>
              <CardDescription>
                管理您的健康自检数据，包括备份、恢复和清除操作
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <strong>重要提示：</strong>表单数据会自动保存到浏览器本地存储。
                  如果您在填写过程中返回上一页，之前填写的内容会自动恢复。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* 数据摘要 */}
          <Card>
            <CardHeader>
              <CardTitle>当前数据状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(dataSummary).map(([name, info]: [string, any]) => (
                  <div key={name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {name}
                    </span>
                    <div className="flex items-center space-x-2">
                      {info.exists ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            已保存 ({(info.size / 1024).toFixed(2)} KB)
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">未填写</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 操作卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>数据操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 备份数据 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">备份数据</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    将当前数据导出为 JSON 文件，用于备份或迁移
                  </p>
                </div>
                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isExporting ? '导出中...' : '导出数据'}
                </Button>
              </div>

              {/* 恢复数据 */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">恢复数据</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    从备份文件中恢复数据（会覆盖当前数据）
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    id="import-file"
                    className="hidden"
                  />
                  <Button
                    onClick={() => document.getElementById('import-file')?.click()}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {isImporting ? '导入中...' : '导入数据'}
                  </Button>
                </div>
              </div>

              {/* 清除数据 */}
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">清除所有数据</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    删除所有已保存的表单数据（不可恢复）
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleClearAll}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isClearing ? '清除中...' : '清除数据'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 消息提示 */}
          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
}
