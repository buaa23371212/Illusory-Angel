import React from "react";
import type { Project } from "../api/client";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Plus, MoreVertical } from "lucide-react";
import { useAppState } from "../store/AppState";
import ProjectCard from "./ProjectCard";
import type { ProjectProgress } from "./ProjectCard";
import { getProjectActionMenuItems, getNavigationMenuItems, getNavigationPanelExtensions } from "../plugins/registry";
import type { ProjectActionMenuItem, NavigationMenuItem, NavigationPanelExtension } from "../plugins/types";

/**
 * 项目导航组件
 * 左侧区域的项目列表导航栏，显示所有项目卡片
 * 从AppState获取全局状态，不再通过props层层传递
 * 点击项目卡片后可切换内容区面板显示详情
 * 支持插件通过 navigationPanelExtensions 替换导航栏内容
 * 支持插件通过 navigationMenuItems 添加操作菜单项
 */
export const ProjectsNavigation: React.FC = () => {
  // 直接从AppState获取状态和dispatch
  const { state, dispatch, loadProjectProgress } = useAppState();

  // 直接从插件注册表获取扩展点数据
  const projectActionMenuItems: ProjectActionMenuItem[] = getProjectActionMenuItems();
  const navigationMenuItems: NavigationMenuItem[] = getNavigationMenuItems();
  const navigationPanelExtensions: NavigationPanelExtension[] = getNavigationPanelExtensions();

  /**
   * 处理创建新项目点击
   */
  const handleCreateProject = () => {
    dispatch({ type: "SET_CREATE_DIALOG", payload: true });
  };

  /**
   * 处理项目选择
   */
  const handleProjectSelect = (project: Project) => {
    dispatch({ type: "SELECT_PROJECT", payload: project });
  };

  /**
   * 处理删除项目点击
   */
  const handleDeleteProjectClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "SET_DELETE_DIALOG",
      payload: { open: true, project },
    });
  };

  /**
   * 处理查看目标点击（返回默认目标列表视图）
   */
  const handleViewGoals = () => {
    dispatch({ type: "SET_ACTIVE_CONTENT_PANEL", payload: null });
  };

  /**
   * 处理项目变化回调
   */
  const handleProjectChange = () => {
    if (state.selectedProject) {
      loadProjectProgress(state.selectedProject.project_id);
    }
  };

  // 检查是否有插件面板声明匹配当前项目的分类
  const matchingPanel = state.selectedProject
    ? navigationPanelExtensions.find(p => p.matchProjectCategory && p.matchProjectCategory === state.selectedProject?.category)
    : null;

  // 如果有匹配的插件导航栏面板，渲染插件面板
  if (matchingPanel) {
    return (
      <aside className="w-80 border-r bg-muted/30 flex flex-col overflow-hidden">
        <matchingPanel.component
          selectedProject={state.selectedProject}
          onProjectChange={handleProjectChange}
        />
      </aside>
    );
  }

  const totalProjects = state.projects.length;

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
                <DropdownMenuItem onClick={handleCreateProject}>
                  <Plus className="mr-2 h-4 w-4" />
                  新建项目
                </DropdownMenuItem>
                {/* 渲染插件注册的导航栏菜单项 */}
                {navigationMenuItems.length > 0 && <DropdownMenuSeparator />}
                {navigationMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={item.id}>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        item.onClick?.();
                      }}>
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        {item.label}
                      </DropdownMenuItem>
                      {item.separator && <DropdownMenuSeparator />}
                    </React.Fragment>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {state.loading ? (
          // 加载骨架屏
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : state.projects.length === 0 ? (
          // 空状态
          <div className="text-center py-8 px-2">
            <p className="text-muted-foreground text-sm mb-4">还没有项目</p>
            <Button size="sm" className="w-full" onClick={handleCreateProject}>
              <Plus className="mr-2 h-4 w-4" />
              创建项目
            </Button>
          </div>
        ) : (
          // 项目列表
          <div className="space-y-1">
            {state.projects.map((project) => {
              const progress: ProjectProgress | undefined = state.progressCache[project.project_id];
              const isSelected = state.selectedProject?.project_id === project.project_id;

              return (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  isSelected={isSelected}
                  progress={progress}
                  projectActionMenuItems={projectActionMenuItems}
                  onSelect={handleProjectSelect}
                  onViewGoals={handleViewGoals}
                  onDeleteClick={handleDeleteProjectClick}
                />
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};