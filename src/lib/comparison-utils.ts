/**
 * 诊断记录对比分析工具
 * 用于对比同一用户的不同次评估记录
 */

export interface ComparisonResult {
  // 评分变化
  scoreChange: number;
  
  // 改善项
  improvements: ComparisonItem[];
  
  // 退步项
  deteriorations: ComparisonItem[];
  
  // 稳定项
  stableItems: string[];
  
  // 趋势
  trend: 'improving' | 'declining' | 'stable';
  
  // 建议
  recommendations: string[];
  
  // 五脏状态对比（如果有）
  organStatusComparison?: OrganStatusComparison;
}

export interface ComparisonItem {
  name: string;
  previous: string;
  current: string;
  change: string;
  severity?: 'mild' | 'moderate' | 'significant';
}

export interface OrganStatusComparison {
  heart: { previous: number; current: number; change: number };
  liver: { previous: number; current: number; change: number };
  spleen: { previous: number; current: number; change: number };
  lung: { previous: number; current: number; change: number };
  kidney: { previous: number; current: number; change: number };
}

/**
 * 面诊记录对比
 */
export function compareFaceDiagnosisRecords(
  previousRecord: any,
  currentRecord: any
): ComparisonResult {
  const improvements: ComparisonItem[] = [];
  const deteriorations: ComparisonItem[] = [];
  const stableItems: string[] = [];
  const recommendations: string[] = [];

  // 1. 面色对比
  if (previousRecord.face_color && currentRecord.face_color) {
    const prevColor = normalizeColor(previousRecord.face_color);
    const currColor = normalizeColor(currentRecord.face_color);
    
    if (prevColor !== currColor) {
      const colorComparison = compareFaceColor(prevColor, currColor);
      if (colorComparison.improved) {
        improvements.push({
          name: '面色',
          previous: prevColor,
          current: currColor,
          change: '改善',
          severity: 'mild',
        });
      } else {
        deteriorations.push({
          name: '面色',
          previous: prevColor,
          current: currColor,
          change: '需关注',
          severity: 'mild',
        });
      }
    } else {
      stableItems.push('面色');
    }
  }

  // 2. 体质对比
  if (previousRecord.constitution && currentRecord.constitution) {
    if (previousRecord.constitution !== currentRecord.constitution) {
      improvements.push({
        name: '体质',
        previous: previousRecord.constitution,
        current: currentRecord.constitution,
        change: '变化',
        severity: 'moderate',
      });
    } else {
      stableItems.push('体质');
    }
  }

  // 3. 五脏状态对比
  let organStatusComparison: OrganStatusComparison | undefined;
  if (previousRecord.organStatus && currentRecord.organStatus) {
    organStatusComparison = {
      heart: calculateOrganChange(previousRecord.organStatus.heart, currentRecord.organStatus.heart),
      liver: calculateOrganChange(previousRecord.organStatus.liver, currentRecord.organStatus.liver),
      spleen: calculateOrganChange(previousRecord.organStatus.spleen, currentRecord.organStatus.spleen),
      lung: calculateOrganChange(previousRecord.organStatus.lung, currentRecord.organStatus.lung),
      kidney: calculateOrganChange(previousRecord.organStatus.kidney, currentRecord.organStatus.kidney),
    };

    // 根据五脏变化添加改善/退步项
    Object.entries(organStatusComparison).forEach(([organ, data]) => {
      const organName = getOrganName(organ);
      if (data.change > 5) {
        improvements.push({
          name: `${organName}功能`,
          previous: `${data.previous}分`,
          current: `${data.current}分`,
          change: `+${data.change}分`,
          severity: data.change > 10 ? 'significant' : 'moderate',
        });
      } else if (data.change < -5) {
        deteriorations.push({
          name: `${organName}功能`,
          previous: `${data.previous}分`,
          current: `${data.current}分`,
          change: `${data.change}分`,
          severity: Math.abs(data.change) > 10 ? 'significant' : 'moderate',
        });
      }
    });
  }

  // 4. 生成建议
  if (improvements.length > 0) {
    recommendations.push('继续保持良好的生活习惯');
  }
  if (deteriorations.length > 0) {
    recommendations.push('建议关注变化项目，必要时咨询中医师');
  }
  if (stableItems.length >= 3) {
    recommendations.push('整体状态稳定，建议定期复查');
  }

  // 5. 计算趋势
  const totalImprovements = improvements.length;
  const totalDeteriorations = deteriorations.length;
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  
  if (totalImprovements > totalDeteriorations) {
    trend = 'improving';
  } else if (totalDeteriorations > totalImprovements) {
    trend = 'declining';
  }

  return {
    scoreChange: 0, // 面诊暂无总分
    improvements,
    deteriorations,
    stableItems,
    trend,
    recommendations,
    organStatusComparison,
  };
}

