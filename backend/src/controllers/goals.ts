/**
 * 目标Controller
 * 实现目标CRUD接口和完成状态切换
 */

import { Request, Response } from 'express';
import { getRepository } from '../repositories';
import { success, error, serverError } from '../utils/response';

/**
 * 根据项目ID获取所有目标
 * @param req Express请求对象，params.projectId为项目ID
 * @param res Express响应对象
 */
export async function getGoalsByProject(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const repo = await getRepository();
    const goals = await repo.goal.findByProjectId(parseInt(projectId));
    // 按优先级升序排序（数字越小优先级越高）
    goals.sort((a, b) => a.priority - b.priority);
    success(res, goals);
  } catch (err) {
    serverError(res, String(err));
  }
}

/**
 * 根据ID获取单个目标
 * @param req Express请求对象，params.id为目标ID
 * @param res Express响应对象
 */
export async function getGoalById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const repo = await getRepository();
    const goal = await repo.goal.findById(parseInt(id));

    if (!goal) {
      error(res, 'Goal not found', 404);
      return;
    }

    success(res, goal);
  } catch (err) {
    serverError(res, String(err));
  }
}

/**
 * 创建新目标
 * @param req Express请求对象，body包含projectId, name, description, priority
 * @param res Express响应对象
 */
export async function createGoal(req: Request, res: Response) {
  try {
    const { projectId, name, description, priority = 3 } = req.body;

    if (!projectId || typeof projectId !== 'number') {
      error(res, 'Valid projectId is required', 400);
      return;
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      error(res, 'Name is required', 400);
      return;
    }

    const repo = await getRepository();
    const goal = await repo.goal.create({
      projectId,
      name: name.trim(),
      description: description?.trim() || null,
      priority: Number(priority) || 3,
      isCompleted: false
    });

    res.status(201);
    success(res, goal, 'Goal created successfully');
  } catch (err) {
    serverError(res, String(err));
  }
}

/**
 * 更新目标
 * @param req Express请求对象，params.id为目标ID，body包含可更新字段
 * @param res Express响应对象
 */
export async function updateGoal(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, priority, isCompleted } = req.body;
    const goalId = parseInt(id);

    const repo = await getRepository();
    const existing = await repo.goal.findById(goalId);

    if (!existing) {
      error(res, 'Goal not found', 404);
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (priority !== undefined) updateData.priority = Number(priority);
    if (isCompleted !== undefined) updateData.isCompleted = Boolean(isCompleted);

    const goal = await repo.goal.update(goalId, updateData);
    success(res, goal);
  } catch (err) {
    serverError(res, String(err));
  }
}

/**
 * 切换目标完成状态
 * @param req Express请求对象，params.id为目标ID
 * @param res Express响应对象
 */
export async function toggleGoalCompleted(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const goalId = parseInt(id);

    const repo = await getRepository();
    const goal = await repo.goal.toggleCompleted(goalId);

    success(res, goal);
  } catch (err) {
    serverError(res, String(err));
  }
}

/**
 * 批量移动目标到另一个项目
 * @param req Express请求对象，body包含goalIds和targetProjectId
 * @param res Express响应对象
 */
export async function batchMoveGoals(req: Request, res: Response) {
  try {
    const { goalIds, targetProjectId } = req.body;

    if (!Array.isArray(goalIds) || goalIds.length === 0) {
      error(res, 'goalIds must be a non-empty array', 400);
      return;
    }

    if (!targetProjectId || typeof targetProjectId !== 'number') {
      error(res, 'Valid targetProjectId is required', 400);
      return;
    }

    const repo = await getRepository();
    const movedCount = await repo.goal.batchMove(goalIds, targetProjectId);

    success(res, { movedCount, goalIds, targetProjectId });
  } catch (err) {
    serverError(res, String(err));
  }
}

/**
 * 删除目标（软删除）
 * @param req Express请求对象，params.id为目标ID
 * @param res Express响应对象
 */
export async function deleteGoal(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const goalId = parseInt(id);

    const repo = await getRepository();
    const existing = await repo.goal.findById(goalId);

    if (!existing) {
      error(res, 'Goal not found', 404);
      return;
    }

    await repo.goal.delete(goalId);
    success(res, { message: 'Goal deleted successfully' });
  } catch (err) {
    serverError(res, String(err));
  }
}