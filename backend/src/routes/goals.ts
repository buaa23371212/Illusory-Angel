/**
 * 目标路由
 * 定义目标相关API端点
 */

import { Router } from 'express';
import {
  getGoalsByProject,
  getGoalById,
  createGoal,
  updateGoal,
  toggleGoalCompleted,
  batchMoveGoals,
  deleteGoal
} from '../controllers/goals';

const router = Router();

// 项目下的目标操作
router.get('/projects/:projectId/goals', getGoalsByProject);
router.post('/projects/:projectId/goals', createGoal);

// 单个目标操作
router.get('/:id', getGoalById);
router.put('/:id', updateGoal);
router.patch('/:id/toggle-completed', toggleGoalCompleted);
router.delete('/:id', deleteGoal);

// 批量操作
router.post('/batch-move', batchMoveGoals);

export default router;