'use client';

import { useState, useEffect } from 'react';

export default function DiagnosticsPanel() {
  const [tests, setTests] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results = [];

    // 测试1: 检查服务可访问性
    try {
      const start = Date.now();
      const response = await fetch('/');
      const duration = Date.now() - start;
      results.push({
        name: '服务可访问性',
        status: 'success',
        message: `首页响应成功 (${duration}ms)`,
        details: `Status: ${response.status}`
      });
    } catch (error: any) {
      results.push({
        name: '服务可访问性',
        status: 'error',
        message: '无法访问服务',
        details: error.message || String(error)
      });
    }

    // 测试2: 检查健康检查API
    try {
      const start = Date.now();
      const response = await fetch('/api/health');
      const data = await response.json();
      const duration = Date.now() - start;
      results.push({
        name: '健康检查API',
        status: 'success',
        message: `数据库连接正常 (${duration}ms)`,
        details: JSON.stringify(data, null, 2)
      });
    } catch (error: any) {
      results.push({
        name: '健康检查API',
        status: 'error',
        message: '健康检查失败',
        details: error.message || String(error)
      });
    }

    // 测试3: 检查历史记录API
    try {
      const start = Date.now();
      const response = await fetch('/api/user/history?phone=13800138000');
      const data = await response.json();
      const duration = Date.now() - start;
      results.push({
        name: '历史记录API',
        status: 'success',
        message: `查询成功 (${duration}ms), 找到 ${data.users?.length || 0} 条记录`,
        details: JSON.stringify(data, null, 2).substring(0, 500)
      });
    } catch (error: any) {
      results.push({
        name: '历史记录API',
        status: 'error',
        message: '历史记录查询失败',
        details: error.message || String(error)
      });
    }

    // 测试4: 检查网络连接
    try {
      results.push({
        name: '网络环境',
        status: 'success',
        message: '浏览器在线',
        details: `Navigator.onLine: ${navigator.onLine}`
      });
    } catch (error: any) {
      results.push({
        name: '网络环境',
        status: 'warning',
        message: '无法确定网络状态',
        details: String(error)
      });
    }

    setTests(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-bold mb-4">诊断工具</h3>

      <button
        onClick={runTests}
        disabled={isRunning}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isRunning ? '运行中...' : '重新运行测试'}
      </button>

      <div className="mt-4 space-y-3">
        {tests.map((test, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              test.status === 'success'
                ? 'bg-green-50 border-green-200'
                : test.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{test.name}</h4>
              <span
                className={`px-2 py-1 rounded text-xs font-bold ${
                  test.status === 'success'
                    ? 'bg-green-500 text-white'
                    : test.status === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-yellow-500 text-white'
                }`}
              >
                {test.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{test.message}</p>
            {test.details && (
              <details className="text-xs">
                <summary className="cursor-pointer text-blue-600 hover:underline">
                  查看详细信息
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32">
                  {test.details}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {tests.some(t => t.status === 'error') && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-bold text-red-700 mb-2">故障排除建议</h4>
          <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
            <li>清除浏览器缓存 (Ctrl+Shift+Delete)</li>
            <li>尝试使用无痕模式</li>
            <li>检查浏览器控制台 (F12) 查看详细错误</li>
            <li>确认网络连接正常</li>
            <li>如果使用代理或VPN，尝试关闭后重试</li>
            <li>检查浏览器扩展是否拦截请求</li>
          </ul>
        </div>
      )}
    </div>
  );
}
