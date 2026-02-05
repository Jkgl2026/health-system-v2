const localtunnel = require('localtunnel');
const axios = require('axios');

(async () => {
  try {
    console.log('正在启动自定义隧道服务...');
    console.log('目标地址: http://localhost:5000');
    console.log('自定义子域名: health-check-system');

    const tunnel = await localtunnel({
      port: 5000,
      subdomain: 'health-check-system',
      local_host: 'localhost'
    });

    console.log('');
    console.log('✅ 隧道启动成功！');
    console.log('');
    console.log('访问地址: ' + tunnel.url);
    console.log('');
    console.log('注意：自定义子域名可能需要付费或有使用限制。');
    console.log('如果遇到错误，请检查 LocalTunnel 账户状态。');
    console.log('');

    tunnel.on('close', () => {
      console.log('隧道已关闭');
    });

    tunnel.on('error', (err) => {
      console.error('隧道错误:', err.message);
      console.log('');
      console.log('备选方案：');
      console.log('1. 使用默认的临时隧道');
      console.log('2. 使用 ngrok 免费版');
      console.log('3. 使用 Cloudflare Tunnel（需要配置）');
    });

    // 保持运行
    process.stdin.resume();

  } catch (error) {
    console.error('启动隧道失败:', error.message);
    console.log('');
    console.log('错误原因可能：');
    console.log('- 自定义子域名已被使用');
    console.log('- 需要 LocalTunnel 付费账户');
    console.log('- 网络连接问题');
    console.log('');
    console.log('正在尝试使用默认隧道...');
    try {
      const defaultTunnel = await localtunnel(5000);
      console.log('');
      console.log('✅ 默认隧道启动成功！');
      console.log('访问地址: ' + defaultTunnel.url);
      console.log('');
      console.log('注意：默认隧道每7天需要重新输入密码。');
    } catch (err) {
      console.error('默认隧道也启动失败:', err.message);
    }
  }
})();
