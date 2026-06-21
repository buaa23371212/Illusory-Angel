/**
 * 统计概览插件
 * 在项目操作菜单添加统计选项，点击后在内容区显示项目统计信息
 */
import type { Plugin } from '../../';
import {
  pluginRegistry,
  registerContentPanelExtension,
  registerProjectActionMenuItem,
} from '../../';
import { StatisticsPanel } from './components/StatisticsPanel';
import { BarChart3 } from 'lucide-react';

// 保留未使用的声明，但不赋值以避免错误
declare let contentPanelChangeCallback: ((panelId: string | null) => void) | null;

/**
 * 插件信息
 */
export const statisticsPlugin: Plugin = {
  id: 'statistics',
  name: '统计概览',
  description: '在项目内容区显示项目统计信息，包括目标完成进度、完成率统计等',
  version: '1.0.0',
  initialize: () => {
    // 注册内容区面板扩展
    registerContentPanelExtension({
      id: 'project-statistics',
      label: '统计信息',
      icon: BarChart3,
      component: StatisticsPanel,
      order: 10,
    });

    // 注册项目操作菜单项，点击后切换到统计面板
    registerProjectActionMenuItem({
      id: 'open-statistics',
      label: '项目统计',
      icon: BarChart3,
      onClick: () => {
        // 这里需要获取App组件中的activeContentPanel状态来切换
        // 由于插件系统是在App外部初始化的，我们通过window来获取切换函数
        // 这个函数会在App组件启动时设置
        if ((window as any).__setActiveContentPanel) {
          (window as any).__setActiveContentPanel('project-statistics');
        }
      },
    });
  },
};

// 导出插件
export default statisticsPlugin;