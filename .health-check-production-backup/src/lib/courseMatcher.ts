import { getDb } from 'coze-coding-dev-sdk';
import { courses } from '@/storage/database/shared/schema';

export interface MatchedCourse {
  id: string;
  title: string;
  content: string;
  duration: string | null;
  module: string | null;
  courseNumber?: number | null;
  season?: string | null;
  relevance: 'high' | 'medium' | 'low';
  matchScore: number;
  matchReasons: string[];
}

export interface CourseMatchInput {
  selectedSymptoms: number[];
  healthAnalysis?: {
    qiAndBlood?: number;
    circulation?: number;
    toxins?: number;
    bloodLipids?: number;
    coldness?: number;
    immunity?: number;
    emotions?: number;
  };
  selectedChoice?: string;
  selectedHabits?: number[];
  badHabitsChecklist?: number[];
}

/**
 * 课程智能匹配服务
 * 根据用户填写的内容精准匹配相关课程
 */
export class CourseMatcher {
  private elementNames: Record<string, string> = {
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
   */
  async matchCourses(input: CourseMatchInput): Promise<MatchedCourse[]> {
    const db = await getDb();

    // 获取所有课程（包括隐藏的课程）
    const allCourses = await db.select().from(courses);

    // 计算每个课程的匹配分数
    const matchedCourses = allCourses.map(course => {
      return this.calculateCourseMatch(course, input);
    });

    // 过滤掉匹配分数为0的课程
    const validCourses = matchedCourses.filter(course => course.matchScore > 0);

    // 按匹配分数排序
    validCourses.sort((a, b) => b.matchScore - a.matchScore);

    // 确定相关性等级
    return validCourses.map(course => ({
      ...course,
      relevance: this.determineRelevance(course.matchScore),
    }));
  }

  /**
   * 计算单个课程的匹配分数
   */
  private calculateCourseMatch(
    course: any,
    input: CourseMatchInput
  ): Omit<MatchedCourse, 'relevance'> {
    let matchScore = 0;
    const matchReasons: string[] = [];

    // 1. 根据症状匹配（权重最高）
    if (input.selectedSymptoms && input.selectedSymptoms.length > 0) {
      const courseSymptoms = course.relatedSymptoms || [];
      const matchedSymptoms = input.selectedSymptoms.filter(symptom =>
        Array.isArray(courseSymptoms) && courseSymptoms.includes(symptom)
      );

      if (matchedSymptoms.length > 0) {
        matchScore += matchedSymptoms.length * 3; // 每个匹配的症状加3分
        matchReasons.push(`匹配到 ${matchedSymptoms.length} 个相关症状`);
      }
    }

    // 2. 根据健康要素匹配（权重高）
    if (input.healthAnalysis) {
      const relatedElements = Array.isArray(course.relatedElements) ? course.relatedElements : [];
      let elementScore = 0;

      for (const [key, value] of Object.entries(input.healthAnalysis)) {
        if (typeof value === 'number' && value > 0) {
          const elementName = this.elementNames[key];
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

    // 3. 根据不良生活习惯匹配（权重中等）
    if (input.badHabitsChecklist && input.badHabitsChecklist.length > 0) {
      const courseModule = course.module;

      // 根据模块匹配生活习惯
      if (courseModule === '生活习惯' && input.badHabitsChecklist.length > 0) {
        matchScore += 5;
        matchReasons.push('匹配生活习惯问题');
      } else if (courseModule === '饮食习惯' &&
                 input.badHabitsChecklist.some(h => h >= 1 && h <= 69)) {
        // 习惯ID 1-69 是饮食习惯
        matchScore += 5;
        matchReasons.push('匹配饮食习惯问题');
      } else if (courseModule === '睡眠' &&
                 input.badHabitsChecklist.some(h => h >= 70 && h <= 79)) {
        // 习惯ID 70-79 是睡眠习惯
        matchScore += 5;
        matchReasons.push('匹配睡眠习惯问题');
      }
    }

    // 4. 根据选择的方案类型匹配
    if (input.selectedChoice) {
      // 如果选择了系统调理，增加所有课程的匹配分数
      if (input.selectedChoice === 'choice3') {
        matchScore += 2;
        matchReasons.push('系统调理需要学习课程');
      }
    }

    // 5. 根据课程优先级调整分数
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
   */
  private determineRelevance(matchScore: number): 'high' | 'medium' | 'low' {
    if (matchScore >= 15) {
      return 'high';
    } else if (matchScore >= 8) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 根据症状获取推荐课程（用于后台分析）
   */
  async getRecommendedCoursesBySymptoms(symptomIds: number[]): Promise<MatchedCourse[]> {
    const db = await getDb();

    const allCourses = await db.select().from(courses);

    return allCourses
      .map(course => {
        const courseSymptoms = course.relatedSymptoms || [];
        const matchedSymptoms = Array.isArray(courseSymptoms)
          ? symptomIds.filter(symptom => courseSymptoms.includes(symptom))
          : [];

        return {
          id: course.id,
          title: course.title,
          content: course.content,
          duration: course.duration,
          module: course.module,
          courseNumber: course.courseNumber,
          season: course.season,
          matchScore: matchedSymptoms.length * 3 + (course.priority || 0),
          matchReasons: matchedSymptoms.length > 0
            ? [`匹配到 ${matchedSymptoms.length} 个相关症状`]
            : [],
          relevance: this.determineRelevance(matchedSymptoms.length * 3 + (course.priority || 0)),
        };
      })
      .filter(course => course.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * 根据健康要素获取推荐课程
   */
  async getRecommendedCoursesByElements(elements: string[]): Promise<MatchedCourse[]> {
    const db = await getDb();

    const allCourses = await db.select().from(courses);

    return allCourses
      .map(course => {
        const courseElements = Array.isArray(course.relatedElements) ? course.relatedElements : [];
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
          relevance: this.determineRelevance(matchedElements.length * 5 + (course.priority || 0)),
        };
      })
      .filter(course => course.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}

// 导出单例
export const courseMatcher = new CourseMatcher();
