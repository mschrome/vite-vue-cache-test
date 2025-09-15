<script setup>
import HelloWorld from '../components/HelloWorld.vue'
import { ref, onMounted } from 'vue'
import { upload } from '@vercel/blob/client'

// 文件上传相关的响应式数据
const inputFileRef = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)
const uploadError = ref(null)
const uploadMode = ref('client') // 'client' or 'server'

// 资源列表相关的响应式数据
const blobList = ref([])
const loadingList = ref(false)
const listError = ref(null)
const selectedBlobs = ref([])
const deleting = ref(false)
const deleteError = ref(null)

// 当前标签页
const activeTab = ref('upload')

// 组件挂载时加载资源列表
onMounted(() => {
  loadBlobList()
})

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
    let result
    if (uploadMode.value === 'client') {
      // 客户端上传
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
        multipart: true,
        clientPayload: JSON.stringify({
          originalFileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString()
        })
      })
      result = {
        success: true,
        blob: blob,
        message: 'File uploaded successfully using client-side upload',
        mode: 'client'
      }
    } else {
      // 服务端上传
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/blob-server-upload', {
        method: 'POST',
        body: formData
      })
      result = await response.json()
      result.mode = 'server'
    }
    uploadResult.value = result
    // 上传成功后重新加载列表
    await loadBlobList()
  } catch (error) {
    uploadError.value = `Upload error: ${error.message}`
  } finally {
    uploading.value = false
  }
}

// 加载 Blob 列表
const loadBlobList = async () => {
  loadingList.value = true
  listError.value = null
  
  try {
    const response = await fetch('/api/blob-list')
    const result = await response.json()
    
    if (response.ok) {
      blobList.value = result.blobs || []
    } else {
      listError.value = result.error || 'Failed to load blob list'
    }
  } catch (error) {
    listError.value = `Failed to load blob list: ${error.message}`
  } finally {
    loadingList.value = false
  }
}

