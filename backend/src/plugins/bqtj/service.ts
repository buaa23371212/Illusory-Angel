/**
 * 爆枪英雄养成服务
 * 处理养成数据的查询和更新逻辑
 */

import { getRepository } from '../../repositories';
import type { Constraint } from '@prisma/client';
import {
  CONSTRAINT_NAMES,
  isValidDailyDropLimit,
  isValidWeeklyDropLimit,
  isValidInventoryResource,
  isValidGoalAttributes,
  isValidMaterialDefinition,
} from './types';
import type {
  BqtjData,
  DailyDropLimit,
  WeeklyDropLimit,
  InventoryResource,
  MaterialDefinition,
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

  return {
    dailyDropLimit,
    weeklyDropLimit,
    inventoryResources,
  };
}

/**
 * 验证 params 数据结构是否匹配对应约束类型
 * @param constraintName 约束名称
 * @param params 需要验证的参数对象
 * @returns 验证是否通过
 */
function validateParamsByConstraintName(
  constraintName: string,
  params: Record<string, unknown>
): boolean {
  // params 必须是对象
  if (typeof params !== 'object' || params === null) {
    return false;
  }

  switch (constraintName) {
    case CONSTRAINT_NAMES.MATERIAL_DEFINITIONS: {
      // 验证每个材料定义
      for (const [key, value] of Object.entries(params)) {
        if (typeof key !== 'string' || !isValidMaterialDefinition(value)) {
          return false;
        }
      }
      return true;
    }

    case CONSTRAINT_NAMES.DAILY_DROP_LIMIT: {
      // 验证每个每日掉落限制
      for (const [key, value] of Object.entries(params)) {
        if (typeof key !== 'string' || !isValidDailyDropLimit(value)) {
          return false;
        }
      }
      return true;
    }

    case CONSTRAINT_NAMES.WEEKLY_DROP_LIMIT: {
      // 验证每个每周掉落限制
      for (const [key, value] of Object.entries(params)) {
        if (typeof key !== 'string' || !isValidWeeklyDropLimit(value)) {
          return false;
        }
      }
      return true;
    }

    case CONSTRAINT_NAMES.GOAL_ATTRIBUTES: {
      // 目标属性直接是对象，不是键值对
      // 目标级约束，params 直接就是目标属性对象
      // 这里只验证结构，不要求所有字段都存在（允许部分更新）
      if (Array.isArray(params)) {
        return false;
      }
      // 检查已知字段类型（如果存在）
      const attrs = params as Partial<{
        priority: unknown;
        parentId: unknown;
        requiredQuantity: unknown;
        goalType: unknown;
      }>;
      if (attrs.priority !== undefined && typeof attrs.priority !== 'number') {
        return false;
      }
      if (attrs.parentId !== undefined && attrs.parentId !== null && typeof attrs.parentId !== 'number') {
        return false;
      }
      if (attrs.requiredQuantity !== undefined && typeof attrs.requiredQuantity !== 'number') {
        return false;
      }
      if (attrs.goalType !== undefined && typeof attrs.goalType !== 'string') {
        return false;
      }
      return true;
    }

    case CONSTRAINT_NAMES.INVENTORY_RESOURCES: {
      // 验证每个背包资源
      for (const [key, value] of Object.entries(params)) {
        if (typeof key !== 'string' || !isValidInventoryResource(value)) {
          return false;
        }
      }
      return true;
    }

    default:
      return false;
  }
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

  // 验证 params 数据结构是否匹配约束类型
  if (!validateParamsByConstraintName(constraintName, params)) {
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