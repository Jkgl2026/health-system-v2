#!/bin/bash

# Cloudflare Tunnel 自动启动脚本
# 用于保持 https://health-system-v2.loca.lt 长期可访问

# 隧道配置
TUNNEL_PORT=5000
TUNNEL_SUBDOMAIN=health-system-v2
TUNNEL_LOG="/workspace/projects/health-check-production/cloudflare-tunnel/tunnel.log"
PID_FILE="/workspace/projects/health-check-production/cloudflare-tunnel/tunnel.pid"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查隧道是否正在运行
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

# 启动隧道
start_tunnel() {
    echo -e "${YELLOW}正在启动 Cloudflare Tunnel...${NC}"

    # 停止现有的隧道进程
    pkill -f "localtunnel.*${TUNNEL_PORT}" 2>/dev/null
    sleep 2

    # 启动新隧道
    cd /workspace/projects/health-check-production
    nohup npx localtunnel --port ${TUNNEL_PORT} --subdomain ${TUNNEL_SUBDOMAIN} > ${TUNNEL_LOG} 2>&1 &
    TUNNEL_PID=$!

    # 保存 PID
    echo $TUNNEL_PID > "$PID_FILE"

    # 等待隧道启动
    sleep 5

    # 检查是否启动成功
    if ps -p $TUNNEL_PID > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Cloudflare Tunnel 启动成功！${NC}"
        echo ""
        echo "========================================="
        echo "  访问信息"
        echo "========================================="
        echo ""
        echo "📱 访问地址: https://health-system-v2.loca.lt/admin/dashboard"
        echo ""
        echo "🔐 隧道密码: 115.191.1.173"
        echo "👤 系统账号: admin / 123456"
        echo ""
        echo "📅 密码有效期: 7天"
        echo "🔄 7天后密码过期: 访问 https://loca.lt/mytunnelpassword 获取新密码"
        echo ""
        echo "📊 查看日志: cat ${TUNNEL_LOG}"
        echo "📋 查看 PID: cat ${PID_FILE}"
        echo ""
        echo "========================================="
        return 0
    else
        echo -e "${RED}❌ Cloudflare Tunnel 启动失败！${NC}"
        echo ""
        echo "查看日志: cat ${TUNNEL_LOG}"
        return 1
    fi
}

# 停止隧道
stop_tunnel() {
    if check_tunnel; then
        PID=$(cat "$PID_FILE")
        echo -e "${YELLOW}正在停止 Cloudflare Tunnel (PID: $PID)...${NC}"
        kill $PID
        sleep 2

        if ps -p $PID > /dev/null 2>&1; then
            kill -9 $PID
        fi

        rm -f "$PID_FILE"
        echo -e "${GREEN}✅ Cloudflare Tunnel 已停止${NC}"
    else
        echo -e "${YELLOW}Cloudflare Tunnel 未运行${NC}"
    fi
}

# 重启隧道
restart_tunnel() {
    stop_tunnel
    sleep 2
    start_tunnel
}

# 显示状态
show_status() {
    if check_tunnel; then
        PID=$(cat "$PID_FILE")
        echo -e "${GREEN}✅ Cloudflare Tunnel 正在运行${NC}"
        echo "   PID: $PID"
        echo ""
        echo "访问地址: https://health-system-v2.loca.lt/admin/dashboard"
        echo "查看日志: cat ${TUNNEL_LOG}"
    else
        echo -e "${RED}❌ Cloudflare Tunnel 未运行${NC}"
        echo ""
        echo "启动命令: $0 start"
    fi
}

# 主函数
case "$1" in
    start)
        if check_tunnel; then
            echo -e "${YELLOW}Cloudflare Tunnel 已经在运行${NC}"
            show_status
        else
            start_tunnel
        fi
        ;;
    stop)
        stop_tunnel
        ;;
    restart)
        restart_tunnel
        ;;
    status)
        show_status
        ;;
    *)
        echo "Cloudflare Tunnel 管理脚本"
        echo ""
        echo "用法: $0 {start|stop|restart|status}"
        echo ""
        echo "示例:"
        echo "  $0 start    # 启动隧道"
        echo "  $0 stop     # 停止隧道"
        echo "  $0 restart  # 重启隧道"
        echo "  $0 status   # 查看状态"
        exit 1
        ;;
esac

exit 0
