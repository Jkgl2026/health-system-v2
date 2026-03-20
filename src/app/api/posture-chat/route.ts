import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// 体态问答系统提示词
const POSTURE_CHAT_PROMPT = `你是一位专业的体态评估和康复训练顾问，精通运动医学、解剖学、中医推拿和康复训练。

你的职责是：
1. 解答用户关于体态问题的疑问
2. 提供专业的改善建议
3. 指导用户正确进行训练动作
4. 解释体态与健康的关系
5. 给出日常生活建议

回答要求：
- 专业准确，有科学依据
- 通俗易懂，避免过于专业的术语
- 实用性强，给出具体可操作的建议
- 关心用户，语气亲切
- 如果问题超出体态范围，建议用户咨询专业医生

## 常见问题快速回答模板：

### 关于评估结果
- "我的XX问题严重吗？" -> 解释问题程度、可能影响、改善建议
- "为什么会有这个问题？" -> 分析可能原因（生活习惯、工作姿势、肌肉不平衡等）
- "这个问题会恶化吗？" -> 说明发展趋势和预防措施

### 关于改善方案
- "这个动作怎么做？" -> 详细解释动作要领、注意事项
- "多久能看到效果？" -> 给出合理预期和影响因素
- "可以增加训练量吗？" -> 评估是否适合，给出进阶建议

### 关于日常生活
- "睡觉应该用什么姿势？" -> 根据具体问题给出建议
- "办公椅怎么调整？" -> 给出人体工学建议
- "穿什么鞋子合适？" -> 根据足部和步态问题给出建议

## 输出格式
直接用自然语言回答，不需要JSON格式。可以适当使用：
- **加粗** 强调重点
- 列表（使用 - 或 1. 2. 3.）组织内容
- 分段使回答更清晰`;

// POST /api/posture-chat - AI问答
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      context, 
      assessmentResult,
      history 
    } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: '请输入问题' },
        { status: 400 }
      );
    }

    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建上下文消息
    const messages: any[] = [
      { role: 'system', content: POSTURE_CHAT_PROMPT },
    ];

    // 添加评估结果上下文
    if (assessmentResult) {
      const contextMessage = `当前用户的体态评估结果：
- 综合评分：${assessmentResult.overallScore || 'N/A'}分
- 主要问题：${assessmentResult.issues?.map((i: any) => `${i.name}(${i.severity})`).join('、') || '无'}
- 严重程度：${assessmentResult.severity || 'N/A'}

请在回答时参考这些信息，给出针对性的建议。`;
      
      messages.push({ role: 'user', content: contextMessage });
      messages.push({ role: 'assistant', content: '好的，我已经了解了您的体态评估结果，请问您有什么问题？' });
    }

    // 添加历史对话
    if (history && history.length > 0) {
      history.forEach((h: any) => {
        messages.push({ role: h.role, content: h.content });
      });
    }

    // 添加当前问题
    messages.push({ role: 'user', content: message });

    // 调用模型
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-251015',
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('[PostureChat] 错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '问答服务暂时不可用，请稍后再试',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET /api/posture-chat - 获取预设问题
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      presetQuestions: [
        {
          category: '评估结果',
          questions: [
            '我的体态问题严重吗？',
            '为什么会有这个问题？',
            '这个问题会恶化吗？',
            '需要看医生吗？',
          ]
        },
        {
          category: '改善方案',
          questions: [
            '这个动作怎么做才正确？',
            '多久能看到效果？',
            '每天应该练习多久？',
            '可以增加训练量吗？',
            '有什么动作需要避免？',
          ]
        },
        {
          category: '日常生活',
          questions: [
            '睡觉应该用什么姿势？',
            '办公椅怎么调整？',
            '穿什么鞋子合适？',
            '运动时要注意什么？',
            '饮食有影响吗？',
          ]
        },
        {
          category: '疼痛问题',
          questions: [
            '为什么会疼？',
            '怎么缓解疼痛？',
            '可以继续训练吗？',
            '什么时候该停止训练？',
          ]
        },
      ],
      tips: [
        '提问时尽量具体，我会给出更有针对性的建议',
        '可以描述您的日常生活和工作场景',
        '如果有疼痛，请说明位置和程度',
        '我的建议仅供参考，如有严重问题请咨询医生',
      ]
    }
  });
}
