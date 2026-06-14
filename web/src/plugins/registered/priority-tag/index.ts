/**
 * 优先级标签插件
 * 在目标卡片中显示优先级标签
 */
import type { Plugin } from '../../';
import { pluginRegistry } from '../../';
import { PriorityGoalCard } from './components/PriorityGoalCard';
import { Flag } from 'lucide-react';

/**
 * 优先级标签插件
 * 使用自定义目标卡片渲染，在目标卡片中添加优先级标签显示
 */
export const priorityTagPlugin: Plugin = {
  id: 'priority-tag',
  name: '优先级标签',
  description: '为目标添加优先级标签支持，在目标列表中直观区分优先级',
  version: '1.0.0',
  initialize: () => {
    // 在导航栏添加菜单项
    pluginRegistry.registerNavigationMenuItem({
      id: 'priority-settings',
      label: '优先级设置',
      icon: Flag,
      order: 20,
      onClick: () => {
        window.alert('优先级设置示例\n\n在实际使用中，这里可以打开优先级配置界面，自定义优先级颜色和名称');
      },
    });

    // 注册自定义目标卡片渲染器，显示优先级标签
    pluginRegistry.registerGoalCardRenderer({
      id: 'priority-goal-card',
      name: '带优先级标签的目标卡片',
      component: PriorityGoalCard,
    });
  },
};

// 导出插件
export default priorityTagPlugin;