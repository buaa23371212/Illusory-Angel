/**
 * 约束Controller
 * 实现约束CRUD接口和依赖检查
 */

import { Request, Response } from 'express';
import { OwnerType } from '@prisma/client';
import { getRepository } from '../repositories';
import { success, error, serverError } from '../utils/response';

/**
 * 检查所有者是否存在
 * @param ownerType 所有者类型
 * @param ownerId 所有者ID
 */
async function checkOwnerExists(ownerType: OwnerType, ownerId: number): Promise<boolean> {
  const repo = await getRepository();
  if (ownerType === 'PROJECT') {
    const project = await repo.project.findById(ownerId);
    return !!project;
  } else {
    const goal = await repo.goal.findById(ownerId);
    return !!goal;
  }
}

/**
 * 根据所有者获取所有约束
 * @param req Express请求对象，params.ownerType和params.ownerId
 * @param res Express响应对象
 */
export async function getConstraintsByOwner(req: Request, res: Response) {
  try {
    const { ownerType, ownerId } = req.params;

    if (!ownerType || !['PROJECT', 'GOAL'].includes(ownerType)) {
      error(res, 'Valid ownerType (PROJECT/GOAL) is required', 400);
      return;
    }

    const repo = await getRepository();
    const constraints = await repo.constraint.findByOwner(
      ownerType as OwnerType,
      parseInt(ownerId)
    );

    success(res, constraints);
  } catch (err) {
    serverError(res, String(err));
  }
}

/**
 * 添加约束
 * @param req Express请求对象，body包含ownerType, ownerId, constraintName, params
 * @param res Express响应对象
 */
export async function addConstraint(req: Request, res: Response) {
  try {
    const { ownerType, ownerId, constraintName, params } = req.body;

    if (!ownerType || !['PROJECT', 'GOAL'].includes(ownerType)) {
      error(res, 'Valid ownerType (PROJECT/GOAL) is required', 400);
      return;
    }

    if (typeof ownerId !== 'number') {
      error(res, 'ownerId must be a number', 400);
      return;
    }

    // 检查所有者是否存在
    const ownerExists = await checkOwnerExists(ownerType as OwnerType, ownerId);
    if (!ownerExists) {
      error(res, 'Owner not found', 404);
      return;
    }

    const repo = await getRepository();
    const constraint = await repo.constraint.create({
      ownerType: ownerType as OwnerType,
      ownerId,
      constraintName: constraintName || null,
      params: params || {}
    });

    res.status(201);
    success(res, constraint, 'Constraint created successfully');
  } catch (err) {
    serverError(res, String(err));
  }
}

/**
 * 更新约束
 * @param req Express请求对象，params.id为约束ID，body包含可更新字段
 * @param res Express响应对象
 */
export async function updateConstraint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { constraintName, params } = req.body;
    const constraintId = parseInt(id);

    const repo = await getRepository();
    const existing = await repo.constraint.findById(constraintId);

    if (!existing) {
      error(res, 'Constraint not found', 404);
      return;
    }

    const updateData: Partial<{
      constraintName: string | null;
      params: any;
    }> = {};
    
    if (constraintName !== undefined) {
      updateData.constraintName = constraintName || null;
    }
    
    if (params !== undefined) {
      updateData.params = params;
    }

    const constraint = await repo.constraint.update(constraintId, updateData);
    success(res, constraint);
  } catch (err) {
    serverError(res, String(err));
  }
}

/**
 * 删除约束（软删除）
 * @param req Express请求对象，params.id为约束ID
 * @param res Express响应对象
 */
export async function deleteConstraint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const constraintId = parseInt(id);

    const repo = await getRepository();
    const existing = await repo.constraint.findById(constraintId);

    if (!existing) {
      error(res, 'Constraint not found', 404);
      return;
    }

    await repo.constraint.delete(constraintId);
    success(res, { message: 'Constraint deleted successfully' });
  } catch (err) {
    serverError(res, String(err));
  }
}