#!/bin/bash

# EdgeOne Pages Node Functions 诊断脚本

echo "🔍 EdgeOne Pages Node Functions 诊断工具"
echo "========================================"
echo ""

# 检查文件是否存在
echo "📁 检查测试文件..."
files=(
  "public/assets/config.json"
  "public/assets/data.md"
  "public/assets2/secret.txt"
  "public/assets2/metadata.json"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (不存在)"
  fi
done

echo ""
echo "📦 检查 Node Functions..."
functions=(
  "node-functions/test-included-files.js"
  "node-functions/test-external-modules.js"
  "node-functions/test-captcha.js"
  "node-functions/test-koa-server.js"
  "node-functions/debug-filesystem.js"
)

for func in "${functions[@]}"; do
  if [ -f "$func" ]; then
    echo "  ✅ $func"
  else
    echo "  ❌ $func (不存在)"
  fi
done

echo ""
echo "⚙️  检查配置文件..."
if [ -f "edgeone.json" ]; then
  echo "  ✅ edgeone.json 存在"
  echo ""
  echo "  📄 edgeone.json 内容："
  cat edgeone.json | grep -A 20 "node-function" || echo "  ⚠️  未找到 node-function 配置"
else
  echo "  ❌ edgeone.json 不存在"
fi

echo ""
echo "📦 检查依赖..."
required_packages=(
  "koa"
  "@koa/router"
  "@koa/bodyparser"
  "koa-json"
  "koa-compose"
  "svg-captcha"
)

if [ -f "package.json" ]; then
  echo "  ✅ package.json 存在"
  for package in "${required_packages[@]}"; do
    if grep -q "\"$package\"" package.json; then
      echo "    ✅ $package"
    else
      echo "    ❌ $package (未安装)"
    fi
  done
else
  echo "  ❌ package.json 不存在"
fi

echo ""
echo "🧪 测试建议："
echo "  1️⃣  先运行调试工具查看文件系统："
echo "     curl http://localhost:8088/debug-filesystem"
echo ""
echo "  2️⃣  测试文件读取："
echo "     curl http://localhost:8088/test-included-files?file=config.json"
echo ""
echo "  3️⃣  在浏览器中打开："
echo "     http://localhost:8088/test-node-functions.html"
echo ""
echo "✅ 诊断完成！"
