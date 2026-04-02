/**
 * GET /api/tenant
 *
 * 从 KV 存储中读取租户信息（通过中间件注入的 x-tenant-id 请求头）。
 *
 * KV key 格式：tenant:{id}
 * KV value 格式：JSON 字符串，例如：
 *   {
 *     "id": "jack",
 *     "name": "Jack",
 *     "tagline": "Building cool stuff, one commit at a time.",
 *     "avatar": "https://api.dicebear.com/9.x/adventurer/svg?seed=Jack",
 *     "themeColor": "#3b82f6",
 *     "bio": "Full-stack developer & indie hacker."
 *   }
 *
 * 前提：需要在 EdgeOne Pages 控制台创建 KV 命名空间并绑定到项目，
 *       变量名设为 TENANT_KV（即代码中的全局变量名）。
 */

// TENANT_KV 是绑定 KV 命名空间时设置的全局变量名
// 如果 KV 还未绑定，提供 fallback 静态数据用于开发
const FALLBACK_TENANTS = {
  jack: {
    id: 'jack',
    name: 'Jack',
    tagline: 'Building cool stuff, one commit at a time.',
    avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Jack',
    themeColor: '#3b82f6',
    bio: 'Full-stack developer & indie hacker. Love open source and coffee.',
  },
  lusy: {
    id: 'lusy',
    name: 'Lusy',
    tagline: 'Design meets code. Pixel-perfect everything.',
    avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Lusy',
    themeColor: '#ec4899',
    bio: 'UI/UX designer turned developer. Making the web beautiful.',
  },
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequest({ request }) {
  const tenantId = request.headers.get('x-tenant-id');

  // 没有 tenantId —— 主域名访问
  if (!tenantId) {
    return jsonResponse({
      success: true,
      tenant: null,
      message: 'No tenant detected. Visiting the main domain.',
    });
  }

  let tenant = null;

  // 优先从 KV 读取
  try {
    if (typeof TENANT_KV !== 'undefined') {
      tenant = await TENANT_KV.get(`tenant:${tenantId}`, 'json');
    }
  } catch (e) {
    console.log('KV read error, falling back to static data:', e.message);
  }

  // KV 中没找到，使用 fallback
  if (!tenant) {
    tenant = FALLBACK_TENANTS[tenantId] || null;
  }

  if (!tenant) {
    return jsonResponse(
      { success: false, tenant: null, message: `Tenant "${tenantId}" not found.` },
      404
    );
  }

  return jsonResponse({ success: true, tenant });
}
