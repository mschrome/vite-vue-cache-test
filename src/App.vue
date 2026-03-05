<script setup>
import { computed } from 'vue'

const urlParams = computed(() => {
  const params = new URLSearchParams(window.location.search)
  return Object.fromEntries(params.entries())
})

const paramT = computed(() => urlParams.value.t || '')
</script>

<template>
  <div v-if="Object.keys(urlParams).length" class="url-params-box">
    <strong>🔍 URL 参数：</strong>
    <span v-for="(val, key) in urlParams" :key="key" class="param-tag">{{ key }}={{ val }}</span>
    <span v-if="paramT"> | t 的值为：<code>{{ paramT }}</code></span>
  </div>

  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="File Storage Management System" />
  
  <!-- Vercel Blob 管理界面 -->
  <div class="blob-manager-container">
    <h2>🗂️ Vercel Blob 存储管理 立即回滚版本 3</h2>
    
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
        📋 文件列表 {{ blobList?.length > 0 ? `(${blobList?.length})` : '' }}
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
        
        <div v-if="blobList?.length > 0" class="batch-actions">
          <button @click="toggleSelectAll" class="select-all-btn">
            {{ selectedBlobs.length === blobList?.length ? '❌ 取消全选' : '✅ 全选' }}
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
      <div v-if="!loadingList && blobList?.length > 0" class="blob-list">
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
      <div v-if="!loadingList && !listError && blobList?.length === 0" class="empty-state">
        <p>📭 暂无文件，请先上传一些文件</p>
        <button @click="activeTab = 'upload'" class="goto-upload-btn">
          📤 去上传文件
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.url-params-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 8px 16px;
  margin-bottom: 16px;
  font-size: 14px;
}
.url-params-box code {
  background: #e0f2fe;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
}
.param-tag {
  background: #dbeafe;
  padding: 2px 8px;
  border-radius: 4px;
  margin: 0 4px;
}
</style>
