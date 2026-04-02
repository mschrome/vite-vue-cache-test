<script setup>
import { computed } from 'vue'
import { useDarkMode } from './composables/useDarkMode.js'
import { useTenant } from './composables/useTenant.js'

const { isDark, toggleDark } = useDarkMode()
const { tenant, loading: tenantLoading } = useTenant()

const urlParams = computed(() => {
  const params = new URLSearchParams(window.location.search)
  return Object.fromEntries(params.entries())
})

const paramT = computed(() => urlParams.value.t || '')
</script>

<template>
  <!-- 暗黑模式切换按钮 -->
  <button class="theme-toggle" @click="toggleDark" :title="isDark ? '切换到亮色模式' : '切换到暗色模式'">
    <span class="icon">{{ isDark ? '☀️' : '🌙' }}</span>
    <span>{{ isDark ? '亮色' : '暗色' }}</span>
  </button>

  <!-- 租户横幅：当识别到租户时在页面顶部展示 -->
  <div v-if="tenantLoading" class="tenant-banner tenant-banner--loading">
    Loading...
  </div>
  <div v-else-if="tenant" class="tenant-banner" :style="{ borderColor: tenant.themeColor, '--tenant-color': tenant.themeColor }">
    <img :src="tenant.avatar" :alt="tenant.name" class="tenant-banner-avatar" />
    <div class="tenant-banner-info">
      <h2 class="tenant-banner-name" :style="{ color: tenant.themeColor }">{{ tenant.name }}'s Space</h2>
      <p class="tenant-banner-tagline">{{ tenant.tagline }}</p>
    </div>
  </div>

  <div v-if="Object.keys(urlParams).length" class="url-params-box">
    <strong>URL Params:</strong>
    <span v-for="(val, key) in urlParams" :key="key" class="param-tag">{{ key }}={{ val }}</span>
    <span v-if="paramT"> | t = <code>{{ paramT }}</code></span>
  </div>

  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld :msg="tenant ? `${tenant.name}'s Dashboard` : 'File Storage Management System'" />
  
  <!-- Vercel Blob 管理界面 -->
  <div class="blob-manager-container">
    <h2>🗂️ Vercel Blob 存储管理 Skill666</h2>
    
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
/* 租户横幅 */
.tenant-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border: 2px solid;
  border-radius: 12px;
  background: var(--color-bg-card, #fff);
}
.tenant-banner--loading {
  justify-content: center;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}
.tenant-banner-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--color-border, #e5e7eb);
  flex-shrink: 0;
}
.tenant-banner-info {
  min-width: 0;
}
.tenant-banner-name {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.3;
}
.tenant-banner-tagline {
  margin: 0.2rem 0 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.url-params-box {
  background: var(--color-bg-params);
  border: 1px solid var(--color-border-params);
  border-radius: 8px;
  padding: 8px 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--color-text);
}
.url-params-box code {
  background: var(--color-bg-code);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  color: var(--color-text);
}
.param-tag {
  background: var(--color-bg-code);
  padding: 2px 8px;
  border-radius: 4px;
  margin: 0 4px;
  color: var(--color-text);
}
</style>
