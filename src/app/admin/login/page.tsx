'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, AlertCircle, Shield, Heart, Activity } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 页面加载时检查是否有保存的登录信息
  useEffect(() => {
    const savedUsername = localStorage.getItem('admin_remembered_username');
    const savedPassword = localStorage.getItem('admin_remembered_password');
    const savedRememberMe = localStorage.getItem('admin_remember_me');
    const savedAutoLogin = localStorage.getItem('admin_auto_login');

    if (savedRememberMe === 'true') {
      setRememberMe(true);
      if (savedUsername) setUsername(savedUsername);
      if (savedPassword) setPassword(savedPassword);
    }

    if (savedAutoLogin === 'true') {
      setAutoLogin(true);
      // 检查是否已经登录
      const isLoggedIn = localStorage.getItem('adminLoggedIn');
      if (isLoggedIn === 'true') {
        router.push('/admin/dashboard');
      } else if (savedUsername && savedPassword) {
        // 自动登录
        handleAutoLogin(savedUsername, savedPassword);
      }
    }
  }, [router]);

  const handleAutoLogin = async (user: string, pass: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: user, 
          password: pass,
          isAutoLogin: true 
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('admin', JSON.stringify(data.admin));
        localStorage.setItem('adminLoggedIn', 'true');
        router.push('/admin/dashboard');
      }
    } catch (err) {
      console.error('自动登录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password,
          rememberMe,
          autoLogin 
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '登录失败');
        return;
      }

      // 保存/清除记住密码
      if (rememberMe) {
        localStorage.setItem('admin_remembered_username', username);
        localStorage.setItem('admin_remembered_password', password);
        localStorage.setItem('admin_remember_me', 'true');
      } else {
        localStorage.removeItem('admin_remembered_username');
        localStorage.removeItem('admin_remembered_password');
        localStorage.setItem('admin_remember_me', 'false');
      }

      // 保存自动登录设置
      if (autoLogin) {
        localStorage.setItem('admin_auto_login', 'true');
      } else {
        localStorage.setItem('admin_auto_login', 'false');
      }

      // 保存登录信息
      localStorage.setItem('admin', JSON.stringify(data.admin));
      localStorage.setItem('adminLoggedIn', 'true');

      // 跳转到管理后台主页
      router.push('/admin/dashboard');
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100 rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* 健康主题装饰图标 */}
      <div className="absolute top-10 left-10 text-emerald-200 opacity-50">
        <Heart className="w-16 h-16" />
      </div>
      <div className="absolute bottom-10 right-10 text-teal-200 opacity-50">
        <Activity className="w-16 h-16" />
      </div>

      <Card className="w-full max-w-md border-2 border-emerald-100 shadow-2xl relative z-10 backdrop-blur-sm bg-white/90">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-800 font-bold">
            健康自检管理后台
          </CardTitle>
          <CardDescription className="text-gray-600">
            请输入管理员账号和密码
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {/* 记住密码和自动登录选项 */}
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-emerald-300 data-[state=checked]:bg-emerald-500"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                  记住密码
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoLogin"
                  checked={autoLogin}
                  onCheckedChange={(checked) => setAutoLogin(checked as boolean)}
                  className="border-emerald-300 data-[state=checked]:bg-emerald-500"
                />
                <Label htmlFor="autoLogin" className="text-sm text-gray-600 cursor-pointer">
                  自动登录
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium py-3 rounded-lg shadow-lg shadow-emerald-200 transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  登录中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  登录
                  <Lock className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-emerald-600"
            >
              返回首页
            </Button>
          </div>

          {/* 底部版权 */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              © 2024 健康自检系统 · 安全登录
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
