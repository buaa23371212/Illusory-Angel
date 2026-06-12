/**
 * 约束路由
 * 定义约束相关API端点
 */

import { Router } from 'express';
import {
  getConstraintsByOwner,
  addConstraint,
  updateConstraint,
  deleteConstraint
} from '../controllers/constraints';

const router = Router();

// 所有者级操作
router.get('/:ownerType/:ownerId/constraints', getConstraintsByOwner);
router.post('/:ownerType/:ownerId/constraints', addConstraint);

// 单个约束操作
router.put('/constraints/:id', updateConstraint);
router.delete('/constraints/:id', deleteConstraint);

export default router;