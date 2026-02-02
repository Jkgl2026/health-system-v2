import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './storage/database/shared/schema';

// 创建 PostgreSQL 连接
function createConnection() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  if (!url) {
    console.warn('DATABASE_URL not set, using mock connection');
    return null;
  }

  const client = postgres(url, { max: 1 });
  return drizzle(client, { schema });
}

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    db = createConnection();
  }
  return db;
}

export * from './storage/database/shared/schema';
