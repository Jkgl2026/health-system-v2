'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, Database, AlertCircle } from 'lucide-react';

export default function DataExportPage() {
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [exportedData, setExportedData] = useState('');
  const [syncResult, setSyncResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 从 localStorage 读取所有健康应用的数据
  const loadLocalStorageData = () => {
    const data: any = {};

    // 读取所有 health_app_ 开头的 key
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('health_app_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch (e) {
          data[key] = localStorage.getItem(key);
        }
      }
    }

    setLocalStorageData(data);
    setExportedData(JSON.stringify(data, null, 2));
  };

  useEffect(() => {
    loadLocalStorageData();
  }, []);

  // 导出为 JSON 文件
  const handleDownload = () => {
    const blob = new Blob([exportedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_app_data_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 同步到数据库
  const handleSyncToDatabase = async () => {
    setLoading(true);
    setSyncResult(null);

    try {
      const userData = localStorageData['health_app_user_data'];
      if (!userData) {
        setSyncResult({
          success: false,
          message: 'localStorage 中没有用户数据，请先在前端页面填写信息'
        });
        setLoading(false);
        return;
      }

      // 解析血压值
      let bloodPressureHigh = null;
      let bloodPressureLow = null;
      if (userData.bloodPressure) {
        const bpParts = userData.bloodPressure.split('/');
        if (bpParts.length === 2) {
          bloodPressureHigh = bpParts[0].trim();
          bloodPressureLow = bpParts[1].trim();
        }
      }

      const response = await fetch('/api/user/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          age: userData.age,
          gender: userData.gender,
          weight: userData.weight ? parseFloat(userData.weight) : null,
          height: userData.height ? parseInt(userData.height) : null,
          blood_pressure_high: bloodPressureHigh,
          blood_pressure_low: bloodPressureLow,
          occupation: userData.occupation,
          address: userData.address,
          bmi: userData.bmi ? parseFloat(userData.bmi) : null,
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setSyncResult({
          success: true,
          message: `数据同步成功！用户 ID: ${result.data.userId}`,
          data: result
        });
      } else {
        setSyncResult({
          success: false,
          message: `同步失败: ${result.msg}`,
          data: result
        });
      }
    } catch (error: any) {
      setSyncResult({
        success: false,
        message: `同步失败: ${error.message}`,
        data: error
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">数据导出与同步工具</h1>

      <Alert className="mb-6 bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>重要说明：</strong> 您在前端页面填写的真实数据保存在浏览器的 localStorage 中。
          由于之前的保存逻辑有缺陷，这些数据没有成功同步到数据库。请使用本工具导出或同步您的真实数据。
        </AlertDescription>
      </Alert>

      {/* localStorage 数据展示 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            localStorage 中的数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(localStorageData).length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  没有找到 health_app 相关的数据。请先在前端页面（个人信息页面）填写信息。
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {Object.entries(localStorageData).map(([key, value]: [string, any]) => (
                  <div key={key} className="border rounded p-4">
                    <h3 className="font-semibold mb-2">{key}</h3>
                    <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto max-h-60">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={loadLocalStorageData} variant="outline">
          刷新数据
        </Button>
        <Button onClick={handleDownload} disabled={Object.keys(localStorageData).length === 0}>
          <Download className="w-4 h-4 mr-2" />
          导出为 JSON
        </Button>
        <Button onClick={handleSyncToDatabase} disabled={Object.keys(localStorageData).length === 0 || loading}>
          <Upload className="w-4 h-4 mr-2" />
          同步到数据库
        </Button>
      </div>

      {/* 同步结果 */}
      {syncResult && (
        <Alert variant={syncResult.success ? "default" : "destructive"} className="mb-6">
          <AlertDescription>
            {syncResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* 导出数据文本框 */}
      {Object.keys(localStorageData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>JSON 数据（可复制）</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={exportedData}
              readOnly
              className="font-mono text-xs min-h-[300px]"
              placeholder="数据将显示在这里..."
            />
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>打开前端页面的个人信息页面（<code className="bg-gray-100 px-1 rounded">/personal-info</code>）</li>
            <li>填写您的真实信息并提交</li>
            <li>返回本页面，点击"刷新数据"查看 localStorage 中的数据</li>
            <li>点击"同步到数据库"将数据保存到后台数据库</li>
            <li>或者点击"导出为 JSON"下载备份数据</li>
            <li>访问后台页面查看同步的数据（<code className="bg-gray-100 px-1 rounded">/admin/user/list</code>）</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
