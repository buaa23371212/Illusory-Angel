/**
 * 存储工厂
 * 根据环境配置创建对应的Repository实现
 */

import { IRepository } from './interface';
import { JsonRepository } from './json';
import { PrismaRepository } from './prisma';

/**
 * 存储类型枚举
 */
export type StorageType = 'json' | 'prisma';

/**
 * 获取存储类型从环境变量
 */
function getStorageType(): StorageType {
  const type = process.env.STORAGE_TYPE;
  if (type === 'prisma') return 'prisma';
  return 'json'; // 默认使用JSON文件存储
}

/**
 * 获取数据目录
 */
function getDataDir(): string {
  return process.env.DATA_DIR || './data';
}

/**
 * 存储工厂实例
 */
let repositoryInstance: IRepository | null = null;

/**
 * 创建Repository实例
 */
async function createRepository(): Promise<IRepository> {
  const storageType = getStorageType();
  const dataDir = getDataDir();

  if (storageType === 'json') {
    const repo = new JsonRepository(dataDir);
    await repo.initialize();
    return repo;
  } else {
    const repo = new PrismaRepository();
    await repo.initialize();
    return repo;
  }
}

/**
 * 获取Repository单例
 */
export async function getRepository(): Promise<IRepository> {
  if (!repositoryInstance) {
    repositoryInstance = await createRepository();
  }
  return repositoryInstance;
}

/**
 * 重置Repository实例（用于测试）
 */
export function resetRepository(): void {
  repositoryInstance = null;
}

/**
 * 获取当前存储类型
 */
export function getCurrentStorageType(): StorageType {
  return getStorageType();
}