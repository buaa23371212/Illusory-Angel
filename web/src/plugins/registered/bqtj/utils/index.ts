/**
 * 树形结构节点数据接口
 */

import type { Goal } from '../../../../api/client';
import type {
  GoalAttributesParams,
  DropLimitConfig,
  InventoryResource,
  MaterialDefinition,
} from '../types';
import type { BqtjAllDataResponse } from '../api';
export interface TreeNode<T> {
  /** 节点ID */
  id: number;
  /** 节点数据 */
  data: T;
  /** 子节点ID列表 */
  children: number[];
  /** 父节点ID，null表示根节点 */
  parentId: number | null;
  /** 是否折叠 */
  collapsed: boolean;
  /** 额外元数据（如 goal_attributes 中的字段） */
  meta?: Record<string, unknown>;
}

/**
 * 树形结构数据接口
 */
export interface TreeData<T> {
  /** 所有节点映射表 */
  nodes: Map<number, TreeNode<T>>;
  /** 根节点ID列表 */
  rootIds: number[];
}

/**
 * 树形结构管理器
 * 维护目标父子关系，支持添加子节点和父节点
 */
export class TreeManager<T> {
  private treeData: TreeData<T>;

  /**
   * 构造函数
   * @param initialData 初始数据，如果为空则创建空树
   */
  constructor(initialData?: Array<{ id: number; data: T; parentId: number | null }>) {
    this.treeData = {
      nodes: new Map(),
      rootIds: [],
    };

    if (initialData) {
      initialData.forEach(item => {
        this.addNode(item.id, item.data, item.parentId);
      });
    }
  }

  /**
   * 添加节点
   * @param id 节点ID
   * @param data 节点数据
   * @param parentId 父节点ID，null表示根节点
   */
  public addNode(id: number, data: T, parentId: number | null): void {
    const node: TreeNode<T> = {
      id,
      data,
      children: [],
      parentId,
      collapsed: false,
    };

    this.treeData.nodes.set(id, node);

    if (parentId === null) {
      if (!this.treeData.rootIds.includes(id)) {
        this.treeData.rootIds.push(id);
      }
    } else {
      const parent = this.treeData.nodes.get(parentId);
      if (parent && !parent.children.includes(id)) {
        parent.children.push(id);
      }
    }
  }

  /**
   * 为指定节点添加子节点
   * @param parentId 父节点ID
   * @param childId 子节点ID
   * @param data 子节点数据
   */
  public addChildNode(parentId: number, childId: number, data: T): void {
    this.addNode(childId, data, parentId);
  }

  /**
   * 为指定节点添加父节点（将当前节点变为新父节点的子节点）
   * 根节点不能添加父节点
   * @param nodeId 当前节点ID
   * @param newParentId 新父节点ID
   */
  public addParentNode(nodeId: number, newParentId: number): void {
    const node = this.treeData.nodes.get(nodeId);
    if (!node) {
      throw new Error(`节点 ${nodeId} 不存在`);
    }

    if (node.parentId === null) {
      throw new Error('根节点不能添加父节点');
    }

    const newParent = this.treeData.nodes.get(newParentId);
    if (!newParent) {
      throw new Error(`父节点 ${newParentId} 不存在`);
    }

    // 如果当前节点已有父节点，先从原父节点移除
    if (node.parentId !== null) {
      const oldParent = this.treeData.nodes.get(node.parentId);
      if (oldParent) {
        oldParent.children = oldParent.children.filter(id => id !== nodeId);
      }
    }

    // 从根列表中移除（如果之前是根节点）
    this.treeData.rootIds = this.treeData.rootIds.filter(id => id !== nodeId);

    // 更新当前节点的父节点
    node.parentId = newParentId;

    // 添加到新父节点的子列表
    if (!newParent.children.includes(nodeId)) {
      newParent.children.push(nodeId);
    }
  }

  /**
   * 将节点提升为根节点（移除其父节点关系）
   * @param nodeId 节点ID
   */
  public makeRoot(nodeId: number): void {
    const node = this.treeData.nodes.get(nodeId);
    if (!node) {
      return;
    }

    // 如果已经是根节点，不需要操作
    if (node.parentId === null) {
      return;
    }

    // 从原父节点移除
    const oldParent = this.treeData.nodes.get(node.parentId);
    if (oldParent) {
      oldParent.children = oldParent.children.filter(id => id !== nodeId);
    }

    // 添加到根列表
    if (!this.treeData.rootIds.includes(nodeId)) {
      this.treeData.rootIds.push(nodeId);
    }

    // 更新父节点为null
    node.parentId = null;
  }

