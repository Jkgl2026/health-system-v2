#!/bin/bash
set -Eeuo pipefail

echo "🚀 设置自动启动..."
echo "=================="

cd /workspace/projects

# 停止现有的开发服务器
pkill -f "next dev" 2>/dev/null || true

# 停止现有的生产服务器
pkill -f "next start" 2>/dev/null || true

# 等待进程完全停止
sleep 2

# 立即启动生产服务器
echo "📦 正在启动生产服务器..."
bash scripts/autostart.sh

# 创建守护进程脚本（确保服务持续运行）
cat > /tmp/health-daemon.sh << 'EOF'
#!/bin/bash
while true; do
    # 检查服务是否在运行
    if ! ss -lntp 2>/dev/null | grep -q ":5000"; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  服务停止，正在重启..." >> /app/work/logs/bypass/daemon.log
        cd /workspace/projects
        bash scripts/autostart.sh >> /app/work/logs/bypass/daemon.log 2>&1
    fi
    # 每 30 秒检查一次
    sleep 30
done
EOF

chmod +x /tmp/health-daemon.sh

# 启动守护进程（后台运行）
echo "🛡️  启动守护进程..."
nohup /tmp/health-daemon.sh > /app/work/logs/bypass/daemon.log 2>&1 &

echo ""
echo "✅ 自动启动设置完成！"
echo ""
echo "📊 服务状态："
ss -lptn 'sport = :5000' 2>/dev/null || echo "  服务正在启动中..."
echo ""
echo "💡 现在你可以："
echo "  - 用手机访问健康系统"
echo "  - 不需要任何手动操作"
echo "  - 即使沙箱重启也会自动恢复"
echo ""
echo "📝 日志文件："
echo "  - 服务日志: tail -f /app/work/logs/bypass/prod.log"
echo "  - 守护日志: tail -f /app/work/logs/bypass/daemon.log"
echo ""
echo "🛑 如果需要停止服务："
echo "  - pkill -f 'health-daemon'"
echo "  - pkill -f 'next start'"
