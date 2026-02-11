/**
 * 登录表单组件
 * 
 * 功能：
 * - 账号密码输入
 * - 表单校验（非空、格式）
 * - 密码显隐切换
 * - 登录加载状态
 * - 错误信息提示
 * - 防重复提交
 * 
 * 使用方式：
 * import LoginForm from '@/app/components/LoginForm';
 * 
 * <LoginForm onSuccess={() => router.push('/admin/dashboard')} />
 */

'use client';

import { useState, FormEvent } from 'react';

/**
 * 登录表单属性接口
 */
interface LoginFormProps {
  /** 登录成功回调函数 */
  onSuccess?: (token: string, user: UserInfo) => void;
  /** 登录失败回调函数 */
  onError?: (error: string) => void;
  /** 显示标题（可选） */
  showTitle?: boolean;
}

/**
 * 用户信息接口
 */
interface UserInfo {
  id: string;
  username: string;
  name: string | null;
}

/**
 * 登录响应接口
 */
interface LoginResponse {
  success: boolean;
  message?: string;
  token?: any;
  admin?: UserInfo;
  user?: UserInfo; // 兼容旧版本
  error?: string;
}

/**
 * 登录表单组件
 */
export default function LoginForm({ 
  onSuccess, 
  onError,
  showTitle = true 
}: LoginFormProps) {
  // 表单状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 加载状态
  const [isLoading, setIsLoading] = useState(false);
  
  // 错误信息
  const [error, setError] = useState('');
  
  // 表单校验错误
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /**
   * 校验账号
   */
  const validateUsername = (value: string): boolean => {
    if (!value.trim()) {
      setUsernameError('请输入账号');
      return false;
    }
    if (value.length < 2) {
      setUsernameError('账号长度至少2个字符');
      return false;
    }
    if (value.length > 50) {
      setUsernameError('账号长度不能超过50个字符');
      return false;
    }
    setUsernameError('');
    return true;
  };

  /**
   * 校验密码
   */
  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError('请输入密码');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('密码长度至少6个字符');
      return false;
    }
    setPasswordError('');
    return true;
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 清除之前的错误
    setError('');
    setUsernameError('');
    setPasswordError('');
    
    // 表单校验
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    
    if (!isUsernameValid || !isPasswordValid) {
      return;
    }
    
    // 防重复提交
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // 构建API URL（使用绝对路径，确保在任何环境下都能正确访问）
      const apiBaseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : '';
      const apiUrl = `${apiBaseUrl}/api/admin/login`;

      console.log('[登录表单] 发送登录请求到:', apiUrl);

      // 发送登录请求
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
        credentials: 'include', // 包含 cookies
      });

      // 获取响应文本和状态
      const responseText = await response.text();
      console.log('[登录表单] 响应状态:', response.status);
      console.log('[登录表单] 响应内容:', responseText);

      let data: LoginResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`响应解析失败: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || `请求失败 (${response.status})`);
      }

      if (data.success && data.token && (data.user || data.admin)) {
        // 登录成功
        const user = data.user || data.admin;

        // 确保 user 存在
        if (!user) {
          throw new Error('用户信息缺失');
        }

        console.log('[登录表单] 登录成功', {
          userId: user.id,
          username: user.username
        });

        // 保存Token到localStorage
        localStorage.setItem('admin_token', JSON.stringify(data.token));
        localStorage.setItem('admin_user', JSON.stringify(user));

        // 清空表单
        setUsername('');
        setPassword('');

        // 调用成功回调
        if (onSuccess) {
          onSuccess(JSON.stringify(data.token), user);
        } else {
          // 默认跳转到后台首页
          window.location.href = '/admin/dashboard';
        }
      } else {
        // 登录失败
        const errorMsg = data.error || '登录失败，请稍后再试';
        console.error('[登录表单] 登录失败', errorMsg);
        setError(errorMsg);

        // 调用失败回调
        if (onError) {
          onError(errorMsg);
        }
      }
    } catch (err) {
      // 请求错误
      const errorMsg = err instanceof Error 
        ? err.message 
        : '网络错误，请检查网络连接';
      console.error('[登录表单] 请求错误', err);
      setError(errorMsg);

      // 调用失败回调
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理账号输入框失焦
   */
  const handleUsernameBlur = () => {
    if (username) {
      validateUsername(username);
    }
  };

  /**
   * 处理密码输入框失焦
   */
  const handlePasswordBlur = () => {
    if (password) {
      validatePassword(password);
    }
  };

  /**
   * 处理账号输入
   */
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (usernameError) {
      validateUsername(value);
    }
  };

  /**
   * 处理密码输入
   */
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) {
      validatePassword(value);
    }
  };

  /**
   * 切换密码显隐
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md">
      {/* 标题 */}
      {showTitle && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">后台管理系统</h1>
          <p className="text-gray-600">请使用管理员账号登录</p>
        </div>
      )}

      {/* 登录表单 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 账号输入框 */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            账号
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            onBlur={handleUsernameBlur}
            placeholder="请输入管理员账号"
            disabled={isLoading}
            className={`
              w-full px-4 py-3 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors
              ${usernameError ? 'border-red-500' : 'border-gray-300'}
              ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            `}
            autoComplete="username"
          />
          {usernameError && (
            <p className="mt-1 text-sm text-red-600">{usernameError}</p>
          )}
        </div>

        {/* 密码输入框 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={handlePasswordBlur}
              placeholder="请输入密码"
              disabled={isLoading}
              className={`
                w-full px-4 py-3 pr-12 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-colors
                ${passwordError ? 'border-red-500' : 'border-gray-300'}
                ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              `}
              autoComplete="current-password"
            />
            {/* 密码显隐切换按钮 */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c-4.478 0-8.268-2.943-9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {passwordError && (
            <p className="mt-1 text-sm text-red-600">{passwordError}</p>
          )}
        </div>

        {/* 登录按钮 */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full bg-blue-600 text-white py-3 px-4 rounded-lg
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            transition-colors font-medium
            ${isLoading ? 'bg-blue-400 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
          ) : (
            '登录'
          )}
        </button>
      </form>

      {/* 提示信息 */}
      <div className="mt-6 text-center text-sm text-gray-500">
        默认账号：admin / 密码：admin123
      </div>
    </div>
  );
}
