#!/bin/bash
set -Eeuo pipefail

echo "🚀 健康管理系统 - 生产模式启动脚本"
echo "=================================="

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
cd "${COZE_WORKSPACE_PATH}"

# 检查是否已构建
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
    echo "📦 未检测到构建文件，开始构建..."
    pnpm run build
    if [ $? -ne 0 ]; then
        echo "❌ 构建失败，请检查错误信息"
        exit 1
    fi
    echo "✅ 构建完成"
else
    echo "✅ 检测到构建文件，跳过构建步骤"
fi

# 检查端口占用
PORT=5000
PIDS=$(ss -H -lntp 2>/dev/null | awk -v port="${PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true)
if [[ -n "${PIDS}" ]]; then
    echo "⚠️  端口 ${PORT} 已被占用 (PIDs: ${PIDS})"
    echo "🔄 正在停止现有服务..."
    echo "${PIDS}" | xargs -I {} kill -9 {} 2>/dev/null || true
    sleep 1
    echo "✅ 端口已释放"
fi

# 启动生产服务器
echo "🚀 启动生产服务器（端口 ${PORT}）..."
echo "📝 日志文件: /app/work/logs/bypass/prod.log"
nohup npx next start --port ${PORT} > /app/work/logs/bypass/prod.log 2>&1 &
START_PID=$!

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 3

# 检查服务状态
if ps -p $START_PID > /dev/null 2>&1; then
    echo "✅ 服务启动成功！"
    echo "📍 访问地址: http://localhost:${PORT}"
    echo "📊 进程 PID: ${START_PID}"
    echo ""
    echo "💡 提示："
    echo "  - 查看日志: tail -f /app/work/logs/bypass/prod.log"
    echo "  - 停止服务: pkill -f 'next start'"
    echo "  - 检查状态: ps aux | grep 'next start'"
else
    echo "❌ 服务启动失败，请检查日志"
    tail -n 20 /app/work/logs/bypass/prod.log
    exit 1
fi
