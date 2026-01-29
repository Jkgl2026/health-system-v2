/**
 * 测试脚本：验证错误响应解析逻辑
 * 这个脚本模拟前端 safeParseResponse 函数的行为
 */

// 模拟 Response 对象
class MockResponse {
  constructor(status, statusText, headers, body) {
    this.status = status;
    this.statusText = statusText;
    this.headers = new Map(headers);
    this._body = body;
    this.ok = status >= 200 && status < 300;
  }

  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body;
  }

  async text() {
    return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
  }

  get url() {
    return 'http://localhost:5000/api/test';
  }
}

// 模拟 safeParseResponse 函数
async function safeParseResponse(res) {
  console.log('[测试] 响应状态:', res.status, res.statusText);
  console.log('[测试] 响应头 Content-Type:', res.headers.get('content-type'));

  // 先检查状态码
  if (!res.ok) {
    let errorText = '';
    let errorData = null;

    try {
      // 尝试解析为 JSON
      if (res.headers.get('content-type')?.includes('application/json')) {
        errorData = await res.json();
        errorText = errorData.error || errorData.message || JSON.stringify(errorData);
      } else {
        // 如果不是 JSON，读取为文本
        errorText = await res.text();
        // 限制文本长度，避免过长
        errorText = errorText.length > 500 ? errorText.substring(0, 500) + '...' : errorText;
      }
    } catch (e) {
      // 如果连文本都读取失败，使用默认消息
      errorText = '无法读取服务器响应';
    }

    throw {
      status: res.status,
      statusText: res.statusText,
      message: errorText || `HTTP ${res.status}: ${res.statusText}`,
      data: errorData,
      url: res.url,
    };
  }

  // 如果响应成功，尝试解析为 JSON
  try {
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await res.json();
    } else {
      // 非 JSON 成功响应
      const text = await res.text();
      return { success: true, data: text };
    }
  } catch (e) {
    throw {
      status: 0,
      statusText: 'Parse Error',
      message: '响应解析失败',
      data: { originalError: e.message },
    };
  }
}

// 测试场景
async function runTests() {
  console.log('========================================');
  console.log('开始测试错误响应解析逻辑');
  console.log('========================================\n');

  // 测试 1：正常 JSON 响应
  console.log('测试 1：正常 JSON 响应');
  try {
    const res = new MockResponse(
      200,
      'OK',
      [['content-type', 'application/json']],
      { success: true, user: { name: '测试用户' } }
    );
    const result = await safeParseResponse(res);
    console.log('✅ 通过:', result);
  } catch (error) {
    console.log('❌ 失败:', error.message);
  }
  console.log('');

  // 测试 2：500 错误 - JSON 响应
  console.log('测试 2：500 错误 - JSON 响应');
  try {
    const res = new MockResponse(
      500,
      'Internal Server Error',
      [['content-type', 'application/json']],
      { error: '数据库连接失败', details: 'Connection timeout' }
    );
    const result = await safeParseResponse(res);
    console.log('❌ 应该抛出错误，但返回了:', result);
  } catch (error) {
    console.log('✅ 正确捕获错误:');
    console.log('   状态:', error.status, error.statusText);
    console.log('   消息:', error.message);
    console.log('   数据:', error.data);
  }
  console.log('');

  // 测试 3：500 错误 - HTML 响应（关键测试）
  console.log('测试 3：500 错误 - HTML 响应（关键测试）');
  try {
    const res = new MockResponse(
      500,
      'Internal Server Error',
      [['content-type', 'text/html']],
      '<html><body><h1>Internal Server Error</h1><p>An error occurred</p></body></html>'
    );
    const result = await safeParseResponse(res);
    console.log('❌ 应该抛出错误，但返回了:', result);
  } catch (error) {
    console.log('✅ 正确捕获错误:');
    console.log('   状态:', error.status, error.statusText);
    console.log('   消息:', error.message);
    console.log('   这不应该包含 JSON 解析错误！');
    if (error.message.includes('is not valid JSON')) {
      console.log('   ❌ 仍然有 JSON 解析错误，修复失败！');
    } else {
      console.log('   ✅ 没有 JSON 解析错误，修复成功！');
    }
  }
  console.log('');

  // 测试 4：503 错误 - 文本响应
  console.log('测试 4：503 错误 - 文本响应');
  try {
    const res = new MockResponse(
      503,
      'Service Unavailable',
      [['content-type', 'text/plain']],
      'Service temporarily unavailable, please try again later.'
    );
    const result = await safeParseResponse(res);
    console.log('❌ 应该抛出错误，但返回了:', result);
  } catch (error) {
    console.log('✅ 正确捕获错误:');
    console.log('   状态:', error.status, error.statusText);
    console.log('   消息:', error.message);
  }
  console.log('');

  console.log('========================================');
  console.log('测试完成！');
  console.log('========================================');
}

// 运行测试
runTests().catch(console.error);
