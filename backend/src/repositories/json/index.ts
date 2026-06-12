/**
 * JSON文件存储入口
 * 聚合所有JSON Repository并初始化
 */

import { IRepository, IProjectRepository, IGoalRepository, IConstraintRepository } from '../interface';
import { ProjectJsonRepository } from './project';
import { GoalJsonRepository } from './goal';
import { ConstraintJsonRepository } from './constraint';
import path from 'path';

/**
 * JSON Repository集合
 */
export class JsonRepository implements IRepository {
  public project: IProjectRepository;
  public goal: IGoalRepository;
  public constraint: IConstraintRepository;

  constructor(dataDir: string) {
    const resolvedDataDir = path.resolve(dataDir);
    this.project = new ProjectJsonRepository(resolvedDataDir);
    this.goal = new GoalJsonRepository(resolvedDataDir);
    this.constraint = new ConstraintJsonRepository(resolvedDataDir);
  }

  /**
   * 初始化所有JSON存储
   */
  async initialize(): Promise<void> {
    await (this.project as ProjectJsonRepository).initialize();
    await (this.goal as GoalJsonRepository).initialize();
    await (this.constraint as ConstraintJsonRepository).initialize();
  }
}