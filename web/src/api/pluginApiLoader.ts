import { apiClient } from './client';
import { getApiExtensions } from '@/plugins/registry';
import type { ApiExtension } from '@/plugins/types';

/**
 * 加载所有插件注册的API扩展到apiClient
 * 应该在应用启动时调用
 */
export function loadPluginApiExtensions(): void {
  const extensions = getApiExtensions();
  
  extensions.forEach((extension: ApiExtension) => {
    // 将插件API方法绑定到apiClient实例
    const boundMethod = extension.method.bind(apiClient);
    apiClient.registerApiMethod(extension.id, boundMethod);
    console.debug(`[Plugin API] Loaded extension: ${extension.id}`);
  });
  
  console.debug(`[Plugin API] Total extensions loaded: ${extensions.length}`);
}