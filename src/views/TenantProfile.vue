<script setup>
import { useTenant } from '../composables/useTenant.js'

const { tenant, loading, error } = useTenant()
</script>

<template>
  <div class="tenant-page">
    <!-- 加载中 -->
    <div v-if="loading" class="tenant-loading">
      <div class="spinner"></div>
      <p>Loading tenant info...</p>
    </div>

    <!-- 识别到租户 -->
    <div v-else-if="tenant" class="tenant-profile">
      <div class="tenant-header" :style="{ borderColor: tenant.themeColor }">
        <img :src="tenant.avatar" :alt="tenant.name" class="tenant-avatar" />
        <h1 class="tenant-name" :style="{ color: tenant.themeColor }">{{ tenant.name }}</h1>
        <p class="tenant-tagline">{{ tenant.tagline }}</p>
      </div>
      <div class="tenant-body">
        <div class="tenant-card">
          <h3>About</h3>
          <p>{{ tenant.bio }}</p>
        </div>
        <div class="tenant-card">
          <h3>Tenant Details</h3>
          <ul class="tenant-details">
            <li><strong>Tenant ID:</strong> <code>{{ tenant.id }}</code></li>
            <li><strong>Theme Color:</strong> <span class="color-swatch" :style="{ background: tenant.themeColor }"></span> {{ tenant.themeColor }}</li>
            <li><strong>Domain:</strong> <code>{{ tenant.id }}.indiehacker.fun</code></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 未识别到租户（主域名） -->
    <div v-else-if="!error" class="tenant-landing">
      <h1>Welcome to IndieHacker.fun</h1>
      <p class="landing-subtitle">Multi-Tenant SaaS Platform powered by EdgeOne Pages</p>
      <div class="demo-tenants">
        <h3>Demo Tenants</h3>
        <div class="tenant-links">
          <a href="?tenant=jack" class="demo-link jack">
            <img src="https://api.dicebear.com/9.x/adventurer/svg?seed=Jack" alt="Jack" class="demo-avatar" />
            <span>jack.indiehacker.fun</span>
          </a>
          <a href="?tenant=lusy" class="demo-link lusy">
            <img src="https://api.dicebear.com/9.x/adventurer/svg?seed=Lusy" alt="Lusy" class="demo-avatar" />
            <span>lusy.indiehacker.fun</span>
          </a>
        </div>
        <p class="demo-tip">
          Tip: In local dev, use <code>?tenant=jack</code> or <code>?tenant=lusy</code> to simulate subdomain access.
        </p>
      </div>
    </div>

    <!-- 错误 -->
    <div v-else class="tenant-error">
      <h2>Tenant Not Found</h2>
      <p>{{ error }}</p>
      <a href="/" class="back-link">Back to main site</a>
    </div>
  </div>
</template>

<style scoped>
.tenant-page {
  max-width: 720px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* Loading */
.tenant-loading {
  text-align: center;
  padding: 4rem 0;
  color: var(--color-text-secondary);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Tenant Profile */
.tenant-header {
  text-align: center;
  padding: 2rem;
  border: 2px solid;
  border-radius: 16px;
  background: var(--color-bg-card);
}
.tenant-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  background: #fff;
}
.tenant-name {
  margin: 1rem 0 0.25rem;
  font-size: 2rem;
}
.tenant-tagline {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.tenant-body {
  display: grid;
  gap: 1.5rem;
  margin-top: 1.5rem;
}
.tenant-card {
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-card);
}
.tenant-card h3 {
  margin: 0 0 0.75rem;
  color: var(--color-text-heading);
}
.tenant-card p {
  margin: 0;
  color: var(--color-text);
  line-height: 1.6;
}
.tenant-details {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tenant-details li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}
.tenant-details li:last-child {
  border-bottom: none;
}
.color-swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  vertical-align: middle;
  margin-right: 4px;
}

/* Landing Page */
.tenant-landing {
  text-align: center;
  padding: 3rem 1rem;
}
.tenant-landing h1 {
  font-size: 2rem;
  color: var(--color-text-heading);
  margin-bottom: 0.5rem;
}
.landing-subtitle {
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}
.demo-tenants {
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-bg-card);
}
.demo-tenants h3 {
  margin: 0 0 1rem;
  color: var(--color-text-heading);
}
.tenant-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.demo-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
  color: var(--color-text);
  transition: all 0.2s;
  background: var(--color-bg-secondary);
}
.demo-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
}
.demo-link.jack:hover {
  border-color: #3b82f6;
}
.demo-link.lusy:hover {
  border-color: #ec4899;
}
.demo-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fff;
}
.demo-tip {
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}
.demo-tip code {
  background: var(--color-bg-code, #f3f4f6);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Error */
.tenant-error {
  text-align: center;
  padding: 3rem 1rem;
}
.tenant-error h2 {
  color: #ef4444;
}
.back-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
}
.back-link:hover {
  filter: brightness(1.05);
}
</style>
