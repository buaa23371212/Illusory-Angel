/**
 * JSON文件存储 - 目标Repository实现
 */

import { Goal } from '@prisma/client';
import { IGoalRepository } from '../interface';
import { BaseJsonRepository } from './base';

/**
 * 目标JSON存储实现
 */
export class GoalJsonRepository extends BaseJsonRepository<Goal> implements IGoalRepository {
  constructor(dataDir: string) {
    super(dataDir, 'goals');
  }

  /**
   * 获取目标ID
   */
  protected getId(item: Goal): number {
    return item.goalId;
  }

  /**
   * 获取ID字段名
   */
  protected getIdName(): string {
    return 'goalId';
  }

  /**
   * 根据项目ID获取所有目标
   */
  async findByProjectId(projectId: number): Promise<Goal[]> {
    return this.data.filter(item => item.projectId === projectId && !item.isDeleted);
  }

  /**
   * 根据ID查找目标
   */
  async findById(id: number): Promise<Goal | null> {
    return super.findById(id);
  }

  /**
   * 创建目标
   */
  async create(data: Omit<Goal, 'goalId' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Goal> {
    return super.create(data);
  }

  /**
   * 更新目标
   */
  async update(id: number, data: Partial<Goal>): Promise<Goal> {
    return super.update(id, data);
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
    let movedCount = 0;

    for (const goalId of goalIds) {
      const goal = await this.findById(goalId);
      if (goal && !goal.isDeleted) {
        await this.update(goalId, { projectId: targetProjectId });
        movedCount++;
      }
    }

    return movedCount;
  }

  /**
   * 删除目标
   */
  async delete(id: number): Promise<void> {
    return super.delete(id);
  }
}