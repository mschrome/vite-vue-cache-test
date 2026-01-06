/**
 * Node Function: 产品 API (CRUD)
 * 
 * GET /api/products - 获取产品列表
 * GET /api/products?id=123 - 获取单个产品
 * POST /api/products - 创建产品
 * PUT /api/products - 更新产品
 * DELETE /api/products?id=123 - 删除产品
 */

// 模拟数据库
let products = [
  { id: 1, name: 'iPhone 15 Pro', price: 7999, category: '手机', stock: 50, createdAt: new Date('2024-01-01').toISOString() },
  { id: 2, name: 'MacBook Pro', price: 15999, category: '电脑', stock: 30, createdAt: new Date('2024-01-02').toISOString() },
  { id: 3, name: 'AirPods Pro', price: 1999, category: '配件', stock: 100, createdAt: new Date('2024-01-03').toISOString() },
  { id: 4, name: 'iPad Air', price: 4799, category: '平板', stock: 45, createdAt: new Date('2024-01-04').toISOString() },
  { id: 5, name: 'Apple Watch', price: 2999, category: '手表', stock: 60, createdAt: new Date('2024-01-05').toISOString() },
];

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const sort = url.searchParams.get('sort') || 'id';
    const order = url.searchParams.get('order') || 'asc';

    // 获取单个产品
    if (id) {
      const product = products.find(p => p.id === parseInt(id));
      if (!product) {
        return new Response(JSON.stringify({
          success: false,
          message: '产品不存在',
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: product,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 过滤产品
    let filteredProducts = [...products];
    
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower)
      );
    }

    // 排序
    filteredProducts.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return new Response(JSON.stringify({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length,
      filters: { category, search, sort, order },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '获取产品失败',
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
    const { name, price, category, stock } = body;

    if (!name || !price || !category) {
      return new Response(JSON.stringify({
        success: false,
        message: '名称、价格和类别都是必填项',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const newProduct = {
      id: Math.max(...products.map(p => p.id), 0) + 1,
      name,
      price: parseFloat(price),
      category,
      stock: stock || 0,
      createdAt: new Date().toISOString(),
    };

    products.push(newProduct);

    return new Response(JSON.stringify({
      success: true,
      message: '产品创建成功',
      data: newProduct,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '创建产品失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

export async function onRequestPut({ request }) {
  try {
    const body = await request.json();
    const { id, name, price, category, stock } = body;

    const index = products.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: '产品不存在',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    products[index] = {
      ...products[index],
      ...(name && { name }),
      ...(price && { price: parseFloat(price) }),
      ...(category && { category }),
      ...(stock !== undefined && { stock }),
      updatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify({
      success: true,
      message: '产品更新成功',
      data: products[index],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '更新产品失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

export async function onRequestDelete({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供产品 ID',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const index = products.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: '产品不存在',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const deletedProduct = products.splice(index, 1)[0];

    return new Response(JSON.stringify({
      success: true,
      message: '产品删除成功',
      data: deletedProduct,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '删除产品失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

