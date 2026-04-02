/**
 * GET /api/tenant
 *
 * 根据中间件注入的 x-tenant-id 请求头返回租户信息。
 * 前端通过此接口获取当前租户数据，用于个性化展示。
 *
 * 实际生产中，这里应连接数据库查询租户配置；
 * 当前用一个静态 Map 做演示。
 */

// 模拟租户数据库 —— 实际项目中替换为数据库查询
const TENANTS = {
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

export async function onRequest({ request }) {
  const tenantId = request.headers.get('x-tenant-id');

  // 没有 tenantId —— 说明访问的是主域名
  if (!tenantId) {
    return new Response(
      JSON.stringify({
        success: true,
        tenant: null,
        message: 'No tenant detected. Visiting the main domain.',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const tenant = TENANTS[tenantId] || null;

  if (!tenant) {
    // tenantId 存在但未在数据库中找到
    return new Response(
      JSON.stringify({
        success: false,
        tenant: null,
        message: `Tenant "${tenantId}" not found.`,
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      tenant,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
