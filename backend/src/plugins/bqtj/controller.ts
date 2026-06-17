/**
 * 爆枪英雄养成控制器
 * 处理HTTP请求，调用service层业务逻辑
 */

import { Request, Response } from 'express';
import * as bqtjService from './service';
import { success, error, serverError } from '../../utils/response';
import type { UpdateConstraintRequest } from './types';

/**
 * 获取项目下所有养成约束数据
 * @param req Express请求对象，params.projectId为项目ID
 * @param res Express响应对象
 * 返回: {success: true, data: BqtjData}
 */
export async function getAllData(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const projectIdNumber = parseInt(projectId as string);

    if (isNaN(projectIdNumber)) {
      error(res, 'Invalid projectId', 400);
      return;
    }

    const data = await bqtjService.getAllBqtjData(projectIdNumber);
    success(res, data);
  } catch (err: unknown) {
    serverError(res, String(err));
  }
}

/**
 * 更新指定约束的 params 数据
 * @param req Express请求对象，params.projectId为项目ID，params.constraintName为约束名称，body包含新的params
 * @param res Express响应对象
 * 返回: {success: true, data: {success: boolean}}
 */
export async function updateConstraint(req: Request, res: Response) {
  try {
    const { projectId, constraintName } = req.params;
    const projectIdNumber = parseInt(projectId as string);

    if (isNaN(projectIdNumber)) {
      error(res, 'Invalid projectId', 400);
      return;
    }

    if (!constraintName || typeof constraintName !== 'string' || constraintName.trim().length === 0) {
      error(res, 'constraintName is required', 400);
      return;
    }

    const { params } = req.body as UpdateConstraintRequest;

    if (!params || typeof params !== 'object' || params === null) {
      error(res, 'params must be a valid JSON object', 400);
      return;
    }

    const updated = await bqtjService.updateConstraintParams(
      projectIdNumber,
      constraintName,
      params
    );

    if (!updated) {
      error(res, 'Invalid constraintName', 400);
      return;
    }

    success(res, { success: true });
  } catch (err: unknown) {
    serverError(res, String(err));
  }
}