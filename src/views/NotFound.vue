<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="not-found-container">
    <h1>404 - 页面未找到</h1>
    <p>抱歉，路径 <code>{{ route.fullPath }}</code> 不存在。</p>
    <a class="back-home" href="/">返回首页</a>
  </div>
  
</template>

<style scoped>
.not-found-container {
  max-width: 720px;
  margin: 5rem auto;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  text-align: center;
}

h1 {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
  color: #111827;
}

p {
  color: #6b7280;
}

.back-home {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff;
  text-decoration: none;
}

.back-home:hover {
  filter: brightness(1.05);
}
</style>


