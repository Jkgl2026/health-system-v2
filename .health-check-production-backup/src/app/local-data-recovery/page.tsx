"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, RefreshCw, Database, Smartphone, AlertTriangle } from 'lucide-react';

interface StorageData {
  key: string;
  value: any;
  source: 'localStorage' | 'sessionStorage';
  isUserData: boolean;
}

export default function LocalDataRecoveryPage() {
  const [storageData, setStorageData] = useState<StorageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 扫描本地存储
  const scanStorage = () => {
    setLoading(true);
    setError(null);

    try {
      const data: StorageData[] = [];

      // 扫描 localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          try {
            const value = localStorage.getItem(key);
            let parsedValue: any = value;

            // 尝试解析 JSON
            try {
              parsedValue = JSON.parse(value || '');
            } catch (e) {
              // 如果不是 JSON，保持原样
            }

            // 判断是否可能是用户数据
            const isUserData = isPossibleUserData(key, parsedValue);

            data.push({
              key,
              value: parsedValue,
              source: 'localStorage',
              isUserData,
            });
          } catch (e) {
            console.error(`Error reading localStorage key ${key}:`, e);
          }
        }
      }

      // 扫描 sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          try {
            const value = sessionStorage.getItem(key);
            let parsedValue: any = value;

            try {
              parsedValue = JSON.parse(value || '');
            } catch (e) {
              // 如果不是 JSON，保持原样
            }

            const isUserData = isPossibleUserData(key, parsedValue);

            data.push({
              key,
              value: parsedValue,
              source: 'sessionStorage',
              isUserData,
            });
          } catch (e) {
            console.error(`Error reading sessionStorage key ${key}:`, e);
          }
        }
      }

      setStorageData(data);
    } catch (e: any) {
      setError(`扫描失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 判断是否可能是用户数据
  const isPossibleUserData = (key: string, value: any): boolean => {
    const userKeywords = [
      'user', 'personal', 'health', 'symptom', 'check', 'analysis',
      'choice', 'requirement', 'name', 'phone', 'age', 'gender',
      'weight', 'height', 'bmi', '小王', '小雪', '张三', '李四', '赤子'
    ];

    const keyLower = key.toLowerCase();
    const hasKeyword = userKeywords.some(keyword =>
      keyLower.includes(keyword.toLowerCase())
    );

    // 检查值中是否包含用户数据特征
    const hasUserData =
      typeof value === 'object' && value !== null && (
        value.name ||
        value.phone ||
        value.age ||
        value.gender ||
        value.userData ||
        value.userInfo
      );

    return hasKeyword || hasUserData;
  };

  // 导出数据
  const exportData = (data: StorageData) => {
    const exportObj = {
      key: data.key,
      source: data.source,
      timestamp: new Date().toISOString(),
      data: data.value,
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recovery_${data.source}_${data.key.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导出所有可能的用户数据
  const exportAllUserData = () => {
    const userData = storageData.filter(d => d.isUserData);

    const exportObj = {
      timestamp: new Date().toISOString(),
      total: userData.length,
      data: userData.map(d => ({
        key: d.key,
        source: d.source,
        value: d.value,
      })),
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_user_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 尝试恢复数据到数据库
  const recoverToDatabase = async (data: StorageData) => {
    try {
      const response = await fetch('/api/recover-local-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.value),
      });

      const result = await response.json();

      if (result.success) {
        alert(`数据恢复成功！用户ID: ${result.userId}`);
      } else {
        alert(`数据恢复失败: ${result.error}`);
      }
    } catch (e: any) {
      alert(`恢复请求失败: ${e.message}`);
    }
  };

  // 格式化显示值
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '(空)';
    }

    if (typeof value === 'string') {
      // 如果是长字符串，截断显示
      if (value.length > 200) {
        return value.substring(0, 200) + '...';
      }
      return value;
    }

    if (typeof value === 'object') {
      const json = JSON.stringify(value, null, 2);
      if (json.length > 500) {
        return json.substring(0, 500) + '...';
      }
      return json;
    }

    return String(value);
  };

  useEffect(() => {
    scanStorage();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6" />
              浏览器本地数据恢复工具
            </CardTitle>
            <CardDescription>
              从浏览器本地存储中扫描并恢复用户数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button
                onClick={scanStorage}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                重新扫描
              </Button>

              {storageData.some(d => d.isUserData) && (
                <Button
                  onClick={exportAllUserData}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  导出所有用户数据
                </Button>
              )}
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                可能是用户数据 ({storageData.filter(d => d.isUserData).length})
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-400"></div>
                其他数据 ({storageData.filter(d => !d.isUserData).length})
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {storageData.map((item, index) => (
            <Card
              key={`${item.source}-${item.key}`}
              className={`transition-all ${
                item.isUserData
                  ? 'border-green-500 border-2 bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {item.source === 'localStorage' ? (
                      <Database className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Smartphone className="h-5 w-5 text-purple-500" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{item.key}</CardTitle>
                      <CardDescription>
                        {item.source} • {item.isUserData && '✅ 可能是用户数据'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportData(item)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {item.isUserData && (
                      <Button
                        size="sm"
                        onClick={() => recoverToDatabase(item)}
                      >
                        恢复到数据库
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm max-h-64">
                  <code>{formatValue(item.value)}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>

        {storageData.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">没有找到任何本地存储数据</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
