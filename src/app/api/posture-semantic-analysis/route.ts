import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

// ==================== 中医分析数据生成 ====================

interface PostureIssue {
  type: string;
  name: string;
  severity: string;
  [key: string]: any;
}

interface TCMPerspective {
  meridians: Array<{ name: string; status: string; reason: string }>;
  acupoints: Array<{ name: string; location: string; benefit: string; method: string }>;
  constitution: string;
  constitutionReason: string;
  daoyinSuggestions?: string[];
}

// 根据体态问题生成中医分析数据（增强版）
function generateTCMPerspective(issues: PostureIssue[]): TCMPerspective {
  const meridians: Array<{ name: string; status: string; reason: string }> = [];
  const acupoints: Array<{ name: string; location: string; benefit: string; method: string }> = [];
  const daoyinSuggestions: string[] = [];
  let constitution = '平和质';
  let constitutionReason = '体态基本正常，继续保持良好习惯';

  // 经络与体态问题对应关系（增强版）
  const meridianMapping: Record<string, Array<{ name: string; reason: string }>> = {
    forward_head: [
      { name: '足太阳膀胱经', reason: '头前伸导致颈部经络气血运行受阻，可能出现头痛、颈僵症状' },
      { name: '足少阳胆经', reason: '颈部侧方经络气血不畅，影响头部供血' },
      { name: '督脉', reason: '阳气上行受阻，可能影响精神状态' },
    ],
    cervical_straightening: [
      { name: '督脉', reason: '颈椎变直严重影响督脉阳气运行，可能导致头晕、记忆力下降' },
      { name: '足太阳膀胱经', reason: '颈后经络气血严重不畅，易引发肩颈疼痛' },
    ],
    cervicothoracic_hump: [
      { name: '督脉', reason: '颈胸交界处气血淤阻，阳气受阻，可能影响心肺功能' },
      { name: '足太阳膀胱经', reason: '大椎穴附近气血运行不畅，易引发上背痛' },
    ],
    elevated_shoulder: [
      { name: '足少阳胆经', reason: '高低肩导致经络不平衡，影响体侧气血运行' },
      { name: '手少阳三焦经', reason: '肩部经络受阻，可能出现手臂麻木' },
    ],
    rounded_shoulder: [
      { name: '手太阴肺经', reason: '圆肩影响胸部经络气血，可能导致胸闷、呼吸不畅' },
      { name: '足阳明胃经', reason: '胸部经络受阻，影响消化功能' },
    ],
    winging_scapula: [
      { name: '手太阳小肠经', reason: '肩胛区经络气血不畅，影响上肢活动' },
      { name: '手少阳三焦经', reason: '肩胛周围经络受阻' },
    ],
    thoracic_hyperkyphosis: [
      { name: '督脉', reason: '驼背严重影响督脉阳气运行，可能导致心肺功能下降、精神不振' },
      { name: '足太阳膀胱经', reason: '背部经络严重受阻，易引发背痛、脏腑功能失调' },
    ],
    scoliosis: [
      { name: '督脉', reason: '脊柱侧弯影响督脉走向，可能导致全身气血运行不畅' },
      { name: '足太阳膀胱经', reason: '侧弯导致经络气血不畅，影响相关脏腑' },
      { name: '足少阳胆经', reason: '体侧经络受影响，可能出现胁肋不适' },
    ],
    anterior_pelvic_tilt: [
      { name: '足阳明胃经', reason: '骨盆前倾影响腹部经络，可能导致消化不良、便秘' },
      { name: '足少阴肾经', reason: '腰部经络气血不畅，易引发腰痛、肾气不足' },
      { name: '任脉', reason: '腹部经络受阻，影响生殖系统功能' },
    ],
    posterior_pelvic_tilt: [
      { name: '足太阳膀胱经', reason: '骨盆后倾影响腰骶经络，可能导致腰骶疼痛' },
      { name: '督脉', reason: '阳气运行受阻，可能影响精神状态' },
    ],
    pelvic_obliquity: [
      { name: '足少阳胆经', reason: '骨盆侧倾影响体侧经络，可能导致长短腿、腰痛' },
      { name: '足厥阴肝经', reason: '肝经气血不畅，可能影响情绪和月经' },
    ],
    genu_recuvatum: [
      { name: '足阳明胃经', reason: '膝超伸影响膝关节经络，易引发膝关节疼痛' },
      { name: '足太阳膀胱经', reason: '膝后经络受影响，可能导致腿后侧紧张' },
    ],
    genu_varum: [
      { name: '足阳明胃经', reason: 'O型腿影响腿部经络走向，可能导致膝关节内侧磨损' },
      { name: '足少阳胆经', reason: '腿外侧经络气血不畅' },
    ],
    genu_valgum: [
      { name: '足太阴脾经', reason: 'X型腿影响腿内侧经络，可能导致脾虚湿重' },
      { name: '足厥阴肝经', reason: '腿内侧经络受影响' },
    ],
    flat_foot: [
      { name: '足少阴肾经', reason: '扁平足影响足部经络，可能导致肾气不足、易疲劳' },
      { name: '足太阳膀胱经', reason: '足底经络气血不畅，影响全身气血运行' },
    ],
    upper_crossed: [
      { name: '督脉', reason: '上交叉综合征影响头颈胸经络整体运行，可能导致头晕、胸闷、颈肩痛' },
      { name: '足太阳膀胱经', reason: '背部经络整体受阻' },
      { name: '手太阴肺经', reason: '胸部经络受阻，影响呼吸功能' },
    ],
    lower_crossed: [
      { name: '足阳明胃经', reason: '下交叉综合征影响腰腹经络，可能导致腰痛、消化不良' },
      { name: '足少阴肾经', reason: '腰部经络气血不畅' },
      { name: '任脉', reason: '腹部经络受阻' },
    ],
  };

  // 穴位与体态问题对应关系（增强版）
  const acupointMapping: Record<string, Array<{ name: string; location: string; benefit: string; method: string }>> = {
    forward_head: [
      { name: '风池穴', location: '颈后两侧，枕骨下方凹陷处', benefit: '缓解颈肩疼痛，改善头部供血，预防头痛头晕', method: '双手拇指按揉3-5分钟，力度以酸胀为度，每日2次' },
      { name: '天柱穴', location: '颈后发际正中旁开1.3寸', benefit: '缓解颈部僵硬，改善颈椎问题，疏通头部经络', method: '拇指点按2-3分钟，配合颈部活动效果更佳' },
      { name: '肩井穴', location: '肩部最高点，大椎与肩峰连线中点', benefit: '缓解肩颈紧张，促进气血运行，改善上半身循环', method: '用对侧手掌适度按压或拍打，每次1-2分钟' },
      { name: '后溪穴', location: '手掌尺侧，第五掌骨小头后方凹陷处', benefit: '通调督脉，缓解颈肩不适，改善颈椎问题', method: '拇指点按3分钟，同时活动颈部' },
    ],
    cervical_straightening: [
      { name: '大椎穴', location: '第七颈椎棘突下方', benefit: '调节阳气，改善颈部问题，增强免疫力', method: '温灸10-15分钟或按揉5分钟，可配合拔罐' },
      { name: '后溪穴', location: '手掌尺侧，第五掌骨小头后方', benefit: '通调督脉，缓解颈肩不适', method: '拇指点按3分钟' },
      { name: '颈百劳', location: '大椎穴上2寸，旁开1寸', benefit: '缓解颈部疲劳，改善颈椎问题', method: '按揉或艾灸5-10分钟' },
    ],
    cervicothoracic_hump: [
      { name: '大椎穴', location: '第七颈椎棘突下方', benefit: '改善颈胸交界问题，疏通督脉，是治疗驼背要穴', method: '温灸或按揉10-15分钟，可配合刮痧' },
      { name: '肩中俞', location: '第七颈椎棘突下旁开2寸', benefit: '缓解肩背僵硬，改善上背部循环', method: '按揉5分钟，可配合拔罐' },
      { name: '天宗穴', location: '肩胛骨中央凹陷处', benefit: '疏通肩背经络，缓解上背痛', method: '点按或刮痧，每次5分钟' },
    ],
    elevated_shoulder: [
      { name: '肩髃穴', location: '肩峰端下缘，臂外展时肩峰前下方凹陷处', benefit: '缓解肩部疼痛，调节肩部平衡，改善肩关节活动', method: '按揉或温灸5分钟，配合肩部活动' },
      { name: '肩贞穴', location: '肩关节后下方，腋后纹头直上1寸', benefit: '改善肩部活动度，缓解肩背疼痛', method: '按揉3-5分钟' },
      { name: '天宗穴', location: '肩胛骨中央凹陷处', benefit: '缓解肩背疼痛，促进气血运行', method: '点按或刮痧' },
    ],
    rounded_shoulder: [
      { name: '膻中穴', location: '两乳头连线中点', benefit: '宽胸理气，改善胸部气血，缓解胸闷', method: '顺时针按揉5分钟，可配合扩胸运动' },
      { name: '中府穴', location: '胸前壁外上方，锁骨下窝外侧', benefit: '调理肺气，改善胸廓活动，增强呼吸功能', method: '轻柔按揉3分钟' },
      { name: '云门穴', location: '锁骨下窝凹陷处', benefit: '开胸顺气，改善肩胸活动', method: '按揉2-3分钟' },
    ],
    thoracic_hyperkyphosis: [
      { name: '至阳穴', location: '第七胸椎棘突下', benefit: '疏通督脉，改善背部气血，缓解背痛', method: '按揉或温灸，可配合拔罐' },
      { name: '身柱穴', location: '第三胸椎棘突下', benefit: '增强脊柱功能，改善体态，强健筋骨', method: '温灸10分钟，可配合按揉' },
      { name: '肺俞穴', location: '第三胸椎棘突下旁开1.5寸', benefit: '调理肺气，改善背部循环，增强呼吸功能', method: '按揉或拔罐' },
      { name: '心俞穴', location: '第五胸椎棘突下旁开1.5寸', benefit: '养心安神，改善背部气血', method: '按揉或温灸' },
    ],
    scoliosis: [
      { name: '华佗夹脊穴', location: '脊柱两侧各0.5寸', benefit: '调节脊柱功能，改善侧弯，疏通督脉', method: '沿脊柱两侧按揉或推拿，每次15分钟' },
      { name: '肾俞穴', location: '第二腰椎棘突下旁开1.5寸', benefit: '补肾强腰，稳固脊柱，增强体质', method: '按揉或温灸，可配合拔罐' },
      { name: '命门穴', location: '第二腰椎棘突下', benefit: '温补肾阳，强腰健骨', method: '温灸10-15分钟' },
    ],
    anterior_pelvic_tilt: [
      { name: '关元穴', location: '脐下3寸', benefit: '培补元气，调节下焦，改善腹部功能', method: '温灸或按揉，每次10分钟' },
      { name: '气海穴', location: '脐下1.5寸', benefit: '益气助阳，改善腹部循环，缓解腰痛', method: '温灸10分钟，可配合按揉' },
      { name: '环跳穴', location: '股骨大转子最凸点与骶管裂孔连线外1/3处', benefit: '缓解腰腿不适，调节骨盆，改善下肢循环', method: '点按或艾灸，每次5分钟' },
      { name: '腰眼穴', location: '第四腰椎棘突下旁开3.5寸凹陷处', benefit: '缓解腰痛，强腰健肾', method: '按揉或温灸' },
    ],
    posterior_pelvic_tilt: [
      { name: '命门穴', location: '第二腰椎棘突下', benefit: '温补肾阳，强腰健骨，改善腰骶功能', method: '温灸或按揉，每次10分钟' },
      { name: '肾俞穴', location: '第二腰椎棘突下旁开1.5寸', benefit: '补肾强腰，改善腰骶，增强体质', method: '按揉或温灸' },
    ],
    genu_recuvatum: [
      { name: '犊鼻穴', location: '髌骨下缘，髌韧带外侧凹陷处', benefit: '调理膝关节，改善功能，缓解膝痛', method: '按揉5分钟，可配合温灸' },
      { name: '委中穴', location: '膝盖后正中，腘窝横纹中点', benefit: '舒筋活络，调理腰腿，缓解膝后紧张', method: '按揉或拔罐' },
      { name: '阳陵泉', location: '小腿外侧，腓骨头前下方凹陷处', benefit: '舒筋利节，改善膝关节功能', method: '按揉3-5分钟' },
    ],
    flat_foot: [
      { name: '涌泉穴', location: '足底前1/3处，蜷足时足前缘凹陷处', benefit: '滋阴降火，强健足部，改善全身循环', method: '按揉或温灸10分钟，可配合足浴' },
      { name: '太溪穴', location: '内踝后方与脚跟骨筋腱之间凹陷处', benefit: '补肾强骨，改善足部功能，增强体质', method: '按揉5分钟' },
      { name: '解溪穴', location: '足背与小腿交界处横纹中央', benefit: '调理踝关节，改善足部活动', method: '按揉3分钟' },
    ],
    upper_crossed: [
      { name: '大椎穴', location: '第七颈椎棘突下方', benefit: '疏通督脉，改善颈胸问题', method: '温灸或按揉10分钟' },
      { name: '风池穴', location: '颈后两侧凹陷处', benefit: '缓解颈肩紧张，改善头部供血', method: '按揉3-5分钟' },
      { name: '膻中穴', location: '两乳头连线中点', benefit: '宽胸理气，改善呼吸', method: '按揉5分钟' },
      { name: '天宗穴', location: '肩胛骨中央', benefit: '疏通肩背经络', method: '点按或刮痧' },
    ],
  };

  // 导引功法建议
  const daoyinMapping: Record<string, string[]> = {
    head_related: [
      '八段锦 - 双手托天理三焦',
      '五禽戏 - 鹿戏（伸展颈部）',
      '易筋经 - 韦驮献杵',
    ],
    shoulder_related: [
      '八段锦 - 左右开弓似射雕',
      '易筋经 - 摘星换斗',
      '五禽戏 - 鹤戏（展翅）',
    ],
    spine_related: [
      '八段锦 - 摇头摆尾去心火',
      '易筋经 - 九鬼拔马刀',
      '五禽戏 - 虎戏（伸展脊柱）',
    ],
    pelvis_related: [
      '八段锦 - 双手攀足固肾腰',
      '五禽戏 - 熊戏（调理脾胃）',
      '站桩 - 无极桩',
    ],
    leg_related: [
      '八段锦 - 攒拳怒目增气力',
      '五禽戏 - 猿戏（灵活肢体）',
      '站桩 - 三体式',
    ],
  };

  // 根据检测到的问题生成经络和穴位建议
  const hasHeadIssue = issues.some(i => ['forward_head', 'cervical_straightening', 'cervicothoracic_hump', 'head_tilt', 'head_rotation'].includes(i.type));
  const hasShoulderIssue = issues.some(i => ['elevated_shoulder', 'rounded_shoulder', 'winging_scapula', 'scapular_elevation'].includes(i.type));
  const hasSpineIssue = issues.some(i => ['thoracic_hyperkyphosis', 'scoliosis', 'spinal_rotation', 'lumbar_hyperlordosis'].includes(i.type));
  const hasPelvisIssue = issues.some(i => ['anterior_pelvic_tilt', 'posterior_pelvic_tilt', 'pelvic_obliquity', 'pelvic_rotation'].includes(i.type));
  const hasLegIssue = issues.some(i => ['genu_recuvatum', 'genu_varum', 'genu_valgum', 'flat_foot', 'high_arch'].includes(i.type));

  // 添加经络
  const addedMeridians = new Set<string>();
  issues.forEach(issue => {
    const mapped = meridianMapping[issue.type];
    if (mapped) {
      mapped.forEach(m => {
        if (!addedMeridians.has(m.name)) {
          meridians.push({ name: m.name, status: issue.severity === 'severe' ? '受阻' : '不畅', reason: m.reason });
          addedMeridians.add(m.name);
        }
      });
    }
  });

  // 添加穴位
  const addedAcupoints = new Set<string>();
  issues.forEach(issue => {
    const mapped = acupointMapping[issue.type];
    if (mapped) {
      mapped.forEach(a => {
        if (!addedAcupoints.has(a.name)) {
          acupoints.push(a);
          addedAcupoints.add(a.name);
        }
      });
    }
  });

  // 添加导引建议
  if (hasHeadIssue) daoyinSuggestions.push(...daoyinMapping.head_related);
  if (hasShoulderIssue) daoyinSuggestions.push(...daoyinMapping.shoulder_related);
  if (hasSpineIssue) daoyinSuggestions.push(...daoyinMapping.spine_related);
  if (hasPelvisIssue) daoyinSuggestions.push(...daoyinMapping.pelvis_related);
  if (hasLegIssue) daoyinSuggestions.push(...daoyinMapping.leg_related);

  // 去重导引建议
  const uniqueDaoyin = [...new Set(daoyinSuggestions)];

  // 根据问题数量和严重程度判断体质
  const severeCount = issues.filter(i => i.severity === 'severe').length;
  const moderateCount = issues.filter(i => i.severity === 'moderate').length;

  if (severeCount >= 3 || moderateCount >= 5) {
    constitution = '血瘀质';
    constitutionReason = '体态问题较多，可能导致气血运行不畅，形成瘀滞';
  } else if (severeCount >= 1 || moderateCount >= 3) {
    constitution = '气虚质';
    constitutionReason = '体态问题可能导致肌肉无力，气血运行不畅，容易出现疲劳';
  } else if (moderateCount >= 1) {
    constitution = '阳虚质';
    constitutionReason = '体态问题可能影响阳气运行，导致身体偏寒、代谢缓慢';
  } else if (issues.length > 0) {
    constitution = '气郁质';
    constitutionReason = '轻微体态问题可能影响气机调畅';
  }

  // 确保至少有基础建议
  if (meridians.length === 0) {
    meridians.push(
      { name: '督脉', status: '通畅', reason: '脊柱状态良好' },
      { name: '足太阳膀胱经', status: '通畅', reason: '背部经络正常' }
    );
  }

  if (acupoints.length === 0) {
    acupoints.push(
      { name: '足三里', location: '小腿外侧，膝下3寸', benefit: '健脾益胃，强身健体', method: '按揉5分钟，每日2次' },
      { name: '三阴交', location: '内踝上3寸', benefit: '调理肝脾肾', method: '按揉3分钟' }
    );
  }

  if (uniqueDaoyin.length === 0) {
    uniqueDaoyin.push('八段锦 - 双手托天理三焦', '五禽戏 - 鹿戏', '站桩 - 无极桩');
  }

  return {
    meridians: meridians.slice(0, 8),
    acupoints: acupoints.slice(0, 10),
    constitution,
    constitutionReason,
    daoyinSuggestions: uniqueDaoyin.slice(0, 6),
  };
}

