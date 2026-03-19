/**
 * 体态改善动作数据库 - 50+专业动作
 */

// 动作分类
export type ExerciseCategory = 
  | 'stretch'      // 拉伸类
  | 'activation'   // 激活类
  | 'strengthening' // 强化类
  | 'functional';  // 功能训练类

// 目标部位
export type TargetArea = 
  | 'neck'         // 颈部
  | 'shoulder'     // 肩部
  | 'upper_back'   // 上背部
  | 'lower_back'   // 下背部
  | 'core'         // 核心
  | 'pelvis'       // 骨盆
  | 'hip'          // 髋部
  | 'knee'         // 膝关节
  | 'ankle'        // 踝关节
  | 'full_body';   // 全身

// 适用问题
export type SuitableIssue = 
  | 'forward_head'
  | 'rounded_shoulder'
  | 'elevated_shoulder'
  | 'thoracic_hyperkyphosis'
  | 'scapular_protraction'
  | 'winging_scapula'
  | 'frozen_shoulder_risk'
  | 'lumbar_hyperlordosis'
  | 'spinal_rotation'
  | 'anterior_pelvic_tilt'
  | 'posterior_pelvic_tilt'
  | 'pelvic_obliquity'
  | 'scoliosis'
  | 'si_joint_dysfunction'
  | 'genu_recuvatum'
  | 'genu_valgum'
  | 'genu_varum'
  | 'flat_foot'
  | 'heel_valgus'
  | 'upper_crossed'
  | 'lower_crossed'
  | 'general';

// 难度等级
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// 动作详情接口
export interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  category: ExerciseCategory;
  targetArea: TargetArea[];
  targetMuscles: string[];
  suitableIssues: SuitableIssue[];
  difficulty: DifficultyLevel;
  
  // 动作描述
  description: string;
  purpose: string;
  
  // 执行方法
  instructions: string[];
  breathing: string;
  
  // 训练参数
  duration: string;      // 持续时间
  repetitions: string;   // 次数
  sets: string;          // 组数
  frequency: string;     // 频率
  
  // 注意事项
  cautions: string[];
  commonMistakes: string[];
  
  // 进退阶
  regression: string;    // 简单版
  progression: string;   // 进阶版
  
  // 替代动作
  alternatives: string[];
  
  // 图片标识（对应SVG文件名）
  imageId: string;
  
  // 是否推荐
  recommended: boolean;
}

// ==================== 动作数据库 ====================

