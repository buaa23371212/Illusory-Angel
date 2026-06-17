/**
 * 后端插件注册表
 * 管理插件注册和扩展点收集
 */

import type { Router } from 'express';

/**
 * 插件信息
 */
export interface PluginInfo {
  id: string;
  name: string;
  description: string;
  version: string;
}

/**
 * 插件注册表
 */
class PluginRegistry {
  private static instance: PluginRegistry;

  /**
   * 已注册的插件信息
   */
  private plugins: Map<string, PluginInfo> = new Map();

  /**
   * 已注册的插件路由
   */
  private pluginRoutes: Router[] = [];

  /**
   * 获取单例实例
   */
  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * 注册插件信息
   * @param info 插件信息
   */
  registerPlugin(info: PluginInfo): void {
    this.plugins.set(info.id, info);
  }

  /**
   * 注册插件路由
   * @param router Express 路由实例
   */
  registerRoutes(router: Router): void {
    this.pluginRoutes.push(router);
  }

  /**
   * 获取所有已注册的插件路由
   */
  getPluginRoutes(): Router[] {
    return [...this.pluginRoutes];
  }

  /**
   * 获取所有已注册的插件信息
   */
  getPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取指定插件信息
   */
  getPlugin(pluginId: string): PluginInfo | undefined {
    return this.plugins.get(pluginId);
  }
}

/**
 * 全局插件注册表单例
 */
export const pluginRegistry = PluginRegistry.getInstance();

/**
 * 便捷方法：注册插件信息
 */
export function registerPlugin(info: PluginInfo): void {
  pluginRegistry.registerPlugin(info);
}

/**
 * 便捷方法：注册插件路由
 */
export function registerPluginRoutes(router: Router): void {
  pluginRegistry.registerRoutes(router);
}

/**
 * 便捷方法：获取所有插件路由
 */
export function getPluginRoutes(): Router[] {
  return pluginRegistry.getPluginRoutes();
}