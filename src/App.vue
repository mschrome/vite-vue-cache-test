<script setup>
import HelloWorld from './components/HelloWorld.vue'
import { ref } from 'vue'

// 文件上传相关的响应式数据
const selectedFile = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)
const uploadError = ref(null)

// 文件选择处理函数
const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0]
  uploadResult.value = null
  uploadError.value = null
}

// 文件上传处理函数
const uploadFile = async () => {
  if (!selectedFile.value) {
    uploadError.value = 'Please select a file first'
    return
  }

  uploading.value = true
  uploadError.value = null

  try {
    const filename = selectedFile.value.name
    const response = await fetch(`/api/blob-upload?filename=${encodeURIComponent(filename)}`, {
      method: 'POST',
      body: selectedFile.value,
    })

    const result = await response.json()

    if (response.ok) {
      uploadResult.value = result
    } else {
      uploadError.value = result.error || 'Upload failed'
    }
  } catch (error) {
    uploadError.value = `Upload error: ${error.message}`
  } finally {
    uploading.value = false
  }
}

// 清除结果
const clearResults = () => {
  selectedFile.value = null
  uploadResult.value = null
  uploadError.value = null
  // 清除文件输入
  const fileInput = document.getElementById('fileInput')
  if (fileInput) fileInput.value = ''
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
    <h2>🗂️ Vercel Blob 存储测试</h2>
    <p>测试文件上传到 Vercel Blob 存储</p>
    
    <div class="upload-section">
      <div class="file-input-wrapper">
        <input 
          id="fileInput"
          type="file" 
          @change="handleFileSelect"
          :disabled="uploading"
          class="file-input"
        />
        <label for="fileInput" class="file-input-label">
          📁 {{ selectedFile ? selectedFile.name : '选择文件' }}
        </label>
      </div>
      
      <button 
        @click="uploadFile"
        :disabled="!selectedFile || uploading"
        class="upload-btn"
      >
        {{ uploading ? '📤 上传中...' : '🚀 上传到 Blob' }}
      </button>
      
      <button 
        @click="clearResults"
        class="clear-btn"
        v-if="uploadResult || uploadError"
      >
        🗑️ 清除
      </button>
    </div>

    <!-- 上传结果 -->
    <div v-if="uploadResult" class="result success">
      <h3>✅ 上传成功!</h3>
      <div class="result-details">
        <p><strong>文件名:</strong> {{ uploadResult.blob.pathname }}</p>
        <p><strong>URL:</strong> 
          <a :href="uploadResult.blob.url" target="_blank" class="blob-link">
            {{ uploadResult.blob.url }}
          </a>
        </p>
        <p><strong>大小:</strong> {{ (uploadResult.blob.size / 1024).toFixed(2) }} KB</p>
        <p><strong>类型:</strong> {{ uploadResult.blob.contentType }}</p>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="uploadError" class="result error">
      <h3>❌ 上传失败</h3>
      <p>{{ uploadError }}</p>
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
  max-width: 600px;
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

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.file-input-label {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #ffffff;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #475569;
  font-weight: 500;
  min-width: 200px;
}

.file-input-label:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
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

@media (max-width: 640px) {
  .blob-test-container {
    margin: 1rem;
    padding: 1rem;
  }
  
  .upload-section {
    gap: 0.75rem;
  }
  
  .upload-btn, .clear-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>
