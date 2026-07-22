/**
 * 插件系统导出
 */

// 类型导出
export * from './types';
export type { Plugin } from './types';

// 注册表导出
export { pluginRegistry } from './registry';
export * from './registry';

// Context导出
export { PluginProvider, usePluginContext } from './PluginContext';

// Hooks导出
export * from './hooks';

// --- 已注册插件 ---
// 导入即自动注册并初始化所有启用的插件
import { statisticsPlugin } from './statistics';
import { alarmClockPlugin } from './alarm-clock';
import { bqtjPlugin } from './bqtj';
import { loadPluginApiExtensions } from '@/api/pluginApiLoader';

// 加载所有插件注册的API扩展到apiClient
loadPluginApiExtensions();

// 导出插件供参考
export { statisticsPlugin, alarmClockPlugin, bqtjPlugin };