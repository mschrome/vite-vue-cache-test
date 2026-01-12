# EdgeOne Pages Webhook Handler

这是一个用于接收和处理 EdgeOne Pages webhook 事件的 Node Function。

## ⚠️ 当前版本：调试模式

**当前版本已优化用于调试：**
- ✅ **详细日志输出**：记录所有请求细节
- ✅ **签名验证已放宽**：即使签名无效也会继续处理（仅警告）
- ✅ **支持 GET 请求**：用于健康检查
- ✅ **宽松的错误处理**：即使缺少字段也会尝试处理
- ✅ **完整的调试信息**：响应中包含 debug 字段

**生产环境部署前记得：**
- 🔒 启用严格的签名验证
- 🚫 移除 GET 请求支持
- 📝 简化日志输出（避免记录敏感信息）

## 📍 API 端点

```
GET  /webhooks/edgeone  (健康检查)
POST /webhooks/edgeone  (接收 webhook)
```

## 🎯 支持的事件类型

### 部署事件 (Deployment Events)

- `deployment.created` - 部署创建时触发

### 项目事件 (Project Events)

- `project.created` - 项目创建时触发

### 域名事件 (Domain Events)

- `domain.added` - 域名添加时触发

## 🔒 安全配置

### 启用 Bearer Token 鉴权

EdgeOne Pages webhook 使用 Bearer Token 进行身份验证：

1. **在 EdgeOne Pages 控制台获取 Webhook Token**
   - Token 长度：8-128 位字符串

2. **在项目中设置环境变量：**

```bash
WEBHOOK_TOKEN=your_webhook_token_here
```

或使用：

```bash
WEBHOOK_SECRET=your_webhook_token_here  # 也支持这个变量名
```

3. **EdgeOne Pages 会在请求头中发送 Bearer Token：**

```
Authorization: Bearer <your-token>
```

函数会自动验证 token 的有效性。如果未配置 `WEBHOOK_TOKEN`，则跳过验证（仅用于测试环境）。

## 📦 Webhook Payload 示例

### 部署创建事件 (deployment.created)

```json
{
  "eventType": "deployment.created",
  "appId": "1234567890",
  "projectId": "prj_abc123xyz456",
  "deploymentId": "dpl_deployment123",
  "projectName": "my-awesome-project",
  "repoBranch": "main",
  "gitCommit": "abc123def456789",
  "env": "production",
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

### 项目创建事件 (project.created)

```json
{
  "eventType": "project.created",
  "appId": "1234567890",
  "projectId": "prj_new123xyz456",
  "projectName": "new-awesome-project",
  "repoUrl": "https://github.com/myorg/my-awesome-project",
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

### 域名添加事件 (domain.added)

```json
{
  "eventType": "domain.added",
  "appId": "1234567890",
  "projectId": "prj_abc123xyz456",
  "domainName": "www.example.com",
  "domainId": "domain_123456",
  "projectName": "my-awesome-project",
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

## 🧪 测试 Webhook

### 🚀 快速调试（推荐）

**步骤 1: 启动本地服务器**
```bash
npm run dev:functions
```

**步骤 2: 使用测试脚本**
```bash
# 快速测试（最简单）
./test-webhook-simple.sh

# 完整测试（所有场景）
./test-webhook.sh local
```

**步骤 3: 查看日志**
- 所有请求细节会打印在 Node Functions 服务器的控制台
- 响应中包含 `debug` 字段，显示处理信息

### 📊 调试检查清单

如果遇到 400/500 错误，按顺序检查：

1. **检查请求方法**
   ```bash
   # 先用 GET 测试连通性
   curl http://localhost:8788/webhooks/edgeone
   ```

2. **检查 JSON 格式和 Token**
   ```bash
   # 最简单的 POST 请求
   curl -X POST http://localhost:8788/webhooks/edgeone \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer test-token-12345678" \
     -d '{"eventType":"deployment.created","appId":"123","projectId":"prj_test"}'
   ```

3. **查看服务器日志**
   - 日志会显示接收到的完整请求信息
   - 包括 headers、body、解析结果等

4. **检查 Content-Type**
   - 必须设置 `Content-Type: application/json`

### 方法 1: 使用测试页面

访问项目内置的测试页面：

```
https://your-domain.com/test-webhook.html
```

这个页面提供了：
- 预置的事件模板
- 可视化的请求发送
- 实时响应展示

### 方法 2: 使用 cURL

```bash
# 部署创建事件
curl -X POST https://your-domain.com/webhooks/edgeone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_TOKEN" \
  -d '{
    "eventType": "deployment.created",
    "appId": "1234567890",
    "projectId": "prj_abc123xyz456",
    "deploymentId": "dpl_deployment123",
    "projectName": "my-awesome-project",
    "repoBranch": "main",
    "gitCommit": "abc123def456789",
    "env": "production",
    "timestamp": "2025-01-08T10:30:00.000Z"
  }'