  /**
   * 删除节点及其所有子节点
   * @param nodeId 节点ID
   */
  public deleteNode(nodeId: number): void {
    const node = this.treeData.nodes.get(nodeId);
    if (!node) {
      return;
    }

    // 递归删除所有子节点
    node.children.forEach(childId => {
      this.deleteNode(childId);
    });

    // 从父节点移除
    if (node.parentId !== null) {
      const parent = this.treeData.nodes.get(node.parentId);
      if (parent) {
        parent.children = parent.children.filter(id => id !== nodeId);
      }
    }

    // 从根列表移除
    this.treeData.rootIds = this.treeData.rootIds.filter(id => id !== nodeId);

    // 从映射表移除
    this.treeData.nodes.delete(nodeId);
  }

  /**
   * 获取节点
   * @param id 节点ID
   */
  public getNode(id: number): TreeNode<T> | undefined {
    return this.treeData.nodes.get(id);
  }

  /**
   * 获取所有根节点
   */
  public getRootIds(): number[] {
    return [...this.treeData.rootIds];
  }

  /**
   * 获取节点的所有子节点ID
   * @param id 节点ID
   */
  public getChildren(id: number): number[] {
    const node = this.treeData.nodes.get(id);
    return node ? [...node.children] : [];
  }

  /**
   * 获取节点深度（用于计算缩进）
   * @param id 节点ID
   */
  public getDepth(id: number): number {
    let depth = 0;
    let currentId: number | null = id;

    while (currentId !== null) {
      const node = this.treeData.nodes.get(currentId);
      if (!node) {
        break;
      }
      currentId = node.parentId;
      if (currentId !== null) {
        depth++;
      }
    }

    return depth;
  }

  /**
   * 切换折叠状态
   * @param id 节点ID
   */
  public toggleCollapse(id: number): void {
    const node = this.treeData.nodes.get(id);
    if (node) {
      node.collapsed = !node.collapsed;
    }
  }

  /**
   * 获取扁平化节点列表（按深度优先遍历）
   * 用于渲染树形列表
   */
  public flatten(): Array<{ node: TreeNode<T>; depth: number }> {
    const result: Array<{ node: TreeNode<T>; depth: number }> = [];

    const traverse = (nodeId: number, depth: number) => {
      const node = this.treeData.nodes.get(nodeId);
      if (!node) {
        return;
      }

      result.push({ node, depth });

      if (!node.collapsed) {
        node.children.forEach(childId => {
          traverse(childId, depth + 1);
        });
      }
    };

    this.treeData.rootIds.forEach(rootId => {
      traverse(rootId, 0);
    });

    return result;
  }

  /**
   * 获取当前树的数据
   */
  public getTreeData(): TreeData<T> {
    return { ...this.treeData, nodes: new Map(this.treeData.nodes) };
  }

  /**
   * 获取所有节点
   */
  public getAllNodes(): Map<number, TreeNode<T>> {
    return new Map(this.treeData.nodes);
  }

  /**
   * 构建从后端目标列表和goal_attributes约束生成树形数据
   * @param goals 目标列表
   * @param goalAttributes goal_attributes约束映射表
   */
  static buildFromGoals<G>(
    goals: Array<{ goal_id: number; name: string }>,
    goalAttributes: Map<number, { parentId?: number | null; requiredQuantity?: number; priority?: number; goalType?: string }>
  ): TreeManager<G> {
    const manager = new TreeManager<G>();

    // 第一遍：创建所有节点，根据 parentId 是否为 null 决定根节点归属
    for (const goal of goals) {
      const attrs = goalAttributes.get(goal.goal_id);
      const parentId = attrs?.parentId ?? null;
      const node: TreeNode<G> = {
        id: goal.goal_id,
        data: goal as unknown as G,
        children: [],
        parentId,
        collapsed: false,
        meta: {
          requiredQuantity: attrs?.requiredQuantity,
          priority: attrs?.priority,
          goalType: attrs?.goalType,
        },
      };
      manager.treeData.nodes.set(goal.goal_id, node);
      if (parentId === null) {
        manager.treeData.rootIds.push(goal.goal_id);
      }
    }

    // 第二遍：建立父子链接（此时所有节点均已就绪，无顺序依赖）
    for (const node of manager.treeData.nodes.values()) {
      if (node.parentId === null) continue;
      const parent = manager.treeData.nodes.get(node.parentId);
      if (parent) {
        parent.children.push(node.id);
      } else {
        // 父节点不存在（数据异常），降级为根节点
        manager.treeData.rootIds.push(node.id);
        console.warn("[TreeManager] 节点:", node, "没有父节点，已降级为根节点");
      }
    }
    
    return manager;
  }
}

