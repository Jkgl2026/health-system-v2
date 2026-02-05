'use client';

import { useState } from 'react';

export default function LoginDebugPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      const startTime = Date.now();

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      const data = await response.json();

      setResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        data: data,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testApiDirect = async () => {
    setLoading(true);
    try {
      const startTime = Date.now();

      const response = await fetch('https://x4mrwzmnw9.coze.site/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
        }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      const data = await response.json();

      setResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`,
        data: data,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">登录接口诊断工具</h1>

        <div className="space-y-4 mb-6">
          <button
            onClick={testLogin}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            测试相对路径接口 (/api/admin/login)
          </button>

          <button
            onClick={testApiDirect}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            测试绝对路径接口 (https://x4mrwzmnw9.coze.site/api/admin/login)
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">测试结果</h2>
          {loading && (
            <div className="text-gray-600">测试中...</div>
          )}
          {!loading && result && (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
          {!loading && !result && (
            <div className="text-gray-500">点击上方按钮开始测试</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">环境信息</h2>
          <div className="space-y-2 text-sm">
            <p><strong>当前 URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>协议:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
            <p><strong>主机:</strong> {typeof window !== 'undefined' ? window.location.host : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
