/**
 * Prisma客户端单例
 * 提供全局数据库访问
 */

import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

// Prisma 7 的 client 引擎类型始终需要适配器
// 即使在 STORAGE_TYPE=json 模式下不使用，也需要创建一个适配器
const databaseUrl = process.env.DATABASE_URL;
const adapter = new PrismaMariaDb({ connectionString: databaseUrl });

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter });
} else {
  // 开发环境下防止热重载创建多个实例
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient({ adapter });
  }
  prisma = (global as any).prisma;
}

export default prisma;