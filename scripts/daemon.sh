#!/bin/bash
set -Eeuo pipefail

echo "🛡️  健康管理系统 - 服务守护脚本"
echo "=================================="

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
cd "${COZE_WORKSPACE_PATH}"

PORT=5000
LOG_FILE="/app/work/logs/bypass/daemon.log"
MAX_RESTART_ATTEMPTS=10
RESTART_DELAY=5

# 创建日志目录
mkdir -p /app/work/logs/bypass

echo "📝 守护日志: ${LOG_FILE}"
echo "🎯 监控端口: ${PORT}"
echo "🔄 最大重启次数: ${MAX_RESTART_ATTEMPTS}"
echo ""

restart_count=0

while true; do
    # 检查服务是否在运行
    if ss -lntp 2>/dev/null | grep -q ":${PORT}"; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 服务运行正常" >> "${LOG_FILE}"

        # 检查进程是否存在
        PID=$(ss -H -lntp 2>/dev/null | awk -v port="${PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | head -1)
        if [ -n "${PID}" ] && ps -p "${PID}" > /dev/null 2>&1; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📍 进程 PID: ${PID}" >> "${LOG_FILE}"
        fi
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  检测到服务停止！" >> "${LOG_FILE}"

        # 检查重启次数
        if [ ${restart_count} -ge ${MAX_RESTART_ATTEMPTS} ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 达到最大重启次数 (${MAX_RESTART_ATTEMPTS})，停止守护" >> "${LOG_FILE}"
            break
        fi

        # 清理可能存在的进程
        PIDS=$(ps aux | grep "next start" | grep -v grep | awk '{print $2}')
        if [ -n "${PIDS}" ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧹 清理残留进程: ${PIDS}" >> "${LOG_FILE}"
            echo "${PIDS}" | xargs -I {} kill -9 {} 2>/dev/null || true
        fi

        # 检查构建文件
        if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📦 未检测到构建文件，开始构建..." >> "${LOG_FILE}"
            pnpm run build >> "${LOG_FILE}" 2>&1
            if [ $? -ne 0 ]; then
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 构建失败，等待 ${RESTART_DELAY} 秒后重试" >> "${LOG_FILE}"
                sleep ${RESTART_DELAY}
                restart_count=$((restart_count + 1))
                continue
            fi
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 构建完成" >> "${LOG_FILE}"
        fi

        # 启动服务
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 启动服务（第 $((restart_count + 1)) 次）..." >> "${LOG_FILE}"
        nohup npx next start --port ${PORT} >> /app/work/logs/bypass/prod.log 2>&1 &

        # 等待服务启动
        sleep 3

        # 验证服务是否启动成功
        if ss -lntp 2>/dev/null | grep -q ":${PORT}"; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 服务启动成功！" >> "${LOG_FILE}"
            restart_count=0
        else
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 服务启动失败，等待 ${RESTART_DELAY} 秒后重试" >> "${LOG_FILE}"
            tail -n 20 /app/work/logs/bypass/prod.log >> "${LOG_FILE}"
            restart_count=$((restart_count + 1))
            sleep ${RESTART_DELAY}
        fi
    fi

    # 等待下一次检查
    sleep 30
done
