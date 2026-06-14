/**
 * 闹钟提醒服务
 * 处理闹钟配置的CRUD和待触发检查逻辑
 */

import { getRepository } from '../../repositories';
import type { Constraint, Goal, Project } from '@prisma/client';
import type { AlarmParams, AlarmConfig, DueAlarm } from './types';
import { isValidTimeFormat, isValidDaysArray } from './types';

/** 约束名称固定为alarm_clock */
const ALARM_CONSTRAINT_NAME = 'alarm_clock';

/**
 * 获取目标的闹钟配置
 * @param goalId 目标ID
 * @returns 闹钟配置，如果不存在返回null
 */
export async function getAlarmConfig(goalId: number): Promise<AlarmConfig | null> {
  const repo = await getRepository();
  
  // 查询目标信息（包含所属项目）
  const goal = await repo.goal.findById(goalId);
  if (!goal) {
    return null;
  }
  
  // 获取项目信息
  const project = await repo.project.findById(goal.projectId);
  if (!project) {
    return null;
  }
  
  // 查询闹钟约束
  const constraint = await findAlarmConstraint(goalId);
  if (!constraint) {
    return null;
  }
  
  // 解析params
  const params = parseAlarmParams(constraint.params);
  if (!params) {
    return null;
  }
  
  return {
    goal_id: goal.goalId,
    goal_name: goal.name,
    project_name: project.name,
    enabled: params.enabled,
    time: params.time,
    days: params.days,
    message: params.message || null,
    last_triggered: params.lastTriggered || null
  };
}

/**
 * 保存闹钟配置（创建或更新）
 * @param goalId 目标ID
 * @param params 闹钟参数
 * @returns 保存后的完整配置，保存失败返回null
 */
export async function saveAlarmConfig(
  goalId: number,
  params: {
    enabled: boolean;
    time: string;
    days: number[];
    message?: string | null;
  }
): Promise<AlarmConfig | null> {
  // 参数验证
  if (!isValidTimeFormat(params.time)) {
    throw new Error('Invalid time format. Expected HH:mm (24-hour format)');
  }
  if (!isValidDaysArray(params.days)) {
    throw new Error('Invalid days array. All days must be integers between 0 and 6');
  }
  
  const repo = await getRepository();
  
  // 验证目标存在
  const goal = await repo.goal.findById(goalId);
  if (!goal) {
    return null;
  }
  
  // 获取项目信息
  const project = await repo.project.findById(goal.projectId);
  if (!project) {
    return null;
  }
  
  // 查找已存在的闹钟约束
  const existingConstraint = await findAlarmConstraint(goalId);
  
  // 构建闹钟参数
  const alarmParams: AlarmParams = {
    enabled: params.enabled,
    time: params.time,
    days: params.days,
    message: params.message || null,
    lastTriggered: existingConstraint
      ? parseAlarmParams(existingConstraint.params)?.lastTriggered || null
      : null
  };
  
  if (existingConstraint) {
    // 更新已存在的约束
    await repo.constraint.update(existingConstraint.constraintId, {
      params: alarmParams
    });
  } else {
    // 创建新约束
    await repo.constraint.create({
      ownerType: 'GOAL',
      ownerId: goalId,
      constraintName: ALARM_CONSTRAINT_NAME,
      params: alarmParams
    });
  }
  
  // 返回完整配置
  return {
    goal_id: goal.goalId,
    goal_name: goal.name,
    project_name: project.name,
    enabled: alarmParams.enabled,
    time: alarmParams.time,
    days: alarmParams.days,
    message: alarmParams.message || null,
    last_triggered: alarmParams.lastTriggered || null
  };
}

/**
 * 删除闹钟配置
 * @param goalId 目标ID
 * @returns 是否删除成功
 */
