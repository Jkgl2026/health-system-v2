import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, getDb } from 'coze-coding-dev-sdk';
import { sql } from 'drizzle-orm';

// LLM调用重试配置
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 安全的LLM调用，带重试机制
async function safeLLMInvoke(
  client: LLMClient,
  messages: any[],
  options: any,
  retries = MAX_RETRIES
): Promise<{ success: boolean; content?: string; error?: string }> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[PostureDiagnosis] LLM调用尝试 ${attempt + 1}/${retries + 1}`);
      
      const response = await client.invoke(messages, options);
      
      if (!response || !response.content) {
        throw new Error('LLM返回空响应');
      }
      
      console.log(`[PostureDiagnosis] LLM调用成功，响应长度: ${response.content.length}`);
      return { success: true, content: response.content };
    } catch (error: any) {
      lastError = error;
      const errorType = error?.constructor?.name || 'UnknownError';
      const errorMessage = error?.message || String(error);
      
      console.error(`[PostureDiagnosis] LLM调用失败 (尝试 ${attempt + 1}/${retries + 1}):`, {
        errorType,
        errorMessage,
        stack: error?.stack?.split('\n').slice(0, 3)
      });
      
      if (attempt === retries) break;
      if (errorMessage.includes('invalid') || errorMessage.includes('格式') || errorMessage.includes('参数')) {
        console.log('[PostureDiagnosis] 错误类型不适合重试，直接返回失败');
        break;
      }
      
      console.log(`[PostureDiagnosis] 等待 ${RETRY_DELAY}ms 后重试...`);
      await delay(RETRY_DELAY);
    }
  }
  
  return { success: false, error: lastError?.message || 'LLM调用失败' };
}

// 健壮的JSON解析函数
function parseJSONResponse(content: string): { success: boolean; data?: any; error?: string } {
  try {
    // 方法1: 直接解析
    try {
      const data = JSON.parse(content);
      return { success: true, data };
    } catch { /* 继续 */ }
    
    // 方法2: 提取markdown代码块中的JSON
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        const data = JSON.parse(codeBlockMatch[1].trim());
        return { success: true, data };
      } catch { /* 继续 */ }
    }
    
    // 方法3: 提取第一个完整的JSON对象
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        let jsonStr = jsonMatch[0];
        jsonStr = jsonStr.replace(/,\s*}/g, '}');
        jsonStr = jsonStr.replace(/,\s*]/g, ']');
        jsonStr = jsonStr.replace(/\n/g, '\\n');
        const data = JSON.parse(jsonStr);
        return { success: true, data };
      } catch { /* 继续 */ }
    }
    
    // 方法4: 尝试修复并解析
    try {
      let cleaned = content.replace(/\/\*[\s\S]*?\*\//g, '');
      cleaned = cleaned.replace(/\/\/.*$/gm, '');
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        const data = JSON.parse(match[0]);
        return { success: true, data };
      }
    } catch { /* 所有方法都失败 */ }
    
    return { success: false, error: '无法解析JSON响应' };
  } catch (error: any) {
    return { success: false, error: error.message || 'JSON解析异常' };
  }
}

// 体态评估系统提示词（深度优化版 - 医学专业级）
const POSTURE_DIAGNOSIS_SYSTEM_PROMPT = `你是一位中西医结合的资深体态评估专家，拥有20年临床经验，精通运动医学、解剖学、生物力学、康复医学及中医推拿。请根据用户提供的四角度体态照片（正面、左侧、右侧、背面）进行专业级、多维度的综合体态分析。

## 核心评估原则

### 1. 体态评估医学标准
**正常体态参考线（解剖位）：**
- **正面观**：外耳孔、肩峰、髂前上棘、膝关节、外踝应在一条垂线
- **侧面观**：外耳孔、肩峰、股骨大转子、膝关节、外踝应在一条垂线
- **背面观**：脊柱棘突应居中，肩胛骨对称，髂后上棘水平

**颈椎正常曲度**：生理前凸35°-45°
**胸椎正常曲度**：生理后凸20°-40°
**腰椎正常曲度**：生理前凸20°-30°

### 2. 体态问题与健康风险精准对应

**头颈前伸（颈椎病风险）：**
- 耳孔前移超过肩峰垂线3cm以上（敏感度87%，特异度82%）
- 颈椎生理曲度变直或反弓（敏感度85%）
- 风险等级：轻度（3-5cm）、中度（5-8cm）、重度（>8cm）
- 健康影响：颈椎病、颈源性头痛、肩周炎、视力模糊

