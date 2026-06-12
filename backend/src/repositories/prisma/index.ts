/**
 * Prisma存储入口
 * 聚合所有Prisma Repository
 */

import { PrismaClient } from '@prisma/client';
import { IRepository, IProjectRepository, IGoalRepository, IConstraintRepository } from '../interface';
import { ProjectPrismaRepository } from './project';
import { GoalPrismaRepository } from './goal';
import { ConstraintPrismaRepository } from './constraint';
import prisma from '../../lib/prisma';

/**
 * Prisma Repository集合
 */
export class PrismaRepository implements IRepository {
  public project: IProjectRepository;
  public goal: IGoalRepository;
  public constraint: IConstraintRepository;

  constructor(prismaClient: PrismaClient = prisma) {
    this.project = new ProjectPrismaRepository(prismaClient);
    this.goal = new GoalPrismaRepository(prismaClient);
    this.constraint = new ConstraintPrismaRepository(prismaClient);
  }

  /**
   * 初始化（Prisma不需要额外初始化）
   */
  async initialize(): Promise<void> {
    // Prisma已经初始化好了
  }
}