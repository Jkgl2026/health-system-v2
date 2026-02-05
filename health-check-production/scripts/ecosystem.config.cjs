module.exports = {
  apps: [{
    name: 'health-check-system',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/opt/health-check-system',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/health-check-system/error.log',
    out_file: '/var/log/health-check-system/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    time: true,
    merge_logs: true
  }]
};
