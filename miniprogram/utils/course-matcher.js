// utils/course-matcher.js
// 课程智能匹配服务 - 根据用户填写的内容精准匹配相关课程

const { ADDITIONAL_COURSES } = require('./course-data');

// 健康要素名称映射
const ELEMENT_NAMES = {
  qiAndBlood: '气血',
  circulation: '循环',
  toxins: '毒素',
  bloodLipids: '血脂',
  coldness: '寒凉',
  immunity: '免疫',
  emotions: '情绪',
};

/**
 * 匹配课程
 * @param {Object} input - 输入参数
 * @param {Array} input.selectedSymptoms - 选中的症状ID
 * @param {Object} input.healthAnalysis - 健康分析结果
 * @param {string} input.selectedChoice - 选择方案
 * @param {Array} input.selectedHabits - 选中的习惯
 * @param {Array} input.badHabitsChecklist - 不良习惯清单
 * @returns {Array} 匹配的课程列表
 */
function matchCourses(input) {
  const {
    selectedSymptoms = [],
    healthAnalysis = {},
    selectedChoice,
    selectedHabits = [],
    badHabitsChecklist = []
  } = input;

  // 计算每个课程的匹配分数
  const matchedCourses = ADDITIONAL_COURSES.map(course => {
    return calculateCourseMatch(course, input);
  });

  // 过滤掉匹配分数为0的课程
  const validCourses = matchedCourses.filter(course => course.matchScore > 0);

  // 按匹配分数排序
  validCourses.sort((a, b) => b.matchScore - a.matchScore);

  // 确定相关性等级
  return validCourses.map(course => ({
    ...course,
    relevance: determineRelevance(course.matchScore),
  }));
}

/**
 * 计算单个课程的匹配分数
 * @param {Object} course - 课程对象
 * @param {Object} input - 输入参数
 * @returns {Object} 匹配结果
 */
function calculateCourseMatch(course, input) {
  const {
    selectedSymptoms = [],
    healthAnalysis = {},
    selectedChoice,
    badHabitsChecklist = []
  } = input;

  let matchScore = 0;
  const matchReasons = [];

  // 1. 根据健康要素匹配（权重最高）
  if (healthAnalysis && Object.keys(healthAnalysis).length > 0) {
    const relatedElements = course.relatedElements || [];
    let elementScore = 0;

    for (const [key, value] of Object.entries(healthAnalysis)) {
      if (typeof value === 'number' && value > 0) {
        const elementName = ELEMENT_NAMES[key];
        if (elementName && relatedElements.includes(elementName)) {
          // 分数越高，权重越大
          elementScore += Math.min(value, 10); // 最多加10分
        }
      }
    }

    if (elementScore > 0) {
      matchScore += elementScore;
      matchReasons.push(`匹配健康要素，得分 ${elementScore}`);
    }
  }

  // 2. 根据不良生活习惯匹配（权重中等）
  if (badHabitsChecklist && badHabitsChecklist.length > 0) {
    const courseModule = course.module;

    // 根据模块匹配生活习惯
    if (courseModule === '生活习惯' && badHabitsChecklist.length > 0) {
      matchScore += 5;
      matchReasons.push('匹配生活习惯问题');
    } else if (courseModule === '饮食习惯' &&
               badHabitsChecklist.some(h => h >= 1 && h <= 69)) {
      // 习惯ID 1-69 是饮食习惯
      matchScore += 5;
      matchReasons.push('匹配饮食习惯问题');
    } else if (courseModule === '睡眠' &&
               badHabitsChecklist.some(h => h >= 70 && h <= 79)) {
      // 习惯ID 70-79 是睡眠习惯
      matchScore += 5;
      matchReasons.push('匹配睡眠习惯问题');
    }
  }

  // 3. 根据选择的方案类型匹配
  if (selectedChoice) {
    // 如果选择了系统调理，增加所有课程的匹配分数
    if (selectedChoice === 'choice3') {
      matchScore += 2;
      matchReasons.push('系统调理需要学习课程');
    }
  }

  // 4. 根据课程优先级调整分数
  if (course.priority) {
    matchScore += course.priority;
  }

  return {
    id: course.id,
    title: course.title,
    content: course.content,
    duration: course.duration,
    module: course.module,
    courseNumber: course.courseNumber,
    season: course.season,
    matchScore,
    matchReasons,
  };
}

