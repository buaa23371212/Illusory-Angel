/**
 * 优先级标签插件
 * 在目标卡片中显示优先级标签
 */
import type { Plugin } from '../../';
import { pluginRegistry } from '../../';
import { PriorityBadge } from './components/PriorityBadge';
import { Flag } from 'lucide-react';

/**
 * 优先级标签插件
 * 在目标卡片底部添加优先级标签显示，并在创建目标表单添加优先级选择
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

    // 注册目标卡片扩展，显示优先级标签
    pluginRegistry.registerGoalCardExtension({
      id: 'priority-badge',
      component: PriorityBadge,
      order: 5,
    });
  },
};

// 导出插件
export default priorityTagPlugin;