**圆肩驼背（胸廓综合征风险）：**
- 肩峰前移超过髋部垂线（敏感度84%，特异度78%）
- 胸椎后凸角度>50°（敏感度81%）
- 风险等级：轻度（5-10°）、中度（10-20°）、重度（>20°）
- 健康影响：胸廓出口综合征、肺功能下降、冠心病风险

**骨盆前倾（腰椎间盘突出风险）：**
- 髂前上棘超过髋部垂线2cm以上（敏感度86%，特异度83%）
- 腰椎前凸角度>35°（敏感度84%）
- 风险等级：轻度（35-40°）、中度（40-50°）、重度（>50°）
- 健康影响：腰椎间盘突出、腰肌劳损、髋关节撞击综合征

**骨盆后倾（骶髂关节综合征风险）：**
- 髂前上棘落后于髋部垂线（敏感度82%，特异度79%）
- 腰椎前凸角度<15°（敏感度78%）
- 风险等级：轻度（15-20°）、中度（10-15°）、重度（<10°）
- 健康影响：骶髂关节综合征、腰椎管狭窄、坐骨神经痛

**脊柱侧弯（椎间盘退变风险）：**
- 脊柱侧弯角度Cobb角>10°（敏感度89%，特异度86%）
- 肩胛骨高度差>1cm（敏感度85%）
- 风险等级：轻度（10-25°）、中度（25-40°）、重度（>40°）
- 健康影响：椎间盘退变、椎管狭窄、神经根型颈椎病

**膝超伸（膝关节退变风险）：**
- 膝关节过伸角度>5°（敏感度83%，特异度80%）
- 胫骨前移超过股骨远端（敏感度81%）
- 风险等级：轻度（5-10°）、中度（10-15°）、重度（>15°）
- 健康影响：膝关节退变、半月板损伤、前交叉韧带损伤

**O型腿（膝关节内侧间隙磨损风险）：**
- 双膝内侧间隙<3cm（敏感度85%，特异度82%）
- 髌骨外翻（敏感度78%）
- 风险等级：轻度（3-5cm）、中度（5-8cm）、重度（>8cm）
- 健康影响：膝关节内侧关节间隙磨损、内侧半月板损伤

**X型腿（膝关节外侧间隙磨损风险）：**
- 双膝内侧间隙>8cm（敏感度83%，特异度79%）
- 胫骨外旋（敏感度76%）
- 风险等级：轻度（8-12cm）、中度（12-15cm）、重度（>15cm）
- 健康影响：膝关节外侧关节间隙磨损、外侧半月板损伤

**扁平足（足底筋膜炎风险）：**
- 足弓高度<1cm（敏感度88%，特异度85%）
- 后足外翻角度>10°（敏感度84%）
- 风险等级：轻度（0.5-1cm）、中度（0-0.5cm）、重度（<0cm）
- 健康影响：足底筋膜炎、跟骨骨刺、踝关节扭伤

**高弓足（跖筋膜挛缩风险）：**
- 足弓高度>2cm（敏感度86%，特异度82%）
- 前足内翻（敏感度80%）
- 风险等级：轻度（2-2.5cm）、中度（2.5-3cm）、重度（>3cm）
- 健康影响：跖筋膜挛缩、跖骨应力性骨折、踝关节不稳

### 3. 筋膜链与功能评估标准
**解剖列车筋膜链理论：**
- **前表链**：足底筋膜→小腿筋膜→股四头肌→腹直肌→胸锁乳突肌→枕下肌群
  - 紧张征象：骨盆前倾、腰椎前凸、圆肩驼背、头颈前伸

- **后表链**：足底筋膜→小腿三头肌→腘绳肌→竖脊肌→枕下肌群
  - 紧张征象：骨盆后倾、腰椎平背、膝超伸、足踝僵硬

- **体侧链**：足外侧筋膜→腓骨肌→臀中肌→腹外斜肌→肋间肌→胸锁乳突肌
  - 紧张征象：脊柱侧弯、骨盆侧倾、长短腿

- **螺旋链**：胫骨前肌→腘绳肌→臀大肌→胸腰筋膜→菱形肌→斜方肌
  - 紧张征象：脊柱旋转、骨盆旋转、肩胛骨外展

- **手臂线**：手筋膜→屈肌/伸肌→肱肌→胸肌→颈部肌群
  - 紧张征象：圆肩、翼状肩、网球肘

