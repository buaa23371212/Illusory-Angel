import React from "react";
import type { Project } from "../api/client";
import type { ProjectActionMenuItem } from "../plugins/types";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { MoreVertical, CheckCircle2, Trash2, Eye } from "lucide-react";

/**
 * 项目进度缓存接口
 */
export interface ProjectProgress {
  total: number;
  completed: number;
}

/**
 * 项目卡片组件属性接口
 */
interface ProjectCardProps {
  /** 项目数据 */
  project: Project;
  /** 是否被选中 */
  isSelected: boolean;
  /** 项目进度信息 */
  progress?: ProjectProgress;
  /** 插件注册的项目操作菜单项 */
  projectActionMenuItems: ProjectActionMenuItem[];
  /** 处理项目选择回调 */
  onSelect: (project: Project) => void;
  /** 处理查看目标回调 */
  onViewGoals: () => void;
  /** 处理删除项目点击回调 */
  onDeleteClick: (project: Project, e: React.MouseEvent) => void;
}

/**
 * 项目卡片组件
 * 在项目导航栏中显示单个项目信息，包含进度和操作菜单
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSelected,
  progress,
  projectActionMenuItems,
  onSelect,
  onViewGoals,
  onDeleteClick,
}) => {
  // 计算进度百分比
  const progressPercent = progress && progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div
      key={project.project_id}
      onClick={() => onSelect(project)}
      className={`w-full text-left p-3 rounded-lg transition-colors group flex items-start justify-between cursor-pointer ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted"
      }`}
    >
      <div className="flex-1 min-w-0 pr-2">
        <p
          className={`font-medium truncate ${
            isSelected
              ? "text-primary-foreground"
              : ""
          }`}
        >
          {project.name}
        </p>
        {project.description && (
          <p
            className={`text-xs truncate mt-1 ${
              isSelected
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
                  isSelected
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }
              >
                <CheckCircle2 className="inline-block w-3 h-3 mr-1" />
                {progress.completed}/{progress.total}
              </span>
              <span
                className={
                  isSelected
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }
              >
                {progressPercent}%
              </span>
            </div>
            <div
              className={`h-1.5 rounded-full overflow-hidden ${
                isSelected
                  ? "bg-primary-foreground/30"
                  : "bg-muted"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isSelected
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
            isSelected
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
              isSelected
                ? "text-primary-foreground hover:bg-primary-foreground/20"
                : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* 查看目标选项 */}
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onSelect(project);
            onViewGoals();
          }}>
            <Eye className="mr-2 h-4 w-4" />
            查看目标
          </DropdownMenuItem>

          {/* 分隔线 */}
          {projectActionMenuItems.length > 0 && <DropdownMenuSeparator />}

          {/* 插件注册的菜单项 */}
          {projectActionMenuItems.map((item) => {
            // 如果提供了component，则使用组件渲染
            if (item.component) {
              const ItemComponent = item.component;
              return (
                <ItemComponent
                  key={item.id}
                  project={project}
                />
              );
            }
            // 否则使用默认方式渲染
            const Icon = item.icon;
            return (
              <React.Fragment key={item.id}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick?.(project);
                  }}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {item.label}
                </DropdownMenuItem>
                {item.separator && <DropdownMenuSeparator />}
              </React.Fragment>
            );
          })}

          {/* 删除项目选项 */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => onDeleteClick(project, e)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除项目
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProjectCard;