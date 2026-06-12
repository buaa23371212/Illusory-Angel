/**
 * Prisma存储 - 项目Repository实现
 * 用于数据库存储（SQLite/MySQL）
 */

import { PrismaClient, Project } from '@prisma/client';
import { IProjectRepository } from '../interface';

/**
 * 项目Prisma存储实现
 */
export class ProjectPrismaRepository implements IProjectRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 获取所有项目
   */
  async findAll(): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { isDeleted: false }
    });
  }

  /**
   * 根据ID查找项目
   */
  async findById(id: number): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { projectId: id, isDeleted: false }
    });
  }

  /**
   * 创建项目
   */
  async create(data: Omit<Project, 'projectId' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Project> {
    return this.prisma.project.create({
      data
    });
  }

  /**
   * 更新项目
   */
  async update(id: number, data: Partial<Project>): Promise<Project> {
    return this.prisma.project.update({
      where: { projectId: id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  /**
   * 删除项目（软删除）
   */
  async delete(id: number): Promise<void> {
    await this.prisma.project.update({
      where: { projectId: id },
      data: {
        isDeleted: true,
        updatedAt: new Date()
      }
    });
  }
}