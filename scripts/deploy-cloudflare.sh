#!/bin/bash

# ====================================
# 快速部署脚本 - Cloudflare Pages
# ====================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境变量
check_env() {
    log_info "检查环境变量..."
    
    if [ ! -f .env.production ]; then
        log_error ".env.production 文件不存在"
        log_warn "请先创建 .env.production 文件，配置以下变量："
        echo "  NEXT_PUBLIC_API_URL=https://your-project.supabase.co/functions/v1"
        echo "  NEXT_PUBLIC_APP_URL=https://health-system-v2.pages.dev"
        exit 1
    fi
    
    log_info "环境变量检查通过"
}

# 安装依赖
install_deps() {
    log_info "安装依赖..."
    
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm 未安装，请先安装: npm install -g pnpm"
        exit 1
    fi
    
    pnpm install
    log_info "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 清理旧的构建文件
    rm -rf out
    
    # 构建静态导出
    pnpm run build
    
    if [ ! -d "out" ]; then
        log_error "构建失败，out 目录不存在"
        exit 1
    fi
    
    log_info "构建完成"
}

# 检查 Wrangler
check_wrangler() {
    log_info "检查 Wrangler CLI..."
    
    if ! command -v wrangler &> /dev/null; then
        log_warn "Wrangler 未安装，正在安装..."
        npm install -g wrangler
    fi
    
    log_info "Wrangler 已就绪"
}

# 部署到 Cloudflare Pages
deploy_pages() {
    log_info "部署到 Cloudflare Pages..."
    
    # 检查是否已登录
    if ! wrangler whoami &> /dev/null; then
        log_info "请登录 Cloudflare..."
        wrangler login
    fi
    
    # 部署
    wrangler pages deploy out --project-name=health-system-v2
    
    log_info "部署完成"
    log_info "访问地址: https://health-system-v2.pages.dev"
}

# 主流程
main() {
    echo "======================================"
    echo "  Cloudflare Pages 部署脚本"
    echo "======================================"
    echo ""
    
    # 检查环境变量
    check_env
    
    # 安装依赖
    install_deps
    
    # 构建项目
    build_project
    
    # 检查 Wrangler
    check_wrangler
    
    # 部署
    deploy_pages
    
    echo ""
    log_info "🎉 部署成功！"
    echo "======================================"
    echo "  访问地址: https://health-system-v2.pages.dev"
    echo "  管理后台: https://health-system-v2.pages.dev/admin/login"
    echo "======================================"
}

# 执行主流程
main
