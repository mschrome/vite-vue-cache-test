# Koa Application for EdgeOne Pages

## 📋 说明

此目录包含一个符合 EdgeOne Pages 规范的 Koa 应用。

根据 EdgeOne Pages 的要求：
- ✅ 使用 `[[default]].js` 文件名
- ✅ 导出 Koa app 实例
- ✅ 无需额外的 HTTP Server 处理
- ✅ 访问路径自动添加目录前缀

## 🌐 访问路径

由于文件位于 `node-functions/koa/[[default]].js`，所有路由会自动添加 `/koa` 前缀：

### 基础路由
```bash
# 服务器信息
GET http://localhost:8088/koa

# 测试所有外部模块
GET http://localhost:8088/koa/test-modules

# 测试特定模块
GET http://localhost:8088/koa/test-modules?module=koa
GET http://localhost:8088/koa/test-modules?module=router
GET http://localhost:8088/koa/test-modules?module=captcha
```

### API 路由
```bash
# Hello 端点
GET http://localhost:8088/koa/api/hello

# Echo 端点（POST）
POST http://localhost:8088/koa/api/echo
Content-Type: application/json

{
  "message": "Hello EdgeOne Pages!",
  "test": true
}

# 配置信息
GET http://localhost:8088/koa/api/config
```

## 🧪 测试示例

### 1. 测试服务器状态
```bash
curl http://localhost:8088/koa
```

### 2. 测试所有外部模块
```bash
curl http://localhost:8088/koa/test-modules
```

### 3. 测试特定模块
```bash
# 测试 Koa
curl http://localhost:8088/koa/test-modules?module=koa

# 测试 Router
curl http://localhost:8088/koa/test-modules?module=router

# 测试 SVG Captcha
curl http://localhost:8088/koa/test-modules?module=captcha
```

### 4. 测试 API 端点
```bash
# Hello API
curl http://localhost:8088/koa/api/hello

# Echo API
curl -X POST http://localhost:8088/koa/api/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message", "timestamp": "2024-12-17"}'

# Config API
curl http://localhost:8088/koa/api/config
```

## 📦 使用的外部模块

此应用使用以下外部模块（已在 `edgeone.json` 中配置）：

- `koa` - Koa 框架
- `@koa/router` - 路由中间件
- `@koa/bodyparser` - Body 解析中间件
- `koa-json` - JSON 格式化中间件
- `koa-compose` - 中间件组合
- `svg-captcha` - SVG 验证码生成

## 🔧 edgeone.json 配置

确保 `edgeone.json` 中包含以下配置：

```json
{
  "node-function": {
    "external_node_modules": [
      "@koa/bodyparser",
      "@koa/router",
      "koa",
      "koa-body",
      "koa-compose",
      "koa-json",
      "svg-captcha"
    ]
  }
}
```

## 🚀 启动服务器

```bash
# 启动 Functions 服务器
npm run dev:functions

# 或者
edgeone pages dev
```

## 📝 代码结构

```
node-functions/
└── koa/
    ├── [[default]].js    ← Koa 应用（自动匹配 /koa 路径）
    └── README.md         ← 本文档
```

## 💡 关键特性

### 1. 符合 EdgeOne Pages 规范
- 使用 `[[default]].js` 文件名
- 导出 Koa app 实例：`export default app`
- 无需手动创建 HTTP Server

### 2. 完整的中间件配置
- JSON 格式化（koa-json）
- Body 解析（@koa/bodyparser）
- 路由处理（@koa/router）
- 中间件组合（koa-compose）

### 3. 统一的功能
- 外部模块测试功能
- 完整的 API 示例
- 错误处理机制

## 🔍 调试

如果遇到问题：

1. **检查服务器日志**
   查看 Functions 服务器的 Console 输出

2. **验证配置**
   ```bash
   ./verify-config.sh
   ```

3. **测试路由**
   ```bash
   # 应该返回服务器信息
   curl http://localhost:8088/koa
   ```

4. **检查模块导入**
   ```bash
   # 应该显示所有模块测试通过
   curl http://localhost:8088/koa/test-modules
   ```

## 📚 参考资料

- [EdgeOne Pages 文档](https://pages.edgeone.ai/document/product-introduction)
- [Koa 官方文档](https://koajs.com/)
- [Koa Router 文档](https://github.com/koajs/router)

## ✅ 预期响应

### GET /koa
```json
{
  "success": true,
  "message": "✅ Koa server running with external modules",
  "server": "EdgeOne Pages Node Function",
  "framework": "Koa",
  "modules": [
    "koa",
    "@koa/router",
    "@koa/bodyparser",
    "koa-json",
    "koa-compose",
    "svg-captcha"
  ],
  "routes": [
    "GET  /",
    "GET  /test-modules",
    "GET  /api/hello",
    "POST /api/echo",
    "GET  /api/config"
  ],
  "timestamp": "2024-12-17T..."
}
```

### GET /koa/test-modules
```json
{
  "success": true,
  "message": "✅ All external modules working correctly!",
  "timestamp": "2024-12-17T...",
  "tests": {
    "koa": {
      "success": true,
      "message": "✅ Koa imported successfully"
    },
    "@koa/router": {
      "success": true,
      "message": "✅ @koa/router imported and configured"
    },
    "svg-captcha": {
      "success": true,
      "message": "✅ svg-captcha generated successfully"
    }
  },
  "summary": {
    "total": 6,
    "passed": 6,
    "failed": 0,
    "successRate": "100.00%"
  }
}
```
