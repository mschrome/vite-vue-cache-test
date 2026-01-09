# EdgeOne Pages Webhook Handler

这是一个用于接收和处理 EdgeOne Pages webhook 事件的 Node Function。

## 📍 API 端点

```
POST /webhooks/edgeone
```

## 🎯 支持的事件类型

### 部署事件 (Deployment Events)

- `deployment.created` - 部署创建时触发
- `deployment.succeeded` - 部署成功时触发
- `deployment.promoted` - 部署被提升为生产环境时触发
- `deployment.error` - 部署失败时触发
- `deployment.cancelled` - 部署被取消时触发

### 项目事件 (Project Events)

- `project.created` - 项目创建时触发
- `project.removed` - 项目删除时触发
- `project.renamed` - 项目重命名时触发

## 🔒 安全配置

### 启用签名验证

为了确保 webhook 请求的安全性，建议配置签名验证：

1. **在 EdgeOne Pages 控制台生成 Webhook Secret**
2. **在项目中设置环境变量：**

```bash
WEBHOOK_SECRET=your_webhook_secret_here
```

3. **EdgeOne Pages 会在请求头中发送签名：**

```
x-edgeone-signature: <hmac-sha256-signature>
```

函数会自动验证签名的有效性。如果未配置 `WEBHOOK_SECRET`，则跳过签名验证（仅用于测试环境）。

## 📦 Webhook Payload 示例

### 部署成功事件

```json
{
  "type": "deployment.succeeded",
  "createdAt": "2025-01-08T10:30:00.000Z",
  "team": {
    "id": "team_abc123",
    "name": "My Team",
    "slug": "my-team"
  },
  "project": {
    "id": "prj_xyz789",
    "name": "my-project"
  },
  "deployment": {
    "id": "dpl_def456",
    "url": "my-project-abc123.edgeone-pages.com",
    "name": "my-project",
    "meta": {
      "githubCommitRef": "main",
      "githubCommitSha": "abc123def456",
      "githubCommitMessage": "feat: add new feature",
      "githubCommitAuthorName": "Developer"
    },
    "buildDuration": 45000,
    "creator": {
      "uid": "user_123",
      "username": "developer"
    }
  }
}
```

### 项目重命名事件

```json
{
  "type": "project.renamed",
  "createdAt": "2025-01-08T10:30:00.000Z",
  "team": {
    "id": "team_abc123",
    "name": "My Team"
  },
  "project": {
    "id": "prj_xyz789",
    "name": "new-project-name",
    "oldName": "old-project-name"
  }
}
```

## 🧪 测试 Webhook

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
# 部署成功事件
curl -X POST https://your-domain.com/webhooks/edgeone \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deployment.succeeded",
    "createdAt": "2025-01-08T10:30:00.000Z",
    "deployment": {
      "url": "my-project-abc123.edgeone-pages.com",
      "buildDuration": 45000
    }
  }'
```

### 方法 3: 本地测试

```bash
# 1. 启动 Node Functions 开发服务器
npm run dev:functions

# 2. 发送测试请求
curl -X POST http://localhost:8788/webhooks/edgeone \
  -H "Content-Type: application/json" \
  -d '{"type":"deployment.succeeded","deployment":{"url":"test.com"}}'
```

## 📊 响应格式

### 成功响应 (200)

```json
{
  "success": true,
  "eventType": "deployment.succeeded",
  "result": {
    "message": "Deployment succeeded event processed",
    "deployment": "my-project-abc123.edgeone-pages.com",
    "duration": 45000
  },
  "timestamp": "2025-01-08T10:30:00.000Z"
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
'deployment.succeeded': (data) => {
  // 添加你的自定义逻辑
  console.log(`✅ Deployment succeeded: ${data.deployment?.url}`);
  
  // 例如：发送通知到 Slack/Discord
  // await sendSlackNotification(data);
  
  // 例如：更新数据库
  // await updateDeploymentStatus(data);
  
  return {
    message: 'Deployment succeeded event processed',
    deployment: data.deployment?.url
  };
}
```

## 🚀 部署到生产环境

1. **配置环境变量：**
   - 在 EdgeOne Pages 控制台设置 `WEBHOOK_SECRET`

2. **部署项目：**
   ```bash
   git add .
   git commit -m "feat: add webhook handler"
   git push
   ```

3. **在 EdgeOne Pages 控制台配置 Webhook：**
   - Webhook URL: `https://your-domain.com/webhooks/edgeone`
   - 选择需要监听的事件类型
   - 保存配置并记录生成的 Secret

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

### Q: 为什么我的 webhook 返回 401 错误？

A: 检查是否正确配置了 `WEBHOOK_SECRET` 环境变量，以及 EdgeOne Pages 发送的签名是否正确。

### Q: 如何在本地测试签名验证？

A: 你需要手动计算 HMAC-SHA256 签名并添加到请求头中：

```javascript
const crypto = require('crypto');
const payload = JSON.stringify({type: "deployment.succeeded"});
const secret = "your_secret";
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

// 然后在请求头中添加: x-edgeone-signature: <signature>
```

### Q: 支持其他事件类型吗？

A: 可以！只需在 `handleWebhookEvent` 函数中添加新的事件处理器即可。

## 📄 许可证

MIT

