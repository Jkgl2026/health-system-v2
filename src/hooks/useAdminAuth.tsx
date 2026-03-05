'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 统一的管理员认证检查 Hook
 * 
 * 功能：
 * 1. 检查 localStorage 中的登录状态
 * 2. 验证 Cookie 是否有效（通过 API 调用）
 * 3. 自动处理未登录状态
 */
export function useAdminAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 首先检查 localStorage 快速缓存
      const isLoggedIn = localStorage.getItem('adminLoggedIn');
      const admin = localStorage.getItem('admin');
      
      if (isLoggedIn === 'true' && admin) {
        setAdminInfo(JSON.parse(admin));
        setIsAuthenticated(true);
      }
      
      // 然后通过 API 验证 Cookie 是否有效
      const response = await fetch('/api/admin/verify', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          if (data.admin) {
            setAdminInfo(data.admin);
            localStorage.setItem('admin', JSON.stringify(data.admin));
          }
        } else {
          // API 返回未认证，清除本地状态
          handleLogout();
        }
      } else if (response.status === 401) {
        // Cookie 无效，清除本地状态
        handleLogout();
      }
    } catch (error) {
      console.error('认证检查失败:', error);
      // 网络错误时不强制登出，保持当前状态
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    setAdminInfo(null);
    router.push('/admin/login');
  };

  const login = async (username: string, password: string, rememberMe: boolean = false, autoLogin: boolean = false) => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe, autoLogin }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('admin', JSON.stringify(data.admin));
        setIsAuthenticated(true);
        setAdminInfo(data.admin);
        return { success: true };
      } else {
        return { success: false, error: data.error || '登录失败' };
      }
    } catch (error) {
      return { success: false, error: '网络错误，请重试' };
    }
  };

  const logout = async () => {
    try {
      // 调用登出 API 清除 Cookie
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('登出 API 调用失败:', error);
    }
    handleLogout();
  };

  return {
    isAuthenticated,
    isLoading,
    adminInfo,
    login,
    logout,
    checkAuth,
  };
}

/**
 * 简单的认证检查函数（用于不需要响应式状态的场景）
 */
export function checkAdminAuth() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('adminLoggedIn') === 'true';
}

/**
 * 获取管理员信息
 */
export function getAdminInfo() {
  if (typeof window === 'undefined') return null;
  const admin = localStorage.getItem('admin');
  return admin ? JSON.parse(admin) : null;
}
