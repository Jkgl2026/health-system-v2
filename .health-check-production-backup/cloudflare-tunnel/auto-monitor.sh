#!/bin/bash

# LocalTunnel 自动重启和监控脚本
# 保持隧道稳定运行，避免频繁IP变化

TUNNEL_PORT=5000
TUNNEL_NAME="health-system"
LOG_FILE="/workspace/projects/health-check-production/cloudflare-tunnel/auto-monitor.log"
PID_FILE="/workspace/projects/health-check-production/cloudflare-tunnel/tunnel.pid"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

get_current_password() {
    curl -s https://loca.lt/mytunnelpassword
}

check_tunnel() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

start_tunnel() {
    log "启动 LocalTunnel..."

    # 停止现有进程
    pkill -9 -f "localtunnel.*${TUNNEL_PORT}" 2>/dev/null
    sleep 2

    # 启动新隧道（使用随机子域名，避免冲突）
    cd /workspace/projects/health-check-production
    OUTPUT=$(npx localtunnel --port ${TUNNEL_PORT} 2>&1 &)
    TUNNEL_PID=$!

    # 保存 PID
    echo $TUNNEL_PID > "$PID_FILE"

    # 等待隧道启动
    sleep 5

    # 获取当前密码
    PASSWORD=$(get_current_password)

    if ps -p $TUNNEL_PID > /dev/null 2>&1; then
        log "隧道启动成功，当前密码: $PASSWORD"
        echo -e "${GREEN}✅ 隧道启动成功${NC}"
        echo -e "${GREEN}当前密码: ${PASSWORD}${NC}"
        return 0
    else
        log "隧道启动失败"
        echo -e "${RED}❌ 隧道启动失败${NC}"
        return 1
    fi
}

show_status() {
    if check_tunnel; then
        PID=$(cat "$PID_FILE")
        PASSWORD=$(get_current_password)
        echo -e "${GREEN}✅ 隧道正在运行${NC}"
        echo "   PID: $PID"
        echo "   当前密码: ${PASSWORD}"
    else
        echo -e "${RED}❌ 隧道未运行${NC}"
    fi
}

# 主逻辑
case "$1" in
    start)
        if check_tunnel; then
            echo -e "${YELLOW}隧道已经在运行${NC}"
            show_status
        else
            start_tunnel
        fi
        ;;
    stop)
        if check_tunnel; then
            PID=$(cat "$PID_FILE")
            kill $PID 2>/dev/null
            sleep 2
            pkill -9 -f "localtunnel.*${TUNNEL_PORT}" 2>/dev/null
            rm -f "$PID_FILE"
            echo -e "${GREEN}✅ 隧道已停止${NC}"
        else
            echo -e "${YELLOW}隧道未运行${NC}"
        fi
        ;;
    restart)
        echo -e "${YELLOW}重启隧道...${NC}"
        stop_tunnel
        sleep 2
        start_tunnel
        ;;
    status)
        show_status
        ;;
    password)
        PASSWORD=$(get_current_password)
        echo -e "${GREEN}当前隧道密码: ${PASSWORD}${NC}"
        ;;
    *)
        echo "LocalTunnel 自动管理脚本"
        echo ""
        echo "用法: $0 {start|stop|restart|status|password}"
        echo ""
        echo "示例:"
        echo "  $0 start    # 启动隧道"
        echo "  $0 stop     # 停止隧道"
        echo "  $0 restart  # 重启隧道"
        echo "  $0 status   # 查看状态"
        echo "  $0 password # 查看当前密码"
        ;;
esac