// ==================== API Prompt ====================

// Vision语义分析系统提示词 - 增强版
const POSTURE_SEMANTIC_ANALYSIS_PROMPT = `你是一位专业的体态评估专家，精通运动医学、解剖学、中医推拿和康复训练。请根据MediaPipe检测到的骨骼关键点数据和计算出的角度，进行全面深入的体态分析。

## 输入数据说明
- 关键点坐标：33个人体关键点的位置（归一化坐标0-1）
- 关节角度：各主要关节的角度测量值
- 检测问题：系统自动识别的体态问题列表
- 四角度数据：正面、左侧、右侧、背面的检测结果
- 置信度：检测的可信程度

## 输出格式

请严格按照以下JSON格式输出，确保是有效的JSON：

{
  "summary": "<一句话总结当前体态状况，包括主要问题和风险>",
  
  "detailedAnalysis": {
    "head": {
      "status": "<状态：正常/轻度前伸/中度前伸/重度前伸/侧倾>",
      "angle": "<具体角度数据>",
      "description": "<详细描述当前状态和可能原因>",
      "impact": "<对颈椎、神经系统、血液循环的影响>"
    },
    "shoulders": {
      "status": "<状态：正常/轻度高低肩/中度高低肩/重度高低肩/圆肩>",
      "leftRightDiff": "<左右肩高度差异>",
      "roundingStatus": "<圆肩程度>",
      "description": "<详细描述>",
      "impact": "<对肩颈、呼吸、胸廓的影响>"
    },
    "spine": {
      "status": "<状态：正常/轻度侧弯/中度侧弯/重度侧弯/驼背>",
      "alignmentScore": "<脊柱对齐度百分比>",
      "curves": {
        "cervical": "<颈椎曲度状态>",
        "thoracic": "<胸椎曲度状态>",
        "lumbar": "<腰椎曲度状态>"
      },
      "description": "<详细描述>",
      "impact": "<对神经系统、内脏器官的影响>"
    },
    "pelvis": {
      "status": "<状态：正常/轻度前倾/中度前倾/重度前倾/后倾/侧倾>",
      "tiltAngle": "<倾斜角度>",
      "rotationStatus": "<旋转状态>",
      "description": "<详细描述>",
      "impact": "<对腰椎、髋关节、生殖系统的影响>"
    },
    "knees": {
      "status": "<状态：正常/轻度超伸/中度超伸/重度超伸/O型腿/X型腿>",
      "angle": "<膝角度数据>",
      "description": "<详细描述>",
      "impact": "<对膝关节、步态的影响>"
    },
    "ankles": {
      "status": "<状态：正常/足外翻/足内翻/扁平足/高弓足>",
      "description": "<详细描述>",
      "impact": "<对步态、膝盖、髋部的影响>"
    }
  },
  
  "primaryIssues": [
    {
      "issue": "<问题名称>",
      "severity": "<严重程度：轻度/中度/重度>",
      "angle": "<具体角度数据>",
      "cause": "<可能原因分析>",
      "relatedMuscles": ["<紧张的肌肉>", "<无力的肌肉>"],
      "relatedMeridians": ["<相关的经络>"],
      "recommendation": "<具体改善建议>"
    }
  ],
  
  "muscleAnalysis": {
    "tight": [
      {
        "muscle": "<肌肉名称>",
        "location": "<位置>",
        "reason": "<为何紧张>",
        "stretches": ["<推荐的拉伸动作>"]
      }
    ],
    "weak": [
      {
        "muscle": "<肌肉名称>",
        "location": "<位置>",
        "reason": "<为何无力>",
        "exercises": ["<推荐的强化动作>"]
      }
    ]
  },
  
  "fasciaChainAnalysis": {
    "frontLine": {
      "status": "<前表链状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    },
    "backLine": {
      "status": "<后表链状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    },
    "lateralLine": {
      "status": "<体侧链状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    },
    "spiralLine": {
      "status": "<螺旋链状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    },
    "deepFrontLine": {
      "status": "<深前线状态>",
      "tension": "<紧张程度>",
      "impact": "<影响>"
    }
  },
  
  "breathingAssessment": {
    "pattern": "<呼吸模式：腹式/胸式/锁骨式/混合>",
    "diaphragm": "<膈肌功能评估>",
    "accessoryMuscles": "<辅助呼吸肌状态>",
    "ribcageMobility": "<胸廓活动度>",
    "impact": "<对体态和健康的影响>"
  },
  
  "riskAssessment": {
    "painRisk": [
      {
        "area": "<疼痛风险区域>",
        "likelihood": "<可能性：高/中/低>",
        "cause": "<原因>",
        "prevention": "<预防措施>"
      }
    ],
    "organImpact": [
      {
        "organ": "<可能受影响的脏器>",
        "impact": "<影响描述>",
        "reason": "<原因>"
      }
    ],
    "progressionRisk": "<如果不改善，未来可能的发展>",
    "overallRisk": "<整体风险评估：低/中/高>"
  },
  
  "recommendations": {
    "immediate": [
      "<立即可以做的姿势调整>",
      "<日常生活中的注意事项>"
    ],
    "shortTerm": [
      "<1-2周内的改善方案>",
      "<推荐的训练频率>"
    ],
    "longTerm": [
      "<1-3个月的调理计划>",
      "<生活习惯的改变建议>"
    ],
    "exercises": [
      {
        "name": "<动作名称>",
        "category": "<类型：整复训练/本源训练/拉伸>",
        "purpose": "<目的>",
        "method": "<具体方法>",
        "duration": "<持续时间>",
        "frequency": "<频率>",
        "cautions": ["<注意事项>"]
      }
    ],
    "lifestyle": [
      {
        "area": "<生活领域：坐姿/睡姿/运动/工作>",
        "suggestion": "<具体建议>"
      }
    ]
  },
  
  "tcmPerspective": {
    "constitution": "<体质判断：平和质/气虚质/阳虚质/阴虚质/痰湿质/湿热质/血瘀质/气郁质/特禀质>",
    "constitutionReason": "<详细判断依据，结合体态问题分析>",
    "constitutionFeatures": ["<该体质的典型特征1>", "<该体质的典型特征2>"],
    "meridians": [
      {
        "name": "<经络名称>",
        "status": "<受阻/通畅/不畅>",
        "reason": "<详细原因，包括对脏腑功能的影响>",
        "symptoms": ["<可能出现的相关症状>"]
      }
    ],
    "acupoints": [
      {
        "name": "<穴位名称>",
        "location": "<精确位置描述>",
        "benefit": "<按摩此穴位的详细好处>",
        "method": "<具体的按摩方法、时长、频率>",
        "contraindications": "<禁忌或注意事项>"
      }
    ],
    "daoyinSuggestions": ["<中医导引功法建议，如八段锦、五禽戏的具体招式>"],
    "dietaryAdvice": {
      "suitable": ["<适合的食物>"],
      "avoid": ["<应避免的食物>"],
      "teaRecommendation": "<推荐的代茶饮>"
    },
    "seasonalAdvice": "<根据体质的四季养生建议>",
    "dailyRoutine": {
      "morning": "<早晨养生建议>",
      "noon": "<中午养生建议>",
      "evening": "<晚间养生建议>"
    }
  },
  
  "healthPrediction": {
    "shortTerm": "<1-3个月如果不改善可能出现的问题>",
    "midTerm": "<6个月-1年可能的发展>",
    "longTerm": "<3年以上可能出现的健康问题>",
    "preventiveMeasures": ["<预防措施>"]
  },
  
  "treatmentPlan": {
    "zhengfu": {
      "name": "整复训练方案",
      "description": "<方案描述>",
      "duration": "<建议周期>",
      "sessions": [
        {
          "week": "<第几周>",
          "focus": "<重点>",
          "exercises": ["<动作列表>"]
        }
      ]
    },
    "benyuan": {
      "name": "本源训练方案",
      "description": "<方案描述>",
      "duration": "<建议周期>",
      "sessions": [
        {
          "week": "<第几周>",
          "focus": "<重点>",
          "exercises": ["<动作列表>"]
        }
      ]
    }
  }
}`;

