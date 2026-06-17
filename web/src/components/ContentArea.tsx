import React from "react";
import type { Project } from "../api/client";
import type { Plugin, ContentPanelExtension } from "../plugins/types";
import { GoalList } from "./GoalList";
import { PluginDetail } from "./PluginDetail";
import type { FeatureType } from "./FeatureSidebar";

/**
 * 内容区域组件属性接口
 */
interface ContentAreaProps {
  /** 当前选中的功能 */
  selectedFeature: FeatureType;
  /** 当前选中的项目 */
  selectedProject: Project | null;
  /** 目标变化回调 */
  onGoalChange: () => void;
  /** 当前选中的插件（插件管理时使用） */
  selectedPlugin: Plugin | null;
  /** 当前激活的内容面板ID（null显示默认目标列表） */
  activeContentPanel: string | null;
  /** 所有注册的内容区面板扩展 */
  contentPanels: ContentPanelExtension[];
}

/**
 * 内容区域组件
 * 最右侧主体内容区，根据选中的功能显示不同内容
 * 在projects功能下，可以显示插件注册的自定义内容面板
 */
export const ContentArea: React.FC<ContentAreaProps> = ({
  selectedFeature,
  selectedProject,
  onGoalChange,
  selectedPlugin,
  activeContentPanel,
  contentPanels,
}) => {
  // 如果不是projects功能，显示插件详情
  if (selectedFeature !== "projects") {
    return (
      <main className="flex-1 overflow-y-auto">
        <PluginDetail
          plugin={selectedPlugin}
        />
      </main>
    );
  }

  // 如果有选中的内容面板，渲染插件面板
  if (activeContentPanel && selectedProject) {
    const panel = contentPanels.find(p => p.id === activeContentPanel);
    if (panel) {
      return (
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <panel.component
              selectedProject={selectedProject}
              onGoalChange={onGoalChange}
            />
          </div>
        </main>
      );
    }
  }

  // 默认显示目标列表
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6">
        <GoalList
          selectedProject={selectedProject}
          onGoalChange={onGoalChange}
        />
      </div>
    </main>
  );
};