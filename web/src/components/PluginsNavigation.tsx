import React, { useMemo } from "react";
import type { Plugin } from "../plugins/types";
import { usePluginRegistry } from "../plugins/hooks";
import { useAppState } from "../store/AppState";
import { cn } from "../lib/utils";

/**
 * 插件导航组件属性
 * 不需要props，所有状态从AppState获取
 */
interface PluginsNavigationProps {
}

/**
 * 插件导航组件
 * 中间区域显示已安装插件列表，支持选择插件
 * 从AppState获取全局状态，不再通过props传递
 */
export const PluginsNavigation: React.FC<PluginsNavigationProps> = () => {
  const { pluginRegistry } = usePluginRegistry();
  const { state, dispatch } = useAppState();

  /**
   * 处理插件选择
   */
  const handlePluginSelect = (plugin: Plugin) => {
    dispatch({ type: "SELECT_PLUGIN", payload: plugin });
  };

  /**
   * 获取所有已注册的插件列表
   */
  const plugins = useMemo(() => {
    return pluginRegistry.getPlugins();
  }, [pluginRegistry]);

  return (
    <aside className="w-80 border-r bg-muted/30 flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold">已安装插件</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {plugins.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-muted-foreground text-sm">暂无已安装插件</p>
          </div>
        ) : (
          <div className="space-y-1">
            {plugins.map((plugin) => (
              <div
                key={plugin.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-colors",
                  state.selectedPlugin?.id === plugin.id
                    ? "bg-primary/10 border-primary"
                    : "bg-background hover:bg-muted/50"
                )}
                onClick={() => handlePluginSelect(plugin)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {plugin.name}
                      </h3>
                      {plugin.version && (
                        <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-muted rounded-full">
                          v{plugin.version}
                        </span>
                      )}
                    </div>
                    {plugin.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {plugin.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};