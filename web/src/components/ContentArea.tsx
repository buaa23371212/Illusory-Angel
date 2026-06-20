import React from "react";
import { GoalList } from "./GoalList";
import { PluginDetail } from "./PluginDetail";
import { useAppState } from "../store/AppState";
import type { ContentPanelExtension } from "../plugins/types";

/**
 * 内容区域组件属性接口
 * 只需要内容面板扩展，其他状态从AppState获取
 */
interface ContentAreaProps {
  /** 所有注册的内容区面板扩展 */
  contentPanels: ContentPanelExtension[];
}

/**
 * 内容区域组件
 * 最右侧主体内容区，根据选中的功能显示不同内容
 * 从AppState获取全局状态，不再通过props层层传递
 * 在projects功能下，可以显示插件注册的自定义内容面板
 */
export const ContentArea: React.FC<ContentAreaProps> = ({
  contentPanels,
}) => {
  // 直接从AppState获取状态和回调
  const { state, loadProjectProgress } = useAppState();

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