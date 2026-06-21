/**
 * bqtj插件API接口封装
 */

import axios from 'axios';
import type {
  MaterialDefinitionsParams,
  DailyDropLimitParams,
  WeeklyDropLimitParams,
  GoalAttributesParams,
  InventoryResourcesParams,
} from '../types';
import { BqtjConstraintNames, BqtjOwnerType } from '../types';

/**
 * 获取项目下所有bqtj数据响应结构
 */
export interface BqtjAllDataResponse {
  materialDefinitions: MaterialDefinitionsParams;
  dailyDropLimit: Array<{
    resourceId: string;
    resourceName: string;
    limit: number;
    current: number;
  }>;
  weeklyDropLimit: Array<{
    resourceId: string;
    resourceName: string;
    limit: number;
    current: number;
  }>;
  inventoryResources: Array<{
    resourceId: string;
    resourceName: string;
    quantity: number;
  }>;
}

/**
 * 更新约束参数请求结构
 */
export interface UpdateConstraintRequest {
  params: MaterialDefinitionsParams | DailyDropLimitParams | WeeklyDropLimitParams | GoalAttributesParams | InventoryResourcesParams;
}

/**
 * API基础URL
 */
const API_BASE = '/api/v1';

/**
 * 获取项目下所有养成约束数据
 * @param projectId 项目ID
 */
export async function getAllBqtjData(
  projectId: number
): Promise<BqtjAllDataResponse> {
  const response = await axios.get(
    `${API_BASE}/projects/${projectId}/plugins/bqtj`
  );

  if (!response.data.success) {
    throw new Error(response.data.error || '获取养成数据失败');
  }

  return response.data.data;
}

/**
 * 更新指定约束的参数数据
 * @param projectId 项目ID
 * @param constraintName 约束名称
 * @param params 参数数据
 */
export async function updateConstraintParams(
  projectId: number,
  constraintName: BqtjConstraintNames,
  params: UpdateConstraintRequest['params']
): Promise<void> {
  const response = await axios.post(
    `${API_BASE}/projects/${projectId}/plugins/bqtj/constraint/${constraintName}`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.error || '更新约束数据失败');
  }
}

/**
 * 创建新目标（包含goal_attributes约束）
 * @param projectId 项目ID
 * @param name 目标名称
 * @param parentId 父目标ID
 * @param requiredQuantity 需要数量
 * @param goalType 目标类型
 * @param priority 优先级
 */
export async function createGoalWithAttributes(
  projectId: number,
  name: string,
  parentId: number | null,
  requiredQuantity: number,
  goalType: 'equipment_craft' | 'resource_collection',
  priority: number
): Promise<{ goal_id: number }> {
  // 1. 创建目标
  const createResponse = await axios.post(`${API_BASE}/goals`, {
    project_id: projectId,
    name,
  });

  if (!createResponse.data.success) {
    throw new Error(createResponse.data.error || '创建目标失败');
  }

  const goalId = createResponse.data.data.goal_id || createResponse.data.data.goalId;

  // 2. 创建goal_attributes约束
  const attributesParams: GoalAttributesParams = {
    priority,
    parentId,
    requiredQuantity,
    goalType,
  };

  await axios.post(`${API_BASE}/constraints`, {
    ownerType: BqtjOwnerType.GOAL,
    ownerId: goalId,
    constraintName: BqtjConstraintNames.GOAL_ATTRIBUTES,
    params: attributesParams,
  });

  return { goal_id: goalId };
}

/**
 * 更新目标goal_attributes属性
 * @param projectId 项目ID
 * @param _goalId 目标ID（保留参数位置，未来可能使用）
 * @param attributes 属性参数
 */
export async function updateGoalAttributes(
  projectId: number,
  _goalId: number,
  attributes: GoalAttributesParams
): Promise<void> {
  await updateConstraintParams(projectId, BqtjConstraintNames.GOAL_ATTRIBUTES, attributes);
}

/**
 * 删除目标
 * @param goalId 目标ID
 */
export async function deleteGoal(goalId: number): Promise<void> {
  const response = await axios.delete(`${API_BASE}/goals/${goalId}`);

  if (!response.data.success) {
    throw new Error(response.data.error || '删除目标失败');
  }
}

/**
 * 更新背包资源
 * @param projectId 项目ID
 * @param params 背包资源参数
 */
export async function updateInventoryResources(
  projectId: number,
  params: InventoryResourcesParams
): Promise<void> {
  await updateConstraintParams(projectId, BqtjConstraintNames.INVENTORY_RESOURCES, params);
}

/**
 * 更新每日掉落限制
 * @param projectId 项目ID
 * @param params 每日掉落限制参数
 */
export async function updateDailyDropLimit(
  projectId: number,
  params: DailyDropLimitParams
): Promise<void> {
  await updateConstraintParams(projectId, BqtjConstraintNames.DAILY_DROP_LIMIT, params);
}

/**
 * 更新每周掉落限制
 * @param projectId 项目ID
 * @param params 每周掉落限制参数
 */
export async function updateWeeklyDropLimit(
  projectId: number,
  params: WeeklyDropLimitParams
): Promise<void> {
  await updateConstraintParams(projectId, BqtjConstraintNames.WEEKLY_DROP_LIMIT, params);
}