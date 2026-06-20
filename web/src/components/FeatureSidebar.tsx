import React from "react";
import { FolderOpen, Puzzle } from "lucide-react";
import { useAppState, type FeatureType } from "../store/AppState";

/**
 * 功能侧边栏组件属性接口
 * 不需要props，所有状态从AppState获取
 */
interface FeatureSidebarProps {
}

/**
 * 功能侧边栏组件
 * 最左侧功能选择栏，用于切换项目管理和插件管理
 * 从AppState获取全局状态，不再通过props传递
 */
export const FeatureSidebar: React.FC<FeatureSidebarProps> = () => {
  const { state, dispatch } = useAppState();

  /**
   * 处理功能选择切换
   */
  const handleFeatureChange = (feature: FeatureType) => {
    dispatch({ type: "SET_SELECTED_FEATURE", payload: feature });
  };
  return (
    <aside className="w-16 border-r bg-muted/30 flex flex-col items-center py-4 gap-2">
      {/* 项目管理 */}
      <button
        onClick={() => handleFeatureChange("projects")}
        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
          state.selectedFeature === "projects"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
        title="项目管理"
      >
        <FolderOpen className="h-6 w-6" />
        <span className="text-[10px] font-medium">项目</span>
      </button>

      {/* 插件管理 */}
      <button
        onClick={() => handleFeatureChange("plugins")}
        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
          state.selectedFeature === "plugins"
            ? "bg-primary text-primary-foreground"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        }`}
        title="插件管理"
      >
        <Puzzle className="h-6 w-6" />
        <span className="text-[10px] font-medium">插件</span>
      </button>
    </aside>
  );
};