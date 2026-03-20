/**
 * 五阶段训练方案生成器
 */

import { 
  Exercise, 
  SuitableIssue, 
  EXERCISE_DATABASE,
  getExercisesForIssue,
  getCategoryName 
} from './exercise-database';

// 训练阶段
export type TrainingPhase = 
  | 'phase1' // 第一阶段：姿势纠正（1-2周）
  | 'phase2' // 第二阶段：肌肉激活（2-4周）
  | 'phase3' // 第三阶段：力量强化（4-8周）
  | 'phase4' // 第四阶段：功能整合（8-12周）
  | 'phase5'; // 第五阶段：维持巩固（长期）

// 训练日程
export interface TrainingSession {
  day: string;
  focus: string;
  exercises: Exercise[];
  duration: string;
  notes: string[];
}

// 周训练计划
export interface WeeklyPlan {
  week: number;
  phase: TrainingPhase;
  objective: string;
  sessions: TrainingSession[];
  tips: string[];
  milestones: string[];
}

// 阶段详情
export interface PhaseDetail {
  id: TrainingPhase;
  name: string;
  duration: string;
  objective: string;
  description: string;
  frequency: string;
  durationPerSession: string;
  keyPoints: string[];
  expectedOutcomes: string[];
}

// 完整训练方案
export interface TrainingPlan {
  id: string;
  createdAt: string;
  issues: SuitableIssue[];
  currentPhase: TrainingPhase;
  weeklyPlans: WeeklyPlan[];
  progress: {
    completedSessions: number;
    totalSessions: number;
    completedWeeks: number;
    startDate: string;
  };
}

// ==================== 阶段定义 ====================

export const PHASE_DETAILS: Record<TrainingPhase, PhaseDetail> = {
  phase1: {
    id: 'phase1',
    name: '姿势纠正阶段',
    duration: '1-2周',
    objective: '建立正确姿势意识，纠正日常不良姿势习惯',
    description: '第一阶段重点在于唤醒身体对正确姿势的感知，通过简单的姿势训练和日常习惯调整，为后续训练打下基础。',
    frequency: '每日多次',
    durationPerSession: '10-15分钟',
    keyPoints: [
      '学会识别和纠正不良姿势',
      '建立姿势提醒机制',
      '简单的拉伸放松紧张肌肉',
      '呼吸训练改善核心意识',
    ],
    expectedOutcomes: [
      '能够识别自己的不良姿势',
      '初步建立正确姿势的习惯',
      '缓解部分肌肉紧张',
      '提升身体意识',
    ],
  },
  phase2: {
    id: 'phase2',
    name: '肌肉激活阶段',
    duration: '2-4周',
    objective: '激活无力肌肉，建立正确的肌肉募集模式',
    description: '第二阶段重点激活长期被抑制的肌肉，恢复正常的功能性肌肉活动模式，为力量训练做准备。',
    frequency: '每日2-3次',
    durationPerSession: '15-20分钟',
    keyPoints: [
      '激活深层稳定肌群',
      '改善神经肌肉控制',
      '建立正确的肌肉募集顺序',
      '初步力量耐力训练',
    ],
    expectedOutcomes: [
      '核心肌群激活能力提升',
      '正确的肌肉募集模式',
      '姿势控制能力改善',
      '日常疲劳感减轻',
    ],
  },
  phase3: {
    id: 'phase3',
    name: '力量强化阶段',
    duration: '4-8周',
    objective: '建立肌肉力量，巩固正确姿势模式',
    description: '第三阶段进行系统的力量训练，强化核心稳定肌群和主要运动肌群，使正确姿势能够轻松维持。',
    frequency: '每周3-4次',
    durationPerSession: '30-45分钟',
    keyPoints: [
      '渐进式力量训练',
      '核心稳定性强化',
      '功能性与力量训练结合',
      '分部位系统训练',
    ],
    expectedOutcomes: [
      '核心力量显著提升',
      '体态明显改善',
      '肌肉不平衡得到纠正',
      '运动能力提升',
    ],
  },
  phase4: {
    id: 'phase4',
    name: '功能整合阶段',
    duration: '8-12周',
    objective: '功能恢复，日常应用',
    description: '第四阶段将训练成果转化为功能性动作能力，在日常生活和运动中应用正确的姿势模式。',
    frequency: '每周3次',
    durationPerSession: '30-45分钟',
    keyPoints: [
      '功能性动作训练',
      '动态姿势控制',
      '运动技能整合',
      '日常生活应用',
    ],
    expectedOutcomes: [
      '功能性动作改善',
      '运动表现提升',
      '日常姿势维持',
      '疼痛明显减轻或消失',
    ],
  },
  phase5: {
    id: 'phase5',
    name: '维持巩固阶段',
    duration: '长期',
    objective: '维持改善效果，预防复发',
    description: '第五阶段是长期维护阶段，通过定期训练和生活习惯调整，维持已取得的改善效果。',
    frequency: '每周2-3次',
    durationPerSession: '20-30分钟',
    keyPoints: [
      '定期维护训练',
      '生活习惯保持',
      '定期复测评估',
      '预防性训练',
    ],
    expectedOutcomes: [
      '长期维持良好体态',
      '预防问题复发',
      '持续健康状态',
      '生活质量提升',
    ],
  },
};

