/**
 * 爆枪英雄养成插件路由定义
 */

import { Router } from 'express';
import { registerPlugin, registerPluginRoutes } from '../registry';
import * as controller from './controller';

const bqtjRouter = Router();

// GET /api/v1/projects/:projectId/plugins/bqtj - 获取项目下所有养成约束数据
bqtjRouter.get('/projects/:projectId/plugins/bqtj', controller.getAllData);

// POST /api/v1/projects/:projectId/plugins/bqtj/constraint/:constraintName - 更新指定约束的 params 数据
bqtjRouter.post('/projects/:projectId/plugins/bqtj/constraint/:constraintName', controller.updateConstraint);

// 自注册：注册插件信息和路由
registerPlugin({
  id: 'bqtj',
  name: '爆枪英雄养成',
  description: '爆枪英雄养成计划插件，管理资源掉落限制和背包资源',
  version: '1.0.0',
});

// 注册路由到主应用
registerPluginRoutes(bqtjRouter);

export default bqtjRouter;