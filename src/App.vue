<script setup>
import HelloWorld from './components/HelloWorld.vue'
// 导入大视频文件，确保它被包含在构建产物中
import largeVideo from './assets/lisa_dancing_001.mp4'
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
  <HelloWorld msg="Vite + Vue" />
  
  <!-- 添加大视频文件，触发Cloudflare Pages文件大小限制 -->
  <div class="video-container">
    <h2>Large Video Test (32MB)</h2>
    <p>This video is used to test Cloudflare Pages file size limit.</p>
    <video 
      :src="largeVideo" 
      controls 
      width="600" 
      height="400"
      preload="metadata"
    >
      Your browser does not support the video tag.
    </video>
    <p><small>Video URL: {{ largeVideo }}</small></p>
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
</style>