// ==================== 方案生成器 ====================

// 根据问题生成个性化训练方案（生成所有阶段的计划）
export function generateTrainingPlan(issues: SuitableIssue[], currentPhase: TrainingPhase = 'phase1'): TrainingPlan {
  const weeklyPlans: WeeklyPlan[] = [];
  
  // 生成所有阶段的周计划
  weeklyPlans.push(...generatePhase1WeeklyPlans(issues));
  weeklyPlans.push(...generatePhase2WeeklyPlans(issues));
  weeklyPlans.push(...generatePhase3WeeklyPlans(issues));
  weeklyPlans.push(...generatePhase4WeeklyPlans(issues));
  weeklyPlans.push(...generatePhase5WeeklyPlans(issues));

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    issues,
    currentPhase,
    weeklyPlans,
    progress: {
      completedSessions: 0,
      totalSessions: weeklyPlans.reduce((sum, w) => sum + w.sessions.length, 0),
      completedWeeks: 0,
      startDate: new Date().toISOString(),
    },
  };
}

// 获取指定阶段的周计划
export function getPhaseWeeklyPlans(plan: TrainingPlan, phase: TrainingPhase): WeeklyPlan[] {
  return plan.weeklyPlans.filter(w => w.phase === phase);
}

// 获取所有阶段的详细信息
export function getAllPhaseDetails(): PhaseDetail[] {
  return [
    PHASE_DETAILS.phase1,
    PHASE_DETAILS.phase2,
    PHASE_DETAILS.phase3,
    PHASE_DETAILS.phase4,
    PHASE_DETAILS.phase5,
  ];
}

// 第一阶段周计划
function generatePhase1WeeklyPlans(issues: SuitableIssue[]): WeeklyPlan[] {
  const exercises = getExercisesForPhase(issues, 'phase1');
  
  return [
    {
      week: 1,
      phase: 'phase1',
      objective: '建立姿势意识，开始日常姿势调整',
      sessions: [
        {
          day: '周一',
          focus: '姿势感知与纠正',
          exercises: exercises.slice(0, 4),
          duration: '15分钟',
          notes: ['每小时检查一次姿势', '设置手机提醒'],
        },
        {
          day: '周三',
          focus: '基础拉伸',
          exercises: exercises.filter(e => e.category === 'stretch').slice(0, 4),
          duration: '15分钟',
          notes: ['注意呼吸', '动作缓慢'],
        },
        {
          day: '周五',
          focus: '呼吸与放松',
          exercises: exercises.filter(e => e.id.includes('breathing') || e.category === 'stretch').slice(0, 4),
          duration: '15分钟',
          notes: ['睡前进行', '放松身心'],
        },
        {
          day: '周日',
          focus: '综合练习',
          exercises: exercises.slice(0, 5),
          duration: '20分钟',
          notes: ['回顾本周', '巩固学习'],
        },
      ],
      tips: [
        '工作时每小时起身活动2分钟',
        '调整座椅和显示器高度',
        '睡前进行简单的拉伸',
        '记录每天的姿势改善感受',
      ],
      milestones: [
        '能够识别自己的不良姿势',
        '初步建立姿势检查习惯',
        '完成4次训练课程',
      ],
    },
    {
      week: 2,
      phase: 'phase1',
      objective: '巩固姿势意识，增加日常练习',
      sessions: [
        {
          day: '周一',
          focus: '姿势强化',
          exercises: exercises.slice(0, 5),
          duration: '15分钟',
          notes: ['增加重复次数'],
        },
        {
          day: '周三',
          focus: '拉伸与放松',
          exercises: exercises.filter(e => e.category === 'stretch').slice(0, 5),
          duration: '20分钟',
          notes: ['延长拉伸时间'],
        },
        {
          day: '周五',
          focus: '呼吸核心',
          exercises: exercises.filter(e => e.targetArea.includes('core')).slice(0, 4),
          duration: '15分钟',
          notes: ['专注呼吸'],
        },
        {
          day: '周日',
          focus: '阶段总结',
          exercises: exercises.slice(0, 6),
          duration: '25分钟',
          notes: ['准备进入下一阶段'],
        },
      ],
      tips: [
        '继续每小时姿势检查',
        '增加日常活动量',
        '注意睡眠姿势',
        '准备进入第二阶段',
      ],
      milestones: [
        '姿势意识已成为习惯',
        '能够自觉纠正不良姿势',
        '肌肉紧张有所缓解',
        '完成第一阶段训练',
      ],
    },
  ];
}