// POST /api/posture-semantic-analysis - Vision语义分析（增强版）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      landmarks, 
      angles, 
      issues, 
      confidence, 
      imageUrl,
      allAngles,
      allIssues 
    } = body;

    if (!landmarks && !imageUrl) {
      return NextResponse.json(
        { success: false, error: '缺少关键点数据或图片' },
        { status: 400 }
      );
    }

    // 初始化LLM客户端
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 准备消息内容
    const messages: any[] = [
      { role: 'system', content: POSTURE_SEMANTIC_ANALYSIS_PROMPT },
    ];

    // 构建详细的分析请求
    let analysisContext = '';
    
    // 添加四角度数据
    if (allAngles && allAngles.length > 0) {
      analysisContext += `\n## 四角度关节角度数据\n`;
      allAngles.forEach((angleData: any) => {
        const angleNameMap: Record<string, string> = {
          front: '正面',
          left: '左侧',
          right: '右侧',
          back: '背面'
        };
        const angleName = angleNameMap[String(angleData.angle)] || String(angleData.angle);
        
        analysisContext += `\n### ${angleName}视角\n`;
        if (angleData.angles) {
          analysisContext += `- 左肩角度: ${angleData.angles.leftShoulderAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 右肩角度: ${angleData.angles.rightShoulderAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 左髋角度: ${angleData.angles.leftHipAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 右髋角度: ${angleData.angles.rightHipAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 左膝角度: ${angleData.angles.leftKneeAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 右膝角度: ${angleData.angles.rightKneeAngle?.toFixed(1) || 'N/A'}°\n`;
          analysisContext += `- 肩部倾斜: ${angleData.angles.shoulderTilt?.toFixed(2) || 'N/A'}°\n`;
          analysisContext += `- 骨盆倾斜: ${angleData.angles.hipTilt?.toFixed(2) || 'N/A'}°\n`;
          analysisContext += `- 头部倾斜: ${angleData.angles.headTilt?.toFixed(2) || 'N/A'}°\n`;
          analysisContext += `- 脊柱对齐度: ${angleData.angles.spinalAlignment?.toFixed(1) || 'N/A'}%\n`;
          analysisContext += `- 头前伸距离: ${angleData.angles.forwardHeadProtrusion?.toFixed(1) || 'N/A'}cm\n`;
          analysisContext += `- 骨盆前倾角: ${angleData.angles.pelvicTilt?.toFixed(1) || 'N/A'}°\n`;
        }
      });
    }
    
    // 添加检测到的问题
    if (allIssues && allIssues.length > 0) {
      analysisContext += `\n## 检测到的体态问题\n`;
      allIssues.forEach((issue: any) => {
        analysisContext += `- ${issue.name}: ${issue.severity} - ${issue.description || ''}\n`;
        if (issue.anatomicalInfo) {
          if (issue.anatomicalInfo.relatedMuscles) {
            analysisContext += `  - 紧张肌肉: ${issue.anatomicalInfo.relatedMuscles.tight?.join('、') || '无'}\n`;
            analysisContext += `  - 无力肌肉: ${issue.anatomicalInfo.relatedMuscles.weak?.join('、') || '无'}\n`;
          }
        }
      });
    }
    
    // 如果有图片，使用Vision模型同时分析
    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `请结合图片和MediaPipe检测结果进行全面深入的体态分析：

**检测置信度**: ${(confidence * 100).toFixed(1)}%
${analysisContext}

请按照输出格式要求，提供详细的分析报告，包括：
1. 各部位的详细状态和健康影响
2. 主要问题及其原因分析
3. 肌肉和筋膜链状态
4. 呼吸模式评估
5. 健康风险评估
6. 具体的改善建议和训练方案
7. 中医视角的分析
8. 健康预测`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      });
    } else {
      // 纯数据分析
      messages.push({
        role: 'user',
        content: `请根据以下MediaPipe检测数据进行全面深入的体态分析：

**关键点数据**（主要关节坐标%）：
${landmarks ? `
- 鼻子: (${(landmarks[0]?.x * 100).toFixed(1)}%, ${(landmarks[0]?.y * 100).toFixed(1)}%)
- 左肩: (${(landmarks[11]?.x * 100).toFixed(1)}%, ${(landmarks[11]?.y * 100).toFixed(1)}%)
- 右肩: (${(landmarks[12]?.x * 100).toFixed(1)}%, ${(landmarks[12]?.y * 100).toFixed(1)}%)
- 左髋: (${(landmarks[23]?.x * 100).toFixed(1)}%, ${(landmarks[23]?.y * 100).toFixed(1)}%)
- 右髋: (${(landmarks[24]?.x * 100).toFixed(1)}%, ${(landmarks[24]?.y * 100).toFixed(1)}%)
- 左膝: (${(landmarks[25]?.x * 100).toFixed(1)}%, ${(landmarks[25]?.y * 100).toFixed(1)}%)
- 右膝: (${(landmarks[26]?.x * 100).toFixed(1)}%, ${(landmarks[26]?.y * 100).toFixed(1)}%)
` : '未提供'}
${analysisContext}

**置信度**: ${(confidence * 100).toFixed(1)}%

请提供详细的分析报告。`
      });
    }

    // 调用Vision模型
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-6-vision-250815',
      temperature: 0.4,
    });

    // 解析JSON响应
    let analysisResult;
    try {
      let jsonStr = response.content;
      
      // 尝试提取JSON
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // 修复可能的JSON问题
        let fixedJson = jsonMatch[0];
        // 移除尾部逗号
        fixedJson = fixedJson.replace(/,\s*}/g, '}');
        fixedJson = fixedJson.replace(/,\s*]/g, ']');
        
        analysisResult = JSON.parse(fixedJson);
      } else {
        throw new Error('未找到有效JSON');
      }
    } catch (parseError) {
      console.error('[SemanticAnalysis] JSON解析失败:', parseError);
      
      // 如果解析失败，构建基本结构
      analysisResult = {
        summary: response.content?.substring(0, 200) || '分析完成',
        detailedAnalysis: {
          head: { status: '需要进一步评估', description: '' },
          shoulders: { status: '需要进一步评估', description: '' },
          spine: { status: '需要进一步评估', description: '' },
          pelvis: { status: '需要进一步评估', description: '' },
          knees: { status: '需要进一步评估', description: '' },
          ankles: { status: '需要进一步评估', description: '' }
        },
        primaryIssues: issues || [],
        muscleAnalysis: { tight: [], weak: [] },
        fasciaChainAnalysis: {
          frontLine: { status: '需评估' },
          backLine: { status: '需评估' },
          lateralLine: { status: '需评估' },
          spiralLine: { status: '需评估' },
          deepFrontLine: { status: '需评估' }
        },
        breathingAssessment: {
          pattern: '需评估',
          diaphragm: '需评估'
        },
        riskAssessment: { 
          overallRisk: '需评估', 
          painRisk: [],
          progressionRisk: ''
        },
        recommendations: {
          immediate: ['建议进行专业体态评估'],
          shortTerm: ['建立正确的姿势意识'],
          longTerm: ['制定系统的训练计划'],
          exercises: [],
          lifestyle: []
        },
        tcmPerspective: generateTCMPerspective(issues || []),
        healthPrediction: {
          shortTerm: '建议定期复查',
          midTerm: '持续关注体态变化',
          longTerm: '预防慢性疼痛发生',
          preventiveMeasures: ['保持良好姿势', '规律运动', '定期休息']
        },
        treatmentPlan: {
          zhengfu: { 
            name: '整复训练方案', 
            description: '需专业康复师制定', 
            sessions: [] 
          },
          benyuan: { 
            name: '本源训练方案', 
            description: '需专业康复师制定', 
            sessions: [] 
          }
        },
        rawContent: response.content,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        analysisResult,
        confidence,
        detectedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('[SemanticAnalysis] 分析错误:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '语义分析失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET /api/posture-semantic-analysis - 健康检查
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Posture Semantic Analysis API is ready',
    models: ['doubao-seed-1-6-vision-250815'],
    features: [
      '四角度骨骼检测数据整合',
      '关节角度精确分析',
      '体态问题深度诊断',
      '肌肉和筋膜链评估',
      '呼吸模式分析',
      '健康风险预测',
      '中医经络穴位分析',
      '个性化训练方案'
    ]
  });
}