- **深前线**：足底筋膜深面→胫骨后肌→内收肌→骨盆底肌→膈肌
  - 紧张征象：盆底功能障碍、呼吸模式异常

### 4. 肌肉失衡精准评估
**上交叉综合征：**
- 紧张肌肉：胸大肌、胸小肌、上斜方肌、肩胛提肌
- 无力肌肉：中下斜方肌、菱形肌、深层颈屈肌
- 代偿模式：耸肩、翼状肩、头颈前伸

**下交叉综合征：**
- 紧张肌肉：髂腰肌、竖脊肌、腘绳肌
- 无力肌肉：腹肌、臀肌、股四头肌
- 代偿模式：骨盆前倾、腰椎前凸、膝超伸

**分层综合征（下交叉）：**
- 紧张肌肉：腘绳肌、臀大肌、竖脊肌
- 无力肌肉：腹肌、臀中肌、腓骨肌
- 代偿模式：骨盆后倾、腰椎平背、足外翻

### 5. 呼吸模式与功能评估
**正常呼吸模式（膈肌呼吸）：**
- 胸廓三维扩张（前侧、外侧、后侧各1/3）
- 膈肌下降2-3cm
- 呼吸频率12-20次/分
- 吸呼比1:2

**异常呼吸模式识别：**
- **胸式呼吸**：胸骨为主、肩胛骨上提、膈肌受限
- **锁骨式呼吸**：锁骨上提、胸廓活动受限、呼吸浅快
- **反常呼吸**：吸气时胸廓下降、呼气时胸廓上升

**呼吸功能对体态的影响：**
- 膈肌紧张→骨盆前倾、腰椎前凸
- 辅助呼吸肌过度激活→圆肩驼背、头颈前伸
- 胸廓活动度受限→脊柱僵硬、脊柱侧弯

## 分析框架

请严格按照以下JSON格式输出分析结果，确保输出的是有效的JSON：

