import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 舌诊系统提示词
const TONGUE_DIAGNOSIS_SYSTEM_PROMPT = `你是一位专业的中医舌诊专家，拥有丰富的舌象分析经验。请根据用户提供的舌苔照片进行专业的舌诊分析。

你的分析应该包括以下几个方面：

1. **舌质分析**：
   - 舌色：淡白、淡红、红、绛红、青紫等
   - 舌形：胖大、瘦薄、裂纹、齿痕等
   - 舌态：强硬、痿软、颤动等

2. **舌苔分析**：
   - 苔色：白苔、黄苔、灰苔、黑苔等
   - 苔质：薄苔、厚苔、腻苔、腐苔、剥落苔等
   - 润燥：润苔、燥苔、糙苔等

3. **整体判断**：
   - 体质倾向：气虚、阳虚、阴虚、痰湿、湿热、血瘀等
   - 脏腑功能：脾胃、肝肾、心肺等的功能状态

4. **健康建议**：
   - 饮食调理建议
   - 生活作息建议
   - 适合的运动方式
   - 需要注意的健康问题

请用通俗易懂的语言解释，同时保持专业性。如果照片质量不佳或无法清晰辨识，请诚实地告知用户。`;

// POST /api/tongue-diagnosis - 舌诊分析（用户端）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: '请上传舌苔图片' },
        { status: 400 }
      );
    }

    // 验证图片格式
    const isValidBase64 = image.startsWith('data:image/') || image.startsWith('/9j/');
    const isValidUrl = image.startsWith('http://') || image.startsWith('https://');
    
    if (!isValidBase64 && !isValidUrl) {
      return NextResponse.json(
        { success: false, error: '图片格式不正确，请上传有效的图片' },
        { status: 400 }
      );
    }

    // 准备图片URL
    const imageUrl = isValidBase64 && !image.startsWith('data:image/') 
      ? `data:image/jpeg;base64,${image}` 
      : image;

    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const messages = [
      { role: 'system' as const, content: TONGUE_DIAGNOSIS_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: '请分析这张舌苔图片，给出专业的舌诊报告：' },
          {
            type: 'image_url' as const,
            image_url: {
              url: imageUrl,
              detail: 'high' as const,
            },
          },
        ],
      },
    ];

    // 调用Vision模型分析
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.7,
    });

    // 返回分析结果
    return NextResponse.json({
      success: true,
      data: {
        diagnosis: response.content,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Tongue diagnosis error:', error);
    return NextResponse.json(
      { success: false, error: '舌诊分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}
