/**
 * API主路由
 * 汇总所有模块路由
 */

import { Router } from 'express';
import { getPluginRoutes } from '../plugins/registry';
// 导入插件入口，触发所有插件的自注册逻辑
import '../plugins';

import projectRoutes from './projects';
import goalRoutes from './goals';
import constraintRoutes from './constraints';

const apiRouter = Router();

// 挂载核心模块路由
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/goals', goalRoutes);
apiRouter.use('/', constraintRoutes);

// 挂载所有插件路由（从注册表获取）
const pluginRoutes = getPluginRoutes();
pluginRoutes.forEach(router => {
  apiRouter.use('/', router);
});

export { apiRouter };