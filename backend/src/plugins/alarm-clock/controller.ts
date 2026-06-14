/**
 * 闹钟提醒控制器
 * 处理HTTP请求，调用service层业务逻辑
 */

import { Request, Response } from 'express';
import * as alarmService from './service';
import { success, error, serverError } from '../../utils/response';
import type { SaveAlarmRequest } from './types';

/**
 * 获取目标闹钟配置
 * @param req Express请求对象，params.goalId为目标ID
 * @param res Express响应对象
 * 返回: {success: true, data: AlarmConfig | null}
 */
export async function getAlarmConfig(req: Request, res: Response) {
  try {
    const { goalId } = req.params;
    const goalIdNumber = parseInt(goalId as string);
    
    if (isNaN(goalIdNumber)) {
      error(res, 'Invalid goalId', 400);
      return;
    }
    
    const config = await alarmService.getAlarmConfig(goalIdNumber);
    success(res, config);
  } catch (err: unknown) {
    serverError(res, String(err));
  }
}

/**
 * 创建或更新闹钟配置
 * @param req Express请求对象，params.goalId为目标ID，body为闹钟配置
 * @param res Express响应对象
 * 返回: {success: true, data: AlarmConfig}
 */
export async function saveAlarmConfig(req: Request, res: Response) {
  try {
    const { goalId } = req.params;
    const goalIdNumber = parseInt(goalId as string);
    
    if (isNaN(goalIdNumber)) {
      error(res, 'Invalid goalId', 400);
      return;
    }
    
    const { enabled, time, days, message } = req.body as SaveAlarmRequest;
    
    // 基本参数验证
    if (typeof enabled !== 'boolean') {
      error(res, 'enabled must be a boolean', 400);
      return;
    }
    if (typeof time !== 'string' || time.trim().length === 0) {
      error(res, 'time is required and must be a string', 400);
      return;
    }
    if (!Array.isArray(days) || days.length === 0) {
      error(res, 'days must be a non-empty array', 400);
      return;
    }
    
    try {
      const config = await alarmService.saveAlarmConfig(goalIdNumber, {
        enabled,
        time: time.trim(),
        days,
        message
      });
      
      if (!config) {
        error(res, 'Goal not found', 404);
        return;
      }
      
      success(res, config);
    } catch (validationErr: unknown) {
      error(res, String(validationErr), 400);
    }
  } catch (err: unknown) {
    serverError(res, String(err));
  }
}

/**
 * 删除闹钟配置
 * @param req Express请求对象，params.goalId为目标ID
 * @param res Express响应对象
 */
export async function deleteAlarmConfig(req: Request, res: Response) {
  try {
    const { goalId } = req.params;
    const goalIdNumber = parseInt(goalId as string);
    
    if (isNaN(goalIdNumber)) {
      error(res, 'Invalid goalId', 400);
      return;
    }
    
    const deleted = await alarmService.deleteAlarmConfig(goalIdNumber);
    if (!deleted) {
      error(res, 'Alarm configuration not found', 404);
      return;
    }
    
    success(res, { success: true });
  } catch (err: unknown) {
    serverError(res, String(err));
  }
}

/**
 * 获取当前待触发的闹钟列表
 * @param req Express请求对象
 * @param res Express响应对象
 * 返回: {success: true, data: DueAlarm[]}
 */
export async function getDueAlarms(req: Request, res: Response) {
  try {
    const dueAlarms = await alarmService.getDueAlarms();
    success(res, dueAlarms);
  } catch (err: unknown) {
    serverError(res, String(err));
  }
}