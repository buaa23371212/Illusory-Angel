import React from "react";
import type { Project } from "../api/client";
import { Card } from "./ui/card";
import { usePluginRegistry } from "../plugins/hooks";

/**
 * 项目详情侧边栏组件属性接口
 */
interface ProjectDetailSidebarProps {
  /** 当前选中的项目 */
  selectedProject: Project | null;
}

/**
 * 项目详情侧边栏组件
 * 最右侧侧边栏，用于展示插件注册的扩展面板
 */
export const ProjectDetailSidebar: React.FC<ProjectDetailSidebarProps> = ({
  selectedProject,
}) => {
  const { pluginRegistry } = usePluginRegistry();
  const sidebarExtensions = pluginRegistry.getSidebarPanelExtensions();

  if (!selectedProject) {
    return (
      <aside className="w-72 border-l bg-muted/30 flex flex-col overflow-hidden hidden lg:block">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">请选择一个项目查看详情</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-l bg-muted/30 flex flex-col overflow-hidden hidden lg:block">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 项目基本信息 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-2">项目信息</h3>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              创建时间：{new Date(selectedProject.created_at).toLocaleDateString("zh-CN")}
            </p>
            {selectedProject.description && (
              <p className="text-muted-foreground break-words">
                {selectedProject.description}
              </p>
            )}
          </div>
        </Card>

        {/* 插件注册的侧边栏面板扩展 */}
        {sidebarExtensions.map((extension) => {
          const ExtensionComponent = extension.component;
          return (
            <Card key={extension.id} className="p-4">
              <h3 className="font-semibold mb-3">{extension.title}</h3>
              <ExtensionComponent selectedProject={selectedProject} />
            </Card>
          );
        })}

        {/* 如果没有插件扩展，显示空状态 */}
        {sidebarExtensions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">暂无扩展信息</p>
            <p className="text-xs mt-1">启用插件后将在此显示扩展内容</p>
          </div>
        )}
      </div>
    </aside>
  );
};