export async function deleteAlarmConfig(goalId: number): Promise<boolean> {
  const repo = await getRepository();
  
  const constraint = await findAlarmConstraint(goalId);
  if (!constraint) {
    return false;
  }
  
  // 软删除
  await repo.constraint.delete(constraint.constraintId);
  return true;
}

/**
 * 获取当前需要触发的所有闹钟
 * @returns 需要触发的闹钟列表
 */
export async function getDueAlarms(): Promise<DueAlarm[]> {
  const repo = await getRepository();
  const now = new Date();
  const currentDay = now.getDay(); // 0=周日，1=周一...6=周六
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // 获取所有启用的闹钟约束
  const allAlarms = await getAllAlarmConstraints();
  const dueAlarms: DueAlarm[] = [];
  
  for (const alarm of allAlarms) {
    const params = parseAlarmParams(alarm.params);
    if (!params || !params.enabled) {
      continue;
    }
    
    // 检查时间匹配
    if (!params.days.includes(currentDay) || params.time !== currentTime) {
      continue;
    }
    
    // 检查今天是否已经触发过
    if (params.lastTriggered && params.lastTriggered >= todayStart) {
      continue;
    }
    
    // 获取目标和项目信息
    const goal = await repo.goal.findById(alarm.ownerId);
    if (!goal || goal.isDeleted) {
      continue;
    }
    
    const project = await repo.project.findById(goal.projectId);
    if (!project || project.isDeleted) {
      continue;
    }
    
    dueAlarms.push({
      alarm_id: alarm.constraintId,
      goal_id: goal.goalId,
      goal_name: goal.name,
      project_name: project.name,
      message: params.message || null
    });
    
    // 更新上次触发时间
    await updateLastTriggered(alarm.constraintId, params, now.getTime());
  }
  
  return dueAlarms;
}

/**
 * 查找目标的闹钟约束
 * @param goalId 目标ID
 * @returns 约束对象，不存在返回null
 */
async function findAlarmConstraint(goalId: number): Promise<Constraint | null> {
  const repo = await getRepository();
  const constraints = await repo.constraint.findByOwner('GOAL', goalId);
  return constraints.find(c => c.constraintName === ALARM_CONSTRAINT_NAME && !c.isDeleted) || null;
}

/**
 * 获取所有未删除的闹钟约束
 * @returns 所有闹钟约束列表
 */
async function getAllAlarmConstraints(): Promise<Constraint[]> {
  const repo = await getRepository();
  // 由于没有直接查询方法，这里通过ownerType筛选后再过滤
  // 实际上会查询所有GOAL类型的约束，然后筛选名称匹配
  // 对于当前规模数据来说这是可接受的
  const allConstraints = await repo.constraint.findByOwnerType('GOAL');
  return allConstraints.filter(
    (c: Constraint) => c.constraintName === ALARM_CONSTRAINT_NAME && !c.isDeleted
  );
}

/**
 * 解析闹钟参数
 * @param params JSON对象或JSON字符串
 * @returns 解析后的AlarmParams，解析失败返回null
 */
function parseAlarmParams(params: any): AlarmParams | null {
  try {
    let parsed: any;
    if (typeof params === 'string') {
      parsed = JSON.parse(params);
    } else {
      parsed = params;
    }
    
    // 基本验证
    if (
      typeof parsed.enabled !== 'boolean' ||
      typeof parsed.time !== 'string' ||
      !Array.isArray(parsed.days)
    ) {
      return null;
    }
    
    return parsed as AlarmParams;
  } catch {
    return null;
  }
}

/**
 * 更新上次触发时间
 * @param constraintId 约束ID
 * @param currentParams 当前参数
 * @param timestamp 当前时间戳
 */
async function updateLastTriggered(
  constraintId: number,
  currentParams: AlarmParams,
  timestamp: number
): Promise<void> {
  const repo = await getRepository();
  const updatedParams: AlarmParams = {
    ...currentParams,
    lastTriggered: timestamp
  };
  await repo.constraint.update(constraintId, {
    params: updatedParams
  });
}