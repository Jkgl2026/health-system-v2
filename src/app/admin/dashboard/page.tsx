/**
 * 后台管理首页
 * 
 * 功能：
 * - 显示系统统计数据
 * - 功能导航
 * - 登出功能
 */

'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '@/app/lib/fetch';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 获取当前用户信息
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      // 未登录，跳转到登录页
      window.location.href = '/admin/login';
      return;
    }

    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    // 清除本地存储
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    // 跳转到登录页
    window.location.href = '/admin/login';
  };

  const features = [
    {
      id: 'dashboard',
      title: '数据概览',
      description: '查看系统统计数据和用户信息',
      icon: '📊',
      status: 'available',
      link: '/admin/dashboard'
    },
    {
      id: 'compare',
      title: '健康对比',
      description: '对比用户不同时期的健康数据变化',
      icon: '📈',
      status: 'available',
      link: '/admin/compare'
    },
    {
      id: 'maintenance',
      title: '系统维护',
      description: '数据库优化、备份和清理',
      icon: '🔧',
      status: 'requires-api',
      link: '/admin/maintenance'
    },
    {
      id: 'seven-questions',
      title: '七问管理',
      description: '查看和管理用户的健康七问数据',
      icon: '❓',
      status: 'requires-api',
      link: '/admin/seven-questions-manager'
    }
  ];

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5'
      }}>
        <div>加载中...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            健康管理系统
          </h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            欢迎回来，{user?.name || user?.username || '管理员'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          退出登录
        </button>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#667eea', marginBottom: '10px' }}>
              3
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>总用户数</div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#48c774', marginBottom: '10px' }}>
              2
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>男性用户</div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff3860', marginBottom: '10px' }}>
              1
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>女性用户</div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffdd57', marginBottom: '10px' }}>
              100%
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>系统状态</div>
          </div>
        </div>

        {/* Features Grid */}
        <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
          管理功能
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {features.map((feature) => (
            <div
              key={feature.id}
              style={{
                background: 'white',
                padding: '30px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                border: feature.status === 'requires-api' ? '2px dashed #ffc107' : '2px solid transparent'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                {feature.description}
              </p>
              {feature.status === 'available' ? (
                <a
                  href={feature.link}
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  进入
                </a>
              ) : (
                <div style={{
                  padding: '10px 20px',
                  background: '#ffc107',
                  color: '#333',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  需要API支持
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
