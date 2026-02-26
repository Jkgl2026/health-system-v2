// utils/course-data.js
// 课程数据

const ADDITIONAL_COURSES = [
  // 因果系列
  {
    id: '22',
    title: '疾病为什么会反复',
    content: '疾病反复的根本原因是没有找到真正的病因，只是控制了症状。需要理解因果规律，找到病因才能从根本上解决问题。',
    duration: '10分钟',
    module: '因果',
    season: '第1季',
    courseNumber: 2,
    relatedElements: ['气血', '循环'],
    relatedDiseases: ['慢性病', '反复发作的疾病'],
    isHidden: true,
    priority: 5
  },
  {
    id: '23',
    title: '如何用两个字解读疾病',
    content: '用"因果"两个字解读疾病。因是病因，果是疾病症状。治病求因，找到病因才能治本。',
    duration: '10分钟',
    module: '因果',
    season: '第1季',
    courseNumber: 3,
    relatedElements: ['气血'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 5
  },
  {
    id: '24',
    title: '如何用因果解决疾病',
    content: '通过找到病因，消除病因，从根本上解决疾病问题。因果思维是健康调理的核心思维。',
    duration: '10分钟',
    module: '因果',
    season: '第1季',
    courseNumber: 4,
    relatedElements: ['气血', '毒素'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 5
  },
  {
    id: '25',
    title: '找到病因就能去根',
    content: '找到病因并消除病因，疾病才能去根。病因在生活习惯、情绪、饮食等方面，需要全面排查。',
    duration: '10分钟',
    module: '因果',
    season: '第2季',
    courseNumber: 18,
    relatedElements: ['气血', '毒素', '情绪'],
    relatedDiseases: ['所有慢性病'],
    isHidden: true,
    priority: 5
  },
  {
    id: '26',
    title: '不懂因果，错上加错',
    content: '如果不懂因果规律，只关注症状，往往会导致错上加错，病情加重。必须建立因果思维。',
    duration: '10分钟',
    module: '因果',
    season: '第1季',
    courseNumber: 5,
    relatedElements: ['气血', '毒素'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 5
  },

  // 寒湿系列
  {
    id: '27',
    title: '预防流感的五个要素',
    content: '预防流感需要注意保暖、提升免疫力、保持卫生、合理饮食、充足休息五个要素。',
    duration: '10分钟',
    module: '寒湿',
    season: '第1季',
    courseNumber: 25,
    relatedElements: ['寒凉', '免疫'],
    relatedDiseases: ['感冒', '流感', '呼吸道感染'],
    isHidden: true,
    priority: 4
  },
  {
    id: '28',
    title: '温度解百病',
    content: '体温是健康的重要指标。体温低会导致免疫力下降、循环不畅、代谢缓慢。提升体温可以预防和改善多种疾病。',
    duration: '10分钟',
    module: '寒湿',
    season: '第1季',
    courseNumber: 46,
    relatedElements: ['寒凉', '循环', '气血', '免疫'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 5
  },
  {
    id: '29',
    title: '气血平衡，让你的生活变得更美好',
    content: '气血平衡是健康的基础。气血充足，身体机能正常；气血不足，各种疾病随之而来。',
    duration: '10分钟',
    module: '气血',
    season: '第2季',
    courseNumber: 25,
    relatedElements: ['气血', '循环'],
    relatedDiseases: ['气血不足引起的疾病'],
    isHidden: true,
    priority: 5
  },
  {
    id: '30',
    title: '会坐月子能去病',
    content: '月子期间调养得当，可以去除很多妇科疾病。月子调养包括保暖、休息、营养、情绪管理等方面。',
    duration: '10分钟',
    module: '寒湿',
    season: '第2季',
    courseNumber: 25,
    relatedElements: ['寒凉', '气血', '毒素'],
    relatedDiseases: ['月子病', '妇科疾病'],
    isHidden: true,
    priority: 4
  },

  // 排毒系列
  {
    id: '31',
    title: '如何解读排毒反应',
    content: '排毒反应是身体在清理毒素时的正常反应，包括发热、乏力、头晕、皮肤变化等。要正确理解，不要误以为是病情加重。',
    duration: '10分钟',
    module: '排毒',
    season: '第1季',
    courseNumber: 18,
    relatedElements: ['毒素', '气血'],
    relatedDiseases: ['所有疾病调理过程'],
    isHidden: true,
    priority: 4
  },
  {
    id: '32',
    title: '你知道身体有哪八个救命的排毒口吗',
    content: '身体有八个重要的排毒口，包括汗腺、泌尿系统、呼吸系统、肠道等。了解并运用这些排毒口，可以有效排毒。',
    duration: '10分钟',
    module: '排毒',
    season: '第1季',
    courseNumber: 26,
    relatedElements: ['毒素', '循环'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 4
  },
  {
    id: '33',
    title: '排毒的四大好处',
    content: '排毒可以清除体内毒素，提升免疫力，改善循环，延缓衰老。是健康调理的重要环节。',
    duration: '10分钟',
    module: '排毒',
    season: '第1季',
    courseNumber: 27,
    relatedElements: ['毒素', '循环', '免疫', '气血'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 4
  },
  {
    id: '34',
    title: '让家人远离大病的秘密',
    content: '通过定期排毒、改善生活习惯、提升免疫力，可以让家人远离大病，保持健康。',
    duration: '10分钟',
    module: '排毒',
    season: '第1季',
    courseNumber: 23,
    relatedElements: ['毒素', '免疫', '气血'],
    relatedDiseases: ['所有慢性病'],
    isHidden: true,
    priority: 4
  },
  {
    id: '35',
    title: '你欠身体的账还的越早，风险越小',
    content: '不良生活习惯、情绪压力等都是欠身体的健康账。越早还账，健康风险越小。',
    duration: '10分钟',
    module: '排毒',
    season: '第3季',
    courseNumber: 37,
    relatedElements: ['毒素', '气血', '循环'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 4
  },

  // 微循环系列
  {
    id: '36',
    title: '大病查出来为什么到晚期',
    content: '大病在早期时，微循环已经出现问题，但仪器检查不出来。等到查出时，往往已经是晚期。要重视身体的早期信号。',
    duration: '10分钟',
    module: '微循环',
    season: '第1季',
    courseNumber: 9,
    relatedElements: ['循环', '气血', '毒素'],
    relatedDiseases: ['癌症', '重大疾病'],
    isHidden: true,
    priority: 5
  },
  {
    id: '37',
    title: '改善微循环，预防重大疾病',
    content: '微循环是大病早期的重要信号。通过改善微循环，可以预防和改善重大疾病。',
    duration: '10分钟',
    module: '微循环',
    season: '第1季',
    courseNumber: 10,
    relatedElements: ['循环', '气血', '毒素'],
    relatedDiseases: ['癌症', '重大疾病'],
    isHidden: true,
    priority: 5
  },

  // 免疫力系列
  {
    id: '38',
    title: '这个世界上没有治百病的药，但是有调百病的方法',
    content: '药物只能治疗症状，不能治本。通过调理气血、循环、毒素等，才能从根本上改善健康。',
    duration: '10分钟',
    module: '免疫力',
    season: '第1季',
    courseNumber: 11,
    relatedElements: ['免疫', '气血', '循环', '毒素'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 5
  },
  {
    id: '39',
    title: '我们的免疫力，为什么比十年前下降了',
    content: '免疫力下降的原因包括环境污染、不良生活习惯、情绪压力、营养不均衡等。需要全面提升免疫力。',
    duration: '10分钟',
    module: '免疫力',
    season: '第4季',
    courseNumber: 1,
    relatedElements: ['免疫', '气血', '毒素'],
    relatedDiseases: ['免疫力低下引起的疾病'],
    isHidden: true,
    priority: 4
  },
  {
    id: '40',
    title: '孩子对不起，我们知道的太晚了',
    content: '很多疾病如果在早期干预，可以避免悲剧。家长要重视孩子的健康，及时预防和调理。',
    duration: '10分钟',
    module: '免疫力',
    season: '第3季',
    courseNumber: 52,
    relatedElements: ['免疫', '气血'],
    relatedDiseases: ['儿童疾病'],
    isHidden: true,
    priority: 4
  },
  {
    id: '41',
    title: '父母体质好，孩子生病少',
    content: '父母的体质会影响孩子的健康。父母调理好身体，孩子生病会减少。',
    duration: '10分钟',
    module: '免疫力',
    season: '第2季',
    courseNumber: 35,
    relatedElements: ['免疫', '气血', '毒素'],
    relatedDiseases: ['儿童疾病'],
    isHidden: true,
    priority: 4
  },

  // 恢复健康七要素
  {
    id: '42',
    title: '恢复健康的速度，由你自己的七个要素决定',
    content: '恢复健康需要关注气血、循环、毒素、血脂、寒凉、免疫、情绪七个要素。要素改善越多，恢复越快。',
    duration: '10分钟',
    module: '恢复健康七要素',
    season: '第1季',
    courseNumber: 40,
    relatedElements: ['气血', '循环', '毒素', '血脂', '寒凉', '免疫', '情绪'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 5
  },
  {
    id: '43',
    title: '为什么坚持一辈子容易，坚持几个月却很难',
    content: '长期坚持需要建立正确的生活习惯和健康观念。健康调理是长期的过程，不能急于求成。',
    duration: '10分钟',
    module: '恢复健康七要素',
    season: '第1季',
    courseNumber: 41,
    relatedElements: ['情绪', '气血'],
    relatedDiseases: ['所有疾病'],
    isHidden: true,
    priority: 4
  },
];

// 课程模块分类
const COURSE_MODULES = {
  '因果': {
    description: '理解因果规律，找到病因才能从根本上解决问题',
    color: '#3b82f6',
    courses: ['22', '23', '24', '25', '26']
  },
  '寒湿': {
    description: '温度是健康的重要指标，提升体温可以预防和改善多种疾病',
    color: '#06b6d4',
    courses: ['27', '28', '30']
  },
  '气血': {
    description: '气血平衡是健康的基础',
    color: '#f59e0b',
    courses: ['29']
  },
  '排毒': {
    description: '清除体内毒素，提升免疫力，改善循环',
    color: '#10b981',
    courses: ['31', '32', '33', '34', '35']
  },
  '微循环': {
    description: '微循环是大病早期的重要信号',
    color: '#8b5cf6',
    courses: ['36', '37']
  },
  '免疫力': {
    description: '全面提升免疫力，预防疾病',
    color: '#ef4444',
    courses: ['38', '39', '40', '41']
  },
  '恢复健康七要素': {
    description: '气血、循环、毒素、血脂、寒凉、免疫、情绪七个要素',
    color: '#ec4899',
    courses: ['42', '43']
  }
};

// 课程季数
const COURSE_SEASONS = [
  { season: '第1季', count: 20, description: '健康观念启蒙' },
  { season: '第2季', count: 15, description: '深入学习调理方法' },
  { season: '第3季', count: 15, description: '实战案例分析' },
  { season: '第4季', count: 10, description: '进阶调理技术' }
];

/**
 * 获取所有课程
 * @returns {Array} 课程列表
 */
function getAllCourses() {
  return ADDITIONAL_COURSES;
}

/**
 * 根据ID获取课程
 * @param {string} id - 课程ID
 * @returns {Object|null} 课程对象
 */
function getCourseById(id) {
  return ADDITIONAL_COURSES.find(course => course.id === id) || null;
}

/**
 * 根据模块获取课程
 * @param {string} module - 模块名称
 * @returns {Array} 课程列表
 */
function getCoursesByModule(module) {
  return ADDITIONAL_COURSES.filter(course => course.module === module);
}

/**
 * 根据健康要素获取课程
 * @param {string} element - 健康要素名称
 * @returns {Array} 课程列表
 */
function getCoursesByElement(element) {
  return ADDITIONAL_COURSES.filter(course => 
    course.relatedElements && course.relatedElements.includes(element)
  );
}

/**
 * 根据疾病获取课程
 * @param {string} disease - 疾病名称
 * @returns {Array} 课程列表
 */
function getCoursesByDisease(disease) {
  return ADDITIONAL_COURSES.filter(course => 
    course.relatedDiseases && course.relatedDiseases.includes(disease)
  );
}

/**
 * 获取高优先级课程
 * @param {number} minPriority - 最小优先级
 * @returns {Array} 课程列表
 */
function getHighPriorityCourses(minPriority = 4) {
  return ADDITIONAL_COURSES.filter(course => 
    course.priority && course.priority >= minPriority
  );
}

module.exports = {
  // 常量
  ADDITIONAL_COURSES,
  COURSE_MODULES,
  COURSE_SEASONS,
  
  // 函数
  getAllCourses,
  getCourseById,
  getCoursesByModule,
  getCoursesByElement,
  getCoursesByDisease,
  getHighPriorityCourses,
};
