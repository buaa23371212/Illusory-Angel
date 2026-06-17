import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import type { Plugin } from "../plugins/types";

/**
 * 插件详情组件属性接口
 */
interface PluginDetailProps {
  /** 当前选中的插件 */
  plugin: Plugin | null;
}

/**
 * 插件详情组件
 * 在主体内容区显示选中插件的详细信息
 */
export const PluginDetail: React.FC<PluginDetailProps> = ({
  plugin,
}) => {
  if (!plugin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="text-center py-12 max-w-md w-full">
          <p className="text-muted-foreground">请从左侧选择一个插件查看详情</p>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <Card className="p-6">
        {/* 插件基本信息 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{plugin.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">ID: {plugin.id}</p>
            </div>
            <Badge variant="default">
              已启用
            </Badge>
          </div>
          {plugin.description && (
            <p className="text-muted-foreground">{plugin.description}</p>
          )}
        </div>

        {/* 插件版本信息 */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">版本</h3>
          {plugin.version ? (
            <p className="text-muted-foreground">{plugin.version}</p>
          ) : (
            <p className="text-muted-foreground text-sm">未指定版本</p>
          )}
        </div>
      </Card>
    </main>
  );
};