/**
 * 舌诊记录对比
 */
export function compareTongueDiagnosisRecords(
  previousRecord: any,
  currentRecord: any
): ComparisonResult {
  const improvements: ComparisonItem[] = [];
  const deteriorations: ComparisonItem[] = [];
  const stableItems: string[] = [];
  const recommendations: string[] = [];

  // 1. 舌色对比
  if (previousRecord.tongueBody?.color && currentRecord.tongueBody?.color) {
    if (previousRecord.tongueBody.color !== currentRecord.tongueBody.color) {
      const comparison = compareTongueColor(previousRecord.tongueBody.color, currentRecord.tongueBody.color);
      if (comparison.improved) {
        improvements.push({
          name: '舌色',
          previous: previousRecord.tongueBody.color,
          current: currentRecord.tongueBody.color,
          change: '改善',
        });
      } else {
        deteriorations.push({
          name: '舌色',
          previous: previousRecord.tongueBody.color,
          current: currentRecord.tongueBody.color,
          change: '需关注',
        });
      }
    } else {
      stableItems.push('舌色');
    }
  }

  // 2. 舌苔对比
  if (previousRecord.tongueCoating?.thickness && currentRecord.tongueCoating?.thickness) {
    if (previousRecord.tongueCoating.thickness !== currentRecord.tongueCoating.thickness) {
      const comparison = compareCoating(previousRecord.tongueCoating.thickness, currentRecord.tongueCoating.thickness);
      if (comparison.improved) {
        improvements.push({
          name: '舌苔厚度',
          previous: previousRecord.tongueCoating.thickness,
          current: currentRecord.tongueCoating.thickness,
          change: '改善',
        });
      } else {
        deteriorations.push({
          name: '舌苔厚度',
          previous: previousRecord.tongueCoating.thickness,
          current: currentRecord.tongueCoating.thickness,
          change: '增厚',
        });
      }
    } else {
      stableItems.push('舌苔厚度');
    }
  }

  // 3. 体质对比
  if (previousRecord.constitution?.type && currentRecord.constitution?.type) {
    if (previousRecord.constitution.type !== currentRecord.constitution.type) {
      improvements.push({
        name: '体质',
        previous: previousRecord.constitution.type,
        current: currentRecord.constitution.type,
        change: '变化',
      });
    } else {
      stableItems.push('体质');
    }
  }

  // 4. 五脏状态对比
  let organStatusComparison: OrganStatusComparison | undefined;
  if (previousRecord.organStatus && currentRecord.organStatus) {
    organStatusComparison = {
      heart: calculateOrganChange(previousRecord.organStatus.heart, currentRecord.organStatus.heart),
      liver: calculateOrganChange(previousRecord.organStatus.liver, currentRecord.organStatus.liver),
      spleen: calculateOrganChange(previousRecord.organStatus.spleen, currentRecord.organStatus.spleen),
      lung: calculateOrganChange(previousRecord.organStatus.lung, currentRecord.organStatus.lung),
      kidney: calculateOrganChange(previousRecord.organStatus.kidney, currentRecord.organStatus.kidney),
    };
  }

  // 5. 生成建议
  if (improvements.length > deteriorations.length) {
    recommendations.push('舌象整体改善，继续保持良好生活习惯');
  } else if (deteriorations.length > improvements.length) {
    recommendations.push('舌象有变化，建议调整饮食起居');
  } else {
    recommendations.push('舌象稳定，建议定期复查');
  }

  // 计算趋势
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (improvements.length > deteriorations.length) {
    trend = 'improving';
  } else if (deteriorations.length > improvements.length) {
    trend = 'declining';
  }

  return {
    scoreChange: 0,
    improvements,
    deteriorations,
    stableItems,
    trend,
    recommendations,
    organStatusComparison,
  };
}

/**
 * 体态评估记录对比
 */
