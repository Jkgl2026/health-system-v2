'use client';

import { useEffect } from 'react';

export default function AdminLoginPage() {
  useEffect(() => {
    // 在客户端执行登录逻辑
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const loginButton = document.getElementById('login-button') as HTMLButtonElement;
    const errorMessage = document.getElementById('error-message') as HTMLDivElement;

    if (loginButton) {
      loginButton.addEventListener('click', () => {
        const username = usernameInput?.value || '';
        const password = passwordInput?.value || '';

        if (errorMessage) {
          errorMessage.style.display = 'none';
        }

        if (username === 'admin' && password === 'admin123') {
          try {
            localStorage.setItem('admin', JSON.stringify({
              id: '1',
              username: 'admin',
              role: 'admin'
            }));
            localStorage.setItem('adminLoggedIn', 'true');
            window.location.href = '/admin/dashboard';
          } catch (err) {
            if (errorMessage) {
              errorMessage.textContent = '浏览器不支持本地存储';
              errorMessage.style.display = 'block';
            }
          }
        } else {
          if (errorMessage) {
            errorMessage.textContent = '用户名或密码错误';
            errorMessage.style.display = 'block';
          }
        }
      });
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          textAlign: 'center',
          margin: '0 0 30px 0',
          color: '#333',
          fontSize: '24px'
        }}>
          管理后台登录
        </h2>

        <div id="error-message" style={{
          color: '#e74c3c',
          backgroundColor: '#fee',
          padding: '12px',
          borderRadius: '5px',
          marginBottom: '20px',
          fontSize: '14px',
          textAlign: 'center',
          border: '1px solid #fcc',
          display: 'none'
        }}></div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#555',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            用户名
          </label>
          <input
            type="text"
            id="username"
            defaultValue="admin"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#555',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            密码
          </label>
          <input
            type="password"
            id="password"
            defaultValue="admin123"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #ddd',
              borderRadius: '5px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          id="login-button"
          style={{
            width: '100%',
            padding: '14px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          登录
        </button>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          fontSize: '14px',
          color: '#666'
        }}>
          <a
            href="/"
            style={{
              color: '#667eea',
              textDecoration: 'none'
            }}
          >
            返回首页
          </a>
        </div>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#f0f7ff',
          borderRadius: '5px',
          fontSize: '13px',
          color: '#555',
          lineHeight: '1.6'
        }}>
          <strong style={{ color: '#667eea' }}>默认账号：</strong><br/>
          用户名：admin<br/>
          密码：admin123
        </div>
      </div>
    </div>
  );
}
