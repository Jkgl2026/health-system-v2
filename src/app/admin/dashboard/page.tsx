'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查登录状态
    const loggedIn = localStorage.getItem('adminLoggedIn');
    setIsLoggedIn(loggedIn === 'true');

    if (loggedIn !== 'true') {
      window.location.href = '/admin-login.html';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('adminLoggedIn');
    window.location.href = '/admin-login.html';
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

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5'
      }}>
        <div>检查登录中...</div>
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
            管理后台
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
                <Link
                  href={feature.link}
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    background: '#667eea',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  访问功能
                </Link>
              ) : (
                <div style={{ fontSize: '12px', color: '#ffc107', fontWeight: 'bold' }}>
                  ⚠️ 需要配置后端 API
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Table */}
        <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
          用户列表
        </h2>

        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#333', borderBottom: '2px solid #ddd' }}>
                    ID
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#333', borderBottom: '2px solid #ddd' }}>
                    姓名
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#333', borderBottom: '2px solid #ddd' }}>
                    年龄
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#333', borderBottom: '2px solid #ddd' }}>
                    性别
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#333', borderBottom: '2px solid #ddd' }}>
                    电话
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#333', borderBottom: '2px solid #ddd' }}>
                    邮箱
                  </th>
                  <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', color: '#333', borderBottom: '2px solid #ddd' }}>
                    注册时间
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', color: '#666' }}>1</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>张三</td>
                  <td style={{ padding: '15px', color: '#666' }}>35</td>
                  <td style={{ padding: '15px', color: '#666' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: '#e3f2fd',
                      color: '#1976d2'
                    }}>男</span>
                  </td>
                  <td style={{ padding: '15px', color: '#666' }}>13800138000</td>
                  <td style={{ padding: '15px', color: '#666' }}>zhangsan@example.com</td>
                  <td style={{ padding: '15px', color: '#666' }}>2025-01-15</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', color: '#666' }}>2</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>李四</td>
                  <td style={{ padding: '15px', color: '#666' }}>28</td>
                  <td style={{ padding: '15px', color: '#666' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: '#e3f2fd',
                      color: '#1976d2'
                    }}>男</span>
                  </td>
                  <td style={{ padding: '15px', color: '#666' }}>13900139000</td>
                  <td style={{ padding: '15px', color: '#666' }}>lisi@example.com</td>
                  <td style={{ padding: '15px', color: '#666' }}>2025-01-20</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', color: '#666' }}>3</td>
                  <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>王五</td>
                  <td style={{ padding: '15px', color: '#666' }}>42</td>
                  <td style={{ padding: '15px', color: '#666' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: '#fce4ec',
                      color: '#c2185b'
                    }}>女</span>
                  </td>
                  <td style={{ padding: '15px', color: '#666' }}>13700137000</td>
                  <td style={{ padding: '15px', color: '#666' }}>wangwu@example.com</td>
                  <td style={{ padding: '15px', color: '#666' }}>2025-01-25</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notice */}
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          padding: '20px',
          borderRadius: '5px',
          marginTop: '30px'
        }}>
          <h3 style={{ fontSize: '16px', color: '#856404', marginBottom: '10px' }}>
            ⚠️ 系统说明
          </h3>
          <p style={{ fontSize: '14px', color: '#856404', margin: 0 }}>
            当前系统运行在静态托管平台（Cloudflare Pages）上。部分高级功能（如系统维护、七问管理）需要后端 API 支持。
            如需使用完整功能，请联系管理员配置后端服务器。
          </p>
        </div>
      </div>
    </div>
  );
}