/**
 * 进度计算工具函数
 * 根据背包资源和掉落限制计算目标实际可获得数量
 */
export interface ProgressCalculationParams {
  /** 目标需要的数量 */
  requiredQuantity: number;
  /** 背包中已有的数量 */
  inventoryQuantity: number;
  /** 当前周期已掉落数量 */
  currentDropQuantity: number;
}

/**
 * 计算目标进度
 * @param params 进度计算参数
 * @returns 进度百分比（0-100）
 */
export function calculateProgress(params: ProgressCalculationParams): number {
  const { requiredQuantity, inventoryQuantity, currentDropQuantity } = params;
  const total = inventoryQuantity + currentDropQuantity;
  const percentage = (total / requiredQuantity) * 100;
  return Math.min(percentage, 100);
}

/**
 * 获取实际已获得的总量
 * @param params 进度计算参数
 * @returns 已获得总量
 */
export function getTotalAcquired(params: ProgressCalculationParams): number {
  return params.inventoryQuantity + params.currentDropQuantity;
}

/**
 * 将对象的 snake_case 键递归转换为 camelCase
 * 后端 API 的 convertCamelToSnake 会将所有嵌套键转为下划线格式，
 * 前端接收后需要还原以便和 TypeScript 类型匹配
 */
function keysToCamel<T>(obj: unknown): T {
  if (obj === null || typeof obj !== 'object') return obj as T;
  if (Array.isArray(obj)) return obj.map(keysToCamel) as T;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = keysToCamel(value);
  }
  return result as T;
}

/**
 * 爆枪英雄养成数据管理器
 * 统一管理目标和5种约束数据（material_definitions, daily_drop_limit,
 * weekly_drop_limit, goal_attributes, inventory_resources）
 * 从后端约束列表构建，提供类型化的数据访问和树形构建能力
 */
export class BqtjDataManager {
  /** 目标属性映射表（goal_id → 属性） */
  readonly goalAttributes: Map<number, GoalAttributesParams>;

  /** 材料定义映射表（materialId → 定义） */
  readonly materialDefinitions: Map<string, MaterialDefinition>;

  /** 每日掉落限制列表 */
  readonly dailyDropLimit: DropLimitConfig[];

  /** 每周掉落限制列表 */
  readonly weeklyDropLimit: DropLimitConfig[];

  /** 背包资源映射表（resourceId → 资源） */
  readonly inventoryResources: Map<string, InventoryResource>;

  constructor(data: BqtjAllDataResponse) {
    this.goalAttributes = new Map();
    this.materialDefinitions = new Map();
    this.dailyDropLimit = data.dailyDropLimit ?? [];
    this.weeklyDropLimit = data.weeklyDropLimit ?? [];
    this.inventoryResources = new Map();

    // 材料定义映射
    if (data.materialDefinitions) {
      for (const [key, value] of Object.entries(data.materialDefinitions)) {
        this.materialDefinitions.set(key, value);
      }
    }

    // 目标属性：后端响应中内层键已转为 snake_case（如 parentId → parent_id），
    // 需要转换为 camelCase 以匹配 TypeScript 类型
    if (data.goalAttributes) {
      for (const [key, value] of Object.entries(data.goalAttributes)) {
        this.goalAttributes.set(Number(key), keysToCamel(value));
      }
    }

    // 背包资源：数组转换为 Map，便于按 resourceId 查找
    if (data.inventoryResources) {
      for (const res of data.inventoryResources) {
        this.inventoryResources.set(res.resourceId, res);
      }
    }
  }

  /**
   * 构建目标树
   * @param goals 目标列表
   */
  buildGoalTree(goals: Goal[]): TreeManager<Goal> {
    return TreeManager.buildFromGoals<Goal>(goals, this.goalAttributes);
  }
}