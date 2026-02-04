#!/bin/bash
# Next.js API 路由修复验证脚本

set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
PORT=5000

cd "${COZE_WORKSPACE_PATH}"

echo "======================================"
echo "Next.js API 路由修复验证"
echo "======================================"
echo ""

# 1. 检查 next.config.mjs 配置
echo "1. 检查 next.config.mjs 配置..."
if grep -q "output: 'export'" next.config.mjs; then
    echo "   ❌ 错误：next.config.mjs 中存在 output: 'export' 配置"
    echo "   这个配置会禁用 API 路由，必须移除！"
    exit 1
else
    echo "   ✅ 正确：next.config.mjs 中没有 output: 'export' 配置"
fi
echo ""

# 2. 检查 API 路由文件
echo "2. 检查 API 路由文件..."
if [ -f "src/app/api/admin/login/route.ts" ]; then
    echo "   ✅ 登录接口文件存在：src/app/api/admin/login/route.ts"
else
    echo "   ❌ 错误：登录接口文件不存在：src/app/api/admin/login/route.ts"
    exit 1
fi
echo ""

# 3. 检查 Next.js 版本
echo "3. 检查 Next.js 版本..."
NEXT_VERSION=$(pnpm list next --depth=0 | grep next | awk '{print $2}' | sed 's/,//')
echo "   当前版本：next@${NEXT_VERSION}"

# 提取主版本号
MAJOR_VERSION=$(echo $NEXT_VERSION | cut -d. -f1)
if [ "$MAJOR_VERSION" -lt 13 ]; then
    echo "   ❌ 错误：Next.js 版本过低（需要 >= 13.0.0）"
    exit 1
else
    echo "   ✅ 正确：Next.js 版本支持 App Router（>= 13.0.0）"
fi
echo ""

# 4. 检查构建产物
echo "4. 检查构建产物..."
if [ -d ".next/server/app/api" ]; then
    echo "   ✅ API 路由构建产物存在：.next/server/app/api/"

    if [ -f ".next/server/app/api/admin/login/route.js" ] || [ -f ".next/server/app/api/admin/login/route.mjs" ]; then
        echo "   ✅ 登录接口已编译：.next/server/app/api/admin/login/route.*"
    else
        echo "   ⚠️  警告：登录接口未编译（需要重新构建）"
        echo "   执行：pnpm run build"
    fi
else
    echo "   ⚠️  警告：API 路由构建产物不存在（需要重新构建）"
    echo "   执行：pnpm run build"
fi
echo ""

# 5. 测试本地接口（如果服务正在运行）
echo "5. 测试本地接口..."
if curl -s http://localhost:${PORT} > /dev/null 2>&1; then
    echo "   服务正在运行，测试 API 接口..."

    RESPONSE=$(curl -s -X POST http://localhost:${PORT}/api/admin/login \
        -H "Content-Type: application/json" \
        -d '{"username":"test","password":"test"}')

    if echo "$RESPONSE" | grep -q "success"; then
        echo "   ✅ API 接口正常工作（返回 JSON 响应）"
    else
        echo "   ❌ 错误：API 接口未正常工作"
        echo "   响应：$RESPONSE"
    fi
else
    echo "   服务未运行，跳过接口测试"
    echo "   启动服务：pnpm start"
fi
echo ""

echo "======================================"
echo "修复验证完成"
echo "======================================"
echo ""
echo "下一步："
echo "1. 重新构建项目：pnpm run build"
echo "2. 启动服务：pnpm start"
echo "3. 测试接口：curl -X POST http://localhost:5000/api/admin/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