// 第二阶段周计划
function generatePhase2WeeklyPlans(issues: SuitableIssue[]): WeeklyPlan[] {
  const exercises = getExercisesForPhase(issues, 'phase2');
  
  return [
    {
      week: 1,
      phase: 'phase2',
      objective: '激活核心肌群，建立正确的肌肉募集',
      sessions: [
        {
          day: '周一',
          focus: '核心激活',
          exercises: exercises.filter(e => e.targetArea.includes('core')).slice(0, 4),
          duration: '20分钟',
          notes: ['动作缓慢', '感受肌肉发力'],
        },
        {
          day: '周二',
          focus: '肩胛稳定',
          exercises: exercises.filter(e => e.targetArea.includes('shoulder')).slice(0, 4),
          duration: '20分钟',
          notes: ['注意不要耸肩'],
        },
        {
          day: '周四',
          focus: '臀部激活',
          exercises: exercises.filter(e => e.targetArea.includes('pelvis') || e.targetArea.includes('hip')).slice(0, 4),
          duration: '20分钟',
          notes: ['臀肌发力感'],
        },
        {
          day: '周五',
          focus: '综合激活',
          exercises: exercises.slice(0, 5),
          duration: '25分钟',
          notes: ['整合训练'],
        },
        {
          day: '周日',
          focus: '拉伸恢复',
          exercises: exercises.filter(e => e.category === 'stretch').slice(0, 4),
          duration: '20分钟',
          notes: ['放松恢复'],
        },
      ],
      tips: [
        '训练前进行热身',
        '专注目标肌肉的感觉',
        '保持正确的呼吸模式',
        '训练后进行拉伸',
      ],
      milestones: [
        '能够正确激活核心',
        '感受到目标肌肉发力',
        '完成5次训练课程',
      ],
    },
    {
      week: 2,
      phase: 'phase2',
      objective: '巩固激活效果，增加训练量',
      sessions: [
        {
          day: '周一',
          focus: '核心强化',
          exercises: exercises.filter(e => e.targetArea.includes('core')).slice(0, 5),
          duration: '25分钟',
          notes: ['增加次数'],
        },
        {
          day: '周三',
          focus: '上下肢协调',
          exercises: exercises.slice(0, 5),
          duration: '25分钟',
          notes: ['整体协调'],
        },
        {
          day: '周五',
          focus: '稳定性训练',
          exercises: exercises.filter(e => e.category === 'functional').slice(0, 4),
          duration: '20分钟',
          notes: ['保持平衡'],
        },
        {
          day: '周日',
          focus: '综合评估',
          exercises: exercises.slice(0, 6),
          duration: '30分钟',
          notes: ['评估进展'],
        },
      ],
      tips: [
        '逐渐增加训练量',
        '保持训练连贯性',
        '注意休息恢复',
        '准备进入下一阶段',
      ],
      milestones: [
        '肌肉激活能力提升',
        '姿势控制改善',
        '完成第二阶段训练',
      ],
    },
  ];
}

