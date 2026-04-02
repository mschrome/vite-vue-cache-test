/**
 * Node Function: CSV 转 JSON
 * 
 * 测试路径：POST /data/csv-to-json
 * Content-Type: text/csv
 */

export async function onRequestPost({ request }) {
  try {
    const csvText = await request.text();
    
    if (!csvText.trim()) {
      return new Response(JSON.stringify({
        success: false,
        message: 'CSV 内容不能为空',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 解析 CSV
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'CSV 转换成功',
      data: {
        headers,
        rows: data,
        totalRows: data.length,
      },
      metadata: {
        convertedAt: new Date().toISOString(),
        originalSize: csvText.length,
        outputSize: JSON.stringify(data).length,
      },
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'CSV 转换失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

