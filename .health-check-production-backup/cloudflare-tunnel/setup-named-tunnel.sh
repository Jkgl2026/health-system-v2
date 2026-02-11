#!/bin/bash

# Cloudflare 命名隧道配置辅助脚本
# 用于配置自有域名到 Cloudflare Tunnel

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Cloudflare 命名隧道配置助手${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 cloudflared 是否安装
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared 未安装${NC}"
    echo -e "${YELLOW}正在安装 cloudflared...${NC}"
    apt-get update -qq
    apt-get install -y cloudflared
    echo -e "${GREEN}✅ cloudflared 安装成功${NC}"
fi

# 配置目录
CONFIG_DIR="/etc/cloudflared"
mkdir -p "$CONFIG_DIR"

echo -e "${YELLOW}请按步骤操作：${NC}"
echo ""

# 步骤 1：输入域名
echo -e "${BLUE}步骤 1：输入你的域名${NC}"
echo -e "例如：myhealth.com"
read -p "请输入域名： " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}❌ 域名不能为空${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}域名：${DOMAIN_NAME}${NC}"
echo ""

# 步骤 2：输入隧道 ID
echo -e "${BLUE}步骤 2：输入 Cloudflare 隧道 ID${NC}"
echo -e "说明："
echo "  1. 访问 https://dash.cloudflare.com/"
echo "  2. 选择你的域名 → Zero Trust → Tunnels"
echo "  3. 创建隧道（如果还没有）"
echo "  4. 复制隧道 ID（UUID 格式）"
echo ""
read -p "请输入隧道 ID： " TUNNEL_ID

if [ -z "$TUNNEL_ID" ]; then
    echo -e "${RED}❌ 隧道 ID 不能为空${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}隧道 ID：${TUNNEL_ID}${NC}"
echo ""

# 步骤 3：输入目标端口
echo -e "${BLUE}步骤 3：输入本地服务端口${NC}"
echo -e "默认：5000"
read -p "请输入端口 [5000]： " LOCAL_PORT

LOCAL_PORT=${LOCAL_PORT:-5000}

echo ""
echo -e "${GREEN}本地端口：${LOCAL_PORT}${NC}"
echo ""

# 步骤 4：是否配置 www 子域名
echo -e "${BLUE}步骤 4：是否配置 www 子域名？${NC}"
echo -e "例如：www.${DOMAIN_NAME}"
read -p "配置 www 子域名？ [Y/n]: " USE_WWW

USE_WWW=${USE_WWW:-Y}

# 生成配置文件
echo -e "${YELLOW}正在生成配置文件...${NC}"

cat > "$CONFIG_DIR/config.yml" << EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CONFIG_DIR}/${TUNNEL_ID}.json

ingress:
  - hostname: ${DOMAIN_NAME}
    service: http://localhost:${LOCAL_PORT}
EOF

# 添加 www 子域名（如果选择）
if [[ "$USE_WWW" =~ ^[Yy]$ ]]; then
    cat >> "$CONFIG_DIR/config.yml" << EOF
  - hostname: www.${DOMAIN_NAME}
    service: http://localhost:${LOCAL_PORT}
EOF
fi

# 添加默认规则
cat >> "$CONFIG_DIR/config.yml" << EOF
  - service: http_status:404
EOF

echo -e "${GREEN}✅ 配置文件生成成功：${CONFIG_DIR}/config.yml${NC}"
echo ""

# 显示配置文件内容
echo -e "${BLUE}配置文件内容：${NC}"
echo "----------------------------------------"
cat "$CONFIG_DIR/config.yml"
echo "----------------------------------------"
echo ""

# 步骤 5：提示添加 DNS 记录
echo -e "${BLUE}步骤 5：在 Cloudflare 添加 DNS 记录${NC}"
echo ""
echo "请按以下步骤操作："
echo "  1. 访问 https://dash.cloudflare.com/"
echo "  2. 选择你的域名：${DOMAIN_NAME}"
echo "  3. 点击 DNS → Records"
echo "  4. 点击 'Add record'"
echo ""
echo -e "${YELLOW}配置 DNS 记录：${NC}"
echo ""
echo "记录 1（主域名）："
echo "  Type: CNAME"
echo "  Name: @"
echo "  Target: ${TUNNEL_ID}"
echo "  Proxy status: ✅ Proxied (橙色云朵)"
echo ""

