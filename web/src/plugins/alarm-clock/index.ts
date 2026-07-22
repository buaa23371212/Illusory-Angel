/**
 * 闹钟提醒插件
 * 为目标设置闹钟提醒，定时通知用户
 */
import type { Plugin } from '../';
import { pluginRegistry } from '../';
import { AlarmGoalBadge } from './components/AlarmGoalBadge';
import GlobalAlarmPolling from './components/GlobalAlarmPolling';
import { registerGoalActionMenuItem } from '../registry';
import { Settings } from 'lucide-react';

// 导出类型和API
export * from './types';
export * from './api';

/**
 * 闹钟提醒插件
 * 为目标设置闹钟提醒，到点自动弹出通知，不错过重要事项
 */
import { getAlarmConfig, saveAlarmConfig, deleteAlarmConfig, getDueAlarms } from './api';
import type { ApiExtension } from '../types';

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
    // 注册目标卡片标签，显示闹钟提醒指示器
    pluginRegistry.registerGoalCardBadge({
      id: 'alarm-goal-badge',
      component: AlarmGoalBadge,
    });

    // 注册目标操作菜单项，提供闹钟设置入口
    // 使用简单方式：label + icon + onClick，不需要自定义组件
    registerGoalActionMenuItem({
      id: 'alarm-settings',
      label: '闹钟设置',
      icon: Settings,
      separator: true,
    });

    // 注册全局组件用于轮询检查闹钟
    pluginRegistry.registerGlobalComponent({
      id: 'alarm-polling',
      component: GlobalAlarmPolling,
    });
  },
};

// 导入时自动注册插件
pluginRegistry.registerPlugin(alarmClockPlugin);

// 导出插件
export default alarmClockPlugin;