// 第三阶段周计划
function generatePhase3WeeklyPlans(issues: SuitableIssue[]): WeeklyPlan[] {
  const exercises = getExercisesForPhase(issues, 'phase3');
  
  return [
    {
      week: 1,
      phase: 'phase3',
      objective: '开始力量训练，建立训练基础',
      sessions: [
        {
          day: '周一',
          focus: '上肢力量',
          exercises: exercises.filter(e => e.targetArea.includes('upper_back') || e.targetArea.includes('shoulder')).slice(0, 5),
          duration: '35分钟',
          notes: ['注意姿势', '渐进增加阻力'],
        },
        {
          day: '周二',
          focus: '核心力量',
          exercises: exercises.filter(e => e.targetArea.includes('core')).slice(0, 5),
          duration: '30分钟',
          notes: ['保持稳定', '增加保持时间'],
        },
        {
          day: '周四',
          focus: '下肢力量',
          exercises: exercises.filter(e => e.targetArea.includes('hip') || e.targetArea.includes('knee')).slice(0, 5),
          duration: '35分钟',
          notes: ['注意膝盖位置', '臀部发力'],
        },
        {
          day: '周六',
          focus: '综合力量',
          exercises: exercises.slice(0, 6),
          duration: '40分钟',
          notes: ['全身协调'],
        },
      ],
      tips: [
        '训练前充分热身',
        '注意动作质量',
        '保持适当休息',
        '记录训练进展',
      ],
      milestones: [
        '力量训练入门',
        '完成4次力量训练',
        '感受到力量提升',
      ],
    },
    {
      week: 2,
      phase: 'phase3',
      objective: '增加训练强度，提升力量',
      sessions: [
        {
          day: '周一',
          focus: '推类动作',
          exercises: exercises.filter(e => e.id.includes('push') || e.id.includes('plank')).slice(0, 5),
          duration: '35分钟',
          notes: ['增加难度'],
        },
        {
          day: '周三',
          focus: '拉类动作',
          exercises: exercises.filter(e => e.id.includes('row') || e.targetArea.includes('upper_back')).slice(0, 5),
          duration: '35分钟',
          notes: ['肩胛控制'],
        },
        {
          day: '周五',
          focus: '腿部力量',
          exercises: exercises.filter(e => e.id.includes('squat') || e.id.includes('lunge')).slice(0, 5),
          duration: '40分钟',
          notes: ['增加负荷'],
        },
        {
          day: '周日',
          focus: '恢复拉伸',
          exercises: exercises.filter(e => e.category === 'stretch').slice(0, 5),
          duration: '25分钟',
          notes: ['充分放松'],
        },
      ],
      tips: [
        '可以开始使用轻重量',
        '注意训练间隔休息',
        '保持营养摄入',
        '充足睡眠',
      ],
      milestones: [
        '力量明显提升',
        '动作更流畅',
        '体态持续改善',
      ],
    },
  ];
}

// 第四阶段周计划
function generatePhase4WeeklyPlans(issues: SuitableIssue[]): WeeklyPlan[] {
  const exercises = getExercisesForPhase(issues, 'phase4');
  
  return [
    {
      week: 1,
      phase: 'phase4',
      objective: '功能性训练，转化训练成果',
      sessions: [
        {
          day: '周一',
          focus: '动态稳定性',
          exercises: exercises.filter(e => e.category === 'functional').slice(0, 5),
          duration: '35分钟',
          notes: ['动态中保持姿势'],
        },
        {
          day: '周三',
          focus: '多平面运动',
          exercises: exercises.slice(0, 5),
          duration: '35分钟',
          notes: ['不同方向'],
        },
        {
          day: '周五',
          focus: '功能性整合',
          exercises: exercises.slice(0, 6),
          duration: '40分钟',
          notes: ['日常应用'],
        },
      ],
      tips: [
        '训练动作接近日常活动',
        '注意动作速度控制',
        '保持良好姿势',
        '开始日常应用',
      ],
      milestones: [
        '动态姿势控制改善',
        '日常活动更轻松',
        '疼痛明显减轻',
      ],
    },
  ];
}

// 第五阶段周计划
function generatePhase5WeeklyPlans(issues: SuitableIssue[]): WeeklyPlan[] {
  const exercises = getExercisesForPhase(issues, 'phase5');
  
  return [
    {
      week: 1,
      phase: 'phase5',
      objective: '维持训练，预防复发',
      sessions: [
        {
          day: '周一',
          focus: '综合维护',
          exercises: exercises.slice(0, 5),
          duration: '25分钟',
          notes: ['保持习惯'],
        },
        {
          day: '周四',
          focus: '力量维持',
          exercises: exercises.filter(e => e.category === 'strengthening').slice(0, 4),
          duration: '25分钟',
          notes: ['维持力量'],
        },
        {
          day: '周日',
          focus: '拉伸恢复',
          exercises: exercises.filter(e => e.category === 'stretch').slice(0, 4),
          duration: '20分钟',
          notes: ['放松恢复'],
        },
      ],
      tips: [
        '定期体态复测（每3个月）',
        '保持良好生活习惯',
        '持续姿势意识',
        '适时调整训练',
      ],
      milestones: [
        '维持良好体态',
        '无明显复发',
        '生活质量提升',
      ],
    },
  ];
}