// 删除单个文件
const deleteBlob = async (url) => {
  if (!confirm('确定要删除这个文件吗？')) {
    return
  }
  
  deleting.value = true
  deleteError.value = null
  
  try {
    const response = await fetch(`/api/blob-delete?url=${encodeURIComponent(url)}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (response.ok) {
      // 删除成功，重新加载列表
      await loadBlobList()
    } else {
      deleteError.value = result.error || 'Failed to delete file'
    }
  } catch (error) {
    deleteError.value = `Delete error: ${error.message}`
  } finally {
    deleting.value = false
  }
}

// 批量删除选中的文件
const deleteSelectedBlobs = async () => {
  if (selectedBlobs.value.length === 0) {
    alert('请先选择要删除的文件')
    return
  }
  
  if (!confirm(`确定要删除 ${selectedBlobs.value.length} 个文件吗？`)) {
    return
  }
  
  deleting.value = true
  deleteError.value = null
  
  try {
    const response = await fetch('/api/blob-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urls: selectedBlobs.value
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      // 删除成功，清空选择并重新加载列表
      selectedBlobs.value = []
      await loadBlobList()
    } else {
      deleteError.value = result.error || 'Failed to delete files'
    }
  } catch (error) {
    deleteError.value = `Batch delete error: ${error.message}`
  } finally {
    deleting.value = false
  }
}

// 切换文件选择
const toggleBlobSelection = (url) => {
  const index = selectedBlobs.value.indexOf(url)
  if (index > -1) {
    selectedBlobs.value.splice(index, 1)
  } else {
    selectedBlobs.value.push(url)
  }
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedBlobs.value.length === blobList.value.length) {
    selectedBlobs.value = []
  } else {
    selectedBlobs.value = blobList.value.map(blob => blob.url)
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取文件类型图标
const getFileIcon = (contentType) => {
  if (contentType.startsWith('image/')) return '🖼️'
  if (contentType.startsWith('video/')) return '🎥'
  if (contentType.startsWith('audio/')) return '🎵'
  if (contentType.includes('pdf')) return '📄'
  if (contentType.startsWith('text/')) return '📝'
  return '📁'
}

// 清除上传结果
const clearUploadResults = () => {
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
      <img src="../assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  
  <!-- 简单导航入口 -->
  <nav class="app-nav">
    <router-link to="/">首页</router-link>
    <router-link to="/test">Test 页面</router-link>
  </nav>
  <HelloWorld msg="文件存储管理系统 new CLI" />
  
  <!-- EdgeOne Pages rewrite 测试链接 -->
  <div style="margin: 1rem 0; text-align: center;">
    <a href="/assets-test/hello.txt" target="_blank" style="color: #16a34a; text-decoration: underline;">
      🔁 测试 EdgeOne 重写：打开 /assets-test/hello.txt
    </a>
    <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem;">
      预期应加载自 <code>/assets-new/hello.txt</code>
    </p>
  </div>
  
  <!-- Vercel Blob 管理界面 -->
  <div class="blob-manager-container">
    <h2>🗂️ Vercel Blob 存储管理 2</h2>
    
    <!-- 标签页导航 -->
    <div class="tab-navigation">
      <button 
        :class="['tab-button', { active: activeTab === 'upload' }]"
        @click="activeTab = 'upload'"
      >
        📤 上传文件
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'list' }]"
        @click="activeTab = 'list'; loadBlobList()"
      >
        📋 文件列表 {{ blobList.length > 0 ? `(${blobList.length})` : '' }}
      </button>
    </div>

    <!-- 上传文件标签页 -->
    <div v-show="activeTab === 'upload'" class="tab-content">
      <p>选择上传方式：</p>
      <div class="upload-mode-switch">
        <label>
          <input type="radio" value="client" v-model="uploadMode" />
          客户端直传（推荐）
        </label>
        <label>
          <input type="radio" value="server" v-model="uploadMode" />
          服务端中转上传
        </label>
      </div>
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
            {{ uploading ? (uploadMode === 'client' ? '📤 客户端上传中...' : '📤 服务端上传中...') : (uploadMode === 'client' ? '🚀 客户端上传到 Blob' : '🚀 服务端上传到 Blob') }}
          </button>
        </div>
      </form>
      <button 
        @click="clearUploadResults"
        class="clear-btn"
        v-if="uploadResult || uploadError"
      >
        🗑️ 清除结果
      </button>
      <div v-if="uploadResult" class="result success">
        <h3>✅ {{ uploadResult.mode === 'server' ? '服务端上传成功!' : '客户端上传成功!' }}</h3>
        <div class="result-details">
          <p><strong>🔗 Blob URL:</strong> 
            <a :href="uploadResult.blob.url" target="_blank" class="blob-link">
              {{ uploadResult.blob.url }}
            </a>
          </p>
          <p><strong>📁 文件路径:</strong> {{ uploadResult.blob.pathname }}</p>
          <p><strong>📊 文件大小:</strong> {{ formatFileSize(uploadResult.blob.size) }}</p>
          <p><strong>📋 内容类型:</strong> {{ uploadResult.blob.contentType || 'unknown' }}</p>
          <p><strong>🎯 上传方式:</strong> <span class="upload-method">{{ uploadResult.mode === 'server' ? '服务端中转' : '客户端直传' }}</span></p>
        </div>
      </div>
      <div v-if="uploadError" class="result error">
        <h3>❌ 上传失败</h3>
        <p>{{ uploadError }}</p>
      </div>
    </div>

    <!-- 文件列表标签页 -->
    <div v-show="activeTab === 'list'" class="tab-content">
      <div class="list-header">
        <button @click="loadBlobList" :disabled="loadingList" class="refresh-btn">
          {{ loadingList ? '🔄 加载中...' : '🔄 刷新列表' }}
        </button>
        
        <div v-if="blobList.length > 0" class="batch-actions">
          <button @click="toggleSelectAll" class="select-all-btn">
            {{ selectedBlobs.length === blobList.length ? '❌ 取消全选' : '✅ 全选' }}
          </button>
          <button 
            @click="deleteSelectedBlobs" 
            :disabled="selectedBlobs.length === 0 || deleting"
            class="batch-delete-btn"
          >
            {{ deleting ? '🗑️ 删除中...' : `🗑️ 删除选中 (${selectedBlobs.length})` }}
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loadingList" class="loading">
        <p>🔄 正在加载文件列表...</p>
      </div>

      <!-- 列表错误 -->
      <div v-if="listError" class="result error">
        <h3>❌ 加载列表失败</h3>
        <p>{{ listError }}</p>
      </div>

      <!-- 删除错误 -->
      <div v-if="deleteError" class="result error">
        <h3>❌ 删除失败</h3>
        <p>{{ deleteError }}</p>
      </div>

      <!-- 文件列表 -->
      <div v-if="!loadingList && blobList.length > 0" class="blob-list">
        <div v-for="blob in blobList" :key="blob.url" class="blob-item">
          <div class="blob-item-header">
            <input 
              type="checkbox" 
              :checked="selectedBlobs.includes(blob.url)"
              @change="toggleBlobSelection(blob.url)"
              class="blob-checkbox"
            />
            <span class="file-icon">{{ getFileIcon(blob.contentType || '') }}</span>
            <div class="blob-info">
              <h4 class="blob-name">{{ blob.pathname }}</h4>
              <div class="blob-meta">
                <span class="file-size">{{ formatFileSize(blob.size) }}</span>
                <span class="file-type">{{ blob.contentType || 'unknown' }}</span>
                <span class="upload-date">{{ formatDate(blob.uploadedAt) }}</span>
              </div>
            </div>
          </div>
          
          <div class="blob-actions">
            <a :href="blob.url" target="_blank" class="view-btn">👁️ 查看</a>
            <a :href="blob.downloadUrl || blob.url" download class="download-btn">📥 下载</a>
            <button 
              @click="deleteBlob(blob.url)"
              :disabled="deleting"
              class="delete-btn"
            >
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loadingList && !listError && blobList.length === 0" class="empty-state">
        <p>📭 暂无文件，请先上传一些文件</p>
        <button @click="activeTab = 'upload'" class="goto-upload-btn">
          📤 去上传文件
        </button>
      </div>
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

/* 顶部导航样式 */
.app-nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 0.5rem 0 1rem;
}
.app-nav a {
  color: #475569;
  text-decoration: none;
  font-weight: 600;
}
.app-nav a.router-link-active {
  color: #3b82f6;
}

/* Blob 管理容器样式 */
.blob-manager-container {
  margin: 2rem auto;
  padding: 2rem;
  max-width: 900px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.blob-manager-container h2 {
  color: #1e293b;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

/* 标签页样式 */
.tab-navigation {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.tab-button {
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}

.tab-button:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background-color: #eff6ff;
}

.tab-content {
  min-height: 300px;
}

/* 上传表单样式 */
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

.upload-btn, .clear-btn, .refresh-btn, .select-all-btn, .batch-delete-btn, .goto-upload-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
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

/* 列表头部样式 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.batch-actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.refresh-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.select-all-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.select-all-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
}

.batch-delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.batch-delete-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.batch-delete-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

/* 文件列表样式 */
.blob-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.blob-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.blob-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.blob-item-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.blob-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.file-icon {
  font-size: 1.5rem;
}

.blob-info {
  flex: 1;
}

.blob-name {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #1e293b;
  word-break: break-all;
}

.blob-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #64748b;
  flex-wrap: wrap;
}

.blob-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.view-btn, .download-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
}

.view-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.download-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.view-btn:hover, .download-btn:hover, .delete-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.delete-btn:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

/* 状态样式 */
.loading {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.goto-upload-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  margin-top: 1rem;
}

.goto-upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
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

.upload-mode-switch {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 500;
}
.upload-mode-switch label {
  cursor: pointer;
}
.upload-mode-switch input[type="radio"] {
  margin-right: 0.5em;
}
.upload-method {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .blob-manager-container {
    margin: 1rem;
    padding: 1rem;
  }
  
  .list-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .batch-actions {
    justify-content: center;
  }
  
  .blob-item {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .blob-item-header {
    justify-content: flex-start;
  }
  
  .blob-actions {
    justify-content: center;
  }
  
  .blob-meta {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .file-input {
    min-width: 250px;
  }
  
  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}
</style>


