'use client';

import { useEffect } from 'react';

export default function ComparePage() {
  useEffect(() => {
    // 检查登录状态
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn !== 'true') {
      window.location.href = '/admin-login.html';
    }
  }, []);

  const handleBack = () => {
    window.location.href = '/admin/dashboard';
  };

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
            健康对比分析
          </p>
        </div>
        <button
          onClick={handleBack}
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
          返回后台
        </button>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Notice */}
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          padding: '30px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', color: '#856404', marginBottom: '15px' }}>
            功能说明
          </h2>
          <p style={{ fontSize: '16px', color: '#856404', lineHeight: '1.6', marginBottom: '20px' }}>
            健康对比分析功能需要访问用户的历史健康数据，包括：
          </p>
          <ul style={{ fontSize: '16px', color: '#856404', lineHeight: '1.8', marginBottom: '20px', paddingLeft: '20px' }}>
            <li>症状检查记录对比</li>
            <li>健康要素分析对比</li>
            <li>用户选择记录对比</li>
            <li>BMI 和血压变化趋势</li>
            <li>健康评分变化分析</li>
            <li>健康要素详细对比（气血、循环、毒素、血脂、寒凉、免疫力、情绪）</li>
            <li>不良习惯和症状变化对比</li>
          </ul>
          <p style={{ fontSize: '16px', color: '#856404', lineHeight: '1.6', marginBottom: '20px' }}>
            此功能需要后端 API 支持，当前系统运行在静态托管平台上，暂不提供此功能。
          </p>
          <p style={{ fontSize: '16px', color: '#856404', lineHeight: '1.6' }}>
            如需使用完整功能，请联系管理员配置后端服务器。
          </p>
        </div>

        {/* Features List */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '20px' }}>
            功能特性
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
              <h4 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
                数据对比
              </h4>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                对比用户不同时期的健康数据变化
              </p>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📈</div>
              <h4 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
                趋势分析
              </h4>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                分析健康指标的变化趋势
              </p>
            </div>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📋</div>
              <h4 style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
                详细报告
              </h4>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                生成详细的健康变化报告
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
