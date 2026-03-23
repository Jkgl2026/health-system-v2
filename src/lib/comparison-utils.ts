/**
 * 诊断记录对比分析工具
 * 用于对比同一用户的不同次评估记录
 * 支持面诊、舌诊、体态评估三种类型的完整对比
 */

// ==================== 类型定义 ====================

export interface ComparisonItem {
  category: string;        // 分类：面色、五官、五脏等
  name: string;            // 项目名称
  previous: string;        // 之前状态
  current: string;         // 当前状态
  change: 'improved' | 'declined' | 'stable' | 'changed';  // 变化类型
  severity?: 'mild' | 'moderate' | 'significant';  // 变化程度
  detail?: string;         // 详细说明
}

export interface ComparisonResult {
  // 评分变化
  scoreChange: number;
  previousScore: number;
  currentScore: number;
  
  // 改善项
  improvements: ComparisonItem[];
  
  // 退步项
  deteriorations: ComparisonItem[];
  
  // 变化项（无法判断好坏）
  changes: ComparisonItem[];
  
  // 稳定项
  stableItems: ComparisonItem[];
  
  // 趋势
  trend: 'improving' | 'declining' | 'stable';
  
  // 建议
  recommendations: string[];
  
  // 详细对比数据
  detailedComparison: {
    // 面诊/舌诊通用
    organStatus?: OrganStatusComparison;
    
    // 面诊专用
    faceColor?: ComparisonItem;
    faceLuster?: ComparisonItem;
    facialFeatures?: ComparisonItem[];
    facialCharacteristics?: ComparisonItem[];
    constitution?: ComparisonItem;
    
    // 舌诊专用
    tongueBody?: ComparisonItem;
    tongueCoating?: ComparisonItem;
    
    // 体态评估专用
    postureIssues?: ComparisonItem[];
    muscles?: ComparisonItem[];
    healthRisks?: ComparisonItem[];
  };
}

export interface OrganStatusComparison {
  heart: { previous: number; current: number; change: number };
  liver: { previous: number; current: number; change: number };
  spleen: { previous: number; current: number; change: number };
  lung: { previous: number; current: number; change: number };
  kidney: { previous: number; current: number; change: number };
}

// ==================== 面诊对比 ====================

/**
 * 面诊记录完整对比
 */
