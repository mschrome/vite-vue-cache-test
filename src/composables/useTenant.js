import { ref, onMounted } from 'vue'

/**
 * 获取当前租户信息的 composable
 * 调用 /api/tenant 接口，该接口会读取中间件注入的 x-tenant-id 头
 */
export function useTenant() {
  const tenant = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const fetchTenant = async () => {
    loading.value = true
    error.value = null
    try {
      // 本地开发时，如果 URL 有 ?tenant=xxx 参数，透传给 API
      const params = new URLSearchParams(window.location.search)
      const tenantParam = params.get('tenant')
      const url = tenantParam ? `/api/tenant?tenant=${tenantParam}` : '/api/tenant'

      const res = await fetch(url)
      const data = await res.json()

      if (data.success && data.tenant) {
        tenant.value = data.tenant
      } else {
        tenant.value = null
        if (!data.success) {
          error.value = data.message || 'Tenant not found'
        }
      }
    } catch (e) {
      error.value = e.message
      tenant.value = null
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchTenant)

  return { tenant, loading, error, refetch: fetchTenant }
}