```

### 方法 3: 测试生产环境

```bash
# 修改脚本中的域名和 token 后运行
./test-webhook.sh production

# 或直接用 curl
curl -X POST https://your-domain.com/webhooks/edgeone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_TOKEN" \
  -d '{"eventType":"deployment.created","appId":"123","projectId":"prj_test","projectName":"test"}'
```

## 📊 响应格式

### 成功响应 (200)

```json
{
  "success": true,
  "eventType": "deployment.created",
  "result": {
    "message": "Deployment created event processed",
    "appId": "1234567890",
    "projectId": "prj_abc123xyz456",
    "deploymentId": "dpl_deployment123",
    "projectName": "my-awesome-project",
    "repoBranch": "main",
    "gitCommit": "abc123def456789",
    "env": "production",
    "timestamp": "2025-01-08T10:30:00.000Z"
  },
  "timestamp": "2025-01-08T10:30:05.000Z",
  "debug": {
    "bodyLength": 234,
    "payloadKeys": ["eventType", "appId", "projectId", "deploymentId"],
    "hasAuthHeader": true,
    "authMethod": "Bearer Token"
  }
}
```

### 错误响应

```json
{
  "error": "Bad request",
  "message": "Missing event type in payload",
  "timestamp": "2025-01-08T10:30:00.000Z"
}
```

## 🔧 自定义处理逻辑

在 `edgeone.js` 文件的 `handleWebhookEvent` 函数中，你可以为每种事件类型添加自定义处理逻辑：

```javascript
'deployment.created': (data) => {
  // 添加你的自定义逻辑
  console.log(`🚀 Deployment created for project: ${data.projectName}`);
  console.log(`   - Branch: ${data.repoBranch}`);
  console.log(`   - Commit: ${data.gitCommit}`);
  
  // 例如：发送通知到 Slack/Discord
  // await sendSlackNotification({
  //   text: `New deployment for ${data.projectName} on ${data.repoBranch}`
  // });
  
  // 例如：更新数据库
  // await db.deployments.create({
  //   deploymentId: data.deploymentId,
  //   projectId: data.projectId,
  //   branch: data.repoBranch,
  //   commit: data.gitCommit
  // });
  
  return {
    message: 'Deployment created event processed',
    appId: data.appId,
    projectId: data.projectId,
    deploymentId: data.deploymentId,
    projectName: data.projectName
  };
}
```

## 🚀 部署到生产环境

1. **配置环境变量：**
   - 在 EdgeOne Pages 控制台设置 `WEBHOOK_TOKEN`
   - Token 长度：8-128 位字符串

2. **部署项目：**
   ```bash
   git add .
   git commit -m "feat: add webhook handler"
   git push
   ```

3. **在 EdgeOne Pages 控制台配置 Webhook：**
   - Webhook URL: `https://your-domain.com/webhooks/edgeone`
   - 回调地址填写上面的 URL
   - 配置秘钥令牌（8-128 位），平台会在 `Authorization: Bearer <token>` 头部发送
   - 选择需要监听的事件类型：
     - deployment.created
     - project.created
     - domain.added

## 📝 日志和调试

所有 webhook 事件都会在服务器日志中记录，包括：
- 事件类型
- 时间戳
- 完整的 payload 数据
- 处理结果

你可以在 EdgeOne Pages 控制台的日志面板中查看这些信息。

## 🔗 相关文档

- [Vercel Webhooks 文档](https://vercel.com/docs/webhooks)
- [EdgeOne Pages Node Functions 文档](https://pages.edgeone.ai/document/product-introduction)
- [HMAC 签名验证说明](https://en.wikipedia.org/wiki/HMAC)

## 💡 常见问题

### Q: 为什么我的 webhook 返回警告但仍然处理成功？

A: 当前版本处于调试模式，即使 Bearer token 验证失败也会继续处理请求（仅记录警告）。这是为了方便调试。

### Q: 如何在本地测试 Bearer Token 验证？

A: 在请求头中添加 Authorization header：

```bash
curl -X POST http://localhost:8788/webhooks/edgeone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-test-token-here" \
  -d '{"eventType":"deployment.created","appId":"123","projectId":"prj_test"}'
```

### Q: 支持其他事件类型吗？

A: 可以！只需在 `handleWebhookEvent` 函数中添加新的事件处理器即可。当前支持：
- `deployment.created`
- `project.created`
- `domain.added`

### Q: eventType 字段是必须的吗？

A: 函数会尝试从 `eventType`、`type` 或 `event` 字段中提取事件类型。如果都没有，会使用 "unknown" 并继续处理。

### Q: 我需要配置 WEBHOOK_TOKEN 吗？

A: 调试阶段可以不配置，函数会跳过验证。生产环境强烈建议配置以确保安全。

## 📄 许可证

MIT