export function compareFaceDiagnosisRecords(
  previousRecord: any,
  currentRecord: any
): ComparisonResult {
  const improvements: ComparisonItem[] = [];
  const deteriorations: ComparisonItem[] = [];
  const changes: ComparisonItem[] = [];
  const stableItems: ComparisonItem[] = [];
  const recommendations: string[] = [];

  // 提取数据
  const prev = previousRecord;
  const curr = currentRecord;

  // ==================== 1. 评分对比 ====================
  const prevScore = prev.score || 0;
  const currScore = curr.score || 0;
  const scoreChange = currScore - prevScore;

  // ==================== 2. 面色对比 ====================
  let faceColorComparison: ComparisonItem | undefined;
  if (prev.faceColor || curr.faceColor) {
    const prevColor = prev.faceColor?.color || prev.face_color || '未检测';
    const currColor = curr.faceColor?.color || curr.face_color || '未检测';
    
    if (prevColor !== currColor) {
      const result = compareFaceColorValue(prevColor, currColor);
      faceColorComparison = {
        category: '面色',
        name: '面色',
        previous: prevColor,
        current: currColor,
        change: result.improved ? 'improved' : 'declined',
        severity: 'moderate',
        detail: prev.faceColor?.meaning || curr.faceColor?.meaning,
      };
      
      if (result.improved) {
        improvements.push(faceColorComparison);
      } else {
        deteriorations.push(faceColorComparison);
      }
    } else {
      const item: ComparisonItem = {
        category: '面色',
        name: '面色',
        previous: prevColor,
        current: currColor,
        change: 'stable',
      };
      stableItems.push(item);
      faceColorComparison = item;
    }
  }

  // ==================== 3. 光泽对比 ====================
  let faceLusterComparison: ComparisonItem | undefined;
  if (prev.faceLuster || curr.faceLuster) {
    const prevLuster = prev.faceLuster?.status || '未检测';
    const currLuster = curr.faceLuster?.status || '未检测';
    
    if (prevLuster !== currLuster) {
      const improved = currLuster.includes('明润');
      faceLusterComparison = {
        category: '光泽',
        name: '面色光泽',
        previous: prevLuster,
        current: currLuster,
        change: improved ? 'improved' : 'declined',
        severity: 'mild',
      };
      
      if (improved) {
        improvements.push(faceLusterComparison);
      } else {
        deteriorations.push(faceLusterComparison);
      }
    } else {
      const item: ComparisonItem = {
        category: '光泽',
        name: '面色光泽',
        previous: prevLuster,
        current: currLuster,
        change: 'stable',
      };
      stableItems.push(item);
      faceLusterComparison = item;
    }
  }

  // ==================== 4. 五官对比 ====================
  const facialFeaturesComparisons: ComparisonItem[] = [];
  if (prev.facialFeatures || curr.facialFeatures) {
    const prevFeatures = prev.facialFeatures || prev.features || {};
    const currFeatures = curr.facialFeatures || curr.features || {};
    
    const featureList = [
      { key: 'eyes', name: '眼睛', organ: '肝' },
      { key: 'nose', name: '鼻子', organ: '脾/肺' },
      { key: 'lips', name: '嘴唇', organ: '脾' },
      { key: 'ears', name: '耳朵', organ: '肾' },
      { key: 'forehead', name: '额头', organ: '心' },
    ];
    
    featureList.forEach(({ key, name, organ }) => {
      const prevFeature = prevFeatures[key] || {};
      const currFeature = currFeatures[key] || {};
      const prevStatus = prevFeature.status || '正常';
      const currStatus = currFeature.status || '正常';
      
      if (prevStatus !== currStatus) {
        const improved = currStatus === '正常' || currStatus.includes('正常');
        const item: ComparisonItem = {
          category: '五官',
          name: `${name}（${organ}）`,
          previous: prevStatus,
          current: currStatus,
          change: improved ? 'improved' : 'declined',
          severity: 'moderate',
          detail: currFeature.issues?.join('、') || prevFeature.issues?.join('、'),
        };
        facialFeaturesComparisons.push(item);
        
        if (improved) {
          improvements.push(item);
        } else {
          deteriorations.push(item);
        }
      } else {
        const item: ComparisonItem = {
          category: '五官',
          name: `${name}（${organ}）`,
          previous: prevStatus,
          current: currStatus,
          change: 'stable',
        };
        stableItems.push(item);
        facialFeaturesComparisons.push(item);
      }
    });
  }

  // ==================== 5. 面部特征对比 ====================
  const facialCharacteristicsComparisons: ComparisonItem[] = [];
  if (prev.facialCharacteristics || curr.facialCharacteristics) {
    const prevChar = prev.facialCharacteristics || {};
    const currChar = curr.facialCharacteristics || {};
    
    const charList = [
      { key: 'spots', name: '面部斑点' },
      { key: 'acne', name: '痤疮' },
      { key: 'wrinkles', name: '皱纹' },
      { key: 'puffiness', name: '面部浮肿' },
      { key: 'darkCircles', name: '黑眼圈' },
    ];
    
    charList.forEach(({ key, name }) => {
      const prevVal = prevChar[key] || '无';
      const currVal = currChar[key] || '无';
      
      if (prevVal !== currVal) {
        const improved = currVal === '无' || currVal === '正常';
        const item: ComparisonItem = {
          category: '面部特征',
          name,
          previous: prevVal,
          current: currVal,
          change: improved ? 'improved' : 'declined',
          severity: 'mild',
        };
        facialCharacteristicsComparisons.push(item);
        
        if (improved) {
          improvements.push(item);
        } else {
          deteriorations.push(item);
        }
      } else if (prevVal !== '无' && prevVal !== '正常') {
        const item: ComparisonItem = {
          category: '面部特征',
          name,
          previous: prevVal,
          current: currVal,
          change: 'stable',
        };
        stableItems.push(item);
        facialCharacteristicsComparisons.push(item);
      }
    });
  }

  // ==================== 6. 体质对比 ====================
  let constitutionComparison: ComparisonItem | undefined;
  const prevConstitution = prev.constitution?.type || prev.constitution;
  const currConstitution = curr.constitution?.type || curr.constitution;
  
  if (prevConstitution && currConstitution) {
    if (prevConstitution !== currConstitution) {
      constitutionComparison = {
        category: '体质',
        name: '体质判断',
        previous: prevConstitution,
        current: currConstitution,
        change: 'changed',
        severity: 'significant',
        detail: curr.constitution?.confidence ? `置信度: ${curr.constitution.confidence}%` : undefined,
      };
      changes.push(constitutionComparison);
    } else {
      const item: ComparisonItem = {
        category: '体质',
        name: '体质判断',
        previous: prevConstitution,
        current: currConstitution,
        change: 'stable',
      };
      stableItems.push(item);
      constitutionComparison = item;
    }
  }

  // ==================== 7. 五脏状态对比 ====================
  let organStatusComparison: OrganStatusComparison | undefined;
  if (prev.organStatus || curr.organStatus) {
    const prevOrgans = prev.organStatus || {};
    const currOrgans = curr.organStatus || {};
    
    organStatusComparison = {
      heart: calculateOrganChange(prevOrgans.heart, currOrgans.heart),
      liver: calculateOrganChange(prevOrgans.liver, currOrgans.liver),
      spleen: calculateOrganChange(prevOrgans.spleen, currOrgans.spleen),
      lung: calculateOrganChange(prevOrgans.lung, currOrgans.lung),
      kidney: calculateOrganChange(prevOrgans.kidney, currOrgans.kidney),
    };

    // 根据五脏变化添加改善/退步项
    Object.entries(organStatusComparison).forEach(([organ, data]) => {
      const organName = getOrganName(organ);
      if (Math.abs(data.change) >= 5) {
        const item: ComparisonItem = {
          category: '五脏状态',
          name: `${organName}功能`,
          previous: `${data.previous}分`,
          current: `${data.current}分`,
          change: data.change > 0 ? 'improved' : 'declined',
          severity: Math.abs(data.change) > 10 ? 'significant' : 'moderate',
        };
        
        if (data.change > 0) {
          improvements.push(item);
        } else {
          deteriorations.push(item);
        }
      }
    });
  }

  // ==================== 8. 生成建议 ====================
  if (improvements.length > 0) {
    recommendations.push(`✅ 改善项目：${improvements.map(i => i.name).join('、')}`);
  }
  if (deteriorations.length > 0) {
    recommendations.push(`⚠️ 需关注：${deteriorations.map(i => i.name).join('、')}`);
    recommendations.push('建议咨询中医师进行专业调理');
  }
  if (scoreChange > 5) {
    recommendations.push('整体评分提升，继续保持良好生活习惯');
  } else if (scoreChange < -5) {
    recommendations.push('整体评分下降，建议调整生活作息');
  }
  if (stableItems.length > 5) {
    recommendations.push('大部分指标稳定，建议定期复查');
  }

  // ==================== 9. 计算趋势 ====================
  const improvementScore = improvements.length * 2 + (scoreChange > 0 ? scoreChange / 10 : 0);
  const deteriorationScore = deteriorations.length * 2 + (scoreChange < 0 ? Math.abs(scoreChange) / 10 : 0);
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (improvementScore > deteriorationScore + 1) {
    trend = 'improving';
  } else if (deteriorationScore > improvementScore + 1) {
    trend = 'declining';
  }

  return {
    scoreChange,
    previousScore: prevScore,
    currentScore: currScore,
    improvements,
    deteriorations,
    changes,
    stableItems,
    trend,
    recommendations,
    detailedComparison: {
      organStatus: organStatusComparison,
      faceColor: faceColorComparison,
      faceLuster: faceLusterComparison,
      facialFeatures: facialFeaturesComparisons,
      facialCharacteristics: facialCharacteristicsComparisons,
      constitution: constitutionComparison,
    },
  };
}