/**
 * 根据匹配分数确定相关性等级
 * @param {number} matchScore - 匹配分数
 * @returns {string} 相关性等级
 */
function determineRelevance(matchScore) {
  if (matchScore >= 15) {
    return 'high';
  } else if (matchScore >= 8) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * 根据健康要素获取推荐课程
 * @param {Array} elements - 健康要素名称数组
 * @returns {Array} 匹配的课程列表
 */
function getRecommendedCoursesByElements(elements) {
  return ADDITIONAL_COURSES
    .map(course => {
      const courseElements = course.relatedElements || [];
      const matchedElements = elements.filter(element =>
        courseElements.includes(element)
      );

      return {
        id: course.id,
        title: course.title,
        content: course.content,
        duration: course.duration,
        module: course.module,
        courseNumber: course.courseNumber,
        season: course.season,
        matchScore: matchedElements.length * 5 + (course.priority || 0),
        matchReasons: matchedElements.length > 0
          ? [`匹配健康要素：${matchedElements.join('、')}`]
          : [],
        relevance: determineRelevance(matchedElements.length * 5 + (course.priority || 0)),
      };
    })
    .filter(course => course.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 根据模块获取推荐课程
 * @param {string} module - 模块名称
 * @returns {Array} 匹配的课程列表
 */
function getRecommendedCoursesByModule(module) {
  return ADDITIONAL_COURSES
    .filter(course => course.module === module)
    .map(course => ({
      id: course.id,
      title: course.title,
      content: course.content,
      duration: course.duration,
      module: course.module,
      courseNumber: course.courseNumber,
      season: course.season,
      matchScore: course.priority || 3,
      matchReasons: [`属于 ${module} 模块`],
      relevance: 'medium',
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 获取个性化推荐课程
 * @param {Object} userData - 用户数据
 * @returns {Array} 推荐课程列表
 */
function getPersonalizedCourses(userData) {
  const {
    healthScore,
    healthAnalysis,
    selectedChoice,
    badHabitsChecklist
  } = userData;

  // 如果健康分数低，推荐基础课程
  if (healthScore && healthScore < 50) {
    const baseCourses = matchCourses({
      healthAnalysis,
      selectedChoice,
      badHabitsChecklist
    });
    
    // 添加基础必学课程
    const mustLearnCourses = ADDITIONAL_COURSES
      .filter(course => course.priority === 5)
      .map(course => ({
        id: course.id,
        title: course.title,
        content: course.content,
        duration: course.duration,
        module: course.module,
        courseNumber: course.courseNumber,
        season: course.season,
        matchScore: 20,
        matchReasons: ['健康分数较低，推荐必学课程'],
        relevance: 'high'
      }));
    
    // 合并并去重
    const allCourses = [...mustLearnCourses, ...baseCourses];
    const uniqueCourses = allCourses.filter((course, index, self) =>
      index === self.findIndex(c => c.id === course.id)
    );
    
    return uniqueCourses.sort((a, b) => b.matchScore - a.matchScore);
  }

  return matchCourses({
    healthAnalysis,
    selectedChoice,
    badHabitsChecklist
  });
}

module.exports = {
  // 常量
  ELEMENT_NAMES,
  
  // 函数
  matchCourses,
  calculateCourseMatch,
  determineRelevance,
  getRecommendedCoursesByElements,
  getRecommendedCoursesByModule,
  getPersonalizedCourses,
};
