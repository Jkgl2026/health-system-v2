#!/bin/bash

# 部署脚本 - 健康自检系统

set -e

echo "========================================="
echo "  健康自检系统 - 部署脚本"
echo "========================================="
echo ""

# 检查是否安装了必要的工具
echo "🔍 检查环境..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm 未安装"
    exit 1
fi

if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI 未安装，正在安装..."
    npm install -g supabase
fi

echo "✅ 环境检查完成"
echo ""

# 构建项目
echo "🏗️  构建项目..."
pnpm run build

if [ ! -d ".next" ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建完成"
echo ""

# 部署 Supabase Edge Functions
echo "🚀 部署 Supabase Edge Functions..."

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ 请设置环境变量 SUPABASE_ACCESS_TOKEN"
    echo "   获取方式: https://supabase.com/dashboard/account/tokens"
    exit 1
fi

supabase login

if [ -z "$SUPABASE_PROJECT_REF" ]; then
    echo "❌ 请设置环境变量 SUPABASE_PROJECT_REF"
    echo "   获取方式: Supabase Dashboard -> Project Settings -> General"
    exit 1
fi

supabase link --project-ref "$SUPABASE_PROJECT_REF"

# 部署所有函数
functions=(
    "init-db"
    "admin-login"
    "admin-users"
    "user-history"
    "admin-compare"
    "admin-export"
    "save-health-record"
)

for func in "${functions[@]}"; do
    echo "部署函数: $func"
    supabase functions deploy "$func"
done

echo "✅ Edge Functions 部署完成"
echo ""

# 设置环境变量
echo "🔧 设置环境变量..."

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ 请设置环境变量 SUPABASE_URL"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ 请设置环境变量 SUPABASE_ANON_KEY"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ 请设置环境变量 SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

supabase secrets set SUPABASE_URL="$SUPABASE_URL"
supabase secrets set SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

echo "✅ 环境变量设置完成"
echo ""

# 初始化数据库
echo "🗄️  初始化数据库..."

read -p "是否要初始化数据库? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    curl "${SUPABASE_URL}/functions/v1/init-db?key=init-health-system-2025"

    echo ""
    echo "✅ 数据库初始化完成"
else
    echo "⏭️  跳过数据库初始化"
fi

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""
echo "📝 下一步操作:"
echo ""
echo "1. 更新 Cloudflare Pages 环境变量:"
echo "   - NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_APP_URL=https://health-system-v2.pages.dev"
echo "   - NEXT_PUBLIC_API_URL=${SUPABASE_URL}/functions/v1"
echo ""
echo "2. 部署前端到 Cloudflare Pages:"
echo "   - 方法 1: 通过 Cloudflare Dashboard 上传 .next 目录"
echo "   - 方法 2: 使用 wrangler pages deploy .next"
echo ""
echo "3. 访问应用:"
echo "   - 前端: https://health-system-v2.pages.dev"
echo "   - 后台: https://health-system-v2.pages.dev/admin/dashboard"
echo "   - 登录: admin / admin123"
echo ""
echo "📚 详细文档: 查看 DEPLOYMENT.md"
echo ""