// ==================== 舌诊对比 ====================

/**
 * 舌诊记录完整对比
 */
export function compareTongueDiagnosisRecords(
  previousRecord: any,
  currentRecord: any
): ComparisonResult {
  const improvements: ComparisonItem[] = [];
  const deteriorations: ComparisonItem[] = [];
  const changes: ComparisonItem[] = [];
  const stableItems: ComparisonItem[] = [];
  const recommendations: string[] = [];

  const prev = previousRecord;
  const curr = currentRecord;

  // ==================== 1. 评分对比 ====================
  const prevScore = prev.score || 0;
  const currScore = curr.score || 0;
  const scoreChange = currScore - prevScore;

  // ==================== 2. 舌质对比 ====================
  let tongueBodyComparison: ComparisonItem | undefined;
  if (prev.tongueBody || curr.tongueBody) {
    const prevBody = prev.tongueBody || {};
    const currBody = curr.tongueBody || {};
    
    // 舌色
    const prevColor = prevBody.color || '未检测';
    const currColor = currBody.color || '未检测';
    // 舌形
    const prevShape = prevBody.shape || '正常';
    const currShape = currBody.shape || '正常';
    
    const colorChanged = prevColor !== currColor;
    const shapeChanged = prevShape !== currShape;
    
    if (colorChanged || shapeChanged) {
      const colorImproved = currColor === '淡红' || currColor === '红';
      const shapeImproved = currShape === '正常' || currShape === '适中';
      
      tongueBodyComparison = {
        category: '舌质',
        name: '舌质分析',
        previous: `${prevColor}，${prevShape}`,
        current: `${currColor}，${currShape}`,
        change: (colorImproved && shapeImproved) ? 'improved' : 
                (!colorImproved || !shapeImproved) ? 'declined' : 'changed',
        severity: 'moderate',
        detail: currBody.meaning || prevBody.meaning,
      };
      
      if (colorImproved && shapeImproved) {
        improvements.push(tongueBodyComparison);
      } else {
        deteriorations.push(tongueBodyComparison);
      }
    } else {
      const item: ComparisonItem = {
        category: '舌质',
        name: '舌质分析',
        previous: `${prevColor}，${prevShape}`,
        current: `${currColor}，${currShape}`,
        change: 'stable',
      };
      stableItems.push(item);
      tongueBodyComparison = item;
    }
  }

  // ==================== 3. 舌苔对比 ====================
  let tongueCoatingComparison: ComparisonItem | undefined;
  if (prev.tongueCoating || curr.tongueCoating) {
    const prevCoating = prev.tongueCoating || {};
    const currCoating = curr.tongueCoating || {};
    
    const prevColor = prevCoating.color || '未检测';
    const currColor = currCoating.color || '未检测';
    const prevThickness = prevCoating.thickness || '未检测';
    const currThickness = currCoating.thickness || '未检测';
    const prevMoisture = prevCoating.moisture || '未检测';
    const currMoisture = currCoating.moisture || '未检测';
    
    const colorChanged = prevColor !== currColor;
    const thicknessChanged = prevThickness !== currThickness;
    const moistureChanged = prevMoisture !== currMoisture;
    
    if (colorChanged || thicknessChanged || moistureChanged) {
      // 判断舌苔是否改善（薄白苔为正常）
      const isNormalCoating = (color: string, thickness: string) => 
        (color === '白' || color === '薄白') && (thickness === '薄' || thickness === '薄苔');
      
      const prevNormal = isNormalCoating(prevColor, prevThickness);
      const currNormal = isNormalCoating(currColor, currThickness);
      
      tongueCoatingComparison = {
        category: '舌苔',
        name: '舌苔分析',
        previous: `${prevColor}，${prevThickness}，${prevMoisture}`,
        current: `${currColor}，${currThickness}，${currMoisture}`,
        change: currNormal && !prevNormal ? 'improved' : 
                !currNormal && prevNormal ? 'declined' : 'changed',
        severity: 'moderate',
        detail: currCoating.meaning || prevCoating.meaning,
      };
      
      if (currNormal && !prevNormal) {
        improvements.push(tongueCoatingComparison);
      } else if (!currNormal && prevNormal) {
        deteriorations.push(tongueCoatingComparison);
      } else {
        changes.push(tongueCoatingComparison);
      }
    } else {
      const item: ComparisonItem = {
        category: '舌苔',
        name: '舌苔分析',
        previous: `${prevColor}，${prevThickness}，${prevMoisture}`,
        current: `${currColor}，${currThickness}，${currMoisture}`,
        change: 'stable',
      };
      stableItems.push(item);
      tongueCoatingComparison = item;
    }
  }

  // ==================== 4. 体质对比 ====================
  let constitutionComparison: ComparisonItem | undefined;
  const prevConstitution = prev.constitution?.type || prev.constitution;
  const currConstitution = curr.constitution?.type || curr.constitution;
  
  if (prevConstitution && currConstitution) {
    if (prevConstitution !== currConstitution) {
      constitutionComparison = {
        category: '体质',
        name: '体质判断',
        previous: prevConstitution,
        current: currConstitution,
        change: 'changed',
        severity: 'significant',
      };
      changes.push(constitutionComparison);
    } else {
      const item: ComparisonItem = {
        category: '体质',
        name: '体质判断',
        previous: prevConstitution,
        current: currConstitution,
        change: 'stable',
      };
      stableItems.push(item);
      constitutionComparison = item;
    }
  }

  // ==================== 5. 五脏状态对比 ====================
  let organStatusComparison: OrganStatusComparison | undefined;
  if (prev.organStatus || curr.organStatus) {
    const prevOrgans = prev.organStatus || {};
    const currOrgans = curr.organStatus || {};
    
    organStatusComparison = {
      heart: calculateOrganChange(prevOrgans.heart, currOrgans.heart),
      liver: calculateOrganChange(prevOrgans.liver, currOrgans.liver),
      spleen: calculateOrganChange(prevOrgans.spleen, currOrgans.spleen),
      lung: calculateOrganChange(prevOrgans.lung, currOrgans.lung),
      kidney: calculateOrganChange(prevOrgans.kidney, currOrgans.kidney),
    };

    Object.entries(organStatusComparison).forEach(([organ, data]) => {
      const organName = getOrganName(organ);
      if (Math.abs(data.change) >= 5) {
        const item: ComparisonItem = {
          category: '五脏状态',
          name: `${organName}功能`,
          previous: `${data.previous}分`,
          current: `${data.current}分`,
          change: data.change > 0 ? 'improved' : 'declined',
          severity: Math.abs(data.change) > 10 ? 'significant' : 'moderate',
        };
        
        if (data.change > 0) {
          improvements.push(item);
        } else {
          deteriorations.push(item);
        }
      }
    });
  }

  // ==================== 6. 生成建议 ====================
  if (improvements.length > 0) {
    recommendations.push(`✅ 改善项目：${improvements.map(i => i.name).join('、')}`);
  }
  if (deteriorations.length > 0) {
    recommendations.push(`⚠️ 需关注：${deteriorations.map(i => i.name).join('、')}`);
    recommendations.push('建议调整饮食起居，必要时咨询中医师');
  }
  if (tongueBodyComparison?.change === 'stable' && tongueCoatingComparison?.change === 'stable') {
    recommendations.push('舌象整体稳定，继续保持');
  }
  if (scoreChange > 5) {
    recommendations.push('整体评分提升，调理效果良好');
  }

  // ==================== 7. 计算趋势 ====================
  const improvementScore = improvements.length * 2 + (scoreChange > 0 ? scoreChange / 10 : 0);
  const deteriorationScore = deteriorations.length * 2 + (scoreChange < 0 ? Math.abs(scoreChange) / 10 : 0);
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (improvementScore > deteriorationScore + 1) {
    trend = 'improving';
  } else if (deteriorationScore > improvementScore + 1) {
    trend = 'declining';
  }

  return {
    scoreChange,
    previousScore: prevScore,
    currentScore: currScore,
    improvements,
    deteriorations,
    changes,
    stableItems,
    trend,
    recommendations,
    detailedComparison: {
      organStatus: organStatusComparison,
      tongueBody: tongueBodyComparison,
      tongueCoating: tongueCoatingComparison,
      constitution: constitutionComparison,
    },
  };
}

