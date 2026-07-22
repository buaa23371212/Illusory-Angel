import { usePluginContext } from './PluginContext';
import type { NavigationMenuItem, NavigationPanelExtension } from './types';
import { pluginRegistry } from './registry';

/**
 * 获取所有注册的导航栏菜单项
 */
export function useNavigationMenuItems(): NavigationMenuItem[] {
  const { registry } = usePluginContext();
  return registry.navigationMenuItems;
}

/**
 * 获取所有注册的导航栏面板扩展
 */
export function useNavigationPanelExtensions(): NavigationPanelExtension[] {
  const { registry } = usePluginContext();
  return registry.navigationPanelExtensions;
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
    getNavigationPanelExtensions: () => registry.navigationPanelExtensions,
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