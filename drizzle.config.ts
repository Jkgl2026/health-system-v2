import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/storage/database/shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.PGDATABASE_URL || '',
  },
  // 只包含需要 Drizzle 管理的表，排除诊断表
  // 诊断表由 API 使用原始 SQL 管理，不应被 Drizzle 迁移
  tablesFilter: ['users', 'symptom_checks', 'health_analysis', 'user_choices', 'requirements', 'admins', 'audit_logs', 'audit_logs_archive', 'backup_records', 'courses', 'exercise_library', 'check_in_records', 'reminders'],
  // 严格模式：防止意外修改已存在的表
  strict: true,
});
