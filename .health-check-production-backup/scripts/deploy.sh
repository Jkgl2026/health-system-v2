#!/bin/bash

# ============================================================================
# 健康自检后台系统 - 一键部署脚本
# 版本：v1.0.0
# 更新时间：2025-02-05
# 说明：自动化部署脚本，包含环境检查、依赖安装、数据库初始化、应用构建和启动
# ============================================================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印横幅
print_banner() {
    echo -e "${BLUE}"
    echo "=================================================================="
    echo "          健康自检后台系统 - 生产环境一键部署脚本"
    echo "          版本：v1.0.0"
    echo "          更新时间：2025-02-05"
    echo "=================================================================="
    echo -e "${NC}"
}

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_warning "建议使用 root 用户执行此脚本"
        read -p "是否继续？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 检查 Node.js 版本
check_nodejs() {
    log_info "检查 Node.js 版本..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js 已安装：$NODE_VERSION"
        
        # 检查版本是否 >= 24
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | cut -d'v' -f2)
        if [ "$MAJOR_VERSION" -lt 24 ]; then
            log_error "Node.js 版本过低（需要 24+），当前版本：$NODE_VERSION"
            log_info "请升级 Node.js 到 24+ 版本"
            exit 1
        fi
    else
        log_error "Node.js 未安装"
        log_info "请先安装 Node.js 24+ 版本"
        exit 1
    fi
}

# 检查 pnpm 版本
check_pnpm() {
    log_info "检查 pnpm 版本..."
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        log_success "pnpm 已安装：$PNPM_VERSION"
    else
        log_warning "pnpm 未安装，正在安装..."
        npm install -g pnpm
        if [ $? -eq 0 ]; then
            log_success "pnpm 安装成功"
        else
            log_error "pnpm 安装失败"
            exit 1
        fi
    fi
}

# 检查 PostgreSQL 版本
check_postgresql() {
    log_info "检查 PostgreSQL 版本..."
    if command -v psql &> /dev/null; then
        PG_VERSION=$(psql --version)
        log_success "PostgreSQL 已安装：$PG_VERSION"
    else
        log_error "PostgreSQL 未安装"
        log_info "请先安装 PostgreSQL 14+ 版本"
        exit 1
    fi
}

# 检查磁盘空间
check_disk_space() {
    log_info "检查磁盘空间..."
    AVAILABLE_SPACE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    if [ "$AVAILABLE_SPACE" -lt 10 ]; then
        log_warning "可用磁盘空间不足 10GB（当前：${AVAILABLE_SPACE}GB）"
        read -p "是否继续？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        log_success "可用磁盘空间充足：${AVAILABLE_SPACE}GB"
    fi
}

# 创建数据库
create_database() {
    log_info "创建数据库..."
    
    read -p "数据库名称 (默认: health_check_db): " DB_NAME
    DB_NAME=${DB_NAME:-health_check_db}
    
    read -p "数据库用户 (默认: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -sp "数据库密码 (默认: postgres): " DB_PASSWORD
    DB_PASSWORD=${DB_PASSWORD:-postgres}
    echo
    
    # 创建数据库
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
        log_warning "数据库 $DB_NAME 已存在"
    }
    
    log_success "数据库创建成功：$DB_NAME"
}

# 恢复数据库结构
restore_schema() {
    log_info "恢复数据库结构..."
    
    if [ ! -f "database/health_check_db_schema.sql" ]; then
        log_error "数据库结构备份文件不存在"
        exit 1
    fi
    
    read -p "数据库名称 (默认: health_check_db): " DB_NAME
    DB_NAME=${DB_NAME:-health_check_db}
    
    sudo -u postgres psql -d $DB_NAME -f database/health_check_db_schema.sql
    
    if [ $? -eq 0 ]; then
        log_success "数据库结构恢复成功"
    else
        log_error "数据库结构恢复失败"
        exit 1
    fi
}

# 恢复数据库数据
restore_data() {
    log_info "恢复数据库数据..."
    
    if [ ! -f "database/health_check_db_data.sql" ]; then
        log_error "数据库数据备份文件不存在"
        exit 1
    fi
    
    read -p "数据库名称 (默认: health_check_db): " DB_NAME
    DB_NAME=${DB_NAME:-health_check_db}
    
    sudo -u postgres psql -d $DB_NAME -f database/health_check_db_data.sql
    
    if [ $? -eq 0 ]; then
        log_success "数据库数据恢复成功"
    else
        log_error "数据库数据恢复失败"
        exit 1
    fi
}

