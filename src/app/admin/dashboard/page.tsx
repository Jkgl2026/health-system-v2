'use client';

import { useEffect } from 'react';

export default function AdminDashboardPage() {
  useEffect(() => {
    const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
    const isLoggedIn = localStorage.getItem('adminLoggedIn');

    // 检查登录状态
    if (isLoggedIn !== 'true') {
      window.location.href = '/admin/login';
    }

    // 退出登录
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        localStorage.removeItem('admin');
        localStorage.removeItem('adminLoggedIn');
        window.location.href = '/admin/login';
      });
    }
  }, []);

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
          id="logout-button"
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

        {/* User Table */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#333' }}>
            用户列表
          </h2>

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
      </div>
    </div>
  );
}