if [[ "$USE_WWW" =~ ^[Yy]$ ]]; then
    echo "记录 2（www 子域名）："
    echo "  Type: CNAME"
    echo "  Name: www"
    echo "  Target: ${TUNNEL_ID}"
    echo "  Proxy status: ✅ Proxied (橙色云朵)"
    echo ""
fi

read -p "DNS 记录已添加？ [Y/n]: " DNS_ADDED

if [[ ! "$DNS_ADDED" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ 请先添加 DNS 记录后再继续${NC}"
    exit 1
fi

# 步骤 6：上传凭证文件
echo ""
echo -e "${BLUE}步骤 6：上传凭证文件${NC}"
echo ""
echo "请按以下步骤操作："
echo "  1. 在 Cloudflare Tunnel 页面"
echo "  2. 选择你的隧道"
echo "  3. 点击 '.cloudflared' 标签"
echo "  4. 下载凭证文件（${TUNNEL_ID}.json）"
echo "  5. 上传到服务器的 ${CONFIG_DIR}/ 目录"
echo ""
read -p "凭证文件已上传？ [Y/n]: " CREDENTIALS_UPLOADED

if [[ ! "$CREDENTIALS_UPLOADED" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ 请先上传凭证文件后再继续${NC}"
    exit 1
fi

# 检查凭证文件
if [ ! -f "$CONFIG_DIR/${TUNNEL_ID}.json" ]; then
    echo -e "${RED}❌ 凭证文件不存在：${CONFIG_DIR}/${TUNNEL_ID}.json${NC}"
    exit 1
fi

# 创建 systemd 服务
echo ""
echo -e "${YELLOW}正在创建 systemd 服务...${NC}"

cat > /etc/systemd/system/cloudflared.service << EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/cloudflared tunnel --config ${CONFIG_DIR}/config.yml run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF

echo -e "${GREEN}✅ systemd 服务创建成功${NC}"
echo ""

# 重新加载 systemd
systemctl daemon-reload

# 启动服务
echo -e "${YELLOW}正在启动 Cloudflare Tunnel...${NC}"
systemctl start cloudflared

# 检查服务状态
sleep 3
if systemctl is-active --quiet cloudflared; then
    echo -e "${GREEN}✅ Cloudflare Tunnel 启动成功！${NC}"
else
    echo -e "${RED}❌ Cloudflare Tunnel 启动失败${NC}"
    echo -e "${YELLOW}查看日志：${NC}"
    journalctl -u cloudflared -n 50 --no-pager
    exit 1
fi

# 设置开机自启动
systemctl enable cloudflared

# 显示状态
echo ""
systemctl status cloudflared --no-pager -l

# 显示访问地址
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  配置完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}访问地址：${NC}"
echo -e "  https://${DOMAIN_NAME}/admin/login"
if [[ "$USE_WWW" =~ ^[Yy]$ ]]; then
    echo -e "  https://www.${DOMAIN_NAME}/admin/login"
fi
echo ""
echo -e "${BLUE}系统账号：${NC}"
echo "  用户名：admin"
echo "  密码：123456"
echo ""
echo -e "${BLUE}管理命令：${NC}"
echo "  查看状态：systemctl status cloudflared"
echo "  查看日志：journalctl -u cloudflared -f"
echo "  重启服务：systemctl restart cloudflared"
echo "  停止服务：systemctl stop cloudflared"
echo ""
echo -e "${YELLOW}注意：${NC}"
echo "  1. DNS 记录可能需要 10-30 分钟生效"
echo "  2. 如果无法访问，请检查 DNS 是否已生效"
echo "  3. 可以使用 nslookup 检查：nslookup ${DOMAIN_NAME}"
echo ""
