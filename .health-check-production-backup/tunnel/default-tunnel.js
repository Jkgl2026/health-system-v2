const localtunnel = require('localtunnel');

(async () => {
  try {
    console.log('正在启动默认隧道服务...');
    console.log('目标地址: http://localhost:5000');
    console.log('');

    const tunnel = await localtunnel({
      port: 5000,
      local_host: 'localhost'
    });

    console.log('✅ 默认隧道启动成功！');
    console.log('');
    console.log('访问地址: ' + tunnel.url);
    console.log('');
    console.log('注意：');
    console.log('- 默认隧道每7天需要重新输入密码');
    console.log('- 隧道密码获取方式：访问 https://loca.lt/mytunnelpassword');
    console.log('- 7天内同一IP无需重复输入密码');
    console.log('');

    tunnel.on('close', () => {
      console.log('隧道已关闭');
    });

    tunnel.on('error', (err) => {
      console.error('隧道错误:', err.message);
    });

    // 保持运行
    process.stdin.resume();

  } catch (error) {
    console.error('启动隧道失败:', error.message);
  }
})();
