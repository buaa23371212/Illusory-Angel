/**
 * 爆枪英雄养成插件入口
 */

import type { Plugin, ApiExtension } from '../../types';
import { registerContentPanelExtension } from '../../';
import { Target } from 'lucide-react';
import BqtjProjectContent from './components/BqtjProjectContent';
import { BQTJ_PROJECT_CATEGORY } from './types';

// 导出类型和API
export * from './types';
export * from './api';

/**
 * 爆枪英雄养成插件
 * 支持掉落限制、材料管理、目标追踪，帮助玩家规划养成进度
 */
import { getAllBqtjData, updateDailyDropLimit, updateWeeklyDropLimit, updateInventoryResources, createGoalWithAttributes, deleteGoal } from './api';

// 定义API扩展
const apiExtensions: ApiExtension[] = [
  { id: 'getAllBqtjData', method: getAllBqtjData },
  { id: 'updateDailyDropLimit', method: updateDailyDropLimit },
  { id: 'updateWeeklyDropLimit', method: updateWeeklyDropLimit },
  { id: 'updateInventoryResources', method: updateInventoryResources },
  { id: 'createGoalWithAttributes', method: createGoalWithAttributes },
  { id: 'deleteGoal', method: deleteGoal },
];

export const bqtjPlugin: Plugin = {
  id: 'bqtj_training',
  name: '爆枪英雄养成',
  description: '爆枪英雄养成项目管理插件，支持掉落限制、材料管理、目标追踪',
  version: '1.0.0',
  apiExtensions,
  initialize: () => {
    // 注册内容面板扩展，显示养成管理内容
    registerContentPanelExtension({
      id: 'bqtj-content',
      label: '养成管理',
      icon: Target,
      component: BqtjProjectContent,
      order: 10,
      matchProjectCategory: BQTJ_PROJECT_CATEGORY,
    });
  },
};

// 默认导出供插件系统加载
export default bqtjPlugin;