/**
 * Node Function: 实时统计
 * 
 * 测试路径：GET /api/stats
 * 返回当前 Node Functions 的统计信息
 */

import * as os from 'node:os';

let requestCount = 0;
let startTime = Date.now();

export async function onRequestGet({ request }) {
  try {
    requestCount++;
    
    const uptime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        system: {
          platform: os.platform(),
          arch: os.arch(),
          nodeVersion: process.version,
          cpus: os.cpus().length,
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          uptime: os.uptime(),
        },
        process: {
          pid: process.pid,
          uptimeMs: uptime,
          uptimeSeconds: Math.floor(uptime / 1000),
          memoryUsage: {
            rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
          },
        },
        statistics: {
          totalRequests: requestCount,
          requestsPerSecond: (requestCount / (uptime / 1000)).toFixed(2),
          averageRequestTime: (uptime / requestCount).toFixed(2) + 'ms',
        },
        timestamp: new Date().toISOString(),
      },
    }, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'no-store',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '获取统计信息失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

export async function onRequestPost({ request }) {
  try {
    // 重置统计
    requestCount = 0;
    startTime = Date.now();

    return new Response(JSON.stringify({
      success: true,
      message: '统计信息已重置',
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '重置失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

