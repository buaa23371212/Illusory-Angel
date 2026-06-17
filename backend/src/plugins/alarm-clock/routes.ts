/**
 * 闹钟提醒插件路由定义
 */

import { Router } from 'express';
import { registerPlugin, registerPluginRoutes } from '../registry';
import * as controller from './controller';

const alarmRouter = Router();

// GET /api/v1/goals/:goalId/alarm - 获取目标闹钟配置
alarmRouter.get('/goals/:goalId/alarm', controller.getAlarmConfig);

// POST /api/v1/goals/:goalId/alarm - 创建或更新闹钟配置
alarmRouter.post('/goals/:goalId/alarm', controller.saveAlarmConfig);

// DELETE /api/v1/goals/:goalId/alarm - 删除闹钟配置
alarmRouter.delete('/goals/:goalId/alarm', controller.deleteAlarmConfig);

// GET /api/v1/alarm/due - 获取当前待触发的闹钟列表
alarmRouter.get('/alarm/due', controller.getDueAlarms);

// 自注册：注册插件信息和路由
registerPlugin({
  id: 'alarm-clock',
  name: '闹钟提醒',
  description: '为目标设置闹钟提醒，到期自动通知',
  version: '1.0.0',
});

registerPluginRoutes(alarmRouter);

export default alarmRouter;