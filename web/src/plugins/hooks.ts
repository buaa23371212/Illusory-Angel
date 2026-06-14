import React from 'react';
import { usePluginContext } from './PluginContext';
import type { NavigationMenuItem } from './types';
import { pluginRegistry } from './registry';

/**
 * 获取所有注册的导航栏菜单项
 */
export function useNavigationMenuItems(): NavigationMenuItem[] {
  const { registry } = usePluginContext();
  return registry.navigationMenuItems;
}

/**
 * 检查是否有插件注册的导航菜单项
 */
export function hasNavigationMenuItems(): boolean {
  return pluginRegistry.getNavigationMenuItems().length > 0;
}

/**
 * 获取所有插件扩展点
 * 在主应用中使用此钩子获取所有注册的扩展点
 */
export function usePlugins() {
  const { registry } = usePluginContext();
  return {
    getNavigationMenuItems: () => registry.navigationMenuItems,
    getContentPanelExtensions: () => pluginRegistry.getContentPanelExtensions(),
    getProjectActionMenuItems: () => registry.projectActionMenuItems,
  };
}

/**
 * 获取插件注册表实例
 * 在少数需要直接访问注册表的场景使用
 */
export function usePluginRegistry() {
  const { registry, refreshRegistry } = usePluginContext();
  return {
    registry,
    refreshRegistry,
    pluginRegistry: pluginRegistry,
  };
}

/**
 * 注册导航菜单项（动态注册时使用）
 * 通常插件在初始化时调用此Hook注册菜单项
 */
export function useRegisterNavigationMenuItem(
  item: NavigationMenuItem
): void {
  const { refreshRegistry } = usePluginContext();
  
  React.useEffect(() => {
    pluginRegistry.registerNavigationMenuItem(item);
    refreshRegistry();
    
    return () => {
      pluginRegistry.unregisterNavigationMenuItem(item.id);
      refreshRegistry();
    };
  }, [item.id, refreshRegistry]);
}