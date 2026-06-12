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

// 添加约束
router.post('/constraints', addConstraint);

// 单个约束操作
router.put('/constraints/:id', updateConstraint);
router.delete('/constraints/:id', deleteConstraint);

// 获取所有者的所有约束
router.get('/constraints/:ownerType/:ownerId', getConstraintsByOwner);

export default router;