// ==================== 体态评估对比 ====================

/**
 * 体态评估记录完整对比
 */
export function comparePostureDiagnosisRecords(
  previousRecord: any,
  currentRecord: any
): ComparisonResult {
  const improvements: ComparisonItem[] = [];
  const deteriorations: ComparisonItem[] = [];
  const changes: ComparisonItem[] = [];
  const stableItems: ComparisonItem[] = [];
  const recommendations: string[] = [];

  const prev = previousRecord;
  const curr = currentRecord;

  // ==================== 1. 评分对比 ====================
  const prevScore = prev.overallScore || prev.score || 0;
  const currScore = curr.overallScore || curr.score || 0;
  const scoreChange = currScore - prevScore;

  // 等级对比
  const prevGrade = prev.grade || '';
  const currGrade = curr.grade || '';
  
  if (prevGrade !== currGrade && prevGrade && currGrade) {
    const item: ComparisonItem = {
      category: '整体评估',
      name: '评估等级',
      previous: `${prevGrade}级`,
      current: `${currGrade}级`,
      change: currGrade < prevGrade ? 'improved' : 'declined', // A比B好
      severity: 'significant',
    };
    changes.push(item);
  }

  // ==================== 2. 体态问题对比 ====================
  const postureIssuesComparisons: ComparisonItem[] = [];
  const prevIssues = (prev.issues || []).map((i: any) => ({
    type: i.type,
    name: i.name,
    severity: i.severity,
    angle: i.angle,
  }));
  const currIssues = (curr.issues || []).map((i: any) => ({
    type: i.type,
    name: i.name,
    severity: i.severity,
    angle: i.angle,
  }));

  const prevIssueTypes = new Set(prevIssues.map((i: any) => i.type));
  const currIssueTypes = new Set(currIssues.map((i: any) => i.type));

  // 已改善的问题
  prevIssues.forEach((issue: any) => {
    if (!currIssueTypes.has(issue.type)) {
      const item: ComparisonItem = {
        category: '体态问题',
        name: issue.name,
        previous: `${getSeverityText(issue.severity)} (${issue.angle?.toFixed(1) || ''}°)`,
        current: '已改善',
        change: 'improved',
        severity: 'significant',
      };
      improvements.push(item);
      postureIssuesComparisons.push(item);
    }
  });

  // 新出现的问题
  currIssues.forEach((issue: any) => {
    if (!prevIssueTypes.has(issue.type)) {
      const item: ComparisonItem = {
        category: '体态问题',
        name: issue.name,
        previous: '无',
        current: `${getSeverityText(issue.severity)} (${issue.angle?.toFixed(1) || ''}°)`,
        change: 'declined',
        severity: 'moderate',
      };
      deteriorations.push(item);
      postureIssuesComparisons.push(item);
    }
  });

  // 持续存在的问题（对比严重程度）
  prevIssues.forEach((prevIssue: any) => {
    const currIssue = currIssues.find((i: any) => i.type === prevIssue.type);
    if (currIssue) {
      const severityChanged = prevIssue.severity !== currIssue.severity;
      const angleChanged = Math.abs((prevIssue.angle || 0) - (currIssue.angle || 0)) > 2;
      
      if (severityChanged || angleChanged) {
        const improved = getSeverityLevel(currIssue.severity) < getSeverityLevel(prevIssue.severity);
        const item: ComparisonItem = {
          category: '体态问题',
          name: prevIssue.name,
          previous: `${getSeverityText(prevIssue.severity)} (${prevIssue.angle?.toFixed(1) || ''}°)`,
          current: `${getSeverityText(currIssue.severity)} (${currIssue.angle?.toFixed(1) || ''}°)`,
          change: improved ? 'improved' : 'declined',
          severity: 'moderate',
        };
        
        if (improved) {
          improvements.push(item);
        } else {
          deteriorations.push(item);
        }
        postureIssuesComparisons.push(item);
      } else {
        const item: ComparisonItem = {
          category: '体态问题',
          name: prevIssue.name,
          previous: `${getSeverityText(prevIssue.severity)}`,
          current: `${getSeverityText(currIssue.severity)}`,
          change: 'stable',
        };
        stableItems.push(item);
        postureIssuesComparisons.push(item);
      }
    }
  });

  // ==================== 3. 肌肉状态对比 ====================
  const musclesComparisons: ComparisonItem[] = [];
  const prevMuscles = prev.muscles || prev.allMuscles || [];
  const currMuscles = curr.muscles || curr.allMuscles || [];

  if (prevMuscles.length > 0 || currMuscles.length > 0) {
    const prevMuscleMap = new Map(prevMuscles.map((m: any) => [m.name, m]));
    const currMuscleMap = new Map(currMuscles.map((m: any) => [m.name, m]));
    
    // 所有肌肉名称
    const allMuscleNames = new Set<string>([...prevMuscleMap.keys(), ...currMuscleMap.keys()] as string[]);
    
    allMuscleNames.forEach((name: string) => {
      const prevMuscle = prevMuscleMap.get(name) as { name: string; status: string } | undefined;
      const currMuscle = currMuscleMap.get(name) as { name: string; status: string } | undefined;
      
      if (!prevMuscle && currMuscle) {
        const item: ComparisonItem = {
          category: '肌肉状态',
          name: name,
          previous: '正常',
          current: `${getMuscleStatusText(currMuscle.status)}`,
          change: 'declined',
          severity: 'mild',
        };
        deteriorations.push(item);
        musclesComparisons.push(item);
      } else if (prevMuscle && !currMuscle) {
        const item: ComparisonItem = {
          category: '肌肉状态',
          name: name,
          previous: `${getMuscleStatusText(prevMuscle.status)}`,
          current: '正常',
          change: 'improved',
          severity: 'mild',
        };
        improvements.push(item);
        musclesComparisons.push(item);
      } else if (prevMuscle && currMuscle && prevMuscle.status !== currMuscle.status) {
        const item: ComparisonItem = {
          category: '肌肉状态',
          name: name,
          previous: `${getMuscleStatusText(prevMuscle.status)}`,
          current: `${getMuscleStatusText(currMuscle.status)}`,
          change: 'changed',
          severity: 'mild',
        };
        changes.push(item);
        musclesComparisons.push(item);
      }
    });
  }

  // ==================== 4. 生成建议 ====================
  if (improvements.length > 0) {
    recommendations.push(`✅ 改善项目：${improvements.map(i => i.name).slice(0, 5).join('、')}`);
  }
  if (deteriorations.length > 0) {
    recommendations.push(`⚠️ 新增/恶化：${deteriorations.map(i => i.name).slice(0, 5).join('、')}`);
    recommendations.push('建议加强相关部位训练');
  }
  if (scoreChange > 5) {
    recommendations.push('体态评分提升，训练效果显著，继续保持');
  } else if (scoreChange < -5) {
    recommendations.push('体态评分下降，建议增加训练频率');
  }
  if (improvements.length > deteriorations.length) {
    recommendations.push('整体趋势向好，坚持训练计划');
  }

  // ==================== 5. 计算趋势 ====================
  const improvementScore = improvements.length * 2 + (scoreChange > 0 ? scoreChange / 5 : 0);
  const deteriorationScore = deteriorations.length * 2 + (scoreChange < 0 ? Math.abs(scoreChange) / 5 : 0);
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (improvementScore > deteriorationScore + 2) {
    trend = 'improving';
  } else if (deteriorationScore > improvementScore + 2) {
    trend = 'declining';
  }

  return {
    scoreChange,
    previousScore: prevScore,
    currentScore: currScore,
    improvements,
    deteriorations,
    changes,
    stableItems,
    trend,
    recommendations,
    detailedComparison: {
      postureIssues: postureIssuesComparisons,
      muscles: musclesComparisons,
    },
  };
}

