#!/bin/bash

# Cloudflare Tunnel 监控脚本
# 每分钟检查隧道状态，如果挂了就自动重启

TUNNEL_SUBDOMAIN="health-system-v2"
TUNNEL_PORT=5000
LOG_FILE="/workspace/projects/health-check-production/cloudflare-tunnel/monitor.log"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 记录日志
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# 检查隧道是否在运行
check_tunnel() {
    # 检查是否有 localtunnel 进程
    if pgrep -f "localtunnel.*${TUNNEL_PORT}" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# 检查隧道是否可访问
check_access() {
    # 检查是否能访问到页面
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://${TUNNEL_SUBDOMAIN}.loca.lt --connect-timeout 10)
    if [ "$HTTP_CODE" = "200" ]; then
        return 0
    else
        return 1
    fi
}

# 重启隧道
restart_tunnel() {
    log "检测到隧道异常，正在重启..."
    echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - 检测到隧道异常，正在重启...${NC}"

    # 停止现有进程
    pkill -9 -f "localtunnel.*${TUNNEL_PORT}" 2>/dev/null
    sleep 2

    # 启动新隧道
    cd /workspace/projects/health-check-production
    nohup npx localtunnel --port ${TUNNEL_PORT} --subdomain ${TUNNEL_SUBDOMAIN} > cloudflare-tunnel/tunnel.log 2>&1 &
    sleep 5

    # 检查是否重启成功
    if pgrep -f "localtunnel.*${TUNNEL_PORT}" > /dev/null; then
        log "隧道重启成功"
        echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') - 隧道重启成功${NC}"
    else
        log "隧道重启失败"
        echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') - 隧道重启失败${NC}"
    fi
}

# 主检查逻辑
main() {
    if ! check_tunnel; then
        log "隧道进程未运行"
        echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - 隧道进程未运行${NC}"
        restart_tunnel
    elif ! check_access; then
        log "隧道无法访问"
        echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - 隧道无法访问${NC}"
        restart_tunnel
    else
        log "隧道运行正常"
        echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') - 隧道运行正常${NC}"
    fi
}

# 执行检查
main
