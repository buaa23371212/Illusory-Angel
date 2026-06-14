/**
 * JSON文件存储 - 约束Repository实现
 */

import { Constraint, OwnerType } from '@prisma/client';
import { IConstraintRepository } from '../interface';
import { BaseJsonRepository } from './base';

/**
 * 约束JSON存储实现
 */
export class ConstraintJsonRepository extends BaseJsonRepository<Constraint> implements IConstraintRepository {
  constructor(dataDir: string) {
    super(dataDir, 'constraints');
  }

  /**
   * 获取约束ID
   */
  protected getId(item: Constraint): number {
    return item.constraintId;
  }

  /**
   * 获取ID字段名
   */
  protected getIdName(): string {
    return 'constraintId';
  }

  /**
   * 根据所有者获取所有约束
   */
  async findByOwner(ownerType: OwnerType, ownerId: number): Promise<Constraint[]> {
    return this.data.filter(
      item => item.ownerType === ownerType && item.ownerId === ownerId && !item.isDeleted
    );
  }

  /**
   * 根据所有者类型获取所有约束（不限制ownerId）
   */
  async findByOwnerType(ownerType: OwnerType): Promise<Constraint[]> {
    return this.data.filter(
      item => item.ownerType === ownerType && !item.isDeleted
    );
  }

  /**
   * 根据ID查找约束
   */
  async findById(id: number): Promise<Constraint | null> {
    return super.findById(id);
  }

  /**
   * 添加约束
   */
  async create(data: Omit<Constraint, 'constraintId' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Constraint> {
    return super.create(data);
  }

  /**
   * 更新约束
   */
  async update(id: number, data: Partial<Constraint>): Promise<Constraint> {
    return super.update(id, data);
  }

  /**
   * 删除约束
   */
  async delete(id: number): Promise<void> {
    return super.delete(id);
  }
}