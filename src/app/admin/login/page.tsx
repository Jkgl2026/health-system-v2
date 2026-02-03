/**
 * 后台管理登录页面
 * 
 * 功能：
 * - 显示登录表单
 * - 登录成功后跳转到后台首页
 * - 已登录用户自动跳转到后台首页
 * - 居中布局，适配电脑端
 * 
 * 路径：/admin/login
 * 
 * 使用方式：
 * 直接访问 /admin/login 即可
 */

'use client';

import { useEffect, useState } from 'react';
import LoginForm from '@/app/components/LoginForm';

/**
 * 登录页面
 */
export default function LoginPage() {
  const [isChecking, setIsChecking] = useState(true);

  /**
   * 检查是否已登录
   */
  useEffect(() => {
    const checkLoginStatus = () => {
      try {
        const token = localStorage.getItem('admin_token');
        
        if (token) {
          console.log('[登录页面] 检测到Token，自动跳转到后台首页');
          // 已登录，跳转到后台首页
          window.location.href = '/admin/dashboard';
          return;
        }
        
        console.log('[登录页面] 未检测到Token，显示登录表单');
        setIsChecking(false);
      } catch (error) {
        console.error('[登录页面] 检查登录状态失败', error);
        setIsChecking(false);
      }
    };

    checkLoginStatus();
  }, []);

  /**
   * 登录成功处理
   */
  const handleLoginSuccess = (token: string, user: any) => {
    console.log('[登录页面] 登录成功，准备跳转', { userId: user.id });
    
    // 延迟跳转，确保Token已保存
    setTimeout(() => {
      window.location.href = '/admin/dashboard';
    }, 300);
  };

  /**
   * 登录失败处理
   */
  const handleLoginError = (error: string) => {
    console.error('[登录页面] 登录失败', error);
    // 错误信息已在LoginForm中显示
  };

  // 检查中显示加载
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">检查登录状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* 登录卡片 */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
          showTitle={true}
        />
      </div>
    </div>
  );
}
