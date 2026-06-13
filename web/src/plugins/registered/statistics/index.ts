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
import { usePluginContext } from '../../../plugins/PluginContext';

// 存储内容面板切换回调，方便从项目操作菜单项调用
let contentPanelChangeCallback: ((panelId: string | null) => void) | null = null;

/**
 * 插件信息
 */
export const statisticsPlugin: Plugin = {
  id: 'statistics',
  name: '统计概览',
  description: '在项目内容区显示项目统计信息，包括目标完成进度、完成率统计等',
  version: '1.0.0',
  initialize: () => {
    // 注册导航栏菜单项 - 点击后可以跳转到统计页面（这里示例只显示提示）
    pluginRegistry.registerNavigationMenuItem({
      id: 'statistics-overview',
      label: '统计概览',
      icon: BarChart3,
      order: 10,
      onClick: () => {
        // 这里可以打开统计模态框或跳转
        console.log('打开统计概览');
        window.alert('统计概览功能示例\n\n在实际使用中，这里可以打开一个统计页面或模态框，展示所有项目的统计数据');
      },
    });

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
        if (window.__setActiveContentPanel) {
          window.__setActiveContentPanel('project-statistics');
        }
      },
    });
  },
};

// 导出插件
export default statisticsPlugin;