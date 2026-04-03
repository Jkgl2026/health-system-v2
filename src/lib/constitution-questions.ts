// 中医体质辨识问卷（基于《中医体质分类与判定》标准）
// 每种体质7-8个问题，采用5级评分制（1=没有，2=很少，3=有时，4=经常，5=总是）

export interface ConstitutionQuestion {
  id: string;
  question: string;
  score: number;
  maxScore: number;
  reverse?: boolean; // 是否为反向题（分数越高体质越差）
  femaleOnly?: boolean; // 是否仅适用于女性
  maleOnly?: boolean; // 是否仅适用于男性
}

export const CONSTITUTION_QUESTIONS: Record<string, ConstitutionQuestion[]> = {
  // 平和质 - 参照组，8个问题
  PINGHE: [
    {
      id: 'pinghe_1',
      question: '您精力充沛吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'pinghe_2',
      question: '您说话声音低弱无力吗？',
      score: 0,
      maxScore: 5,
      reverse: true // 反向题，分数越高体质越差
    },
    {
      id: 'pinghe_3',
      question: '您容易疲乏吗？',
      score: 0,
      maxScore: 5,
      reverse: true
    },
    {
      id: 'pinghe_4',
      question: '您面色晦暗或容易出现褐斑吗？',
      score: 0,
      maxScore: 5,
      reverse: true
    },
    {
      id: 'pinghe_5',
      question: '您容易心慌气短吗？',
      score: 0,
      maxScore: 5,
      reverse: true
    },
    {
      id: 'pinghe_6',
      question: '您容易失眠或睡眠质量差吗？',
      score: 0,
      maxScore: 5,
      reverse: true
    },
    {
      id: 'pinghe_7',
      question: '您容易忘事（健忘）吗？',
      score: 0,
      maxScore: 5,
      reverse: true
    },
    {
      id: 'pinghe_8',
      question: '您食欲正常吗？',
      score: 0,
      maxScore: 5
    }
  ],

  // 气虚质 - 8个问题
  QIXU: [
    {
      id: 'qixu_1',
      question: '您容易疲乏吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qixu_2',
      question: '您容易气短（呼吸短促，接不上气）吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qixu_3',
      question: '您比一般人容易感冒吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qixu_4',
      question: '您喜欢安静、懒得说话吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qixu_5',
      question: '您说话声音低弱无力吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qixu_6',
      question: '您活动量稍大就容易出虚汗吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qixu_7',
      question: '您容易头晕吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qixu_8',
      question: '您容易心慌吗？',
      score: 0,
      maxScore: 5
    }
  ],

  // 阳虚质 - 7个问题
  YANGXU: [
    {
      id: 'yangxu_1',
      question: '您手脚发凉吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yangxu_2',
      question: '您胃脘部、背部或腰膝部怕冷吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yangxu_3',
      question: '您比一般人怕冷吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yangxu_4',
      question: '您喝（吃）凉的的东西会感到不舒服或怕喝（吃）凉的吃喝？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yangxu_5',
      question: '您受凉或吃（喝）凉的东西后，容易拉肚子吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yangxu_6',
      question: '您比一般人容易感冒吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yangxu_7',
      question: '您小便次数多吗？',
      score: 0,
      maxScore: 5
    }
  ],

  // 阴虚质 - 8个问题
  YINXU: [
    {
      id: 'yinxu_1',
      question: '您感到口干咽燥、总想喝水吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yinxu_2',
      question: '您手心脚心发热吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yinxu_3',
      question: '您感觉身体、脸上发热吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yinxu_4',
      question: '您皮肤或口唇干吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yinxu_5',
      question: '您大便干结吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yinxu_6',
      question: '您容易心慌或感到心慌吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yinxu_7',
      question: '您容易失眠或睡眠质量差吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'yinxu_8',
      question: '您容易盗汗吗？',
      score: 0,
      maxScore: 5
    }
  ],

  // 痰湿质 - 8个问题
  TANSHI: [
    {
      id: 'tanshi_1',
      question: '您感到胸闷或腹部胀满吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tanshi_2',
      question: '您感到身体沉重不轻松或不爽快吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tanshi_3',
      question: '您腹部肥满松软吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tanshi_4',
      question: '您有额部油脂分泌多的现象吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tanshi_5',
      question: '您上眼睑比别人肿（上眼睑有轻微隆起的现象）吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tanshi_6',
      question: '您嘴里有黏黏的感觉吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tanshi_7',
      question: '您平时痰多，特别是咽喉部总感到有痰堵着吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tanshi_8',
      question: '您舌苔厚腻吗？',
      score: 0,
      maxScore: 5
    }
  ],

  // 湿热质 - 7个问题
  SHIRE: [
    {
      id: 'shire_1',
      question: '您面部或鼻部有油腻感或者油亮发光吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'shire_2',
      question: '您容易生痤疮或疮疖吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'shire_3',
      question: '您感到口苦或嘴里有异味吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'shire_4',
      question: '您大便黏滞不爽、有解不尽的感觉吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'shire_5',
      question: '您小便时尿道有发热感、尿色浓（深）吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'shire_6',
      question: '您带下色黄（白带颜色发黄）吗？（限女性回答）',
      score: 0,
      maxScore: 5,
      femaleOnly: true
    },
    {
      id: 'shire_7',
      question: '您的阴囊部位潮湿吗？（限男性回答）',
      score: 0,
      maxScore: 5,
      maleOnly: true
    }
  ],

  // 血瘀质 - 7个问题
  XUEYU: [
    {
      id: 'xueyu_1',
      question: '您的皮肤在不知不觉中会出现青紫瘀斑（皮下出血）吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'xueyu_2',
      question: '您的两颧部有细微红丝吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'xueyu_3',
      question: '您身体上有哪里疼痛（刺痛），而且部位固定吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'xueyu_4',
      question: '您面色晦黯或容易出现褐斑吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'xueyu_5',
      question: '您容易有黑眼圈吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'xueyu_6',
      question: '您嘴唇颜色偏黯吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'xueyu_7',
      question: '您的舌质颜色偏黯吗？',
      score: 0,
      maxScore: 5
    }
  ],

  // 气郁质 - 7个问题
  QIYU: [
    {
      id: 'qiyu_1',
      question: '您感到闷闷不乐、情绪低沉吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qiyu_2',
      question: '您容易精神紧张、焦虑不安吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qiyu_3',
      question: '您无缘无故叹气吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qiyu_4',
      question: '您容易心慌心跳吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qiyu_5',
      question: '您容易对事物不感兴趣，甚至不想说话吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qiyu_6',
      question: '您容易想哭或容易哭吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'qiyu_7',
      question: '您经常咽喉部有异物感，且吐之不出、咽之不下吗？',
      score: 0,
      maxScore: 5
    }
  ],

  // 特禀质 - 7个问题
  TEBING: [
    {
      id: 'tebing_1',
      question: '您没有感冒时也会打喷嚏吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tebing_2',
      question: '您没有感冒时也会鼻塞、流鼻涕吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tebing_3',
      question: '您容易过敏（对药物、食物、气味、花粉等）吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tebing_4',
      question: '您的皮肤容易起荨麻疹（风团、风疹块、风疙瘩）吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tebing_5',
      question: '您的皮肤因过敏出现过紫癜（紫红色瘀点、瘀斑）吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tebing_6',
      question: '您的皮肤一抓就红，并出现抓痕吗？',
      score: 0,
      maxScore: 5
    },
    {
      id: 'tebing_7',
      question: '您的皮肤容易过敏吗？',
      score: 0,
      maxScore: 5
    }
  ]
};

