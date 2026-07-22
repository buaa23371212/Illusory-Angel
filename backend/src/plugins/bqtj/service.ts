/**
 * 爆枪英雄养成服务
 * 处理养成数据的查询和更新逻辑
 */

import { getRepository } from '../../repositories';
import type { Constraint } from '@prisma/client';
import {
  CONSTRAINT_NAMES,
  GoalAttributes,
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
import { createArchiveParser } from './parser';

/**
 * 获取项目下所有养成约束数据
 * @param projectId 项目ID
 * @returns 完整的养成数据，包含每日掉落限制、每周掉落限制和背包已有资源
 */
export async function getAllBqtjData(projectId: number): Promise<BqtjData> {
  const repo = await getRepository();

  // 先获取项目下所有目标，用于后续查询目标级约束
  const projectGoals = await repo.goal.findByProjectId(projectId);
  const goalIds = projectGoals.map(g => g.goalId);

  // 查询项目级约束（ownerType: PROJECT）
  const [dailyConstraint, weeklyConstraint, inventoryConstraint, materialConstraint] = await Promise.all([
    findConstraintByName(projectId, CONSTRAINT_NAMES.DAILY_DROP_LIMIT),
    findConstraintByName(projectId, CONSTRAINT_NAMES.WEEKLY_DROP_LIMIT),
    findConstraintByName(projectId, CONSTRAINT_NAMES.INVENTORY_RESOURCES),
    findConstraintByName(projectId, CONSTRAINT_NAMES.MATERIAL_DEFINITIONS),
  ]);

  // 查询目标级约束（goal_attributes 的 ownerType 为 GOAL）
  const goalAttributes = await findAllGoalAttributes(goalIds);

  // 解析数据
  const dailyDropLimit = parseDailyDropLimit(dailyConstraint);
  const weeklyDropLimit = parseWeeklyDropLimit(weeklyConstraint);
  const inventoryResources = parseInventoryResources(inventoryConstraint);
  const materialDefinitions = parseMaterialDefinitions(materialConstraint);

  return {
    dailyDropLimit,
    weeklyDropLimit,
    inventoryResources,
    materialDefinitions,
    goalAttributes,
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
 * @param ownerId 所有者ID（项目ID或目标ID）
 * @param constraintName 约束名称
 * @param params 新的 params JSON 对象
 * @param ownerType 所有者类型（默认 PROJECT，用于区分项目级和目标级约束）
 * @returns 更新是否成功
 */
export async function updateConstraintParams(
  ownerId: number,
  constraintName: string,
  params: Record<string, unknown>,
  ownerType: 'PROJECT' | 'GOAL' = 'PROJECT'
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
  const existing = await findConstraintByName(ownerId, constraintName, ownerType);

  if (existing) {
    // 更新现有约束
    await repo.constraint.update(existing.constraintId, { params: params as unknown as any });
  } else {
    // 创建新约束
    await repo.constraint.create({
      ownerType,
      ownerId,
      constraintName,
      params: params as unknown as any,
    });
  }

  return true;
}

/**
 * 根据所有者ID和约束名称查找约束
 * @param ownerId 所有者ID
 * @param constraintName 约束名称
 * @param ownerType 所有者类型（默认 PROJECT）
 */
async function findConstraintByName(
  ownerId: number,
  constraintName: string,
  ownerType: 'PROJECT' | 'GOAL' = 'PROJECT'
): Promise<Constraint | null> {
  const repo = await getRepository();
  const constraints = await repo.constraint.findByOwner(ownerType, ownerId);
  return constraints.find(c => c.constraintName === constraintName) || null;
}

/**
 * 解析每日掉落限制约束数据
 */
function parseDailyDropLimit(constraint: Constraint | null): DailyDropLimit[] {
  if (!constraint || !constraint.params) return [];
  const params = constraint.params as unknown as Record<string, DailyDropLimit>;
  return Object.values(params);
}

/**
 * 解析每周掉落限制约束数据
 */
function parseWeeklyDropLimit(constraint: Constraint | null): WeeklyDropLimit[] {
  if (!constraint || !constraint.params) return [];
  const params = constraint.params as unknown as Record<string, WeeklyDropLimit>;
  return Object.values(params);
}

/**
 * 解析背包已有资源约束数据
 */
function parseInventoryResources(constraint: Constraint | null): InventoryResource[] {
  if (!constraint || !constraint.params) return [];
  const params = constraint.params as unknown as Record<string, InventoryResource>;
  return Object.values(params);
}

/**
 * 解析材料定义约束数据
 */
function parseMaterialDefinitions(constraint: Constraint | null): Record<string, MaterialDefinition> {
  if (!constraint || !constraint.params) return {};
  return constraint.params as unknown as Record<string, MaterialDefinition>;
}

/**
 * 获取项目中所有目标的目标属性约束
 * goal_attributes 是目标级约束（ownerType: GOAL），需要收集本项目所有目标的约束
 * @param goalIds 项目下所有目标的 ID 列表
 * @returns 以目标ID为键的 GoalAttributes 映射
 */
async function findAllGoalAttributes(goalIds: number[]): Promise<Record<string, GoalAttributes>> {
  if (goalIds.length === 0) return {};
  const repo = await getRepository();

  // 获取所有 GOAL 类型约束，过滤出 goal_attributes 且属于本项目目标
  const allGoalConstraints = await repo.constraint.findByOwnerType('GOAL');
  const goalAttrConstraints = allGoalConstraints.filter(
    c => c.constraintName === CONSTRAINT_NAMES.GOAL_ATTRIBUTES && goalIds.includes(c.ownerId)
  );

  const result: Record<string, GoalAttributes> = {};
  for (const constraint of goalAttrConstraints) {
    result[String(constraint.ownerId)] = constraint.params as unknown as GoalAttributes;
  }

  return result;
}

/**
 * 解析游戏存档并将结果保存为背包资源约束
 * @param projectId 项目ID
 * @param archiveContent 存档文件内容（Base64编码或原始字符串）
 * @param saveToInventory 是否将解析结果保存为 inventory_resources 约束
 * @returns 解析结果
 */
export async function parseArchiveAndSave(
  projectId: number,
  archiveContent: string,
  saveToInventory: boolean = true
): Promise<{
  success: boolean;
  error?: string;
  parsedResources?: InventoryResource[];
}> {
  try {
    const parser = createArchiveParser();

    // 尝试解码 Base64 内容
    let content: string | Buffer = archiveContent;
    try {
      content = Buffer.from(archiveContent, 'base64');
    } catch {
      // 如果不是 Base64，保持原样作为字符串处理
      content = archiveContent;
    }

    // 调用解析器
    const result = await parser.parse(content);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    // 如果解析成功且需要保存，将结果存储为背包资源约束
    if (saveToInventory && result.inventoryResources && result.inventoryResources.length > 0) {
      // 转换为约束所需的格式（以 resourceId 为键）
      const inventoryParams: Record<string, InventoryResource> = {};
      for (const resource of result.inventoryResources) {
        inventoryParams[resource.resourceId] = resource;
      }

      // 更新或创建 inventory_resources 约束
      await updateConstraintParams(
        projectId,
        CONSTRAINT_NAMES.INVENTORY_RESOURCES,
        inventoryParams,
        'PROJECT'
      );
    }

    return {
      success: true,
      parsedResources: result.inventoryResources,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: `解析存档时发生错误: ${String(err)}`,
    };
  }
}