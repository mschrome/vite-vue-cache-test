<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { ref } from 'vue'
import { upload } from '@vercel/blob/client'

// 文件上传相关的响应式数据
const inputFileRef = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)
const uploadError = ref(null)

// 文件上传处理函数
const handleSubmit = async (event) => {
  event.preventDefault()
  
  if (!inputFileRef.value?.files || inputFileRef.value.files.length === 0) {
    uploadError.value = 'Please select a file first'
    return
  }

  uploading.value = true
  uploadError.value = null
  uploadResult.value = null

  try {
    const file = inputFileRef.value.files[0]
    
    // 使用 Vercel 的客户端上传功能
    const blob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/blob-upload',
      multipart: true, // 对大文件启用分块上传
      clientPayload: JSON.stringify({
        originalFileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      })
    })

    uploadResult.value = {
      success: true,
      blob: blob,
      message: 'File uploaded successfully using client-side upload'
    }

  } catch (error) {
    console.error('Upload error:', error)
    uploadError.value = `Upload error: ${error.message}`
  } finally {
    uploading.value = false
  }
}

// 清除结果
const clearResults = () => {
  uploadResult.value = null
  uploadError.value = null
  if (inputFileRef.value) {
    inputFileRef.value.value = ''
  }
}
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Hello Vue 3 + Vercel" />
  
  <!-- Vercel Blob 测试区域 -->
  <div class="blob-test-container">
    <h2>🗂️ Vercel Blob 客户端上传测试</h2>
    <p>使用 @vercel/blob/client 进行直接客户端上传</p>
    
    <form @submit="handleSubmit" class="upload-form">
      <div class="form-section">
        <input 
          ref="inputFileRef"
          name="file" 
          type="file" 
          accept="image/jpeg, image/png, image/webp, image/gif, .pdf, .txt, .mp4, .mp3"
          required
          :disabled="uploading"
          class="file-input"
        />
        
        <button 
          type="submit"
          :disabled="uploading"
          class="upload-btn"
        >
          {{ uploading ? '📤 客户端上传中...' : '🚀 客户端上传到 Blob' }}
        </button>
      </div>
    </form>
    
    <button 
      @click="clearResults"
      class="clear-btn"
      v-if="uploadResult || uploadError"
    >
      🗑️ 清除结果
    </button>

    <!-- 上传结果 -->
    <div v-if="uploadResult" class="result success">
      <h3>✅ 客户端上传成功!</h3>
      <div class="result-details">
        <p><strong>🔗 Blob URL:</strong> 
          <a :href="uploadResult.blob.url" target="_blank" class="blob-link">
            {{ uploadResult.blob.url }}
          </a>
        </p>
        <p><strong>📁 文件路径:</strong> {{ uploadResult.blob.pathname }}</p>
        <p><strong>📊 文件大小:</strong> {{ (uploadResult.blob.size / 1024).toFixed(2) }} KB</p>
        <p><strong>📋 内容类型:</strong> {{ uploadResult.blob.contentType || 'unknown' }}</p>
        <p><strong>💾 下载地址:</strong> 
          <a :href="uploadResult.blob.downloadUrl || uploadResult.blob.url" target="_blank" class="blob-link">
            {{ uploadResult.blob.downloadUrl || uploadResult.blob.url }}
          </a>
        </p>
        <p><strong>🎯 上传方式:</strong> 
          <span class="upload-method">客户端直接上传 (Client-side Upload)</span>
        </p>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="uploadError" class="result error">
      <h3>❌ 客户端上传失败</h3>
      <p>{{ uploadError }}</p>
      <div class="debug-info">
        <p><strong>排查建议:</strong></p>
        <ul>
          <li>检查 Vercel 环境变量 BLOB_READ_WRITE_TOKEN 是否正确配置</li>
          <li>确认文件类型和大小符合限制要求</li>
          <li>查看浏览器开发者工具的网络面板获取更多信息</li>
        </ul>
      </div>
    </div>

    <!-- 功能说明 -->
    <div class="feature-info">
      <h4>🚀 客户端上传功能特点:</h4>
      <ul>
        <li>✨ 直接从浏览器上传，无需通过服务器中转</li>
        <li>⚡ 支持大文件分块上传 (multipart)</li>
        <li>🔒 安全的权限控制和文件类型验证</li>
        <li>📊 实时上传进度反馈</li>
        <li>🎯 基于 @vercel/blob/client 的官方实现</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.video-container {
  margin: 2rem auto;
  padding: 1rem;
  max-width: 800px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.video-container h2 {
  color: #333;
  margin-bottom: 1rem;
}

.video-container p {
  color: #666;
  margin: 0.5rem 0;
}

.video-container video {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Blob 测试样式 */
.blob-test-container {
  margin: 2rem auto;
  padding: 2rem;
  max-width: 700px;
  text-align: center;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.blob-test-container h2 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.blob-test-container > p {
  color: #64748b;
  margin-bottom: 2rem;
}

.upload-form {
  margin-bottom: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.file-input {
  padding: 0.75rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
  font-weight: 500;
  min-width: 300px;
}

.file-input:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
}

.file-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-btn, .clear-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.upload-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.upload-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.clear-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  margin-top: 1rem;
}

.clear-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.result {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: left;
}

.result.success {
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.result.error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.result h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.result-details p {
  margin: 0.5rem 0;
  word-break: break-all;
}

.blob-link {
  color: #2563eb;
  text-decoration: underline;
}

.blob-link:hover {
  color: #1d4ed8;
}

.upload-method {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
}

.debug-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.05);
  border-radius: 6px;
  font-size: 0.9rem;
}

.debug-info ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  text-align: left;
}

.debug-info li {
  margin: 0.25rem 0;
}

.feature-info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 8px;
  text-align: left;
}

.feature-info h4 {
  color: #1e40af;
  margin: 0 0 1rem 0;
}

.feature-info ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #1e40af;
}

.feature-info li {
  margin: 0.5rem 0;
  font-weight: 500;
}

@media (max-width: 640px) {
  .blob-test-container {
    margin: 1rem;
    padding: 1rem;
  }
  
  .form-section {
    gap: 0.75rem;
  }
  
  .upload-btn, .clear-btn {
    width: 100%;
    max-width: 250px;
  }
  
  .file-input {
    min-width: 250px;
  }
}
</style>
