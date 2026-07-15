/**
 * 不绑定工具插件 - 类型定义
 * 定义所有约束的参数数据结构
 */

/**
 * 项目材料定义
 * 存储项目中可获取的材料信息
 */
export interface MaterialDefinition {
  /** 材料唯一ID，项目内唯一标识 */
  materialId: string;
  /** 材料名称（用于显示） */
  materialName: string;
  /** 材料图片路径 */
  materialImageURL: string;
  /** 材料描述（可选） */
  description?: string;
}

/**
 * 项目材料定义约束参数
 * key 为材料唯一ID，value 为材料定义
 */
export interface MaterialDefinitionsParams {
  [materialId: string]: MaterialDefinition;
}

/**
 * 每日/每周掉落限制配置
 */
export interface DropLimitConfig {
  /** 资源唯一标识 */
  resourceId: string;
  /** 资源名称（用于显示） */
  resourceName: string;
  /** 掉落限制数量 */
  limit: number;
  /** 当前已获取数量 */
  current: number;
}

/**
 * 每日掉落限制约束参数
 * key 为资源ID，value 为限制配置
 */
export interface DailyDropLimitParams {
  [resourceId: string]: DropLimitConfig;
}

/**
 * 每周掉落限制约束参数
 * key 为资源ID，value 为限制配置
 */
export interface WeeklyDropLimitParams {
  [resourceId: string]: DropLimitConfig;
}

/**
 * 目标属性扩展
 * 存储目标的扩展属性，不属于核心目标表的基础字段
 */
export interface GoalAttributesParams {
  /** 优先级，1-5，1 最高，5 最低，用于排序和展示 */
  priority?: number;
  /** 父目标ID，null 表示无父目标（根目标） */
  parentId?: number | null;
  /** 需要的数量，表示完成此目标需要多少个该物品/资源 */
  requiredQuantity?: number;
  /** 目标类型，如 "equipment_craft"（装备制作）、"resource_collection"（资源获取）等 */
  goalType?: string;
}

/**
 * 背包已有资源
 */
export interface InventoryResource {
  /** 资源唯一标识 */
  resourceId: string;
  /** 资源名称（用于显示） */
  resourceName: string;
  /** 背包中已有的数量 */
  quantity: number;
}

/**
 * 背包已有资源约束参数
 * key 为资源ID，value 为已有数量
 */
export interface InventoryResourcesParams {
  [resourceId: string]: InventoryResource;
}

/**
 * 所有约束参数类型联合
 */
export type BqtjConstraintParams =
  | MaterialDefinitionsParams
  | DailyDropLimitParams
  | WeeklyDropLimitParams
  | GoalAttributesParams
  | InventoryResourcesParams;

/**
 * 约束名称常量定义
 */
export const BqtjConstraintNames = {
  /** 项目材料定义 */
  MATERIAL_DEFINITIONS: 'material_definitions',
  /** 每日掉落限制 */
  DAILY_DROP_LIMIT: 'daily_drop_limit',
  /** 每周掉落限制 */
  WEEKLY_DROP_LIMIT: 'weekly_drop_limit',
  /** 目标属性扩展 */
  GOAL_ATTRIBUTES: 'goal_attributes',
  /** 背包已有资源 */
  INVENTORY_RESOURCES: 'inventory_resources',
} as const;

export type BqtjConstraintNames = typeof BqtjConstraintNames[keyof typeof BqtjConstraintNames];

/**
 * 所有者类型常量定义
 */
export const BqtjOwnerType = {
  /** 项目级约束 */
  PROJECT: 'PROJECT',
  /** 目标级约束 */
  GOAL: 'GOAL',
} as const;

export type BqtjOwnerType = typeof BqtjOwnerType[keyof typeof BqtjOwnerType];

/**
 * 爆枪英雄养成项目类型常量定义
 */
export const BQTJ_PROJECT_CATEGORY = 'bqtj_training' as const;

/**
 * 爆枪英雄养成项目类型类型
 */
export type BqtjProjectCategory = typeof BQTJ_PROJECT_CATEGORY;