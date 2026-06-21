/**
 * 爆枪英雄养成插件类型定义
 */

/**
 * 材料定义
 */
export interface MaterialDefinition {
  materialId: string;
  materialName: string;
  materialImageURL: string;
  description?: string;
}

/**
 * 每日掉落限制配置
 */
export interface DailyDropLimit {
  resourceId: string;
  resourceName: string;
  limit: number;
  current: number;
}

/**
 * 每周掉落限制配置
 */
export interface WeeklyDropLimit {
  resourceId: string;
  resourceName: string;
  limit: number;
  current: number;
}

/**
 * 背包已有资源配置
 */
export interface InventoryResource {
  resourceId: string;
  resourceName: string;
  quantity: number;
}

/**
 * 目标属性扩展配置
 */
export interface GoalAttributes {
  priority: number;
  parentId: number | null;
  requiredQuantity: number;
  goalType: string;
}

/**
 * 完整的养成数据响应
 */
export interface BqtjData {
  dailyDropLimit: DailyDropLimit[];
  weeklyDropLimit: WeeklyDropLimit[];
  inventoryResources: InventoryResource[];
  materialDefinitions: Record<string, MaterialDefinition>;
  goalAttributes: Record<string, GoalAttributes>;
}

/**
 * 更新约束请求体
 */
export interface UpdateConstraintRequest {
  params: Record<string, unknown>;
}

/**
 * 约束名称常量定义
 */
export const CONSTRAINT_NAMES = {
  MATERIAL_DEFINITIONS: 'material_definitions',
  DAILY_DROP_LIMIT: 'daily_drop_limit',
  WEEKLY_DROP_LIMIT: 'weekly_drop_limit',
  GOAL_ATTRIBUTES: 'goal_attributes',
  INVENTORY_RESOURCES: 'inventory_resources',
} as const;

/**
 * 验证每日掉落限制对象是否有效
 */
export function isValidDailyDropLimit(obj: unknown): obj is DailyDropLimit {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as DailyDropLimit;
  return typeof o.resourceId === 'string' &&
    typeof o.resourceName === 'string' &&
    typeof o.limit === 'number' &&
    typeof o.current === 'number';
}

/**
 * 验证每周掉落限制对象是否有效
 */
export function isValidWeeklyDropLimit(obj: unknown): obj is WeeklyDropLimit {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as WeeklyDropLimit;
  return typeof o.resourceId === 'string' &&
    typeof o.resourceName === 'string' &&
    typeof o.limit === 'number' &&
    typeof o.current === 'number';
}

/**
 * 验证背包资源对象是否有效
 */
export function isValidInventoryResource(obj: unknown): obj is InventoryResource {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as InventoryResource;
  return typeof o.resourceId === 'string' &&
    typeof o.resourceName === 'string' &&
    typeof o.quantity === 'number';
}

/**
 * 验证目标属性对象是否有效
 */
export function isValidGoalAttributes(obj: unknown): obj is GoalAttributes {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as GoalAttributes;
  return typeof o.priority === 'number' &&
    (o.parentId === null || typeof o.parentId === 'number') &&
    typeof o.requiredQuantity === 'number' &&
    typeof o.goalType === 'string';
}

/**
 * 验证材料定义对象是否有效
 */
export function isValidMaterialDefinition(obj: unknown): obj is MaterialDefinition {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as MaterialDefinition;
  return typeof o.materialId === 'string' &&
    typeof o.materialName === 'string' &&
    typeof o.materialImageURL === 'string' &&
    (o.description === undefined || typeof o.description === 'string');
}