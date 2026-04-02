/**
 * Node Function: 天气 API 模拟
 * 
 * 测试路径：GET /api/weather?city=北京
 */

// 模拟天气数据
const weatherData = {
  '北京': { temp: 15, condition: '晴', humidity: 45, wind: 12 },
  '上海': { temp: 20, condition: '多云', humidity: 65, wind: 8 },
  '广州': { temp: 28, condition: '阴', humidity: 75, wind: 6 },
  '深圳': { temp: 27, condition: '晴', humidity: 70, wind: 10 },
  '成都': { temp: 18, condition: '小雨', humidity: 80, wind: 5 },
  '杭州': { temp: 22, condition: '晴', humidity: 55, wind: 7 },
};

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const city = url.searchParams.get('city') || '北京';

    const weather = weatherData[city];

    if (!weather) {
      return new Response(JSON.stringify({
        success: false,
        message: `暂无 ${city} 的天气数据`,
        availableCities: Object.keys(weatherData),
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 模拟未来3天预报
    const forecast = [
      { day: '今天', ...weather },
      { day: '明天', temp: weather.temp + 2, condition: '多云', humidity: weather.humidity - 5, wind: weather.wind + 2 },
      { day: '后天', temp: weather.temp - 1, condition: '晴', humidity: weather.humidity, wind: weather.wind },
    ];

    return new Response(JSON.stringify({
      success: true,
      city,
      current: weather,
      forecast,
      updateTime: new Date().toISOString(),
      timezone: 'Asia/Shanghai',
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': 'max-age=1800', // 缓存30分钟
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '获取天气数据失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

