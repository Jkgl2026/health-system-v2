#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"

start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."

    # 确保构建产物存在
    if [ ! -d ".next" ]; then
        echo "Error: Build directory (.next) not found. Please run 'pnpm run build' first."
        exit 1
    fi

    # 启动 Next.js 生产服务器
    npx next start --port ${DEPLOY_RUN_PORT}
}

echo "Starting HTTP service on port ${DEPLOY_RUN_PORT} for deploy..."
start_service
