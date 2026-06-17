import React, { createContext, useContext, useState, useEffect } from 'react';
import type { PluginRegistry } from './types';
import { pluginRegistry } from './registry';

/**
 * 插件上下文类型
 */
interface PluginContextType {
  /** 当前插件注册表 */
  registry: PluginRegistry;
  /** 强制刷新注册表 */
  refreshRegistry: () => void;
}

/**
 * 创建插件上下文
 */
const PluginContext = createContext<PluginContextType | null>(null);

/**
 * 插件上下文提供者组件
 * 将插件注册信息提供给整个应用
 */
export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<PluginRegistry>(
    pluginRegistry.getRegistry()
  );

  /**
   * 刷新注册表
   * 当插件注册发生变化时调用，触发组件重新渲染
   */
  const refreshRegistry = () => {
    setRegistry(pluginRegistry.getRegistry());
  };

  useEffect(() => {
    // 初始加载时获取最新注册表
    refreshRegistry();
  }, []);

  return (
    <PluginContext.Provider value={{ registry, refreshRegistry }}>
      {/* 渲染所有注册的全局组件 */}
      {registry.globalComponents.map(({ component: Component }, index) => (
        <Component key={index} />
      ))}
      {children}
    </PluginContext.Provider>
  );
}

/**
 * 使用插件上下文的Hook
 */
export function usePluginContext(): PluginContextType {
  const context = useContext(PluginContext);
  if (!context) {
    throw new Error('usePluginContext must be used within a PluginProvider');
  }
  return context;
}

export default PluginContext;