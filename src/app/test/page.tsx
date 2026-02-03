export default function SimpleTestPage() {
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
          margin: '0 0 20px 0',
          color: '#333',
          fontSize: '24px'
        }}>
          部署测试
        </h2>

        <div style={{
          padding: '20px',
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#155724'
        }}>
          ✅ Cloudflare Pages 部署成功！
        </div>

        <div style={{
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>
            如果你能看到这个页面，说明部署是正常的。
          </p>
          <p style={{ margin: '0' }}>
            登录功能修复中，请稍候...
          </p>
        </div>

        <button
          onClick={() => {
            window.location.href = '/admin/login';
          }}
          style={{
            marginTop: '20px',
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
          前往登录页面
        </button>
      </div>
    </div>
  );
}
