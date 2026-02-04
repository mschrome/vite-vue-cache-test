export function onRequestPost({request}) {
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function onRequestGet({request}) {
  const geo = request.eo.geo;
  
  // 提取地理位置信息
  const geoData = {
    ip: request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || '未知',
    country: geo?.country || '未知',
    city: geo?.city || '未知',
    region: geo?.region || '未知',
    latitude: geo?.latitude || '未知',
    longitude: geo?.longitude || '未知',
    timezone: geo?.timezone || '未知',
    isp: geo?.asOrganization || geo?.isp || '未知',
    continent: geo?.continent || '未知',
    countryCode: geo?.countryCode || '',
  };
  
  const res = JSON.stringify(geoData, null, 2);

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestPut({request}) {
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestPatch({request}) {
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestDelete({request}) {
  const geo = request.eo.geo;
  const res = JSON.stringify({
    geo: geo,
  });

  return new Response(res, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestHead({request}) {
  // HEAD 请求不返回 Body，仅返回头部
  return new Response(null, {
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function onRequestOptions() {
  // 处理 CORS 预检
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
}