# 配置环境变量
setup_env() {
    log_info "配置环境变量..."
    
    if [ -f ".env" ]; then
        log_warning ".env 文件已存在"
        read -p "是否覆盖？(y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "跳过环境变量配置"
            return
        fi
    fi
    
    read -p "数据库名称 (默认: health_check_db): " DB_NAME
    DB_NAME=${DB_NAME:-health_check_db}
    
    read -p "数据库用户 (默认: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    read -sp "数据库密码 (默认: postgres): " DB_PASSWORD
    DB_PASSWORD=${DB_PASSWORD:-postgres}
    echo
    
    cat > .env << EOF
# 数据库连接配置
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

# 应用配置
NODE_ENV=production
PORT=5000

# Coze SDK 配置（可选）
COZE_API_KEY=
COZE_API_SECRET=
EOF
    
    chmod 600 .env
    log_success "环境变量配置成功"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    
    pnpm install
    
    if [ $? -eq 0 ]; then
        log_success "依赖安装成功"
    else
        log_error "依赖安装失败"
        exit 1
    fi
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    pnpm run build
    
    if [ $? -eq 0 ]; then
        log_success "项目构建成功"
    else
        log_error "项目构建失败"
        exit 1
    fi
}

# 安装 PM2
install_pm2() {
    log_info "安装 PM2..."
    
    if command -v pm2 &> /dev/null; then
        log_success "PM2 已安装"
    else
        pnpm add -g pm2
        if [ $? -eq 0 ]; then
            log_success "PM2 安装成功"
        else
            log_error "PM2 安装失败"
            exit 1
        fi
    fi
}

# 创建日志目录
create_log_directory() {
    log_info "创建日志目录..."
    
    sudo mkdir -p /var/log/health-check-system
    sudo chown -R $(whoami):$(whoami) /var/log/health-check-system
    
    log_success "日志目录创建成功"
}

# 启动应用
start_application() {
    log_info "启动应用..."
    
    # 更新 PM2 配置文件中的路径
    CURRENT_DIR=$(pwd)
    sed -i "s|/opt/health-check-system|$CURRENT_DIR|g" scripts/ecosystem.config.cjs
    
    # 使用 PM2 启动应用
    pm2 start scripts/ecosystem.config.cjs
    
    if [ $? -eq 0 ]; then
        log_success "应用启动成功"
        pm2 save
        pm2 startup
    else
        log_error "应用启动失败"
        exit 1
    fi
}

# 显示部署摘要
show_summary() {
    echo -e "${GREEN}"
    echo "=================================================================="
    echo "                   部署完成！"
    echo "=================================================================="
    echo -e "${NC}"
    
    log_info "应用信息："
    echo "  应用名称：health-check-system"
    echo "  应用端口：5000"
    echo "  PM2 状态：$(pm2 status | grep health-check-system | awk '{print $10}')"
    
    log_info "默认账号："
    echo "  管理员账号：admin"
    echo "  管理员密码：123456"
    
    log_warning "⚠️  请立即修改管理员密码！"
    
    log_info "常用命令："
    echo "  查看状态：pm2 status"
    echo "  查看日志：pm2 logs health-check-system"
    echo "  重启应用：pm2 restart health-check-system"
    echo "  停止应用：pm2 stop health-check-system"
    
    log_info "访问地址："
    echo "  本地访问：http://localhost:5000"
    echo "  管理后台：http://localhost:5000/admin/login"
    
    echo -e "${GREEN}"
    echo "=================================================================="
    echo -e "${NC}"
}

# 主函数
main() {
    print_banner
    check_root
    
    log_info "开始环境检查..."
    check_nodejs
    check_pnpm
    check_postgresql
    check_disk_space
    
    echo
    read -p "是否创建/恢复数据库？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_database
        restore_schema
        restore_data
    fi
    
    echo
    read -p "是否配置环境变量？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_env
    fi
    
    echo
    read -p "是否安装依赖？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_dependencies
    fi
    
    echo
    read -p "是否构建项目？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_project
    fi
    
    echo
    read -p "是否启动应用？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_pm2
        create_log_directory
        start_application
    fi
    
    show_summary
}

# 执行主函数
main
