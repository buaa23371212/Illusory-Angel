import React from "react";
import type { Project } from "../api/client";
import type { ProjectActionMenuItem } from "../plugins/types";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Plus, MoreVertical, CheckCircle2, Trash2 } from "lucide-react";

/**
 * 项目进度缓存接口
 */
export interface ProjectProgress {
  total: number;
  completed: number;
}

/**
 * 项目导航组件属性接口
 */
interface ProjectsNavigationProps {
  /** 项目列表 */
  projects: Project[];
  /** 当前选中的项目 */
  selectedProject: Project | null;
  /** 项目选择回调 */
  onProjectSelect: (project: Project) => void;
  /** 项目删除回调 */
  onDeleteProject: (project: Project, e: React.MouseEvent) => void;
  /** 创建新项目回调 */
  onCreateProject: () => void;
  /** 是否正在加载 */
  loading: boolean;
  /** 项目进度缓存 */
  progressCache: Record<number, ProjectProgress>;
  /** 插件注册的项目操作菜单项 */
  projectActionMenuItems: ProjectActionMenuItem[];
  /** 当前激活的内容面板ID */
  activeContentPanel: string | null;
  /** 切换内容面板回调 */
  onContentPanelChange: (panelId: string | null) => void;
}

/**
 * 项目导航组件
 * 中间区域的项目列表导航栏，显示所有项目及其进度
 * 项目卡片下拉菜单包含插件注册的操作选项，点击后可切换内容区面板
 */
export const ProjectsNavigation: React.FC<ProjectsNavigationProps> = ({
  projects,
  selectedProject,
  onProjectSelect,
  onDeleteProject,
  onCreateProject,
  loading,
  progressCache,
  projectActionMenuItems,
  activeContentPanel,
  onContentPanelChange,
}) => {
  const totalProjects = projects.length;

  return (
    <aside className="w-80 border-r bg-muted/30 flex flex-col overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">我的项目</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalProjects} 个项目
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onCreateProject}>
                  <Plus className="mr-2 h-4 w-4" />
                  新建项目
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          // 加载骨架屏
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          // 空状态
          <div className="text-center py-8 px-2">
            <p className="text-muted-foreground text-sm mb-4">还没有项目</p>
            <Button size="sm" className="w-full" onClick={onCreateProject}>
              <Plus className="mr-2 h-4 w-4" />
              创建项目
            </Button>
          </div>
        ) : (
          // 项目列表
          <div className="space-y-1">
            {projects.map((project) => {
              const progress = progressCache[project.project_id];
              const progressPercent =
                progress && progress.total > 0
                  ? Math.round((progress.completed / progress.total) * 100)
                  : 0;

              return (
                <div
                  key={project.project_id}
                  onClick={() => onProjectSelect(project)}
                  className={`w-full text-left p-3 rounded-lg transition-colors group flex items-start justify-between cursor-pointer ${
                    selectedProject?.project_id === project.project_id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p
                      className={`font-medium truncate ${
                        selectedProject?.project_id === project.project_id
                          ? "text-primary-foreground"
                          : ""
                      }`}
                    >
                      {project.name}
                    </p>
                    {project.description && (
                      <p
                        className={`text-xs truncate mt-1 ${
                          selectedProject?.project_id === project.project_id
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {project.description}
                      </p>
                    )}
                    {/* 进度显示 */}
                    {progress && progress.total > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={
                              selectedProject?.project_id === project.project_id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }
                          >
                            <CheckCircle2 className="inline-block w-3 h-3 mr-1" />
                            {progress.completed}/{progress.total}
                          </span>
                          <span
                            className={
                              selectedProject?.project_id === project.project_id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }
                          >
                            {progressPercent}%
                          </span>
                        </div>
                        <div
                          className={`h-1.5 rounded-full overflow-hidden ${
                            selectedProject?.project_id === project.project_id
                              ? "bg-primary-foreground/30"
                              : "bg-muted"
                          }`}
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              selectedProject?.project_id === project.project_id
                                ? "bg-primary-foreground"
                                : "bg-primary"
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        selectedProject?.project_id === project.project_id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {new Date(project.created_at).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className={`h-6 w-6 ${
                          selectedProject?.project_id === project.project_id
                            ? "text-primary-foreground hover:bg-primary-foreground/20"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {projectActionMenuItems.map((item) => {
                       const Icon = item.icon;
                       return (
                         <React.Fragment key={item.id}>
                           <DropdownMenuItem
                             onClick={(e) => {
                               e.stopPropagation();
                               item.onClick(project);
                             }}
                           >
                             {Icon && <Icon className="mr-2 h-4 w-4" />}
                             {item.label}
                           </DropdownMenuItem>
                           {item.separator && <DropdownMenu.Separator />}
                         </React.Fragment>
                       );
                     })}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => onDeleteProject(project, e)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除项目
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};