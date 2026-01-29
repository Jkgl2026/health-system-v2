#!/bin/bash
set -Eeuo pipefail

echo "🚀 [自动启动] 健康管理系统启动脚本"
echo "================================="

COZE_WORKSPACE_PATH="/workspace/projects"
cd "${COZE_WORKSPACE_PATH}"

LOG_FILE="/app/work/logs/bypass/autostart.log"
mkdir -p /app/work/logs/bypass

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 开始自动启动流程..." | tee -a "${LOG_FILE}"

# 检查服务是否已在运行
if ss -lntp 2>/dev/null | grep -q ":5000"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 服务已在运行，跳过启动" | tee -a "${LOG_FILE}"
    exit 0
fi

# 检查构建文件
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📦 开始构建项目..." | tee -a "${LOG_FILE}"
    pnpm run build >> "${LOG_FILE}" 2>&1
    if [ $? -ne 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 构建失败" | tee -a "${LOG_FILE}"
        exit 1
    fi
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 构建完成" | tee -a "${LOG_FILE}"
fi

# 清理可能存在的进程
PIDS=$(ps aux | grep "next" | grep -v grep | awk '{print $2}')
if [ -n "${PIDS}" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧹 清理残留进程..." | tee -a "${LOG_FILE}"
    echo "${PIDS}" | xargs -I {} kill -9 {} 2>/dev/null || true
    sleep 1
fi

# 启动生产服务器
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🚀 启动生产服务器..." | tee -a "${LOG_FILE}"
nohup npx next start --port 5000 > /app/work/logs/bypass/prod.log 2>&1 &
START_PID=$!

# 等待服务启动
sleep 3

# 检查服务状态
if ps -p $START_PID > /dev/null 2>&1 && ss -lntp 2>/dev/null | grep -q ":5000"; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ 服务启动成功！(PID: ${START_PID})" | tee -a "${LOG_FILE}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📍 访问地址: http://localhost:5000" | tee -a "${LOG_FILE}"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ 服务启动失败" | tee -a "${LOG_FILE}"
    tail -n 20 /app/work/logs/bypass/prod.log | tee -a "${LOG_FILE}"
    exit 1
fi
