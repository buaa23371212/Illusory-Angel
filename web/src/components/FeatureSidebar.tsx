import React from "react";
import { FolderOpen, Puzzle } from "lucide-react";

/**
 * 功能类型定义
 */
export type FeatureType = "projects" | "plugins";

/**
 * 功能侧边栏组件属性接口
 */
interface FeatureSidebarProps {
  /** 当前选中的功能 */
  selectedFeature: FeatureType;
  /** 功能切换回调 */
  onFeatureChange: (feature: FeatureType) => void;
}

/**
 * 功能侧边栏组件
 * 最左侧功能选择栏，用于切换项目管理和插件管理
 */
export const FeatureSidebar: React.FC<FeatureSidebarProps> = ({
  selectedFeature,
  onFeatureChange,
}) => {
  return (
    <aside className="w-16 border-r bg-muted/30 flex flex-col items-center py-4 gap-2">
      {/* 项目管理 */}
      <button
        onClick={() => onFeatureChange("projects")}
        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
          selectedFeature === "projects"
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
        onClick={() => onFeatureChange("plugins")}
        className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
          selectedFeature === "plugins"
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