export const EXERCISE_DATABASE: Exercise[] = [
  // ==================== 颈部动作 ====================
  {
    id: 'neck-chin-tuck',
    name: '下巴后缩',
    nameEn: 'Chin Tuck',
    category: 'activation',
    targetArea: ['neck'],
    targetMuscles: ['颈深屈肌'],
    suitableIssues: ['forward_head', 'upper_crossed'],
    difficulty: 'beginner',
    description: '通过主动后缩下巴激活深层颈屈肌，纠正头前伸姿势',
    purpose: '激活颈深屈肌，改善头前伸，恢复颈椎正常曲度',
    instructions: [
      '坐直或站直，目视前方',
      '用手指轻推下巴向后移动',
      '感觉后脑勺向上延伸，颈部后侧拉长',
      '保持3-5秒后放松',
      '重复10-15次'
    ],
    breathing: '收缩时呼气，放松时吸气',
    duration: '3-5秒/次',
    repetitions: '10-15次',
    sets: '3组',
    frequency: '每日3-5次',
    cautions: [
      '不要低头，下巴水平后移',
      '动作要缓慢，不要用力过猛',
      '如有颈椎病变请咨询医生'
    ],
    commonMistakes: ['低头代替后缩', '过度用力', '耸肩'],
    regression: '仰卧位进行，减少幅度',
    progression: '增加保持时间至10秒',
    alternatives: ['颈部等长收缩'],
    imageId: 'neck-chin-tuck',
    recommended: true,
  },
  {
    id: 'neck-side-stretch',
    name: '颈部侧屈拉伸',
    nameEn: 'Neck Side Stretch',
    category: 'stretch',
    targetArea: ['neck', 'shoulder'],
    targetMuscles: ['上斜方肌', '肩胛提肌', '斜角肌'],
    suitableIssues: ['forward_head', 'elevated_shoulder', 'upper_crossed'],
    difficulty: 'beginner',
    description: '拉伸颈部侧面肌肉，缓解颈肩紧张',
    purpose: '放松紧张的斜方肌和肩胛提肌，改善颈肩疼痛',
    instructions: [
      '坐直，肩膀放松下沉',
      '右手放在左耳上方',
      '轻柔地将头向右侧倾斜',
      '感觉左侧颈部拉伸',
      '保持30秒，换边重复'
    ],
    breathing: '拉伸时深呼吸，保持自然呼吸',
    duration: '30秒/侧',
    repetitions: '2-3次/侧',
    sets: '2组',
    frequency: '每日2-3次',
    cautions: [
      '不要用力拉扯',
      '有颈椎病变者减少幅度',
      '出现疼痛立即停止'
    ],
    commonMistakes: ['过度用力', '肩膀耸起', '头部旋转'],
    regression: '减小拉伸幅度',
    progression: '加入轻度前倾增加前斜角肌拉伸',
    alternatives: ['斜角肌拉伸'],
    imageId: 'neck-side-stretch',
    recommended: true,
  },
  {
    id: 'levator-scapulae-stretch',
    name: '肩胛提肌拉伸',
    nameEn: 'Levator Scapulae Stretch',
    category: 'stretch',
    targetArea: ['neck', 'upper_back'],
    targetMuscles: ['肩胛提肌'],
    suitableIssues: ['elevated_shoulder', 'forward_head', 'upper_crossed'],
    difficulty: 'beginner',
    description: '针对肩胛提肌的深度拉伸，缓解颈肩交界处紧张',
    purpose: '放松肩胛提肌，改善高低肩和颈肩疼痛',
    instructions: [
      '坐直，将右手放在身后',
      '左手越过头顶，抓住右耳后方',
      '将头部向左前方45°方向轻拉',
      '感觉右侧颈后肩胛提肌拉伸',
      '保持30秒，换边'
    ],
    breathing: '拉伸时深呼吸，保持自然呼吸',
    duration: '30秒/侧',
    repetitions: '2-3次/侧',
    sets: '2组',
    frequency: '每日2-3次',
    cautions: [
      '动作轻柔，不要扭转头部',
      '保持肩膀下沉',
      '有疼痛立即停止'
    ],
    commonMistakes: ['头部过度旋转', '肩膀耸起', '过度用力'],
    regression: '减小拉伸幅度',
    progression: '增加头部前倾角度',
    alternatives: ['颈部后外侧拉伸'],
    imageId: 'levator-scapulae-stretch',
    recommended: true,
  },

  // ==================== 肩部动作 ====================
  {
    id: 'chest-stretch-doorway',
    name: '门框胸肌拉伸',
    nameEn: 'Doorway Chest Stretch',
    category: 'stretch',
    targetArea: ['shoulder', 'upper_back'],
    targetMuscles: ['胸大肌', '胸小肌', '三角肌前束'],
    suitableIssues: ['rounded_shoulder', 'upper_crossed', 'thoracic_hyperkyphosis'],
    difficulty: 'beginner',
    description: '利用门框进行胸肌深度拉伸，改善圆肩',
    purpose: '拉伸紧张的胸肌，改善肩部前伸，打开胸廓',
    instructions: [
      '站在门框前，双手抬起与肩同高',
      '前臂贴在门框两侧',
      '身体向前迈一步，穿过门框',
      '感觉胸部前侧拉伸',
      '保持30-60秒'
    ],
    breathing: '拉伸时深呼吸，感受胸廓扩张',
    duration: '30-60秒',
    repetitions: '2-3次',
    sets: '2组',
    frequency: '每日2-3次',
    cautions: [
      '不要过度后仰',
      '肩膀放松不要耸起',
      '如有肩部疼痛减少幅度'
    ],
    commonMistakes: ['手臂位置过高或过低', '过度前倾', '耸肩'],
    regression: '单侧交替进行',
    progression: '调整手臂高度拉伸不同纤维',
    alternatives: ['墙壁胸肌拉伸', '泡沫轴胸椎伸展'],
    imageId: 'chest-stretch-doorway',
    recommended: true,
  },
  {
    id: 'scapular-retraction',
    name: '肩胛骨后缩',
    nameEn: 'Scapular Retraction',
    category: 'activation',
    targetArea: ['upper_back', 'shoulder'],
    targetMuscles: ['菱形肌', '中斜方肌', '前锯肌'],
    suitableIssues: ['rounded_shoulder', 'scapular_protraction', 'upper_crossed'],
    difficulty: 'beginner',
    description: '激活中斜方肌和菱形肌，改善肩胛骨位置',
    purpose: '增强肩胛骨稳定肌群，纠正圆肩',
    instructions: [
      '坐直或站直，双臂自然下垂',
      '肩膀向后、向下移动',
      '感觉两侧肩胛骨向脊柱靠拢',
      '保持5秒后放松',
      '重复15-20次'
    ],
    breathing: '后缩时呼气，放松时吸气',
    duration: '5秒/次',
    repetitions: '15-20次',
    sets: '3组',
    frequency: '每日3-5次',
    cautions: [
      '不要耸肩',
      '动作幅度适中',
      '不要过度夹紧'
    ],
    commonMistakes: ['耸肩代替后缩', '过度用力', '腰部过度前凸'],
    regression: '减少保持时间',
    progression: '使用弹力带增加阻力',
    alternatives: ['YTW训练'],
    imageId: 'scapular-retraction',
    recommended: true,
  },
  {
    id: 'wall-angels',
    name: '墙壁天使',
    nameEn: 'Wall Angels',
    category: 'strengthening',
    targetArea: ['upper_back', 'shoulder'],
    targetMuscles: ['下斜方肌', '中斜方肌', '菱形肌', '前锯肌'],
    suitableIssues: ['rounded_shoulder', 'thoracic_hyperkyphosis', 'upper_crossed'],
    difficulty: 'intermediate',
    description: '在墙上进行手臂上下滑动，强化肩胛稳定肌群',
    purpose: '改善肩胛骨活动度，强化下斜方肌，纠正驼背',
    instructions: [
      '靠墙站立，脚跟离墙一脚距离',
      '臀部、上背部、后脑勺贴墙',
      '双臂贴墙举起呈"W"形',
      '手臂沿墙向上滑动至最大限度',
      '缓慢下放，重复10-15次'
    ],
    breathing: '上滑时呼气，下放时吸气',
    duration: '10-15次',
    repetitions: '10-15次',
    sets: '3组',
    frequency: '每日2-3次',
    cautions: [
      '保持腰椎不要过度前凸',
      '手臂全程贴墙',
      '不要耸肩'
    ],
    commonMistakes: ['腰部离墙', '手臂离墙', '耸肩'],
    regression: '减少活动范围',
    progression: '手持轻重量',
    alternatives: ['地板天使', '泡沫轴胸椎伸展'],
    imageId: 'wall-angels',
    recommended: true,
  },
  {
    id: 'ytw-exercise',
    name: 'YTW训练',
    nameEn: 'YTW Exercise',
    category: 'strengthening',
    targetArea: ['upper_back', 'shoulder'],
    targetMuscles: ['下斜方肌', '中斜方肌', '菱形肌', '三角肌后束'],
    suitableIssues: ['rounded_shoulder', 'winging_scapula', 'upper_crossed'],
    difficulty: 'intermediate',
    description: '俯卧进行Y、T、W三种姿势的手臂训练',
    purpose: '全面强化肩胛稳定肌群，改善肩部姿势',
    instructions: [
      '俯卧在垫子上，额头轻触地面',
      'Y字：双臂向前上方举起，拇指朝上',
      'T字：双臂向两侧展开，与躯干垂直',
      'W字：双臂屈肘，形成W形，挤压肩胛骨',
      '每个姿势保持3秒，各做10次'
    ],
    breathing: '举起时呼气，下放时吸气',
    duration: '3秒/姿势',
    repetitions: '各10次',
    sets: '3组',
    frequency: '每日2次',
    cautions: [
      '不要过度抬头',
      '肩膀放松不要耸起',
      '动作要缓慢控制'
    ],
    commonMistakes: ['过度抬头', '耸肩', '动作过快'],
    regression: '减少举起高度',
    progression: '手持轻重量增加阻力',
    alternatives: ['俯卧游泳式', '弹力带YTW'],
    imageId: 'ytw-exercise',
    recommended: true,
  },
  {
    id: 'external-rotation',
    name: '肩外旋训练',
    nameEn: 'Shoulder External Rotation',
    category: 'strengthening',
    targetArea: ['shoulder'],
    targetMuscles: ['冈下肌', '小圆肌', '肩袖肌群'],
    suitableIssues: ['rounded_shoulder', 'frozen_shoulder_risk'],
    difficulty: 'beginner',
    description: '强化肩袖外旋肌群，改善肩部稳定性',
    purpose: '增强肩袖力量，防止肩部损伤',
    instructions: [
      '侧卧，下方手臂支撑头部',
      '上方手臂肘部贴身，前臂与地面垂直',
      '手持轻重量（1-2kg）',
      '以前臂为轴，向上旋转',
      '缓慢下放，重复15次'
    ],
    breathing: '上旋时呼气，下放时吸气',
    duration: '15次/侧',
    repetitions: '15次',
    sets: '3组',
    frequency: '每日1-2次',
    cautions: [
      '肘部保持贴身',
      '使用轻重量',
      '肩膀放松'
    ],
    commonMistakes: ['肘部离身', '重量过大', '耸肩'],
    regression: '不使用重量',
    progression: '使用弹力带增加阻力',
    alternatives: ['站姿弹力带外旋'],
    imageId: 'external-rotation',
    recommended: true,
  },

  // ==================== 胸椎动作 ====================
  {
    id: 'thoracic-extension-foam-roll',
    name: '泡沫轴胸椎伸展',
    nameEn: 'Foam Roll Thoracic Extension',
    category: 'stretch',
    targetArea: ['upper_back'],
    targetMuscles: ['胸椎', '胸大肌', '胸小肌', '前锯肌'],
    suitableIssues: ['thoracic_hyperkyphosis', 'rounded_shoulder', 'upper_crossed'],
    difficulty: 'beginner',
    description: '利用泡沫轴伸展胸椎，改善驼背',
    purpose: '增加胸椎伸展活动度，缓解背部紧张',
    instructions: [
      '将泡沫轴横放在背部，位于肩胛骨下方',
      '双手抱头，肘部向后打开',
      '身体向后仰，使胸椎围绕泡沫轴弯曲',
      '保持30秒，移动泡沫轴位置重复',
      '覆盖整个胸椎区域'
    ],
    breathing: '伸展时深呼吸，感受胸廓打开',
    duration: '30秒/位置',
    repetitions: '3-5个位置',
    sets: '2组',
    frequency: '每日1-2次',
    cautions: [
      '不要在腰椎位置进行',
      '动作要缓慢',
      '有脊柱问题者请咨询医生'
    ],
    commonMistakes: ['过度后仰', '速度过快', '腰部离地'],
    regression: '减少后仰幅度',
    progression: '增加后仰幅度',
    alternatives: ['猫牛式', '椅子胸椎伸展'],
    imageId: 'thoracic-extension-foam-roll',
    recommended: true,
  },
  {
    id: 'cat-cow-stretch',
    name: '猫牛式',
    nameEn: 'Cat-Cow Stretch',
    category: 'stretch',
    targetArea: ['upper_back', 'lower_back'],
    targetMuscles: ['竖脊肌', '腹肌', '背阔肌'],
    suitableIssues: ['thoracic_hyperkyphosis', 'lumbar_hyperlordosis', 'general'],
    difficulty: 'beginner',
    description: '经典的脊柱灵活性训练，增加脊柱活动度',
    purpose: '改善脊柱灵活性，缓解背部紧张',
    instructions: [
      '四点跪姿，手腕在肩下，膝盖在髋下',
      '牛式：吸气，塌腰，抬头，看天花板',
      '猫式：呼气，弓背，低头，看肚脐',
      '缓慢交替，配合呼吸',
      '重复10-15次'
    ],
    breathing: '牛式吸气，猫式呼气',
    duration: '10-15次',
    repetitions: '10-15次',
    sets: '3组',
    frequency: '每日2-3次',
    cautions: [
      '动作要缓慢流畅',
      '不要过度塌腰',
      '如有腰部疼痛减小幅度'
    ],
    commonMistakes: ['动作过快', '过度塌腰', '不配合呼吸'],
    regression: '减小活动范围',
    progression: '增加保持时间',
    alternatives: ['坐姿猫牛式'],
    imageId: 'cat-cow-stretch',
    recommended: true,
  },
  {
    id: 'thoracic-rotation',
    name: '胸椎旋转',
    nameEn: 'Thoracic Rotation',
    category: 'functional',
    targetArea: ['upper_back'],
    targetMuscles: ['腹外斜肌', '多裂肌', '回旋肌'],
    suitableIssues: ['thoracic_hyperkyphosis', 'spinal_rotation', 'general'],
    difficulty: 'beginner',
    description: '侧卧进行的胸椎旋转活动度训练',
    purpose: '改善胸椎旋转活动度，缓解背部僵硬',
    instructions: [
      '侧卧，双膝并拢屈曲90°',
      '双臂向前伸直，双手合十',
      '上方手臂向上划过身体，向后旋转',
      '眼睛跟随手移动，尽量触地',
      '保持30秒，换边重复'
    ],
    breathing: '旋转时呼气，还原时吸气',
    duration: '30秒/侧',
    repetitions: '3-5次/侧',
    sets: '2组',
    frequency: '每日2次',
    cautions: [
      '保持膝盖不动',
      '动作缓慢控制',
      '如有疼痛减小幅度'
    ],
    commonMistakes: ['膝盖移动', '动作过快', '肩部用力过猛'],
    regression: '减小旋转幅度',
    progression: '增加保持时间',
    alternatives: ['坐姿胸椎旋转'],
    imageId: 'thoracic-rotation',
    recommended: true,
  },

  // ==================== 核心动作 ====================
  {
    id: 'dead-bug',
    name: '死虫式',
    nameEn: 'Dead Bug',
    category: 'strengthening',
    targetArea: ['core', 'lower_back'],
    targetMuscles: ['腹横肌', '腹直肌', '腹外斜肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'lumbar_hyperlordosis', 'lower_crossed'],
    difficulty: 'beginner',
    description: '仰卧进行的核心稳定性训练',
    purpose: '强化核心稳定肌群，改善腰椎稳定性',
    instructions: [
      '仰卧，双臂向上伸直',
      '双腿屈髋屈膝90°',
      '吸气准备，呼气时对侧手脚缓慢下放',
      '不要触地，保持腰部贴地',
      '还原换边，重复10-15次/侧'
    ],
    breathing: '下放时呼气，还原时吸气',
    duration: '10-15次/侧',
    repetitions: '10-15次/侧',
    sets: '3组',
    frequency: '每日2次',
    cautions: [
      '保持腰部贴地',
      '不要屏气',
      '动作要缓慢'
    ],
    commonMistakes: ['腰部离地', '屏气', '动作过快'],
    regression: '只动腿或只动手',
    progression: '使用弹力带增加阻力',
    alternatives: ['鸟狗式', '平板支撑'],
    imageId: 'dead-bug',
    recommended: true,
  },
  {
    id: 'bird-dog',
    name: '鸟狗式',
    nameEn: 'Bird Dog',
    category: 'strengthening',
    targetArea: ['core', 'lower_back'],
    targetMuscles: ['多裂肌', '腹横肌', '臀大肌', '竖脊肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'lower_crossed', 'general'],
    difficulty: 'beginner',
    description: '四点跪姿进行的对侧手脚伸展训练',
    purpose: '强化核心稳定性，改善身体协调',
    instructions: [
      '四点跪姿，手腕在肩下，膝盖在髋下',
      '收紧腹部，背部保持平直',
      '同时抬起右手和左腿，向两端延伸',
      '保持3-5秒',
      '缓慢还原换边，重复10次/侧'
    ],
    breathing: '伸展时呼气，还原时吸气',
    duration: '3-5秒/次',
    repetitions: '10次/侧',
    sets: '3组',
    frequency: '每日2次',
    cautions: [
      '保持背部平直',
      '不要过度抬头',
      '避免骨盆旋转'
    ],
    commonMistakes: ['塌腰', '骨盆旋转', '过度抬头'],
    regression: '只抬手或只抬腿',
    progression: '增加保持时间或使用弹力带',
    alternatives: ['死虫式', '平板支撑'],
    imageId: 'bird-dog',
    recommended: true,
  },
  {
    id: 'plank',
    name: '平板支撑',
    nameEn: 'Plank',
    category: 'strengthening',
    targetArea: ['core', 'shoulder'],
    targetMuscles: ['腹横肌', '腹直肌', '三角肌', '前锯肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'lumbar_hyperlordosis', 'lower_crossed'],
    difficulty: 'intermediate',
    description: '经典的核心稳定性训练动作',
    purpose: '强化核心力量，改善身体稳定性',
    instructions: [
      '俯卧，前臂撑地，肘部在肩正下方',
      '脚尖着地，身体呈一条直线',
      '收紧腹部和臀部',
      '保持自然呼吸',
      '坚持30-60秒'
    ],
    breathing: '保持自然呼吸，不要屏气',
    duration: '30-60秒',
    repetitions: '1次',
    sets: '3组',
    frequency: '每日2-3次',
    cautions: [
      '不要塌腰或撅臀',
      '保持头部自然',
      '如有肩痛改为膝盖着地'
    ],
    commonMistakes: ['塌腰', '撅臀', '屏气', '耸肩'],
    regression: '膝盖着地',
    progression: '增加时间或抬起一只脚',
    alternatives: ['侧平板', '高位平板支撑'],
    imageId: 'plank',
    recommended: true,
  },
  {
    id: 'side-plank',
    name: '侧平板支撑',
    nameEn: 'Side Plank',
    category: 'strengthening',
    targetArea: ['core'],
    targetMuscles: ['腹外斜肌', '腹内斜肌', '腰方肌'],
    suitableIssues: ['pelvic_obliquity', 'scoliosis', 'general'],
    difficulty: 'intermediate',
    description: '侧卧进行的侧向核心稳定性训练',
    purpose: '强化侧腹肌群，改善侧向稳定性',
    instructions: [
      '侧卧，下方前臂撑地',
      '双腿并拢或前后放置',
      '髋部抬起，身体呈一条直线',
      '保持20-40秒',
      '换边重复'
    ],
    breathing: '保持自然呼吸',
    duration: '20-40秒/侧',
    repetitions: '1次/侧',
    sets: '3组',
    frequency: '每日2次',
    cautions: [
      '保持身体在一条直线',
      '不要前倾或后仰',
      '如有肩痛改为膝盖着地'
    ],
    commonMistakes: ['髋部下沉', '身体前倾', '屏气'],
    regression: '膝盖着地',
    progression: '增加时间或抬起上方腿',
    alternatives: ['侧卧抬腿'],
    imageId: 'side-plank',
    recommended: true,
  },

  // ==================== 骨盆和髋部动作 ====================
  {
    id: 'hip-flexor-stretch',
    name: '髂腰肌拉伸',
    nameEn: 'Hip Flexor Stretch',
    category: 'stretch',
    targetArea: ['pelvis', 'hip'],
    targetMuscles: ['髂腰肌', '股直肌', '阔筋膜张肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'lower_crossed', 'lumbar_hyperlordosis'],
    difficulty: 'beginner',
    description: '跪姿进行的髂腰肌深度拉伸',
    purpose: '放松紧张的髂腰肌，改善骨盆前倾',
    instructions: [
      '单膝跪地，前腿屈膝90°',
      '保持躯干直立',
      '将髋部向前推',
      '感觉跪腿侧腹股沟拉伸',
      '保持30-60秒，换边'
    ],
    breathing: '拉伸时深呼吸',
    duration: '30-60秒/侧',
    repetitions: '2-3次/侧',
    sets: '2组',
    frequency: '每日2-3次',
    cautions: [
      '保持躯干直立',
      '不要过度前倾',
      '如有膝盖疼痛垫软垫'
    ],
    commonMistakes: ['躯干前倾', '骨盆旋转', '后腿位置不正确'],
    regression: '减小拉伸幅度',
    progression: '抬起同侧手臂增加拉伸',
    alternatives: ['站姿髂腰肌拉伸', '半跪髂腰肌拉伸'],
    imageId: 'hip-flexor-stretch',
    recommended: true,
  },
  {
    id: 'glute-bridge',
    name: '臀桥',
    nameEn: 'Glute Bridge',
    category: 'strengthening',
    targetArea: ['pelvis', 'hip', 'lower_back'],
    targetMuscles: ['臀大肌', '腘绳肌', '竖脊肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'lower_crossed', 'posterior_pelvic_tilt'],
    difficulty: 'beginner',
    description: '仰卧进行的臀部和下背部强化训练',
    purpose: '激活臀大肌，改善骨盆稳定性',
    instructions: [
      '仰卧，双膝屈曲，脚掌着地',
      '双脚与髋同宽',
      '收紧臀部，将髋部抬起',
      '身体从肩到膝呈一条直线',
      '保持3秒，缓慢下放，重复15-20次'
    ],
    breathing: '抬起时呼气，下放时吸气',
    duration: '3秒/次',
    repetitions: '15-20次',
    sets: '3组',
    frequency: '每日2次',
    cautions: [
      '不要过度拱腰',
      '臀部发力而非腰部',
      '膝盖不要内扣'
    ],
    commonMistakes: ['过度拱腰', '臀部力量不足', '膝盖内扣'],
    regression: '减少抬起高度',
    progression: '单腿臀桥或增加负重',
    alternatives: ['蚌式开合', '跪姿后抬腿'],
    imageId: 'glute-bridge',
    recommended: true,
  },
  {
    id: 'clamshell',
    name: '蚌式开合',
    nameEn: 'Clamshell',
    category: 'strengthening',
    targetArea: ['hip', 'pelvis'],
    targetMuscles: ['臀中肌', '臀小肌', '阔筋膜张肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'pelvic_obliquity', 'genu_valgum'],
    difficulty: 'beginner',
    description: '侧卧进行的髋外旋训练',
    purpose: '强化臀中肌，改善髋关节稳定性',
    instructions: [
      '侧卧，双膝屈曲约45°',
      '双脚并拢，使用臀部力量',
      '上方膝盖向上打开',
      '保持双脚接触',
      '缓慢下放，重复15-20次/侧'
    ],
    breathing: '打开时呼气，下放时吸气',
    duration: '15-20次/侧',
    repetitions: '15-20次/侧',
    sets: '3组',
    frequency: '每日2次',
    cautions: [
      '保持骨盆稳定',
      '不要后仰',
      '动作要缓慢'
    ],
    commonMistakes: ['骨盆后仰', '动作过快', '使用惯性'],
    regression: '减少活动范围',
    progression: '使用弹力带增加阻力',
    alternatives: ['站姿髋外展', '侧卧抬腿'],
    imageId: 'clamshell',
    recommended: true,
  },
  {
    id: 'pelvic-tilt',
    name: '骨盆倾斜训练',
    nameEn: 'Pelvic Tilt',
    category: 'activation',
    targetArea: ['pelvis', 'lower_back', 'core'],
    targetMuscles: ['腹横肌', '腹直肌', '臀大肌', '竖脊肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'posterior_pelvic_tilt', 'lumbar_hyperlordosis'],
    difficulty: 'beginner',
    description: '基础骨盆控制训练',
    purpose: '学会正确控制骨盆位置，改善骨盆前倾或后倾',
    instructions: [
      '仰卧，双膝屈曲，脚掌着地',
      '找到腰椎自然曲度',
      '呼气，收紧腹部，将腰部压向地面',
      '吸气，放松，恢复腰椎曲度',
      '反复练习15-20次'
    ],
    breathing: '压腰时呼气，放松时吸气',
    duration: '15-20次',
    repetitions: '15-20次',
    sets: '3组',
    frequency: '每日3-5次',
    cautions: [
      '动作要缓慢',
      '不要憋气',
      '感受骨盆运动'
    ],
    commonMistakes: ['动作过快', '憋气', '幅度过大'],
    regression: '减少活动幅度',
    progression: '站姿骨盆倾斜',
    alternatives: ['猫牛式'],
    imageId: 'pelvic-tilt',
    recommended: true,
  },

  // ==================== 下肢动作 ====================
  {
    id: 'hamstring-stretch',
    name: '腘绳肌拉伸',
    nameEn: 'Hamstring Stretch',
    category: 'stretch',
    targetArea: ['hip', 'knee'],
    targetMuscles: ['腘绳肌', '腓肠肌'],
    suitableIssues: ['posterior_pelvic_tilt', 'genu_recuvatum', 'lower_crossed'],
    difficulty: 'beginner',
    description: '坐姿进行的腘绳肌拉伸',
    purpose: '放松紧张的腘绳肌，改善骨盆后倾',
    instructions: [
      '坐姿，一腿伸直，另一腿屈膝',
      '背部挺直，髋部前倾',
      '双手向伸直腿的脚尖方向延伸',
      '感觉大腿后侧拉伸',
      '保持30-60秒，换边'
    ],
    breathing: '拉伸时深呼吸',
    duration: '30-60秒/侧',
    repetitions: '2-3次/侧',
    sets: '2组',
    frequency: '每日2-3次',
    cautions: [
      '保持背部挺直',
      '不要过度拉伸',
      '如有腰痛改为躺姿'
    ],
    commonMistakes: ['弓背', '过度拉伸', '膝盖过度伸直'],
    regression: '减小前倾幅度',
    progression: '增加拉伸强度',
    alternatives: ['站姿腘绳肌拉伸', '躺姿腘绳肌拉伸'],
    imageId: 'hamstring-stretch',
    recommended: true,
  },
  {
    id: 'quad-stretch',
    name: '股四头肌拉伸',
    nameEn: 'Quadriceps Stretch',
    category: 'stretch',
    targetArea: ['hip', 'knee'],
    targetMuscles: ['股四头肌', '髂腰肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'genu_recuvatum', 'genu_varum'],
    difficulty: 'beginner',
    description: '站姿进行的股四头肌拉伸',
    purpose: '放松紧张的股四头肌，改善膝超伸',
    instructions: [
      '站立，手扶墙保持平衡',
      '弯曲一腿膝盖，用手抓住脚踝',
      '将脚跟拉向臀部',
      '膝盖指向地面',
      '保持30秒，换边'
    ],
    breathing: '拉伸时深呼吸',
    duration: '30秒/侧',
    repetitions: '2-3次/侧',
    sets: '2组',
    frequency: '每日2-3次',
    cautions: [
      '保持躯干直立',
      '膝盖不要外展',
      '如有膝痛减小幅度'
    ],
    commonMistakes: ['躯干前倾', '膝盖外展', '过度拉伸'],
    regression: '使用毛巾辅助',
    progression: '增加拉伸强度',
    alternatives: ['侧卧股四头肌拉伸'],
    imageId: 'quad-stretch',
    recommended: true,
  },
  {
    id: 'calf-stretch',
    name: '小腿拉伸',
    nameEn: 'Calf Stretch',
    category: 'stretch',
    targetArea: ['ankle'],
    targetMuscles: ['腓肠肌', '比目鱼肌'],
    suitableIssues: ['flat_foot', 'genu_recuvatum', 'heel_valgus'],
    difficulty: 'beginner',
    description: '墙壁辅助的小腿拉伸',
    purpose: '放松紧张的小腿肌肉，改善踝关节活动度',
    instructions: [
      '面对墙壁站立，双手扶墙',
      '一腿向后跨一步，脚跟着地',
      '前腿屈膝，后腿伸直',
      '感觉后腿小腿拉伸',
      '保持30秒，换边'
    ],
    breathing: '拉伸时深呼吸',
    duration: '30秒/侧',
    repetitions: '2-3次/侧',
    sets: '2组',
    frequency: '每日2-3次',
    cautions: [
      '后脚保持直线',
      '脚跟着地',
      '如有跟腱疼痛减小幅度'
    ],
    commonMistakes: ['脚跟离地', '后腿外旋', '过度拉伸'],
    regression: '减小拉伸幅度',
    progression: '在台阶上进行拉伸',
    alternatives: ['台阶小腿拉伸', '下犬式'],
    imageId: 'calf-stretch',
    recommended: true,
  },
  {
    id: 'arch-exercise',
    name: '足弓训练',
    nameEn: 'Arch Exercise',
    category: 'strengthening',
    targetArea: ['ankle'],
    targetMuscles: ['胫骨后肌', '足底肌群'],
    suitableIssues: ['flat_foot', 'heel_valgus'],
    difficulty: 'beginner',
    description: '坐姿进行的足弓强化训练',
    purpose: '强化足弓支撑肌群，改善扁平足',
    instructions: [
      '坐姿，双脚平放地面',
      '用脚趾抓毛巾或小球',
      '保持脚跟不动',
      '将脚趾向上卷起，形成足弓',
      '保持5秒，放松，重复20次'
    ],
    breathing: '收缩时呼气，放松时吸气',
    duration: '5秒/次',
    repetitions: '20次',
    sets: '3组',
    frequency: '每日3次',
    cautions: [
      '不要用脚趾卷曲代替足弓',
      '保持脚跟着地',
      '动作要缓慢'
    ],
    commonMistakes: ['脚趾过度卷曲', '脚跟离地', '动作过快'],
    regression: '减少次数',
    progression: '单脚进行，或站立位进行',
    alternatives: ['足底筋膜放松', '小腿强化'],
    imageId: 'arch-exercise',
    recommended: true,
  },
  {
    id: 'single-leg-stance',
    name: '单腿站立平衡',
    nameEn: 'Single Leg Stance',
    category: 'functional',
    targetArea: ['ankle', 'hip', 'core'],
    targetMuscles: ['臀中肌', '足底肌群', '核心肌群'],
    suitableIssues: ['flat_foot', 'pelvic_obliquity', 'general'],
    difficulty: 'beginner',
    description: '基础平衡训练',
    purpose: '改善平衡能力，强化下肢稳定性',
    instructions: [
      '站立，双手叉腰或扶墙',
      '抬起一腿，保持平衡',
      '保持躯干稳定',
      '坚持30秒',
      '换腿重复'
    ],
    breathing: '保持自然呼吸',
    duration: '30秒/侧',
    repetitions: '3次/侧',
    sets: '2组',
    frequency: '每日2次',
    cautions: [
      '如有困难可扶墙',
      '保持骨盆水平',
      '不要屏气'
    ],
    commonMistakes: ['骨盆倾斜', '过度摇晃', '屏气'],
    regression: '手扶墙',
    progression: '闭眼进行，或不平稳表面',
    alternatives: ['树式', '单腿硬拉'],
    imageId: 'single-leg-stance',
    recommended: true,
  },
  {
    id: 'squat',
    name: '深蹲',
    nameEn: 'Squat',
    category: 'strengthening',
    targetArea: ['hip', 'knee', 'ankle'],
    targetMuscles: ['臀大肌', '股四头肌', '腘绳肌', '小腿肌群'],
    suitableIssues: ['anterior_pelvic_tilt', 'genu_varum', 'genu_valgum', 'general'],
    difficulty: 'intermediate',
    description: '经典的下肢力量训练',
    purpose: '强化下肢整体力量，改善功能',
    instructions: [
      '双脚与肩同宽，脚尖略外展',
      '核心收紧，背部挺直',
      '屈髋屈膝下蹲',
      '膝盖指向脚尖方向',
      '下蹲至大腿与地面平行',
      '起身，重复15次'
    ],
    breathing: '下蹲时吸气，起身时呼气',
    duration: '15次',
    repetitions: '15次',
    sets: '3组',
    frequency: '每日1-2次',
    cautions: [
      '膝盖不要内扣',
      '保持背部挺直',
      '重量落在脚后跟'
    ],
    commonMistakes: ['膝盖内扣', '弓背', '踮脚', '重心前移'],
    regression: '椅子辅助深蹲',
    progression: '增加负重，单腿深蹲',
    alternatives: ['靠墙静蹲', '弓步蹲'],
    imageId: 'squat',
    recommended: true,
  },
  {
    id: 'lunge',
    name: '弓步蹲',
    nameEn: 'Lunge',
    category: 'strengthening',
    targetArea: ['hip', 'knee'],
    targetMuscles: ['臀大肌', '股四头肌', '腘绳肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'genu_varum', 'genu_valgum', 'general'],
    difficulty: 'intermediate',
    description: '单侧下肢力量训练',
    purpose: '改善下肢力量不平衡，增强功能',
    instructions: [
      '站立，双脚与髋同宽',
      '一腿向前跨出一大步',
      '双膝屈曲下蹲',
      '前膝不超过脚尖',
      '后膝接近地面',
      '推起回到起始位置',
      '换腿，各做10次'
    ],
    breathing: '下蹲时吸气，起身时呼气',
    duration: '10次/侧',
    repetitions: '10次/侧',
    sets: '3组',
    frequency: '每日1-2次',
    cautions: [
      '保持躯干直立',
      '前膝不要内扣',
      '后脚跟抬起'
    ],
    commonMistakes: ['躯干前倾', '膝盖内扣', '步幅过小'],
    regression: '减小下蹲深度',
    progression: '增加负重，后抬腿弓步',
    alternatives: ['侧向弓步', '保加利亚分腿蹲'],
    imageId: 'lunge',
    recommended: true,
  },

  // ==================== 全身综合动作 ====================
  {
    id: 'wall-sit',
    name: '靠墙静蹲',
    nameEn: 'Wall Sit',
    category: 'strengthening',
    targetArea: ['hip', 'knee', 'core'],
    targetMuscles: ['股四头肌', '臀大肌', '核心肌群'],
    suitableIssues: ['genu_recuvatum', 'anterior_pelvic_tilt', 'general'],
    difficulty: 'intermediate',
    description: '靠墙保持静蹲姿势',
    purpose: '强化下肢等长收缩力量，改善膝关节稳定性',
    instructions: [
      '背靠墙站立',
      '双脚向前跨出一步',
      '屈膝下蹲至90°',
      '保持背部贴墙',
      '坚持30-60秒'
    ],
    breathing: '保持自然呼吸',
    duration: '30-60秒',
    repetitions: '1次',
    sets: '3组',
    frequency: '每日1-2次',
    cautions: [
      '膝盖不要超过脚尖',
      '保持呼吸',
      '如有膝痛减小角度'
    ],
    commonMistakes: ['屏气', '膝盖超过脚尖', '背部离墙'],
    regression: '增加膝盖角度',
    progression: '增加时间或单腿进行',
    alternatives: ['深蹲', '弓步蹲'],
    imageId: 'wall-sit',
    recommended: true,
  },
  {
    id: 'standing-posture-correction',
    name: '站姿纠正训练',
    nameEn: 'Standing Posture Correction',
    category: 'functional',
    targetArea: ['full_body'],
    targetMuscles: ['核心肌群', '臀大肌', '肩胛稳定肌群'],
    suitableIssues: ['forward_head', 'rounded_shoulder', 'anterior_pelvic_tilt', 'general'],
    difficulty: 'beginner',
    description: '基础站姿纠正练习',
    purpose: '建立正确的站立姿势意识',
    instructions: [
      '双脚与肩同宽站立',
      '膝盖微屈，不要锁死',
      '收紧臀部，骨盆中立',
      '收紧腹部，肋骨下沉',
      '肩膀后缩下沉',
      '下巴微收，头顶向上延伸',
      '保持30秒，放松，重复5次'
    ],
    breathing: '保持自然呼吸',
    duration: '30秒',
    repetitions: '5次',
    sets: '3组',
    frequency: '每日5-10次',
    cautions: [
      '不要过度用力',
      '保持自然呼吸',
      '感受正确姿势'
    ],
    commonMistakes: ['过度挺腰', '耸肩', '过度收下巴'],
    regression: '靠墙站立',
    progression: '保持更长时间',
    alternatives: ['靠墙站立'],
    imageId: 'standing-posture-correction',
    recommended: true,
  },
  {
    id: 'wall-stand',
    name: '靠墙站立',
    nameEn: 'Wall Stand',
    category: 'functional',
    targetArea: ['full_body'],
    targetMuscles: ['核心肌群', '肩胛稳定肌群', '颈部肌群'],
    suitableIssues: ['forward_head', 'rounded_shoulder', 'thoracic_hyperkyphosis', 'general'],
    difficulty: 'beginner',
    description: '靠墙练习正确站姿',
    purpose: '建立正确的姿势模式',
    instructions: [
      '背靠墙站立',
      '脚跟离墙一脚距离',
      '臀部、上背部、后脑勺贴墙',
      '下巴微收',
      '肩膀后缩贴墙',
      '保持1-2分钟'
    ],
    breathing: '保持自然呼吸',
    duration: '1-2分钟',
    repetitions: '1次',
    sets: '3组',
    frequency: '每日3-5次',
    cautions: [
      '不要过度挺腰',
      '保持呼吸',
      '感觉正确的姿势'
    ],
    commonMistakes: ['过度挺腰', '头部前伸', '肩膀耸起'],
    regression: '减少时间',
    progression: '增加时间，配合手臂动作',
    alternatives: ['站姿纠正训练'],
    imageId: 'wall-stand',
    recommended: true,
  },

  // ==================== 更多动作 ====================
  {
    id: 'itb-stretch',
    name: '髂胫束拉伸',
    nameEn: 'ITB Stretch',
    category: 'stretch',
    targetArea: ['hip', 'knee'],
    targetMuscles: ['髂胫束', '阔筋膜张肌'],
    suitableIssues: ['genu_varum', 'pelvic_obliquity'],
    difficulty: 'beginner',
    description: '站姿进行的髂胫束拉伸',
    purpose: '放松髂胫束，改善膝关节外侧紧张',
    instructions: [
      '站立，双腿交叉',
      '前腿为拉伸侧',
      '身体向拉伸侧侧弯',
      '手臂向上伸展',
      '感觉大腿外侧拉伸',
      '保持30秒，换边'
    ],
    breathing: '拉伸时深呼吸',
    duration: '30秒/侧',
    repetitions: '2-3次/侧',
    sets: '2组',
    frequency: '每日2次',
    cautions: [
      '保持平衡',
      '不要过度侧弯',
      '如有膝痛停止'
    ],
    commonMistakes: ['身体前倾', '过度侧弯', '失去平衡'],
    regression: '使用泡沫轴放松',
    progression: '增加拉伸强度',
    alternatives: ['泡沫轴髂胫束放松'],
    imageId: 'itb-stretch',
    recommended: true,
  },
  {
    id: 'piriformis-stretch',
    name: '梨状肌拉伸',
    nameEn: 'Piriformis Stretch',
    category: 'stretch',
    targetArea: ['hip'],
    targetMuscles: ['梨状肌', '臀大肌', '髋外旋肌群'],
    suitableIssues: ['anterior_pelvic_tilt', 'si_joint_dysfunction'],
    difficulty: 'beginner',
    description: '坐姿进行的梨状肌拉伸',
    purpose: '放松梨状肌，改善髋关节活动度',
    instructions: [
      '坐姿，一腿屈膝跨过另一腿',
      '对侧手肘抵住膝盖外侧',
      '身体向对侧旋转',
      '感觉臀部深处拉伸',
      '保持30-60秒，换边'
    ],
    breathing: '拉伸时深呼吸',
    duration: '30-60秒/侧',
    repetitions: '2-3次/侧',
    sets: '2组',
    frequency: '每日2次',
    cautions: [
      '保持背部挺直',
      '不要过度旋转',
      '如有骶髂疼痛减小幅度'
    ],
    commonMistakes: ['弓背', '过度旋转', '动作过快'],
    regression: '减小旋转幅度',
    progression: '躺姿进行4字形拉伸',
    alternatives: ['躺姿梨状肌拉伸'],
    imageId: 'piriformis-stretch',
    recommended: true,
  },
  {
    id: 'adductor-stretch',
    name: '内收肌拉伸',
    nameEn: 'Adductor Stretch',
    category: 'stretch',
    targetArea: ['hip'],
    targetMuscles: ['内收肌群', '股薄肌'],
    suitableIssues: ['genu_valgum', 'pelvic_obliquity'],
    difficulty: 'beginner',
    description: '坐姿进行的内收肌拉伸',
    purpose: '放松内收肌群，改善髋关节活动度',
    instructions: [
      '坐姿，双脚脚心相对',
      '双手握住脚踝',
      '身体前倾，背部挺直',
      '用手肘向下压膝盖',
      '感觉大腿内侧拉伸',
      '保持30-60秒'
    ],
    breathing: '拉伸时深呼吸',
    duration: '30-60秒',
    repetitions: '2-3次',
    sets: '2组',
    frequency: '每日2次',
    cautions: [
      '保持背部挺直',
      '不要过度下压',
      '如有髋痛减小幅度'
    ],
    commonMistakes: ['弓背', '过度下压', '动作过快'],
    regression: '减小前倾幅度',
    progression: '增加下压强度',
    alternatives: ['站姿侧弓步拉伸'],
    imageId: 'adductor-stretch',
    recommended: true,
  },
  {
    id: 'serratus-push-up',
    name: '前锯肌俯卧撑',
    nameEn: 'Serratus Push Up',
    category: 'strengthening',
    targetArea: ['shoulder', 'upper_back'],
    targetMuscles: ['前锯肌', '胸大肌'],
    suitableIssues: ['winging_scapula', 'rounded_shoulder', 'scapular_protraction'],
    difficulty: 'beginner',
    description: '强化前锯肌的训练',
    purpose: '激活前锯肌，改善翼状肩',
    instructions: [
      '俯卧撑姿势或跪姿俯卧撑姿势',
      '保持手臂伸直',
      '将肩胛骨向两侧展开',
      '然后收回，挤压肩胛骨',
      '重复15-20次'
    ],
    breathing: '展开时呼气，收回时吸气',
    duration: '15-20次',
    repetitions: '15-20次',
    sets: '3组',
    frequency: '每日2次',
    cautions: [
      '手臂始终保持伸直',
      '不要塌腰',
      '动作要缓慢'
    ],
    commonMistakes: ['手臂弯曲', '塌腰', '动作过快'],
    regression: '跪姿进行',
    progression: '在健身球上进行',
    alternatives: ['墙壁俯卧撑推墙'],
    imageId: 'serratus-push-up',
    recommended: true,
  },
  {
    id: 'lower-trap-activation',
    name: '下斜方肌激活',
    nameEn: 'Lower Trap Activation',
    category: 'activation',
    targetArea: ['upper_back', 'shoulder'],
    targetMuscles: ['下斜方肌'],
    suitableIssues: ['elevated_shoulder', 'rounded_shoulder', 'upper_crossed'],
    difficulty: 'beginner',
    description: '俯卧进行的下斜方肌激活训练',
    purpose: '激活下斜方肌，改善肩胛骨上提',
    instructions: [
      '俯卧，双臂向斜上方伸展呈Y形',
      '拇指朝上',
      '将手臂抬离地面',
      '感觉肩胛骨向下旋转',
      '保持3秒，重复15次'
    ],
    breathing: '抬起时呼气，下放时吸气',
    duration: '3秒/次',
    repetitions: '15次',
    sets: '3组',
    frequency: '每日2次',
    cautions: [
      '不要过度抬头',
      '肩膀不要耸起',
      '动作要缓慢'
    ],
    commonMistakes: ['耸肩', '过度抬头', '动作过快'],
    regression: '减少抬起高度',
    progression: '增加保持时间或使用重量',
    alternatives: ['墙壁天使'],
    imageId: 'lower-trap-activation',
    recommended: true,
  },
  {
    id: 'breathing-exercise',
    name: '腹式呼吸训练',
    nameEn: 'Diaphragmatic Breathing',
    category: 'functional',
    targetArea: ['core', 'full_body'],
    targetMuscles: ['膈肌', '腹横肌', '盆底肌'],
    suitableIssues: ['anterior_pelvic_tilt', 'general'],
    difficulty: 'beginner',
    description: '基础呼吸模式训练',
    purpose: '改善呼吸模式，增强核心稳定性',
    instructions: [
      '仰卧，双膝屈曲',
      '一手放在胸口，一手放在腹部',
      '吸气时腹部隆起，胸部不动',
      '呼气时腹部下沉',
      '呼气时间延长至吸气的2倍',
      '练习5-10分钟'
    ],
    breathing: '吸气4秒，呼气8秒',
    duration: '5-10分钟',
    repetitions: '1次',
    sets: '1组',
    frequency: '每日3次',
    cautions: [
      '保持胸部不动',
      '呼吸要缓慢',
      '不要屏气'
    ],
    commonMistakes: ['胸部起伏', '呼吸过快', '屏气'],
    regression: '减少练习时间',
    progression: '坐姿或站姿进行',
    alternatives: ['箱式呼吸'],
    imageId: 'breathing-exercise',
    recommended: true,
  },
  {
    id: 'foam-roll-back',
    name: '泡沫轴背部放松',
    nameEn: 'Foam Roll Back Release',
    category: 'stretch',
    targetArea: ['upper_back', 'lower_back'],
    targetMuscles: ['竖脊肌', '背阔肌', '胸椎关节'],
    suitableIssues: ['thoracic_hyperkyphosis', 'general'],
    difficulty: 'beginner',
    description: '使用泡沫轴放松背部肌肉',
    purpose: '放松背部紧张，改善胸椎活动度',
    instructions: [
      '将泡沫轴横放在背部',
      '双手抱头，肘部向外',
      '双脚支撑，臀部抬起',
      '前后滚动，按摩背部',
      '遇到紧张点停留30秒'
    ],
    breathing: '保持自然呼吸',
    duration: '3-5分钟',
    repetitions: '1次',
    sets: '1组',
    frequency: '每日1次',
    cautions: [
      '不要滚到腰椎',
      '动作要缓慢',
      '有脊柱问题者请咨询医生'
    ],
    commonMistakes: ['速度过快', '腰部着地', '过度用力'],
    regression: '减少滚动范围',
    progression: '增加时间',
    alternatives: ['网球定点按压'],
    imageId: 'foam-roll-back',
    recommended: true,
  },
];

// ==================== 辅助函数 ====================

// 根据问题获取推荐动作
export function getExercisesForIssue(issue: SuitableIssue): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.suitableIssues.includes(issue));
}

// 根据部位获取动作
export function getExercisesForArea(area: TargetArea): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.targetArea.includes(area));
}

// 根据分类获取动作
export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.category === category);
}

// 获取推荐动作
export function getRecommendedExercises(): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.recommended);
}

// 根据难度获取动作
export function getExercisesByDifficulty(difficulty: DifficultyLevel): Exercise[] {
  return EXERCISE_DATABASE.filter(ex => ex.difficulty === difficulty);
}

// 搜索动作
export function searchExercises(query: string): Exercise[] {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_DATABASE.filter(ex => 
    ex.name.includes(query) || 
    ex.nameEn.toLowerCase().includes(lowerQuery) ||
    ex.targetMuscles.some(m => m.includes(query)) ||
    ex.description.includes(query)
  );
}

// 获取动作分类名称
export function getCategoryName(category: ExerciseCategory): string {
  const names: Record<ExerciseCategory, string> = {
    stretch: '拉伸类',
    activation: '激活类',
    strengthening: '强化类',
    functional: '功能训练类',
  };
  return names[category];
}

// 获取部位名称
export function getAreaName(area: TargetArea): string {
  const names: Record<TargetArea, string> = {
    neck: '颈部',
    shoulder: '肩部',
    upper_back: '上背部',
    lower_back: '下背部',
    core: '核心',
    pelvis: '骨盆',
    hip: '髋部',
    knee: '膝关节',
    ankle: '踝关节',
    full_body: '全身',
  };
  return names[area];
}

// 获取难度名称
export function getDifficultyName(difficulty: DifficultyLevel): string {
  const names: Record<DifficultyLevel, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  };
  return names[difficulty];
}

// 导出动作总数
export const TOTAL_EXERCISES = EXERCISE_DATABASE.length;
