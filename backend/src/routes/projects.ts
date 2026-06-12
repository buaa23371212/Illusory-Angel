/**
 * 项目路由
 * 定义项目相关API端点
 */

import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectConstraints
} from '../controllers/projects';

const router = Router();

// 项目CRUD
router.get('/', getProjects);
router.post('/', createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.get('/:projectId/constraints', getProjectConstraints);

export default router;