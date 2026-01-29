#!/bin/bash
# 健康管理系统 - 自动启动守护进程
# 此脚本会在沙箱启动后自动运行，确保服务始终可用

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

# 检查是否已经运行过
if [ -f "/tmp/health-system-autostart.lock" ]; then
    echo "✅ 自动启动已完成，跳过"
    exit 0
fi

# 标记为已运行
touch /tmp/health-system-autostart.lock

# 运行自动启动脚本
bash scripts/autostart.sh

# 将此脚本添加到 crontab，确保下次也能自动启动
if ! crontab -l 2>/dev/null | grep -q "health-system-autostart"; then
    (crontab -l 2>/dev/null; echo "@reboot sleep 10 && cd ${SCRIPT_DIR} && bash scripts/autostart.sh >> /app/work/logs/bypass/autostart.log 2>&1") | crontab -
    echo "✅ 已添加到开机自动启动"
fi
