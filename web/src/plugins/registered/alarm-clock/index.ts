/**
 * 闹钟提醒插件
 * 为目标设置闹钟提醒，定时通知用户
 */
import type { Plugin } from '../../';
import { pluginRegistry } from '../../';
import AlarmGoalCard from './components/AlarmGoalCard';
import GlobalAlarmPolling from './components/GlobalAlarmPolling';

// 导出类型和API
export * from './types';
export * from './api';

/**
 * 闹钟提醒插件
 * 为目标设置闹钟提醒，到点自动弹出通知，不错过重要事项
 */
import { getAlarmConfig, saveAlarmConfig, deleteAlarmConfig, getDueAlarms } from './api';
import type { ApiExtension } from '../../types';

// 定义API扩展
const apiExtensions: ApiExtension[] = [
  { id: 'getAlarmConfig', method: getAlarmConfig },
  { id: 'saveAlarmConfig', method: saveAlarmConfig },
  { id: 'deleteAlarmConfig', method: deleteAlarmConfig },
  { id: 'getDueAlarms', method: getDueAlarms },
];

export const alarmClockPlugin: Plugin = {
  id: 'alarm-clock',
  name: '闹钟提醒',
  description: '为目标设置闹钟提醒，到点自动弹出通知，不错过重要事项',
  version: '1.0.0',
  apiExtensions,
  initialize: () => {
    // 注册自定义目标卡片渲染器，显示闹钟指示器
    pluginRegistry.registerGoalCardRenderer({
      id: 'alarm-goal-card',
      name: '带闹钟指示器的目标卡片',
      component: AlarmGoalCard,
    });

    // 注册全局组件用于轮询检查闹钟
    pluginRegistry.registerGlobalComponent({
      id: 'alarm-polling',
      component: GlobalAlarmPolling,
    });
  },
};

// 导出插件
export default alarmClockPlugin;