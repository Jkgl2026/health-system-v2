import { NextRequest, NextResponse } from 'next/server';
import { getDb } from 'coze-coding-dev-sdk';
import { exerciseLibrary } from '@/storage/database/shared/schema';

// POST /api/seed-exercises - 预设训练动作库数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirm } = body;

    // 安全保护：必须传入 confirm=true 才能执行
    if (confirm !== true) {
      return NextResponse.json(
        {
          error: '操作被拒绝',
          message: '请传入 confirm=true 参数确认执行数据预设操作。'
        },
        { status: 403 }
      );
    }

    const db = await getDb();

    // 预设训练动作数据
    const exercises = [
      // 整复训练
      {
        name: '颈椎复位训练',
        category: '整复训练',
        subCategory: '颈椎调理',
        description: '针对颈椎前引、颈椎曲度变直等问题的整复训练，通过特定的动作恢复颈椎正常曲度。',
        targetIssues: ['颈椎前引', '颈椎曲度变直', '颈部僵硬', '头痛'],
        contraindications: ['颈椎骨折', '颈椎肿瘤', '严重骨质疏松'],
        duration: '15分钟',
        reps: 10,
        sets: 3,
        frequency: '每日2次',
        restTime: '30秒',
        steps: [
          '坐姿，保持脊柱直立',
          '双手交叉放于后脑勺',
          '缓慢向后仰头，同时双手给以轻微阻力',
          '保持5秒后缓慢还原',
          '重复上述动作'
        ],
        tips: [
          '动作要缓慢，避免突然发力',
          '如有疼痛应立即停止',
          '配合深呼吸效果更佳'
        ],
        primaryMuscles: ['胸锁乳突肌', '斜方肌上部', '颈夹肌'],
        relatedMeridians: ['督脉', '膀胱经'],
        sortOrder: 1,
        isActive: true,
      },
      {
        name: '肩胛骨复位',
        category: '整复训练',
        subCategory: '肩部调理',
        description: '针对圆肩、翼状肩等问题，通过激活前锯肌和菱形肌，恢复肩胛骨正常位置。',
        targetIssues: ['圆肩', '翼状肩', '肩胛骨内侧疼痛', '肩周炎'],
        contraindications: ['肩关节脱位', '肩部骨折', '肩袖撕裂'],
        duration: '20分钟',
        reps: 15,
        sets: 3,
        frequency: '每日2次',
        steps: [
          '俯卧，双臂自然下垂',
          '肩胛骨向后内收，感觉两肩胛骨靠近',
          '保持5秒',
          '缓慢放松',
          '重复动作'
        ],
        tips: [
          '避免耸肩',
          '注意感受肩胛骨的运动',
          '可配合弹力带增加难度'
        ],
        primaryMuscles: ['前锯肌', '菱形肌', '斜方肌中部'],
        relatedMeridians: ['小肠经', '三焦经'],
        sortOrder: 2,
        isActive: true,
      },
      {
        name: '骨盆复位训练',
        category: '整复训练',
        subCategory: '骨盆调理',
        description: '针对骨盆前倾、后倾等问题，通过激活核心肌群和髋屈肌群，恢复骨盆中立位。',
        targetIssues: ['骨盆前倾', '骨盆后倾', '腰椎前凸', '下腰痛'],
        contraindications: ['腰椎间盘突出急性期', '严重脊柱侧弯'],
        duration: '25分钟',
        reps: 12,
        sets: 3,
        frequency: '每日2次',
        steps: [
          '仰卧，双腿屈膝',
          '吸气时腰椎贴地，骨盆后倾',
          '呼气时腰椎离开地面，骨盆前倾',
          '控制节奏，缓慢往返',
          '保持核心稳定'
        ],
        tips: [
          '动作要缓慢流畅',
          '避免憋气',
          '注意腰椎不要过度离开地面'
        ],
        primaryMuscles: ['腹直肌', '髂腰肌', '臀大肌'],
        relatedMeridians: ['肾经', '膀胱经'],
        sortOrder: 3,
        isActive: true,
      },
      
      // 本源训练
      {
        name: '本源站桩',
        category: '本源训练',
        subCategory: '基础功法',
        description: '传统站桩功法，通过特定的站姿和呼吸，调理全身气血，增强体质。',
        targetIssues: ['体虚乏力', '气血不足', '免疫力低下', '亚健康'],
        contraindications: ['严重心脏病', '高血压危象', '急性炎症'],
        duration: '15-30分钟',
        frequency: '每日1-2次',
        steps: [
          '双脚与肩同宽，膝盖微屈',
          '双手抱球于胸前，高度与心平',
          '脊柱自然伸展，头顶悬',
          '舌抵上颚，目微闭',
          '自然呼吸，意守丹田'
        ],
        tips: [
          '初学者每次5-10分钟即可',
          '保持全身放松',
          '注意膝盖不要超过脚尖'
        ],
        primaryMuscles: ['股四头肌', '臀大肌', '核心肌群'],
        relatedMeridians: ['任脉', '督脉', '肾经'],
        relatedAcupoints: ['涌泉', '百会', '丹田'],
        sortOrder: 10,
        isActive: true,
      },
      {
        name: '本源呼吸法',
        category: '本源训练',
        subCategory: '呼吸调理',
        description: '深长的腹式呼吸训练，调理膈肌功能，改善呼吸模式，促进气血运行。',
        targetIssues: ['呼吸浅短', '胸闷气短', '焦虑紧张', '睡眠不佳'],
        contraindications: ['气胸', '严重肺疾病急性期'],
        duration: '10-15分钟',
        frequency: '每日2-3次',
        steps: [
          '坐或仰卧，全身放松',
          '一手放胸部，一手放腹部',
          '吸气时腹部隆起，胸部不动',
          '呼气时腹部内收，缓慢呼尽',
          '呼吸比约1:2'
        ],
        tips: [
          '初学者不要过度追求深度',
          '保持自然，不要憋气',
          '可在睡前练习助眠'
        ],
        primaryMuscles: ['膈肌', '腹横肌', '肋间肌'],
        relatedMeridians: ['肺经', '肾经'],
        relatedAcupoints: ['膻中', '气海', '关元'],
        sortOrder: 11,
        isActive: true,
      },
      {
        name: '八段锦-双手托天理三焦',
        category: '本源训练',
        subCategory: '八段锦',
        description: '八段锦第一式，通过双手上托动作，调理三焦气机，改善全身气血运行。',
        targetIssues: ['胸闷气短', '消化不良', '肩颈僵硬', '疲劳'],
        contraindications: ['严重高血压', '急性心脏病'],
        duration: '5-10分钟',
        reps: 8,
        sets: 1,
        frequency: '每日2次',
        steps: [
          '两脚分开与肩同宽，双手自然下垂',
          '两掌心向上，从腹前向上托举',
          '至胸前翻掌，继续向上托举',
          '眼看双手，脚跟离地',
          '两手分开下落，脚跟落地'
        ],
        tips: [
          '动作要舒展大方',
          '上托时吸气，下落时呼气',
          '保持身体稳定'
        ],
        primaryMuscles: ['三角肌', '斜方肌', '竖脊肌'],
        relatedMeridians: ['三焦经', '肺经', '脾经'],
        sortOrder: 12,
        isActive: true,
      },
    ];

    // 插入数据
    const insertPromises = exercises.map(exercise => 
      db.insert(exerciseLibrary).values(exercise)
    );

    await Promise.all(insertPromises);

    return NextResponse.json({
      success: true,
      message: '训练动作库数据预设完成',
      count: exercises.length,
      categories: {
        整复训练: exercises.filter(e => e.category === '整复训练').length,
        本源训练: exercises.filter(e => e.category === '本源训练').length,
      }
    });

  } catch (error) {
    console.error('Error seeding exercises:', error);
    return NextResponse.json(
      { 
        error: '数据预设失败', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