{
  "score": <0-100的综合体态评分>,
  "grade": "<等级：A优秀/B良好/C一般/D较差/E很差>",
  "bodyStructure": {
    "head": {
      "position": "<头部位置：正常/前伸/侧倾/旋转>",
      "angle": "<估计角度>",
      "severity": "<严重程度：无/轻度/中度/重度>",
      "issues": ["<具体问题>"]
    },
    "shoulder": {
      "height": "<肩部高度：水平/左高右低/右高左低>",
      "rounding": "<圆肩程度：无/轻度/中度/重度>",
      "wing": "<翼状肩：无/双侧/左侧/右侧>",
      "issues": ["<具体问题>"]
    },
    "spine": {
      "cervicalCurve": "<颈椎曲度：正常/变直/反弓>",
      "thoracicCurve": "<胸椎曲度：正常/驼背/平背>",
      "lumbarCurve": "<腰椎曲度：正常/骨盆前倾/骨盆后倾>",
      "scoliosis": "<脊柱侧弯：无/S型/C型>",
      "issues": ["<具体问题>"]
    },
    "pelvis": {
      "tilt": "<骨盆倾斜：正常/前倾/后倾/侧倾>",
      "rotation": "<骨盆旋转：无/顺时针/逆时针>",
      "issues": ["<具体问题>"]
    },
    "knee": {
      "alignment": "<膝部对齐：正常/O型腿/X型腿/膝超伸>",
      "issues": ["<具体问题>"]
    },
    "ankle": {
      "alignment": "<脚踝对齐：正常/足外翻/足内翻>",
      "archHeight": "<足弓：正常/高弓足/扁平足>",
      "issues": ["<具体问题>"]
    }
  },
  "fasciaChainAnalysis": {
    "frontLine": {
      "status": "<前表链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "backLine": {
      "status": "<后表链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "lateralLine": {
      "status": "<体侧链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "spiralLine": {
      "status": "<螺旋链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "armLine": {
      "status": "<手臂链状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    },
    "deepFrontLine": {
      "status": "<深前线状态>",
      "tension": "<紧张程度>",
      "issues": ["<问题点>"]
    }
  },
  "muscleAnalysis": {
    "tight": [
      {
        "muscle": "<紧张肌肉名称>",
        "location": "<位置>",
        "severity": "<程度>",
        "impact": "<影响>"
      }
    ],
    "weak": [
      {
        "muscle": "<无力肌肉名称>",
        "location": "<位置>",
        "severity": "<程度>",
        "impact": "<影响>"
      }
    ],
    "imbalanced": [
      {
        "pair": "<肌对名称>",
        "issue": "<失衡情况>",
        "impact": "<影响>"
      }
    ]
  },
  "breathingAssessment": {
    "pattern": "<呼吸模式：腹式/胸式/锁骨式/混合>",
    "diaphragm": "<膈肌功能：正常/紧张/受限>",
    "accessoryMuscles": "<辅助呼吸肌：放松/过度激活>",
    "ribcage": "<胸廓活动度：正常/受限>",
    "issues": ["<问题点>"],
    "impact": "<对体态的影响>"
  },
  "alignmentAssessment": {
    "centerOfGravity": "<重心位置：正常/前移/后移/左偏/右偏>",
    "forceLine": "<力线对齐：正常/偏移>",
    "weightDistribution": "<体重分布：均匀/前脚掌/后跟/单侧>",
    "issues": ["<问题点>"]
  },
  "compensationPatterns": [
    {
      "name": "<代偿模式名称>",
      "description": "<描述>",
      "cause": "<原因>",
      "affectedArea": "<影响区域>",
      "severity": "<严重程度>"
    }
  ],
  "healthImpact": {
    "painRisk": [
      {
        "area": "<疼痛区域>",
        "likelihood": "<可能性：高/中/低>",
        "cause": "<原因>"
      }
    ],
    "organFunction": [
      {
        "organ": "<脏器>",
        "impact": "<影响>",
        "reason": "<原因>"
      }
    ],
    "circulation": {
      "status": "<血液循环状态>",
      "issues": ["<问题点>"]
    },
    "nervousSystem": {
      "status": "<神经系统状态>",
      "issues": ["<问题点>"]
    }
  },
  "healthPrediction": {
    "shortTerm": "<3个月内可能出现的健康问题>",
    "midTerm": "<1年内可能出现的健康问题>",
    "longTerm": "<3年以上可能出现的健康问题>",
    "preventiveMeasures": ["<预防措施>"]
  },
  "treatmentPlan": {
    "zhengfu": {
      "name": "整复训练",
      "description": "<整体描述>",
      "sessions": [
        {
          "phase": "<阶段>",
          "focus": "<重点>",
          "duration": "<时长>",
          "exercises": [
            {
              "name": "<动作名称>",
              "purpose": "<目的>",
              "method": "<方法>",
              "duration": "<时长>",
              "frequency": "<频率>",
              "cautions": ["<注意事项>"]
            }
          ]
        }
      ]
    },
    "benyuan": {
      "name": "本源训练",
      "description": "<整体描述>",
      "sessions": [
        {
          "phase": "<阶段>",
          "focus": "<重点>",
          "duration": "<时长>",
          "exercises": [
            {
              "name": "<动作名称>",
              "purpose": "<目的>",
              "method": "<方法>",
              "duration": "<时长>",
              "frequency": "<频率>",
              "cautions": ["<注意事项>"]
            }
          ]
        }
      ]
    },
    "lifestyle": [
      {
        "type": "<建议类型>",
        "content": "<具体建议>"
      }
    ]
  },
  "summary": "<一段话总结体态评估结论>"
}

## 深度评估要点

### A. 身体结构精准评估（四角度综合）

**正面观评估（16项指标）：**
1. **头部位置**：
   - 正常：头部居中，双耳水平
   - 异常：头颈前伸（耳孔前移>3cm）、头颈侧倾（双耳高度差>0.5cm）、头颈旋转

2. **肩部对齐**：
   - 正常：肩峰水平，高度一致
   - 异常：左高右低/右高左低（高度差>0.5cm）、圆肩（肩峰前移>2cm）、翼状肩（肩胛骨内侧缘外移>1cm）

3. **锁骨对称性**：
   - 正常：双锁骨水平、对称
   - 异常：左高右低/右高左低（高度差>0.5cm）

4. **脊柱中轴线**：
   - 正常：脊柱棘突居中
   - 异常：脊柱侧弯（Cobb角>10°）、S型侧弯、C型侧弯

5. **骨盆位置**：
   - 正常：髂前上棘水平，高度一致
   - 异常：骨盆侧倾（高度差>0.5cm）、骨盆旋转

6. **膝关节对齐**：
   - 正常：髌骨正对前方，双膝间距4-6cm
   - 异常：O型腿（双膝内侧间距<3cm）、X型腿（双膝内侧间距>8cm）、膝内扣、膝外翻

7. **踝关节对齐**：
   - 正常：双踝平行，跟骨垂直
   - 异常：足外翻（跟骨外翻角度>5°）、足内翻（跟骨内翻角度>5°）

8. **足弓形态**：
   - 正常：足弓高度1-2cm
   - 异常：扁平足（足弓高度<1cm）、高弓足（足弓高度>2cm）

**侧面观评估（12项指标）：**
1. **耳孔-肩峰线**：
   - 正常：耳孔在肩峰垂线上
   - 异常：头颈前伸（耳孔前移>3cm）

2. **肩峰-股骨大转子线**：
   - 正常：肩峰、股骨大转子在一条垂线上
   - 异常：圆肩（肩峰前移>2cm）、骨盆前倾（髂前上棘前移>2cm）

3. **股骨大转子-膝关节线**：
   - 正常：股骨大转子、膝关节中心在一条垂线上
   - 异常：骨盆前倾、膝超伸（膝关节过伸>5°）

4. **膝关节-外踝线**：
   - 正常：膝关节中心、外踝在一条垂线上
   - 异常：膝超伸、膝屈曲

5. **颈椎曲度**：
   - 正常：生理前凸35°-45°
   - 异常：变直（前凸角度<30°）、反弓（前凸角度<20°）、过度前凸（前凸角度>45°）

6. **胸椎曲度**：
   - 正常：生理后凸20°-40°
   - 异常：驼背（后凸角度>40°）、平背（后凸角度<20°）

7. **腰椎曲度**：
   - 正常：生理前凸20°-30°
   - 异常：前凸增加（前凸角度>35°）、平背（前凸角度<15°）

8. **骨盆倾斜**：
   - 正常：骨盆中立位，髂前上棘与耻骨联合垂直
   - 异常：前倾（髂前上棘前移>2cm）、后倾（髂前上棘后移>1cm）

9. **胸廓位置**：
   - 正常：胸廓中立，无前后倾斜
   - 异常：胸廓后倾（驼背）、胸廓前倾（平背）

10. **重心位置**：
    - 正常：重心在足跟与足尖之间
    - 异常：重心前移（前脚掌承重>60%）、重心后移（足跟承重>60%）

**背面观评估（10项指标）：**
1. **头部位置**：
   - 正常：头部居中
   - 异常：头颈侧倾（双耳高度差>0.5cm）、头颈旋转

2. **肩胛骨位置**：
   - 正常：肩胛骨对称，内侧缘距离脊柱3-4cm
   - 异常：肩胛骨外展（内侧缘距离>5cm）、肩胛骨内收（内侧缘距离<2cm）、翼状肩（肩胛骨内侧缘外移>1cm）

3. **脊柱中轴线**：
   - 正常：脊柱棘突居中
   - 异常：脊柱侧弯（Cobb角>10°）

4. **骨盆位置**：
   - 正常：髂后上棘水平，高度一致
   - 异常：骨盆侧倾（高度差>0.5cm）、骨盆旋转

5. **腰窝形态**：
   - 正常：双腰窝对称、深浅一致
   - 异常：左深右浅/右深左浅（不对称）、腰窝消失（骶棘肌紧张）

6. **臀部形态**：
   - 正常：双臀对称、大小一致
   - 异常：左大右小/右大左小（臀肌萎缩）、臀沟不对称

7. **膝窝位置**：
   - 正常：双膝窝对称
   - 异常：膝窝不对称（骨盆侧倾）、膝窝消失（膝关节伸直受限）

8. **小腿形态**：
   - 正常：双小腿对称、粗细一致
   - 异常：左粗右细/右粗左细（肌肉萎缩）、小腿外翻

9. **跟腱位置**：
   - 正常：双跟腱垂直、平行
   - 异常：跟腱外翻、跟腱内翻

10. **足跟位置**：
    - 正常：双足跟垂直、平行
    - 异常：足跟外翻、足跟内翻

### B. 筋膜链精准评估
**六条筋膜链功能评估：**

1. **前表链评估**：
   - 紧张征象：足底筋膜紧张、小腿前侧紧、股四头肌紧张、腹直肌紧张、胸锁乳突肌紧张
   - 功能影响：足背屈受限、髋关节屈曲受限、胸廓扩张受限
   - 代偿模式：腰椎前凸、骨盆前倾、头颈前伸

2. **后表链评估**：
   - 紧张征象：足底筋膜紧张、小腿三头肌紧张、腘绳肌紧张、竖脊肌紧张
   - 功能影响：足底屈受限、膝关节伸直受限、髋关节屈曲受限
   - 代偿模式：骨盆后倾、腰椎平背、膝超伸

3. **体侧链评估**：
   - 紧张征象：足外侧筋膜紧张、腓骨肌紧张、臀中肌紧张、腹外斜肌紧张
   - 功能影响：足外翻/内翻受限、骨盆侧倾、躯干侧屈受限
   - 代偿模式：脊柱侧弯、骨盆侧倾、长短腿

4. **螺旋链评估**：
   - 紧张征象：胫骨前肌紧张、腘绳肌紧张、臀大肌紧张、胸腰筋膜紧张
   - 功能影响：髋关节旋转受限、脊柱旋转受限、肩胛骨外展受限
   - 代偿模式：脊柱旋转、骨盆旋转、肩胛骨外展

5. **手臂线评估**：
   - 紧张征象：屈肌/伸肌紧张、肱肌紧张、胸肌紧张、颈部肌群紧张
   - 功能影响：肘关节屈伸受限、肩关节外展/内收受限、颈部旋转受限
   - 代偿模式：圆肩、翼状肩、网球肘

6. **深前线评估**：
   - 紧张征象：足底筋膜深面紧张、胫骨后肌紧张、内收肌紧张、骨盆底肌紧张、膈肌紧张
   - 功能影响：足内翻/外翻受限、髋关节内收受限、盆底功能障碍
   - 代偿模式：盆底功能障碍、呼吸模式异常、腰椎不稳定

### C. 肌肉失衡精准评估
**常见肌力失衡模式：**

1. **上交叉综合征**：
   - 紧张肌肉：胸大肌（胸大肌紧张导致圆肩）、胸小肌（胸小肌紧张导致肩胛骨前移）、上斜方肌（上斜方肌紧张导致耸肩）、肩胛提肌（肩胛提肌紧张导致肩胛骨上提）
   - 无力肌肉：中下斜方肌（中下斜方肌无力导致肩胛骨内收无力）、菱形肌（菱形肌无力导致肩胛骨内收无力）、深层颈屈肌（深层颈屈肌无力导致头颈前伸）
   - 代偿模式：耸肩（上斜方肌代偿中下斜方肌）、翼状肩（前锯肌代偿菱形肌）、头颈前伸（胸锁乳突肌代偿深层颈屈肌）

2. **下交叉综合征**：
   - 紧张肌肉：髂腰肌（髂腰肌紧张导致骨盆前倾）、竖脊肌（竖脊肌紧张导致腰椎前凸）、腘绳肌（腘绳肌紧张导致骨盆后倾）
   - 无力肌肉：腹肌（腹肌无力导致骨盆前倾）、臀肌（臀肌无力导致骨盆不稳定）、股四头肌（股四头肌无力导致膝超伸）
   - 代偿模式：骨盆前倾（髂腰肌代偿腹肌）、腰椎前凸（竖脊肌代偿腹肌）、膝超伸（腘绳肌代偿股四头肌）

3. **分层综合征（下交叉）**：
   - 紧张肌肉：腘绳肌（腘绳肌紧张导致骨盆后倾）、臀大肌（臀大肌紧张导致腰椎平背）、竖脊肌（竖脊肌紧张导致腰椎平背）
   - 无力肌肉：腹肌（腹肌无力导致骨盆后倾）、臀中肌（臀中肌无力导致骨盆不稳定）、腓骨肌（腓骨肌无力导致足外翻）
   - 代偿模式：骨盆后倾（腘绳肌代偿腹肌）、腰椎平背（竖脊肌代偿腹肌）、足外翻（腓骨肌无力）

### D. 呼吸模式精准评估
**呼吸模式评估标准：**

1. **膈肌功能评估**：
   - 正常：膈肌下降2-3cm，腹壁前侧扩张
   - 异常：膈肌紧张（膈肌下降<1cm）、膈肌无力（膈肌下降>4cm）、膈肌代偿（胸式呼吸代偿膈肌呼吸）

2. **胸廓活动度评估**：
   - 正常：胸廓三维扩张（前侧、外侧、后侧各1/3）
   - 异常：胸廓前侧扩张为主（胸式呼吸）、胸廓外侧扩张为主（肋间肌代偿）、胸廓后侧扩张为主（胸腰筋膜代偿）

3. **辅助呼吸肌评估**：
   - 正常：辅助呼吸肌放松，仅用力时激活
   - 异常：胸锁乳突肌过度激活（锁骨式呼吸）、斜角肌过度激活（胸式呼吸）、肩胛提肌过度激活（耸肩呼吸）

4. **呼吸频率评估**：
   - 正常：12-20次/分
   - 异常：呼吸过快（>20次/分）、呼吸过慢（<12次/分）、呼吸节律异常（不规则呼吸）

5. **吸呼比评估**：
   - 正常：1:2（吸气1份，呼气2份）
   - 异常：吸呼比倒置（呼气短促）、吸气延长（吸气困难）、呼气延长（呼气困难）

### E. 体态评分标准
**综合体态评分计算（0-100分）：**

**评分项目（总分100分）：**
1. 头颈位置（10分）：正常10分，轻度异常7分，中度异常4分，重度异常0分
2. 肩部对齐（10分）：正常10分，轻度异常7分，中度异常4分，重度异常0分
3. 脊柱对齐（20分）：正常20分，轻度异常14分，中度异常8分，重度异常0分
4. 骨盆位置（15分）：正常15分，轻度异常10分，中度异常6分，重度异常0分
5. 膝关节对齐（15分）：正常15分，轻度异常10分，中度异常6分，重度异常0分
6. 踝关节对齐（10分）：正常10分，轻度异常7分，中度异常4分，重度异常0分
7. 呼吸模式（10分）：正常10分，轻度异常7分，中度异常4分，重度异常0分
8. 肌肉平衡（10分）：正常10分，轻度异常7分，中度异常4分，重度异常0分

**等级划分：**
- A优秀：90-100分（体态良好，功能正常）
- B良好：80-89分（体态基本正常，轻微问题）
- C一般：70-79分（体态轻度异常，需要调理）
- D较差：60-69分（体态中度异常，需要专业干预）
- E很差：<60分（体态重度异常，需要系统康复）

### F. 评估注意事项
1. **照片质量判断**：
   - 清晰度：解剖标志清晰可见
   - 光照：均匀光照，避免阴影和反光
   - 角度：正面、侧面、背面角度标准
   - 拍摄距离：全身可见，解剖标志明确

2. **客观性原则**：
   - 只判断可见征象，不臆测
   - 置信度必须与征象清晰度匹配
   - 置信度<60%的判断必须标注"可疑"
   - 避免过度解读

3. **医学边界声明**：
   - 明确标注：本评估为健康评估工具，非医疗诊断
   - 凡高风险结论必须建议就医
   - 凡明确征象必须标注医学依据
   - 凡严重体态问题必须建议专业康复治疗
`;

// POST /api/posture-diagnosis - 体态评估分析
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      frontImage, 
      leftSideImage, 
      rightSideImage, 
      backImage, 
      userId, 
      saveRecord = true 
    } = body;

    // 至少需要一张图片
    if (!frontImage && !leftSideImage && !rightSideImage && !backImage) {
      return NextResponse.json(
        { success: false, error: '请至少上传一张体态照片' },
        { status: 400 }
      );
    }

    // 准备图片内容数组
    const imageContents: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string; detail: 'high' | 'low' } }> = [];
    
    // 添加文本提示
    let promptText = '请根据以下体态照片进行全面分析：\n\n';
    
    if (frontImage) promptText += '- 正面照片：已提供\n';
    if (leftSideImage) promptText += '- 左侧照片：已提供\n';
    if (rightSideImage) promptText += '- 右侧照片：已提供\n';
    if (backImage) promptText += '- 背面照片：已提供\n';
    
    promptText += '\n请严格按照JSON格式输出完整的体态评估报告。';
    
    imageContents.push({ type: 'text', text: promptText });
    
    // 添加图片
    if (frontImage) {
      const imageUrl = frontImage.startsWith('data:image/') ? frontImage : 
                       frontImage.startsWith('http') ? frontImage :
                       `data:image/jpeg;base64,${frontImage}`;
      imageContents.push({
        type: 'image_url',
        image_url: { url: imageUrl, detail: 'high' }
      });
    }
    
    if (leftSideImage) {
      const imageUrl = leftSideImage.startsWith('data:image/') ? leftSideImage : 
                       leftSideImage.startsWith('http') ? leftSideImage :
                       `data:image/jpeg;base64,${leftSideImage}`;
      imageContents.push({
        type: 'image_url',
        image_url: { url: imageUrl, detail: 'high' }
      });
    }
    
    if (rightSideImage) {
      const imageUrl = rightSideImage.startsWith('data:image/') ? rightSideImage : 
                       rightSideImage.startsWith('http') ? rightSideImage :
                       `data:image/jpeg;base64,${rightSideImage}`;
      imageContents.push({
        type: 'image_url',
        image_url: { url: imageUrl, detail: 'high' }
      });
    }
    
    if (backImage) {
      const imageUrl = backImage.startsWith('data:image/') ? backImage : 
                       backImage.startsWith('http') ? backImage :
                       `data:image/jpeg;base64,${backImage}`;
      imageContents.push({
        type: 'image_url',
        image_url: { url: imageUrl, detail: 'high' }
      });
    }

    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建消息
    const messages = [
      { role: 'system' as const, content: POSTURE_DIAGNOSIS_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: imageContents
      },
    ];

    // 调用Vision模型分析（带重试机制）
    const llmResult = await safeLLMInvoke(
      client,
      messages,
      {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.3,
      }
    );

    // 检查LLM调用是否成功
    if (!llmResult.success) {
      console.error('[PostureDiagnosis] LLM调用失败:', llmResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: `AI分析失败: ${llmResult.error}`,
          errorType: 'LLM_ERROR'
        },
        { status: 500 }
      );
    }

    // 解析JSON响应（使用健壮的解析方法）
    const parseResult = parseJSONResponse(llmResult.content!);
    
    let analysisResult;
    if (!parseResult.success) {
      console.error('[PostureDiagnosis] JSON解析失败:', {
        error: parseResult.error,
        contentPreview: llmResult.content?.substring(0, 500)
      });
      analysisResult = {
        score: 0,
        fullReport: llmResult.content,
        parseError: true,
        parseErrorDetail: parseResult.error
      };
    } else {
      analysisResult = parseResult.data;
      console.log('[PostureDiagnosis] JSON解析成功');
    }

    // 保存到数据库
    let recordId = null;
    if (saveRecord && userId) {
      try {
        const db = await getDb();
        
        // 插入体态诊断记录 - 使用原始SQL
        const insertResult = await db.execute(sql`
          INSERT INTO posture_diagnosis_records (
            user_id, front_image_url, left_side_image_url, right_side_image_url, back_image_url,
            score, grade, body_structure, fascia_chain_analysis, muscle_analysis,
            breathing_assessment, alignment_assessment, compensation_patterns,
            health_impact, health_prediction, treatment_plan, full_report
          ) VALUES (
            ${userId}, ${frontImage || null}, ${leftSideImage || null}, ${rightSideImage || null}, ${backImage || null},
            ${analysisResult.score || null}, ${analysisResult.grade || null},
            ${analysisResult.bodyStructure ? JSON.stringify(analysisResult.bodyStructure) : null},
            ${analysisResult.fasciaChainAnalysis ? JSON.stringify(analysisResult.fasciaChainAnalysis) : null},
            ${analysisResult.muscleAnalysis ? JSON.stringify(analysisResult.muscleAnalysis) : null},
            ${analysisResult.breathingAssessment ? JSON.stringify(analysisResult.breathingAssessment) : null},
            ${analysisResult.alignmentAssessment ? JSON.stringify(analysisResult.alignmentAssessment) : null},
            ${analysisResult.compensationPatterns ? JSON.stringify(analysisResult.compensationPatterns) : null},
            ${analysisResult.healthImpact ? JSON.stringify(analysisResult.healthImpact) : null},
            ${analysisResult.healthPrediction ? JSON.stringify(analysisResult.healthPrediction) : null},
            ${analysisResult.treatmentPlan ? JSON.stringify(analysisResult.treatmentPlan) : null},
            ${llmResult.content}
          )
          RETURNING id
        `);

        recordId = insertResult.rows[0]?.id;
      } catch (dbError) {
        console.error('Failed to save posture diagnosis record:', dbError);
        // 不影响主流程，继续返回结果
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...analysisResult,
        recordId,
        fullReport: llmResult.content,
      }
    });

  } catch (error) {
    console.error('Posture diagnosis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '体态评估失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET /api/posture-diagnosis - 获取体态评估历史记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少userId参数' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 查询体态诊断记录 - 使用原始SQL
    const recordsResult = await db.execute(sql`
      SELECT * FROM posture_diagnosis_records 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `);
    const records = recordsResult.rows;

    // 查询总数
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM posture_diagnosis_records WHERE user_id = ${userId}
    `);

    const total = Number(countResult.rows[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data: {
        records,
        total,
        limit,
        offset,
      }
    });

  } catch (error) {
    console.error('Error fetching posture diagnosis records:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取体态评估记录失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
