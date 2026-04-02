/**
 * 多租户中间件 — EdgeOne Pages Middleware
 *
 * 从请求的 Host 中提取子域名作为 tenantId。
 * 例如：jack.indiehacker.fun  → tenantId = "jack"
 *       lusy.indiehacker.fun  → tenantId = "lusy"
 *       indiehacker.fun       → tenantId = null（主域名，不属于任何租户）
 *
 * 识别到 tenantId 后，通过 x-tenant-id 请求头传递给 Edge/Node Functions 和前端。
 */

// 主域名（泛域名的根）
const BASE_DOMAIN = 'indiehacker.fun';

/**
 * 从 hostname 中提取 tenantId（子域名部分）
 * @param {string} hostname - 例如 "jack.indiehacker.fun"
 * @returns {string|null} tenantId 或 null
 */
function extractTenantId(hostname) {
  // 去掉端口号
  const host = hostname.split(':')[0];

  // 如果就是主域名本身，没有租户
  if (host === BASE_DOMAIN || host === `www.${BASE_DOMAIN}`) {
    return null;
  }

  // 检查是否是 *.indiehacker.fun 的子域名
  const suffix = `.${BASE_DOMAIN}`;
  if (host.endsWith(suffix)) {
    const subdomain = host.slice(0, -suffix.length); // "jack" / "lusy"
    // 只取第一级子域名，忽略多级如 a.b.indiehacker.fun
    if (subdomain && !subdomain.includes('.')) {
      return subdomain.toLowerCase();
    }
  }

  // localhost 开发环境：通过查询参数 ?tenant=jack 模拟
  // 这样本地 edgeone pages dev 时也能测试
  return null;
}

export function middleware(context) {
  const { request, next } = context;

  const url = new URL(request.url);
  const hostname = request.headers.get('host') || '';

  // 1. 优先从子域名提取 tenantId
  let tenantId = extractTenantId(hostname);

  // 2. 本地开发 fallback：通过 ?tenant=xxx 查询参数模拟
  if (!tenantId && (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1'))) {
    tenantId = url.searchParams.get('tenant') || null;
  }

  // 3. 如果识别到租户，注入 x-tenant-id 请求头传递给后续处理
  if (tenantId) {
    return next({
      headers: {
        'x-tenant-id': tenantId,
      },
    });
  }

  // 4. 未识别到租户（主域名访问），直接透传
  return next();
}
