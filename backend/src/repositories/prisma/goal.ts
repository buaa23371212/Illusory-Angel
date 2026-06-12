/**
 * Prisma存储 - 目标Repository实现
 * 用于数据库存储（SQLite/MySQL）
 */

import { PrismaClient, Goal } from '@prisma/client';
import { IGoalRepository } from '../interface';

/**
 * 目标Prisma存储实现
 */
export class GoalPrismaRepository implements IGoalRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 根据项目ID获取所有目标
   */
  async findByProjectId(projectId: number): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      where: { projectId, isDeleted: false },
      orderBy: { priority: 'asc' }
    });
  }

  /**
   * 根据ID查找目标
   */
  async findById(id: number): Promise<Goal | null> {
    return this.prisma.goal.findUnique({
      where: { goalId: id, isDeleted: false }
    });
  }

  /**
   * 创建目标
   */
  async create(data: Omit<Goal, 'goalId' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Goal> {
    return this.prisma.goal.create({
      data
    });
  }

  /**
   * 更新目标
   */
  async update(id: number, data: Partial<Goal>): Promise<Goal> {
    return this.prisma.goal.update({
      where: { goalId: id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  /**
   * 切换完成状态
   */
  async toggleCompleted(id: number): Promise<Goal> {
    const goal = await this.findById(id);
    if (!goal) {
      throw new Error(`Goal with id ${id} not found`);
    }

    return this.update(id, {
      isCompleted: !goal.isCompleted
    });
  }

  /**
   * 批量移动目标到另一个项目
   */
  async batchMove(goalIds: number[], targetProjectId: number): Promise<number> {
    const result = await this.prisma.goal.updateMany({
      where: {
        goalId: { in: goalIds },
        isDeleted: false
      },
      data: {
        projectId: targetProjectId,
        updatedAt: new Date()
      }
    });

    return result.count;
  }

  /**
   * 删除目标（软删除）
   */
  async delete(id: number): Promise<void> {
    await this.prisma.goal.update({
      where: { goalId: id },
      data: {
        isDeleted: true,
        updatedAt: new Date()
      }
    });
  }
}