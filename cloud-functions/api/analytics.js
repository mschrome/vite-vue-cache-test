/**
 * Node Function: 数据分析
 * 
 * 测试路径：
 * GET /api/analytics - 获取总体统计
 * POST /api/analytics/track - 追踪事件
 */

import { randomUUID } from 'node:crypto';

// 模拟分析数据存储
let events = [];
let pageViews = 0;
let uniqueVisitors = new Set();

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'today'; // today, week, month

    // 模拟统计数据
    const stats = {
      pageViews,
      uniqueVisitors: uniqueVisitors.size,
      events: events.length,
      topPages: [
        { path: '/', views: 1250, avgDuration: 45 },
        { path: '/products', views: 890, avgDuration: 120 },
        { path: '/about', views: 456, avgDuration: 60 },
      ],
      topEvents: [
        { event: 'button_click', count: 340 },
        { event: 'form_submit', count: 89 },
        { event: 'video_play', count: 67 },
      ],
      traffic: {
        direct: 45,
        organic: 30,
        social: 15,
        referral: 10,
      },
      devices: {
        mobile: 60,
        desktop: 35,
        tablet: 5,
      },
      period,
      generatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify({
      success: true,
      data: stats,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '获取统计数据失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { event, properties, userId } = body;

    if (!event) {
      return new Response(JSON.stringify({
        success: false,
        message: '事件名称不能为空',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 记录事件
    const eventId = randomUUID();
    const trackedEvent = {
      id: eventId,
      event,
      properties: properties || {},
      userId: userId || null,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    };

    events.push(trackedEvent);
    pageViews++;
    
    if (userId) {
      uniqueVisitors.add(userId);
    }

    // 限制内存中的事件数量
    if (events.length > 1000) {
      events = events.slice(-1000);
    }

    return new Response(JSON.stringify({
      success: true,
      message: '事件追踪成功',
      data: {
        eventId,
        event,
        trackedAt: trackedEvent.timestamp,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '事件追踪失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