// 体质名称映射
export const CONSTITUTION_NAMES = {
  PINGHE: '平和质',
  QIXU: '气虚质',
  YANGXU: '阳虚质',
  YINXU: '阴虚质',
  TANSHI: '痰湿质',
  SHIRE: '湿热质',
  XUEYU: '血瘀质',
  QIYU: '气郁质',
  TEBING: '特禀质'
};

// 计算体质得分
export function calculateConstitutionScore(answers: Record<string, number>): Record<string, number> {
  const scores: Record<string, number> = {};
  const transformedScores: Record<string, number> = {};

  // 计算原始得分
  Object.entries(CONSTITUTION_QUESTIONS).forEach(([constitutionType, questions]) => {
    let rawScore = 0;
    questions.forEach(q => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        if (q.reverse) {
          // 反向题，分数转换：1→5, 2→4, 3→3, 4→2, 5→1
          rawScore += (6 - answer);
        } else {
          rawScore += answer;
        }
      }
    });
    scores[constitutionType] = rawScore;
  });

  // 计算转化分：转化分 = [(原始分 - 题数) / (题数 × 4)] × 100
  Object.entries(CONSTITUTION_QUESTIONS).forEach(([constitutionType, questions]) => {
    const rawScore = scores[constitutionType];
    const questionCount = questions.length;
    const transformedScore = Math.round(((rawScore - questionCount) / (questionCount * 4)) * 100);
    transformedScores[constitutionType] = Math.max(0, Math.min(100, transformedScore));
  });

  return transformedScores;
}

// 判断体质类型
export function determineConstitutionType(scores: Record<string, number>): {
  primary: string;
  secondary: string[];
  isBalanced: boolean;
} {
  const scoreEntries = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  // 如果没有有效得分，返回默认值
  if (scoreEntries.length === 0) {
    return {
      primary: '平和质',
      secondary: [],
      isBalanced: true
    };
  }

  // 平和质判断标准：平和质转化分 ≥ 60分，且其他8种体质转化分均 < 30分
  const pingheScore = scores['PINGHE'] || 0;
  const isBalanced = pingheScore >= 60 && scoreEntries.slice(1).every(([_, score]) => score < 30);

  if (isBalanced) {
    return {
      primary: '平和质',
      secondary: [],
      isBalanced: true
    };
  }

  // 偏颇体质：转化分 ≥ 40分
  const secondary = scoreEntries
    .filter(([type, score]) => type !== 'PINGHE' && score >= 40)
    .slice(0, 3)
    .map(([type]) => {
      const name = CONSTITUTION_NAMES[type as keyof typeof CONSTITUTION_NAMES];
      return name || type; // 如果找不到映射，使用原始键名
    });

  const primaryType = scoreEntries[0][0];
  const primaryName = CONSTITUTION_NAMES[primaryType as keyof typeof CONSTITUTION_NAMES] || primaryType;

  // 确保 primaryName 不是 undefined
  const safePrimaryName = primaryName || '平和质';

  return {
    primary: safePrimaryName,
    secondary,
    isBalanced: false
  };
}

// 获取所有问题（平铺）
export function getAllQuestions() {
  const allQuestions: any[] = [];
  Object.entries(CONSTITUTION_QUESTIONS).forEach(([type, questions]) => {
    questions.forEach(q => {
      allQuestions.push({
        ...q,
        constitutionType: type
      });
    });
  });
  return allQuestions;
}
