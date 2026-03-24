import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/storage/database/shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || process.env.PGDATABASE_URL || '',
  },
  // 严格模式：防止意外修改已存在的表
  strict: true,
});