// ==================== 辅助函数 ====================

function calculateOrganChange(prev: number = 70, curr: number = 70): { previous: number; current: number; change: number } {
  return {
    previous: prev,
    current: curr,
    change: curr - prev,
  };
}

export function getOrganName(organ: string): string {
  const names: Record<string, string> = {
    heart: '心',
    liver: '肝',
    spleen: '脾',
    lung: '肺',
    kidney: '肾',
  };
  return names[organ] || organ;
}

function compareFaceColorValue(prev: string, curr: string): { improved: boolean } {
  const colorScore: Record<string, number> = {
    '红润': 5,
    '正常': 5,
    '淡红': 4,
    '黄': 3,
    '偏黄': 3,
    '白': 3,
    '偏白': 3,
    '青': 2,
    '偏青': 2,
    '黑': 1,
    '偏黑': 1,
  };
  const prevScore = colorScore[prev] || 3;
  const currScore = colorScore[curr] || 3;
  return { improved: currScore > prevScore };
}

function getSeverityText(severity: string): string {
  const texts: Record<string, string> = {
    'mild': '轻度',
    'moderate': '中度',
    'severe': '重度',
    '轻度': '轻度',
    '中度': '中度',
    '重度': '重度',
  };
  return texts[severity] || severity || '未知';
}

function getSeverityLevel(severity: string): number {
  const levels: Record<string, number> = {
    'mild': 1,
    '轻度': 1,
    'moderate': 2,
    '中度': 2,
    'severe': 3,
    '重度': 3,
  };
  return levels[severity] || 0;
}

function getMuscleStatusText(status: string): string {
  const texts: Record<string, string> = {
    'tight': '紧张',
    'weak': '无力',
    'overactive': '过度活跃',
    'inhibited': '抑制',
  };
  return texts[status] || status || '异常';
}