export function comparePostureDiagnosisRecords(
  previousRecord: any,
  currentRecord: any
): ComparisonResult {
  const improvements: ComparisonItem[] = [];
  const deteriorations: ComparisonItem[] = [];
  const stableItems: string[] = [];
  const recommendations: string[] = [];

  // 1. 总分对比
  const prevScore = previousRecord.overallScore || previousRecord.score || 0;
  const currScore = currentRecord.overallScore || currentRecord.score || 0;
  const scoreChange = currScore - prevScore;

  // 2. 问题对比
  const prevIssues = (previousRecord.issues || []).map((i: any) => i.type || i);
  const currIssues = (currentRecord.issues || []).map((i: any) => i.type || i);

  // 已改善的问题
  prevIssues.forEach((issue: string) => {
    if (!currIssues.includes(issue)) {
      improvements.push({
        name: getIssueName(issue),
        previous: '存在',
        current: '已改善',
        change: '改善',
        severity: 'moderate',
      });
    }
  });

  // 新出现的问题
  currIssues.forEach((issue: string) => {
    if (!prevIssues.includes(issue)) {
      deteriorations.push({
        name: getIssueName(issue),
        previous: '无',
        current: '存在',
        change: '新问题',
        severity: 'moderate',
      });
    }
  });

  // 持续存在的问题
  prevIssues.forEach((issue: string) => {
    if (currIssues.includes(issue)) {
      stableItems.push(getIssueName(issue));
    }
  });

  // 3. 生成建议
  if (scoreChange > 5) {
    recommendations.push('体态评分提升，训练效果良好，继续保持');
  } else if (scoreChange < -5) {
    recommendations.push('体态评分下降，建议加强训练');
  } else {
    recommendations.push('体态稳定，坚持训练');
  }

  if (improvements.length > 0) {
    recommendations.push(`已改善问题：${improvements.map(i => i.name).join('、')}`);
  }
  if (deteriorations.length > 0) {
    recommendations.push(`新增问题：${deteriorations.map(i => i.name).join('、')}，建议重点关注`);
  }

  // 计算趋势
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (scoreChange > 3 || improvements.length > deteriorations.length) {
    trend = 'improving';
  } else if (scoreChange < -3 || deteriorations.length > improvements.length) {
    trend = 'declining';
  }

  return {
    scoreChange,
    improvements,
    deteriorations,
    stableItems,
    trend,
    recommendations,
  };
}

// 辅助函数

function normalizeColor(color: string): string {
  const colorMap: Record<string, string> = {
    '偏黄': '黄',
    '偏白': '白',
    '偏青': '青',
    '偏黑': '黑',
    '偏红': '红',
    '红润': '正常',
  };
  return colorMap[color] || color;
}

function compareFaceColor(prev: string, curr: string): { improved: boolean } {
  const colorScore: Record<string, number> = {
    '正常': 5,
    '红润': 5,
    '黄': 3,
    '白': 3,
    '青': 2,
    '黑': 1,
  };
  const prevScore = colorScore[prev] || 3;
  const currScore = colorScore[curr] || 3;
  return { improved: currScore > prevScore };
}

function compareTongueColor(prev: string, curr: string): { improved: boolean } {
  const colorScore: Record<string, number> = {
    '淡红': 5,
    '红': 4,
    '淡白': 3,
    '绛红': 2,
    '青紫': 1,
  };
  const prevScore = colorScore[prev] || 3;
  const currScore = colorScore[curr] || 3;
  return { improved: currScore > prevScore };
}

function compareCoating(prev: string, curr: string): { improved: boolean } {
  const coatingScore: Record<string, number> = {
    '薄苔': 5,
    '少苔': 4,
    '薄白': 5,
    '厚苔': 2,
    '腻苔': 1,
  };
  const prevScore = coatingScore[prev] || 3;
  const currScore = coatingScore[curr] || 3;
  return { improved: currScore > prevScore };
}

function calculateOrganChange(prev: number = 70, curr: number = 70): { previous: number; current: number; change: number } {
  return {
    previous: prev,
    current: curr,
    change: curr - prev,
  };
}

function getOrganName(organ: string): string {
  const names: Record<string, string> = {
    heart: '心',
    liver: '肝',
    spleen: '脾',
    lung: '肺',
    kidney: '肾',
  };
  return names[organ] || organ;
}

function getIssueName(issue: string): string {
  const names: Record<string, string> = {
    'forward_head': '头前伸',
    'rounded_shoulders': '圆肩',
    'winged_scapula': '翼状肩',
    'anterior_pelvic_tilt': '骨盆前倾',
    'posterior_pelvic_tilt': '骨盆后倾',
    'scoliosis': '脊柱侧弯',
    'knock_knees': '膝外翻',
    'bow_legs': '膝内翻',
    'flat_feet': '扁平足',
    'high_arches': '高足弓',
  };
  return names[issue] || issue;
}
