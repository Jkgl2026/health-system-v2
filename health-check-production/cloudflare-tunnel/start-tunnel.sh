#!/bin/bash

# 停止现有的 LocalTunnel 进程
pkill -f "localtunnel.*5000"

# 等待进程停止
sleep 2

# 启动新的 LocalTunnel，使用固定子域名
cd /workspace/projects/health-check-production
nohup npx localtunnel --port 5000 --subdomain health-system-v2 > cloudflare-tunnel/tunnel.log 2>&1 &

# 等待隧道启动
sleep 5

# 显示隧道信息
echo "========================================="
echo "  Cloudflare Tunnel 启动完成"
echo "========================================="
echo ""
echo "访问地址: https://health-system-v2.loca.lt/admin/dashboard"
echo ""
echo "注意："
echo "- 免费版 LocalTunnel 仍需要每7天输入密码"
echo "- 要实现真正长期免密，需要使用 Cloudflare Tunnel"
echo ""
echo "获取隧道密码: https://loca.lt/mytunnelpassword"
echo ""
echo "查看日志: cat cloudflare-tunnel/tunnel.log"
echo "========================================="
