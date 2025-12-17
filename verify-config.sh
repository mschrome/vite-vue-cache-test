#!/bin/bash

# EdgeOne Pages 配置验证脚本

echo "🔍 EdgeOne Pages 配置验证"
echo "=========================================="
echo ""

# 1. 检查构建输出
echo "1️⃣  检查构建输出结构..."
if [ -d "dist" ]; then
  echo "  ✅ dist/ 目录存在"
  
  # 检查测试文件
  if [ -f "dist/assets/config.json" ]; then
    echo "  ✅ dist/assets/config.json 存在"
  else
    echo "  ❌ dist/assets/config.json 不存在"
    echo "     → 运行: npm run build"
  fi
  
  if [ -f "dist/assets/data.md" ]; then
    echo "  ✅ dist/assets/data.md 存在"
  else
    echo "  ❌ dist/assets/data.md 不存在"
  fi
  
  if [ -f "dist/assets2/secret.txt" ]; then
    echo "  ✅ dist/assets2/secret.txt 存在"
  else
    echo "  ❌ dist/assets2/secret.txt 不存在"
  fi
  
  if [ -f "dist/assets2/metadata.json" ]; then
    echo "  ✅ dist/assets2/metadata.json 存在"
  else
    echo "  ❌ dist/assets2/metadata.json 不存在"
  fi
  
  # 检查是否有 public 前缀（不应该有）
  if [ -d "dist/public" ]; then
    echo "  ⚠️  dist/public/ 存在（不应该存在）"
    echo "     → Vite 应该将 public/ 内容复制到 dist/ 根目录"
  else
    echo "  ✅ dist/public/ 不存在（正确）"
  fi
else
  echo "  ❌ dist/ 目录不存在"
  echo "     → 运行: npm run build"
fi

echo ""

# 2. 检查 edgeone.json 配置
echo "2️⃣  检查 edgeone.json 配置..."
if [ -f "edgeone.json" ]; then
  echo "  ✅ edgeone.json 存在"
  
  # 检查配置内容
  if grep -q '"assets/\*\*"' edgeone.json; then
    echo "  ✅ 配置包含 assets/**（正确）"
  else
    echo "  ❌ 配置不包含 assets/**"
  fi
  
  if grep -q '"assets2/\*\*"' edgeone.json; then
    echo "  ✅ 配置包含 assets2/**（正确）"
  else
    echo "  ❌ 配置不包含 assets2/**"
  fi
  
  if grep -q '"public/assets' edgeone.json; then
    echo "  ⚠️  配置包含 public/assets（可能错误）"
    echo "     → 应该是 assets/**，不是 public/assets/**"
    echo "     → 因为 dist/ 中没有 public/ 目录"
  else
    echo "  ✅ 配置不包含 public/ 前缀（正确）"
  fi
else
  echo "  ❌ edgeone.json 不存在"
fi

echo ""

# 3. 验证配置逻辑
echo "3️⃣  验证配置逻辑..."
echo "  📖 included_files 配置原则："
echo "     • 相对于 outputDirectory（默认是 dist/）"
echo "     • 不是相对于项目根目录"
echo "     • Vite 构建时 public/ → dist/（移除 public 前缀）"
echo ""
echo "  示例："
echo "     源文件: public/assets/config.json"
echo "     构建后: dist/assets/config.json"
echo "     配置:   \"assets/**\" ✅"
echo "     错误:   \"public/assets/**\" ❌"

echo ""

# 4. 构建和配置对比
echo "4️⃣  构建产物 vs 配置对比..."
if [ -d "dist" ]; then
  echo "  📁 dist/ 中的目录："
  ls -d dist/*/ 2>/dev/null | sed 's/dist\///g' | sed 's/^/     • /'
  
  echo ""
  echo "  ⚙️  edgeone.json 配置的路径："
  grep -A 5 'included_files' edgeone.json | grep '"' | sed 's/^/     • /'
  
  echo ""
  echo "  💡 配置路径应该匹配 dist/ 中的目录结构"
fi

echo ""

# 5. 测试建议
echo "5️⃣  测试建议..."
echo "  ✅ 配置验证完成后，执行："
echo ""
echo "     # 重启 Functions 服务器"
echo "     npm run dev:functions"
echo ""
echo "     # 测试文件读取"
echo "     curl http://localhost:8088/test-included-files?file=config.json"
echo ""
echo "     # 运行调试工具"
echo "     curl http://localhost:8088/debug-filesystem | jq .pathChecks"
echo ""
echo "     # 在浏览器中测试"
echo "     http://localhost:8088/test-node-functions.html"

echo ""
echo "=========================================="
echo "✅ 验证完成！"
echo ""
echo "📚 详细说明: CONFIGURATION_EXPLAINED.md"
