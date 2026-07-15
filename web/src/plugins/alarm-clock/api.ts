/**
 * 闹钟提醒插件 - API调用封装
 * 遵循插件化设计，API定义随插件存放
 */

import type { AlarmConfig, SaveAlarmRequest, DueAlarm } from './types';
import { apiClient } from '@/api/client';

/**
 * 获取目标的闹钟配置
 * @param goalId 目标ID
 */
export async function getAlarmConfig(goalId: number): Promise<AlarmConfig | null> {
  const response = await apiClient.client.get<{ success: boolean; data: AlarmConfig | null }>(`/goals/${goalId}/alarm`);
  return response.data.data;
}

/**
 * 保存目标的闹钟配置
 * @param goalId 目标ID
 * @param data 闹钟配置数据
 */
export async function saveAlarmConfig(goalId: number, data: SaveAlarmRequest): Promise<AlarmConfig> {
  const response = await apiClient.client.post<{ success: boolean; data: AlarmConfig }>(`/goals/${goalId}/alarm`, data);
  return response.data.data;
}

/**
 * 删除目标的闹钟配置
 * @param goalId 目标ID
 */
export async function deleteAlarmConfig(goalId: number): Promise<{ success: boolean }> {
  const response = await apiClient.client.delete<{ success: boolean; data: { success: boolean } }>(`/goals/${goalId}/alarm`);
  return response.data.data;
}

/**
 * 获取当前待触发的闹钟列表
 * 由前端轮询调用，检查是否有需要触发的闹钟
 */
export async function getDueAlarms(): Promise<DueAlarm[]> {
  const response = await apiClient.client.get<{ success: boolean; data: DueAlarm[] }>(`/alarm/due`);
  return response.data.data;
}