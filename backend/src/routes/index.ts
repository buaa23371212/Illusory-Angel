/**
 * API主路由
 * 汇总所有模块路由
 */

import { Router } from 'express';
import projectRoutes from './projects';
import goalRoutes from './goals';
import constraintRoutes from './constraints';
import alarmRouter from '../plugins/alarm-clock/routes';

const apiRouter = Router();

// 挂载各模块路由
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/', constraintRoutes);
// 闹钟提醒插件路由
apiRouter.use('/', alarmRouter);

export { apiRouter };