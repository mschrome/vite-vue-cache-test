/**
 * Node Function: JSON 转 CSV
 * 
 * 测试路径：POST /data/json-to-csv
 * Content-Type: application/json
 * 请求体：[{"name":"张三","age":25},{"name":"李四","age":30}]
 */

export async function onRequestPost({ request }) {
  try {
    const jsonData = await request.json();
    
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供一个非空数组',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 获取所有字段名
    const headers = Object.keys(jsonData[0]);
    
    // 生成 CSV
    const csvLines = [headers.join(',')];
    
    jsonData.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        // 处理包含逗号的值
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvLines.push(values.join(','));
    });
    
    const csvContent = csvLines.join('\n');

    return new Response(csvContent, {
      status: 200,
      headers: { 
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': 'attachment; filename="export.csv"',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'JSON 转换失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

