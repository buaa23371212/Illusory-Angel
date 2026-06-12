/**
 * API主路由
 * 汇总所有模块路由
 */

import { Router } from 'express';
import projectRoutes from './projects';
import goalRoutes from './goals';
import constraintRoutes from './constraints';

const apiRouter = Router();

// 挂载各模块路由
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/', constraintRoutes);

export { apiRouter };