// 获取阶段对应的动作
function getExercisesForPhase(issues: SuitableIssue[], phase: TrainingPhase): Exercise[] {
  const phaseExerciseIds: Record<TrainingPhase, string[]> = {
    phase1: [
      'standing-posture-correction',
      'wall-stand',
      'breathing-exercise',
      'neck-chin-tuck',
      'chest-stretch-doorway',
      'pelvic-tilt',
      'cat-cow-stretch',
    ],
    phase2: [
      'dead-bug',
      'bird-dog',
      'glute-bridge',
      'scapular-retraction',
      'lower-trap-activation',
      'clamshell',
      'external-rotation',
      'serratus-push-up',
    ],
    phase3: [
      'plank',
      'side-plank',
      'squat',
      'lunge',
      'wall-sit',
      'ytw-exercise',
      'wall-angels',
      'single-leg-stance',
    ],
    phase4: [
      'squat',
      'lunge',
      'single-leg-stance',
      'bird-dog',
      'plank',
      'dead-bug',
      'glute-bridge',
    ],
    phase5: [
      'plank',
      'glute-bridge',
      'scapular-retraction',
      'neck-chin-tuck',
      'chest-stretch-doorway',
      'hip-flexor-stretch',
      'hamstring-stretch',
    ],
  };

  const phaseIds = phaseExerciseIds[phase] || [];
  const exercises: Exercise[] = [];
  
  // 首先添加阶段特定动作
  phaseIds.forEach(id => {
    const ex = EXERCISE_DATABASE.find(e => e.id === id);
    if (ex) exercises.push(ex);
  });
  
  // 然后添加针对问题的动作
  issues.forEach(issue => {
    const issueExercises = getExercisesForIssue(issue);
    issueExercises.forEach(ex => {
      if (!exercises.find(e => e.id === ex.id)) {
        exercises.push(ex);
      }
    });
  });
  
  return exercises.slice(0, 10); // 限制每次训练最多10个动作
}

// 获取阶段详情
export function getPhaseDetail(phase: TrainingPhase): PhaseDetail {
  return PHASE_DETAILS[phase];
}

// 获取阶段名称
export function getPhaseName(phase: TrainingPhase): string {
  return PHASE_DETAILS[phase].name;
}

// 获取下一阶段
export function getNextPhase(currentPhase: TrainingPhase): TrainingPhase | null {
  const phases: TrainingPhase[] = ['phase1', 'phase2', 'phase3', 'phase4', 'phase5'];
  const currentIndex = phases.indexOf(currentPhase);
  if (currentIndex < phases.length - 1) {
    return phases[currentIndex + 1];
  }
  return null;
}

// 计算完成百分比
export function calculateProgress(plan: TrainingPlan): number {
  if (plan.progress.totalSessions === 0) return 0;
  return Math.round((plan.progress.completedSessions / plan.progress.totalSessions) * 100);
}

// 生成每日任务
export function generateDailyTasks(phase: TrainingPhase, issues: SuitableIssue[]): string[] {
  const tasks: Record<TrainingPhase, string[]> = {
    phase1: [
      '每小时检查姿势并纠正',
      '进行3次下巴后缩练习',
      '完成早晚各10分钟拉伸',
      '睡前进行腹式呼吸练习',
      '记录今日姿势改善感受',
    ],
    phase2: [
      '完成核心激活训练',
      '进行肩胛稳定性练习',
      '臀部激活训练',
      '训练后拉伸放松',
      '保持日常姿势意识',
    ],
    phase3: [
      '完成今日力量训练计划',
      '训练前热身10分钟',
      '训练后拉伸放松',
      '注意蛋白质摄入',
      '保证充足睡眠',
    ],
    phase4: [
      '完成功能性训练',
      '日常活动中注意姿势',
      '训练后恢复拉伸',
      '记录功能改善情况',
    ],
    phase5: [
      '完成维护训练',
      '保持日常姿势习惯',
      '定期进行拉伸放松',
      '注意身体信号',
    ],
  };
  
  return tasks[phase] || [];
}

// 导出
export { type SuitableIssue };
