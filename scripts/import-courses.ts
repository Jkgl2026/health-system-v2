import { getDb } from 'coze-coding-dev-sdk';
import { courses } from '../src/storage/database/shared/schema';
import { ADDITIONAL_COURSES, DISEASE_SYMPTOM_MAP } from '../src/lib/course-data';

async function importCourses() {
  console.log('开始导入课程数据...');

  try {
    const db = await getDb();

    // 检查是否已存在课程数据
    const existingCoursesResult = await db.select().from(courses).limit(1);
    if (existingCoursesResult.length > 0) {
      console.log('课程数据已存在，无需重复导入');
      return;
    }

    // 导入课程数据
    let importedCount = 0;
    for (const course of ADDITIONAL_COURSES) {
      // 根据疾病查找相关症状
      const relatedSymptoms: number[] = [];
      if (course.relatedDiseases && Array.isArray(course.relatedDiseases)) {
        for (const disease of course.relatedDiseases) {
          const symptoms = DISEASE_SYMPTOM_MAP[disease] || [];
          relatedSymptoms.push(...symptoms);
        }
      }

      // 去重
      const uniqueSymptoms = [...new Set(relatedSymptoms)];

      await db.insert(courses).values({
        title: course.title,
        content: course.content,
        duration: course.duration,
        module: course.module,
        relatedElements: course.relatedElements || [],
        relatedSymptoms: uniqueSymptoms,
        relatedDiseases: course.relatedDiseases || [],
        priority: course.priority || 0,
        isHidden: course.isHidden ?? true,
        courseNumber: course.courseNumber,
        season: course.season,
      });

      importedCount++;
      console.log(`已导入: ${course.title}`);
    }

    console.log(`\n成功导入 ${importedCount} 门课程!`);
  } catch (error) {
    console.error('导入课程失败:', error);
    process.exit(1);
  }
}

importCourses()
  .then(() => {
    console.log('导入完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('导入失败:', error);
    process.exit(1);
  });
