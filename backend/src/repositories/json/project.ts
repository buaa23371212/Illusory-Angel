/**
 * JSON文件存储 - 项目Repository实现
 */

import { Project } from '@prisma/client';
import { IProjectRepository } from '../interface';
import { BaseJsonRepository } from './base';

/**
 * 项目JSON存储实现
 */
export class ProjectJsonRepository extends BaseJsonRepository<Project> implements IProjectRepository {
  constructor(dataDir: string) {
    super(dataDir, 'projects');
  }

  /**
   * 获取项目ID
   */
  protected getId(item: Project): number {
    return item.projectId;
  }

  /**
   * 获取ID字段名
   */
  protected getIdName(): string {
    return 'projectId';
  }

  /**
   * 获取所有项目
   */
  async findAll(): Promise<Project[]> {
    return this.data.filter(item => !item.isDeleted);
  }

  /**
   * 根据ID查找项目
   */
  async findById(id: number): Promise<Project | null> {
    return super.findById(id);
  }

  /**
   * 创建项目
   */
  async create(data: Omit<Project, 'projectId' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Project> {
    return super.create(data);
  }

  /**
   * 更新项目
   */
  async update(id: number, data: Partial<Project>): Promise<Project> {
    return super.update(id, data);
  }

  /**
   * 删除项目
   */
  async delete(id: number): Promise<void> {
    return super.delete(id);
  }
}