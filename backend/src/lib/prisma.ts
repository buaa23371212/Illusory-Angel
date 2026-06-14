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

// 解析连接字符串为 PoolConfig 格式
const url = new URL(databaseUrl || '');
const poolConfig: mariadb.PoolConfig = {
  host: url.hostname,
  port: url.port ? parseInt(url.port) : 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1) // 移除开头的斜杠
};

const adapter = new PrismaMariaDb(poolConfig);

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