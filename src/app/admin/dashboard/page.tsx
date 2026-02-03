'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [users] = useState<User[]>([
    {
      id: '1',
      name: '张三',
      age: 35,
      gender: '男',
      phone: '13800138000',
      email: 'zhangsan@example.com',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: '李四',
      age: 28,
      gender: '女',
      phone: '13900139000',
      email: 'lisi@example.com',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: '王五',
      age: 42,
      gender: '男',
      phone: '13700137000',
      email: 'wangwu@example.com',
      created_at: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    setMounted(true);

    // 检查登录状态
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('adminLoggedIn');
      if (!isLoggedIn) {
        router.push('/admin/login');
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('admin');
    }
    router.push('/admin/login');
  };

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5'
      }}>
        <div style={{ fontSize: '18px', color: '#666' }}>加载中...</div>
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
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
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
        {/* Stats Cards */}
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
              {users.length}
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>
              总用户数
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#48c774', marginBottom: '10px' }}>
              {users.filter(u => u.gender === '男').length}
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>
              男性用户
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff3860', marginBottom: '10px' }}>
              {users.filter(u => u.gender === '女').length}
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>
              女性用户
            </div>
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
            <div style={{ fontSize: '16px', color: '#666' }}>
              系统状态
            </div>
          </div>
        </div>

        {/* User Table */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            color: '#333'
          }}>
            用户列表
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: '#333',
                    borderBottom: '2px solid #ddd'
                  }}>
                    ID
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: '#333',
                    borderBottom: '2px solid #ddd'
                  }}>
                    姓名
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: '#333',
                    borderBottom: '2px solid #ddd'
                  }}>
                    年龄
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: '#333',
                    borderBottom: '2px solid #ddd'
                  }}>
                    性别
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: '#333',
                    borderBottom: '2px solid #ddd'
                  }}>
                    电话
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: '#333',
                    borderBottom: '2px solid #ddd'
                  }}>
                    邮箱
                  </th>
                  <th style={{
                    padding: '15px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: '#333',
                    borderBottom: '2px solid #ddd'
                  }}>
                    注册时间
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px', color: '#666' }}>
                      {user.id}
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>
                      {user.name}
                    </td>
                    <td style={{ padding: '15px', color: '#666' }}>
                      {user.age}
                    </td>
                    <td style={{ padding: '15px', color: '#666' }}>
                      <span style={{
                        padding: '5px 10px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: user.gender === '男' ? '#48c774' : '#ff3860',
                        color: 'white'
                      }}>
                        {user.gender}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: '#666' }}>
                      {user.phone}
                    </td>
                    <td style={{ padding: '15px', color: '#666' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '15px', color: '#666', fontSize: '12px' }}>
                      {new Date(user.created_at).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '5px',
            fontSize: '14px',
            color: '#856404',
            lineHeight: '1.6'
          }}>
            <strong>提示：</strong>
            <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
              <li>当前显示的是模拟数据</li>
              <li>真实数据需要配置数据库连接</li>
              <li>所有功能界面已完成，可以正常使用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
