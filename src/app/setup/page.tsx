'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [dbStatus, setDbStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [adminStatus, setAdminStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const initDatabase = async () => {
    setDbStatus('loading');
    setMessage('正在初始化数据库...');

    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (response.ok) {
        setDbStatus('success');
        setMessage(`✅ 数据库初始化成功！创建的表：${data.tables.join(', ')}`);
      } else {
        setDbStatus('error');
        setMessage(`❌ 数据库初始化失败：${data.error}`);
      }
    } catch (error) {
      setDbStatus('error');
      setMessage(`❌ 请求失败：${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const initAdmin = async () => {
    setAdminStatus('loading');
    setMessage('正在创建管理员账户...');

    try {
      const response = await fetch('/api/init-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });

      const data = await response.json();

      if (response.ok) {
        setAdminStatus('success');
        setMessage(`✅ 管理员账户创建成功！用户名：admin，密码：admin123`);
      } else {
        setAdminStatus('error');
        setMessage(`❌ 创建管理员失败：${data.error}`);
      }
    } catch (error) {
      setAdminStatus('error');
      setMessage(`❌ 请求失败：${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🚀 系统初始化
        </h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              步骤 1: 初始化数据库
            </h2>
            <button
              onClick={initDatabase}
              disabled={dbStatus === 'loading' || dbStatus === 'success'}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                dbStatus === 'loading'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : dbStatus === 'success'
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : dbStatus === 'error'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {dbStatus === 'idle' && '初始化数据库'}
              {dbStatus === 'loading' && '初始化中...'}
              {dbStatus === 'success' && '✓ 已完成'}
              {dbStatus === 'error' && '重试'}
            </button>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              步骤 2: 创建管理员账户
            </h2>
            <button
              onClick={initAdmin}
              disabled={
                adminStatus === 'loading' ||
                adminStatus === 'success' ||
                dbStatus !== 'success'
              }
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                adminStatus === 'loading'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : adminStatus === 'success'
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : adminStatus === 'error'
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : dbStatus === 'success'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {adminStatus === 'idle' && '创建管理员'}
              {adminStatus === 'loading' && '创建中...'}
              {adminStatus === 'success' && '✓ 已完成'}
              {adminStatus === 'error' && '重试'}
            </button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-md ${
                message.includes('✅')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <p className="text-sm">{message}</p>
            </div>
          )}

          {dbStatus === 'success' && adminStatus === 'success' && (
            <div className="pt-4 border-t">
              <a
                href="/admin"
                className="block w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-center transition-colors"
              >
                进入后台管理 →
              </a>
              <a
                href="/"
                className="block w-full py-3 px-4 mt-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium text-center transition-colors"
              >
                返回首页 →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
