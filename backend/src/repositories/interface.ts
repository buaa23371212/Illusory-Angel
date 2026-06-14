/**
 * 存储层接口定义
 * 定义Repository接口，支持多种存储实现（JSON文件/数据库）
 */

import { Project, Goal, Constraint, OwnerType } from '@prisma/client';

/**
 * 项目Repository接口
 */
export interface IProjectRepository {
  /**
   * 获取所有项目
   */
  findAll(): Promise<Project[]>;

  /**
   * 根据ID查找项目
   */
  findById(id: number): Promise<Project | null>;

  /**
   * 创建项目
   */
  create(data: Omit<Project, 'projectId' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Project>;

  /**
   * 更新项目
   */
  update(id: number, data: Partial<Project>): Promise<Project>;

  /**
   * 删除项目
   */
  delete(id: number): Promise<void>;
}

/**
 * 目标Repository接口
 */
export interface IGoalRepository {
  /**
   * 根据项目ID获取所有目标
   */
  findByProjectId(projectId: number): Promise<Goal[]>;

  /**
   * 根据ID查找目标
   */
  findById(id: number): Promise<Goal | null>;

  /**
   * 创建目标
   */
  create(data: Omit<Goal, 'goalId' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Goal>;

  /**
   * 更新目标
   */
  update(id: number, data: Partial<Goal>): Promise<Goal>;

  /**
   * 切换完成状态
   */
  toggleCompleted(id: number): Promise<Goal>;

  /**
   * 批量移动目标到另一个项目
   */
  batchMove(goalIds: number[], targetProjectId: number): Promise<number>;

  /**
   * 删除目标
   */
  delete(id: number): Promise<void>;
}

/**
 * 约束Repository接口
 */
export interface IConstraintRepository {
  /**
   * 根据所有者获取所有约束
   */
  findByOwner(ownerType: OwnerType, ownerId: number): Promise<Constraint[]>;

  /**
   * 根据所有者类型获取所有约束（不限制ownerId）
   */
  findByOwnerType(ownerType: OwnerType): Promise<Constraint[]>;

  /**
   * 根据ID查找约束
   */
  findById(id: number): Promise<Constraint | null>;

  /**
   * 添加约束
   */
  create(data: Omit<Constraint, 'constraintId' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Constraint>;

  /**
   * 更新约束
   */
  update(id: number, data: Partial<Constraint>): Promise<Constraint>;

  /**
   * 删除约束
   */
  delete(id: number): Promise<void>;
}

/**
 * Repository集合
 */
export interface IRepository {
  project: IProjectRepository;
  goal: IGoalRepository;
  constraint: IConstraintRepository;
}