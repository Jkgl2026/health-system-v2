#!/bin/bash

# Cloudflare Tunnel 管理脚本
# 用于管理健康自检系统的 Cloudflare Tunnel

TUNNEL_PORT=5000
TUNNEL_LOG="/workspace/projects/health-check-production/cloudflare-tunnel/cloudflare-tunnel.log"
PID_FILE="/workspace/projects/health-check-production/cloudflare-tunnel/cloudflare-tunnel.pid"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 记录日志
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$TUNNEL_LOG"
}

# 检查隧道是否在运行
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

# 获取当前访问地址
get_url() {
    grep -oP 'https://[^[:space:]]+\.trycloudflare\.com' "$TUNNEL_LOG" | tail -1
}

# 启动隧道
start_tunnel() {
    echo -e "${YELLOW}正在启动 Cloudflare Tunnel...${NC}"
    log "启动 Cloudflare Tunnel..."

    # 检查是否已经在运行
    if check_tunnel; then
        echo -e "${BLUE}Cloudflare Tunnel 已经在运行${NC}"
        show_status
        return 0
    fi

    # 停止现有进程
    pkill -9 -f cloudflared 2>/dev/null
    sleep 2

    # 启动新隧道
    nohup cloudflared tunnel --url http://localhost:${TUNNEL_PORT} > ${TUNNEL_LOG} 2>&1 &
    TUNNEL_PID=$!

    # 保存 PID
    echo $TUNNEL_PID > "$PID_FILE"

    # 等待隧道启动
    sleep 5

    # 检查是否启动成功
    if ps -p $TUNNEL_PID > /dev/null 2>&1; then
        URL=$(get_url)
        echo -e "${GREEN}✅ Cloudflare Tunnel 启动成功！${NC}"
        echo ""
        echo "========================================="
        echo "  访问信息"
        echo "========================================="
        echo ""
        if [ -n "$URL" ]; then
            echo -e "${BLUE}📱 访问地址: ${URL}/admin/dashboard${NC}"
        else
            echo -e "${YELLOW}📱 访问地址: 正在解析中（请稍后）${NC}"
        fi
        echo ""
        echo -e "${BLUE}👤 系统账号: admin / 123456${NC}"
        echo -e "${BLUE}🔐 隧道密码: 不需要！直接访问${NC}"
        echo -e "${BLUE}🌐 访问协议: HTTPS (HTTP/2)${NC}"
        echo ""
        echo "📊 查看日志: tail -f ${TUNNEL_LOG}"
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
        log "停止 Cloudflare Tunnel (PID: $PID)"
        kill $PID 2>/dev/null
        sleep 2

        if ps -p $PID > /dev/null 2>&1; then
            kill -9 $PID 2>/dev/null
        fi

        rm -f "$PID_FILE"
        echo -e "${GREEN}✅ Cloudflare Tunnel 已停止${NC}"
    else
        echo -e "${YELLOW}Cloudflare Tunnel 未运行${NC}"
    fi
}

# 重启隧道
restart_tunnel() {
    echo -e "${YELLOW}正在重启 Cloudflare Tunnel...${NC}"
    stop_tunnel
    sleep 2
    start_tunnel
}

# 显示状态
show_status() {
    echo "========================================="
    echo "  Cloudflare Tunnel 状态"
    echo "========================================="
    echo ""

    if check_tunnel; then
        PID=$(cat "$PID_FILE")
        URL=$(get_url)
        echo -e "${GREEN}✅ Cloudflare Tunnel 正在运行${NC}"
        echo "   PID: $PID"
        echo "   端口: ${TUNNEL_PORT}"
        echo ""

        if [ -n "$URL" ]; then
            echo -e "${BLUE}📱 访问地址:${NC}"
            echo "   ${URL}/admin/dashboard"
            echo "   ${URL}/admin/login"
        else
            echo -e "${YELLOW}📱 访问地址: 正在解析中...${NC}"
        fi
        echo ""
        echo "📊 查看日志: tail -f ${TUNNEL_LOG}"
    else
        echo -e "${RED}❌ Cloudflare Tunnel 未运行${NC}"
        echo ""
        echo "启动命令: $0 start"
    fi
    echo ""
    echo "========================================="
}

# 显示帮助
show_help() {
    echo "Cloudflare Tunnel 管理脚本"
    echo ""
    echo "用法: $0 {start|stop|restart|status|url|logs}"
    echo ""
    echo "命令说明:"
    echo "  start   - 启动隧道"
    echo "  stop    - 停止隧道"
    echo "  restart - 重启隧道"
    echo "  status  - 查看状态"
    echo "  url     - 查看访问地址"
    echo "  logs    - 查看日志"
    echo ""
    echo "示例:"
    echo "  $0 start    # 启动隧道"
    echo "  $0 stop     # 停止隧道"
    echo "  $0 restart  # 重启隧道"
    echo "  $0 status   # 查看状态"
    echo "  $0 url      # 查看访问地址"
    echo "  $0 logs     # 查看日志"
    exit 0
}

# 显示访问地址
show_url() {
    URL=$(get_url)
    if [ -n "$URL" ]; then
        echo -e "${GREEN}当前访问地址:${NC}"
        echo ""
        echo -e "${BLUE}${URL}/admin/dashboard${NC}"
        echo -e "${BLUE}${URL}/admin/login${NC}"
        echo ""
        echo -e "${YELLOW}系统账号: admin / 123456${NC}"
        echo -e "${YELLOW}隧道密码: 不需要！直接访问${NC}"
    else
        echo -e "${YELLOW}正在解析访问地址，请稍后...${NC}"
        echo "查看日志: tail -f ${TUNNEL_LOG}"
    fi
}

# 显示日志
show_logs() {
    if [ -f "$TUNNEL_LOG" ]; then
        echo -e "${BLUE}最新 30 行日志:${NC}"
        echo ""
        tail -30 "$TUNNEL_LOG"
    else
        echo -e "${RED}日志文件不存在${NC}"
    fi
}

# 主函数
case "$1" in
    start)
        start_tunnel
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
    url)
        show_url
        ;;
    logs)
        show_logs
        ;;
    *)
        show_help
        ;;
esac

exit 0
