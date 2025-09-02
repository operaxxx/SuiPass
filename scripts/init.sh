#!/bin/bash

# SuiPass 项目初始化脚本
# 使用方法: ./scripts/init.sh

set -e

echo "🚀 初始化 SuiPass 项目..."

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 请先安装 Node.js (>=18.0.0)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误: Node.js 版本必须 >= 18.0.0"
    exit 1
fi

# 安装根目录依赖
echo "📦 安装根目录依赖..."
pnpm install

# 安装所有 workspace 依赖
echo "📦 安装 workspace 依赖..."
pnpm bootstrap

# 初始化 Git hooks
echo "🪝 初始化 Git hooks..."
pnpm prepare

# 创建环境变量文件示例
if [ ! -f packages/frontend/.env.example ]; then
    echo "📝 创建环境变量示例..."
    cat > packages/frontend/.env.example << EOL
# Sui Network Configuration
VITE_SUI_NETWORK=mainnet
VITE_SUI_RPC_URL=https://sui.mainnet.rpc

# Walrus Configuration
VITE_WALRUS_RPC_URL=https://walrus.mainnet.rpc

# Analytics (Optional)
VITE_ANALYTICS_ID=

# Feature Flags
VITE_ENABLE_ZKLOGIN=true
VITE_ENABLE_LOCAL_MODE=true
EOL
fi

# 创建 .env 文件（如果不存在）
if [ ! -f packages/frontend/.env ]; then
    echo "📝 创建 .env 文件..."
    cp packages/frontend/.env.example packages/frontend/.env
fi

# 创建本地开发配置
echo "⚙️ 创建本地开发配置..."
cat > packages/frontend/.env.development << EOL
VITE_SUI_NETWORK=local
VITE_SUI_RPC_URL=http://127.0.0.1:9000
VITE_WALRUS_RPC_URL=http://127.0.0.1:9001
VITE_ENABLE_ZKLOGIN=true
VITE_ENABLE_LOCAL_MODE=true
EOL

echo "✅ 初始化完成！"
echo ""
echo "下一步："
echo "1. 查看 README.md 了解项目结构"
echo "2. 运行 'pnpm dev' 启动开发服务器"
echo "3. 运行 'pnpm contract:test' 测试智能合约"
echo ""
echo "📚 文档："
echo "- 产品需求：docs/PRD.md"
echo "- 设计系统：docs/UI-UX-Design-System.md"
echo "- UI 原型：docs/UI-Prototype-Examples.md"