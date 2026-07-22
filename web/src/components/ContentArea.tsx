import React from "react";
import { GoalList } from "./GoalList";
import { PluginDetail } from "./PluginDetail";
import { useAppState } from "../store/AppState";
import { getContentPanelExtensions } from "../plugins/registry";
import type { ContentPanelExtension } from "../plugins/types";

/**
 * 内容区域组件
 * 最右侧主体内容区，根据选中的功能显示不同内容
 * 从AppState获取全局状态，不再通过props层层传递
 * 在projects功能下，可以显示插件注册的自定义内容面板
 */
export const ContentArea: React.FC = () => {
  // 直接从AppState获取状态和回调
  const { state, loadProjectProgress } = useAppState();

  // 直接从插件注册表获取扩展点数据
  const contentPanels: ContentPanelExtension[] = getContentPanelExtensions();

  /**
   * 处理目标变化，刷新项目进度
   */
  const handleGoalChange = () => {
    if (state.selectedProject) {
      loadProjectProgress(state.selectedProject.project_id);
    }
  };

  // 如果不是projects功能，显示插件详情
  if (state.selectedFeature !== "projects") {
    return (
      <main className="flex-1 overflow-y-auto">
        <PluginDetail
          plugin={state.selectedPlugin}
        />
      </main>
    );
  }

  // 如果有选中的内容面板，渲染插件面板
  if (state.activeContentPanel && state.selectedProject) {
    const panel = contentPanels.find(p => p.id === state.activeContentPanel);
    if (panel) {
      return (
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <panel.component
              selectedProject={state.selectedProject}
              onGoalChange={handleGoalChange}
            />
          </div>
        </main>
      );
    }
  }

  // 默认行为：检查是否有插件面板声明匹配当前项目的分类
  const matchingPanel = state.selectedProject
    ? contentPanels.find(p => p.matchProjectCategory && p.matchProjectCategory === state.selectedProject?.category)
    : null;
  if (matchingPanel) {
    return (
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <matchingPanel.component
            selectedProject={state.selectedProject}
            onGoalChange={handleGoalChange}
          />
        </div>
      </main>
    );
  }

  // 默认显示目标列表
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-6">
        <GoalList
          selectedProject={state.selectedProject}
          onGoalChange={handleGoalChange}
        />
      </div>
    </main>
  );
};