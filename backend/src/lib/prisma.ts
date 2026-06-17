/**
 * Prisma客户端单例
 * 提供全局数据库访问
 * 仅在 STORAGE_TYPE=prisma 时初始化，json模式下不使用
 */

import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

let prisma: PrismaClient;

// 只在使用 prisma 存储时才初始化客户端
if (process.env.STORAGE_TYPE === 'prisma') {
  const databaseUrl = process.env.DATABASE_URL;
  
  // 移除可能包围URL的引号
  const cleanDatabaseUrl = (databaseUrl || '').replace(/^["']|["']$/g, '');
  
  // 解析mysql连接字符串，mysql:// 协议需要特殊处理
  const urlStr = cleanDatabaseUrl.replace('mysql://', 'http://');
  const url = new URL(urlStr);
  
  const poolConfig: mariadb.PoolConfig = {
    host: url.hostname,
    port: url.port ? parseInt(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1) // 移除开头的斜杠
  };

  const adapter = new PrismaMariaDb(poolConfig);

  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({ adapter });
  } else {
    // 开发环境下防止热重载创建多个实例
    if (!(global as any).prisma) {
      (global as any).prisma = new PrismaClient({ adapter });
    }
    prisma = (global as any).prisma;
  }
} else {
  // json模式下不需要prisma客户端，创建一个空占位
  // 这里只需要类型兼容，实际不会使用
  prisma = {} as PrismaClient;
}

export default prisma;