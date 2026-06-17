/**
 * 爆枪英雄养成服务
 * 处理养成数据的查询和更新逻辑
 */

import { getRepository } from '../../repositories';
import type { Constraint } from '@prisma/client';
import { CONSTRAINT_NAMES } from './types';
import type {
  BqtjData,
  DailyDropLimit,
  WeeklyDropLimit,
  InventoryResource,
} from './types';

/**
 * 获取项目下所有养成约束数据
 * @param projectId 项目ID
 * @returns 完整的养成数据，包含每日掉落限制、每周掉落限制和背包已有资源
 */
export async function getAllBqtjData(projectId: number): Promise<BqtjData> {
  const repo = await getRepository();

  // 查询所有相关约束
  const [dailyConstraint, weeklyConstraint, inventoryConstraint] = await Promise.all([
    findConstraintByName(projectId, CONSTRAINT_NAMES.DAILY_DROP_LIMIT),
    findConstraintByName(projectId, CONSTRAINT_NAMES.WEEKLY_DROP_LIMIT),
    findConstraintByName(projectId, CONSTRAINT_NAMES.INVENTORY_RESOURCES),
  ]);

  // 解析数据
  const dailyDropLimit = parseDailyDropLimit(dailyConstraint);
  const weeklyDropLimit = parseWeeklyDropLimit(weeklyConstraint);
  const inventoryResources = parseInventoryResources(inventoryConstraint);

  // 自动重置过期的掉落限制
  await resetExpiredLimits(projectId);

  return {
    dailyDropLimit,
    weeklyDropLimit,
    inventoryResources,
  };
}

/**
 * 更新指定约束的 params 数据
 * @param projectId 项目ID
 * @param constraintName 约束名称
 * @param params 新的 params JSON 对象
 * @returns 更新是否成功
 */
export async function updateConstraintParams(
  projectId: number,
  constraintName: string,
  params: Record<string, unknown>
): Promise<boolean> {
  const repo = await getRepository();

  // 验证约束名称是否合法
  const validNames = Object.values(CONSTRAINT_NAMES);
  if (!validNames.includes(constraintName as any)) {
    return false;
  }

  // 查找已存在的约束
  const existing = await findConstraintByName(projectId, constraintName);

  if (existing) {
    // 更新现有约束
    await repo.constraint.update(existing.constraintId, { params });
  } else {
    // 创建新约束
    await repo.constraint.create({
      ownerType: 'PROJECT',
      ownerId: projectId,
      constraintName,
      params,
    });
  }

  return true;
}

/**
 * 根据项目ID和约束名称查找约束
 */
async function findConstraintByName(
  ownerId: number,
  constraintName: string
): Promise<Constraint | null> {
  const repo = await getRepository();
  const constraints = await repo.constraint.findByOwner('PROJECT', ownerId);
  return constraints.find(c => c.constraintName === constraintName) || null;
}

/**
 * 解析每日掉落限制约束数据
 */
function parseDailyDropLimit(constraint: Constraint | null): DailyDropLimit[] {
  if (!constraint || !constraint.params) return [];
  const params = constraint.params as Record<string, DailyDropLimit>;
  return Object.values(params);
}

/**
 * 解析每周掉落限制约束数据
 */
function parseWeeklyDropLimit(constraint: Constraint | null): WeeklyDropLimit[] {
  if (!constraint || !constraint.params) return [];
  const params = constraint.params as Record<string, WeeklyDropLimit>;
  return Object.values(params);
}

/**
 * 解析背包已有资源约束数据
 */
function parseInventoryResources(constraint: Constraint | null): InventoryResource[] {
  if (!constraint || !constraint.params) return [];
  const params = constraint.params as Record<string, InventoryResource>;
  return Object.values(params);
}

/**
 * 计算下一次每日重置时间戳（次日凌晨00:00）
 */
function getNextDailyResetTime(): number {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return tomorrow.getTime();
}

/**
 * 计算下一次每周重置时间戳（下周一凌晨00:00）
 */
function getNextWeeklyResetTime(): number {
  const now = new Date();
  const currentDay = now.getDay(); // 0=周日, 1=周一...6=周六
  const daysToNextMonday = currentDay === 0 ? 1 : 8 - currentDay;
  const nextMonday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysToNextMonday,
    0,
    0,
    0,
    0
  );
  return nextMonday.getTime();
}

/**
 * 重置过期的掉落限制
 * 如果当前时间超过 resetAt，则将 current 重置为 0 并更新 resetAt 到下一个周期
 */
export async function resetExpiredLimits(projectId: number): Promise<void> {
  const repo = await getRepository();
  const now = Date.now();

  // 处理每日掉落限制
  const dailyConstraint = await findConstraintByName(
    projectId,
    CONSTRAINT_NAMES.DAILY_DROP_LIMIT
  );
  if (dailyConstraint && dailyConstraint.params) {
    const params = dailyConstraint.params as Record<string, DailyDropLimit>;
    let needUpdate = false;

    for (const [key, limit] of Object.entries(params)) {
      if (limit.resetAt <= now) {
        limit.current = 0;
        limit.resetAt = getNextDailyResetTime();
        params[key] = limit;
        needUpdate = true;
      }
    }

    if (needUpdate) {
      await repo.constraint.update(dailyConstraint.constraintId, { params });
    }
  }

  // 处理每周掉落限制
  const weeklyConstraint = await findConstraintByName(
    projectId,
    CONSTRAINT_NAMES.WEEKLY_DROP_LIMIT
  );
  if (weeklyConstraint && weeklyConstraint.params) {
    const params = weeklyConstraint.params as Record<string, WeeklyDropLimit>;
    let needUpdate = false;

    for (const [key, limit] of Object.entries(params)) {
      if (limit.resetAt <= now) {
        limit.current = 0;
        limit.resetAt = getNextWeeklyResetTime();
        params[key] = limit;
        needUpdate = true;
      }
    }

    if (needUpdate) {
      await repo.constraint.update(weeklyConstraint.constraintId, { params });
    }
  }
}