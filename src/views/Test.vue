<script setup>
import { ref } from 'vue'

const counter = ref(0)
const increment = () => {
  counter.value += 1
}
</script>

<template>
  <div class="test-page">
    <h1>/test 页面</h1>
    <p>这是一个示例路由页面，用于验证 SPA 深链与回退。</p>
    <div class="card">
      <p>计数器：{{ counter }}</p>
      <button @click="increment">+1</button>
    </div>
    <p>
      <a href="/">返回首页</a>
    </p>
  </div>
</template>

<style scoped>
.test-page {
  max-width: 720px;
  margin: 2rem auto;
  padding: 2rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
.card {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
}
button {
  padding: 6px 12px;
  border: 0;
  border-radius: 8px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
}
button:hover { filter: brightness(1.05); }
</style>


