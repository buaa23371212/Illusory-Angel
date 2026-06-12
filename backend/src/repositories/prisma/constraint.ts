/**
 * Prisma存储 - 约束Repository实现
 * 用于数据库存储（SQLite/MySQL）
 */

import { PrismaClient, Constraint, OwnerType, Prisma } from '@prisma/client';
import { IConstraintRepository } from '../interface';

/**
 * 约束Prisma存储实现
 */
export class ConstraintPrismaRepository implements IConstraintRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 根据所有者获取所有约束
   */
  async findByOwner(ownerType: OwnerType, ownerId: number): Promise<Constraint[]> {
    return this.prisma.constraint.findMany({
      where: { ownerType, ownerId, isDeleted: false }
    });
  }

  /**
   * 根据ID查找约束
   */
  async findById(id: number): Promise<Constraint | null> {
    return this.prisma.constraint.findUnique({
      where: { constraintId: id, isDeleted: false }
    });
  }

  /**
   * 添加约束
   */
  async create(data: Omit<Constraint, 'constraintId' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Constraint> {
    // 使用类型断言将JsonValue转换为Prisma接受的InputJsonValue类型
    // Prisma的InputJsonValue接受null值，需要特殊处理
    const createData = {
      ...data,
      params: data.params as unknown as Prisma.InputJsonValue
    };
    return this.prisma.constraint.create({
      data: createData
    });
  }

  /**
   * 更新约束
   */
  async update(id: number, data: Partial<Constraint>): Promise<Constraint> {
    // 从更新数据中移除constraintId（不允许更新主键）
    const { constraintId, ...updateData } = data;
    // 特殊处理params类型转换
    let processedParams: Prisma.InputJsonValue | undefined;
    if ('params' in updateData) {
      processedParams = updateData.params as unknown as Prisma.InputJsonValue;
    }
    // 构建最终数据对象
    const processedData: Prisma.ConstraintUpdateInput = {
      ...(updateData as Omit<Partial<Constraint>, 'params'>),
      updatedAt: new Date(),
      ...(processedParams !== undefined ? { params: processedParams } : {})
    };
    return this.prisma.constraint.update({
      where: { constraintId: id },
      data: processedData
    });
  }

  /**
   * 删除约束（软删除）
   */
  async delete(id: number): Promise<void> {
    await this.prisma.constraint.update({
      where: { constraintId: id },
      data: {
        isDeleted: true,
        updatedAt: new Date()
      }
    });
  }
}