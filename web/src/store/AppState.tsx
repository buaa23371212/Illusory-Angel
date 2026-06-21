import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { apiClient } from "../api/client";
import type { Project, Goal } from "../api/client";
import type { Plugin } from "../plugins/types";
import { toast } from "sonner";

/**
 * 功能类型定义
 */
export type FeatureType = "projects" | "plugins";

/**
 * 应用状态接口
 * 包含所有全局共享的状态
 */
export interface AppState {
  // 功能选择状态
  selectedFeature: FeatureType;

  // 项目相关状态
  projects: Project[];
  loading: boolean;
  selectedProject: Project | null;

  // 进度缓存
  progressCache: Record<number, { total: number; completed: number }>;

  // 对话框状态
  createDialogOpen: boolean;
  deleteDialogOpen: boolean;
  projectToDelete: Project | null;

  // 内容面板状态（插件扩展用）
  activeContentPanel: string | null;

  // 插件管理状态
  selectedPlugin: Plugin | null;
}

/**
 * 初始状态
 */
export const initialState: AppState = {
  selectedFeature: "projects",
  projects: [],
  loading: true,
  selectedProject: null,
  progressCache: {},
  createDialogOpen: false,
  deleteDialogOpen: false,
  projectToDelete: null,
  activeContentPanel: null,
  selectedPlugin: null,
};

/**
 * 操作类型枚举
 */
type Action =
  | { type: "SET_SELECTED_FEATURE"; payload: FeatureType }
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SELECT_PROJECT"; payload: Project | null }
  | { type: "UPDATE_PROGRESS_CACHE"; payload: { projectId: number; total: number; completed: number } }
  | { type: "SET_CREATE_DIALOG"; payload: boolean }
  | { type: "SET_DELETE_DIALOG"; payload: { open: boolean; project: Project | null } }
  | { type: "SET_ACTIVE_CONTENT_PANEL"; payload: string | null }
  | { type: "SELECT_PLUGIN"; payload: Plugin | null }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "DELETE_PROJECT"; payload: number }
  | { type: "REFRESH_PROGRESS"; payload: number };

/**
 * Reducer函数
 * 纯函数，根据action更新状态
 */
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_SELECTED_FEATURE":
      return { ...state, selectedFeature: action.payload };

    case "SET_PROJECTS": {
      const projects = action.payload;
      let selectedProject = state.selectedProject;
      // 如果没有选中的项目且列表不为空，默认选中第一个
      if (!selectedProject && projects.length > 0) {
        selectedProject = projects[0];
      }
      return { ...state, projects, selectedProject };
    }

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SELECT_PROJECT":
      return { ...state, selectedProject: action.payload, activeContentPanel: null };

    case "UPDATE_PROGRESS_CACHE":
      return {
        ...state,
        progressCache: {
          ...state.progressCache,
          [action.payload.projectId]: {
            total: action.payload.total,
            completed: action.payload.completed,
          },
        },
      };

    case "SET_CREATE_DIALOG":
      return { ...state, createDialogOpen: action.payload };

    case "SET_DELETE_DIALOG":
      return {
        ...state,
        deleteDialogOpen: action.payload.open,
        projectToDelete: action.payload.project,
      };

    case "SET_ACTIVE_CONTENT_PANEL":
      return { ...state, activeContentPanel: action.payload };

    case "SELECT_PLUGIN":
      return { ...state, selectedPlugin: action.payload };

    case "ADD_PROJECT":
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        selectedProject: action.payload,
      };

    case "DELETE_PROJECT": {
      const newProjects = state.projects.filter(
        (p) => p.project_id !== action.payload
      );
      let newSelectedProject = state.selectedProject;
      if (state.selectedProject?.project_id === action.payload) {
        newSelectedProject = newProjects.length > 0 ? newProjects[0] : null;
      }
      return {
        ...state,
        projects: newProjects,
        selectedProject: newSelectedProject,
      };
    }

    case "REFRESH_PROGRESS":
      // 触发重新加载进度，实际加载在side effect中处理
      return state;

    default:
      return state;
  }
}

/**
 * Context
 */
const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // 异步操作方法
  loadProjects: () => Promise<void>;
  loadProjectProgress: (projectId: number) => Promise<void>;
  confirmDeleteProject: () => Promise<void>;
} | null>(null);

/**
 * Provider组件
 * 提供应用状态给所有子组件
 */
export interface AppStateProviderProps {
  children: ReactNode;
}

/**
 * 应用状态Provider
 * 包含所有side effect和异步操作逻辑
 */
export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  /**
   * 加载单个项目进度
   */
  const loadProjectProgress = useCallback(async (projectId: number) => {
    try {
      const response = await apiClient.getGoals({ project_id: projectId });
      const goals = response?.list || [];
      const completed = goals.filter((g: Goal) => g.is_completed === 1).length;
      dispatch({
        type: "UPDATE_PROGRESS_CACHE",
        payload: { projectId, total: goals.length, completed },
      });
    } catch (error) {
      console.error("Failed to load project progress:", error);
    }
  }, []);

  /**
   * 加载所有项目列表
   */
  const loadProjects = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await apiClient.getProjects();
      const projectList = response?.list || [];
      dispatch({ type: "SET_PROJECTS", payload: projectList });

      // 预加载所有项目进度
      for (const project of projectList) {
        await loadProjectProgress(project.project_id);
      }
    } catch (error) {
      console.error("加载项目失败:", error);
      toast.error("加载项目失败，请检查后端服务是否正常运行");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [loadProjectProgress]);

  /**
   * 确认删除项目
   */
  const confirmDeleteProject = useCallback(async () => {
    if (!state.projectToDelete) return;

    try {
      await apiClient.deleteProject(state.projectToDelete.project_id);
      dispatch({
        type: "DELETE_PROJECT",
        payload: state.projectToDelete.project_id,
      });
      toast.success("项目删除成功");
    } catch (error) {
      console.error("删除项目失败:", error);
      toast.error("删除项目失败");
    } finally {
      dispatch({ type: "SET_DELETE_DIALOG", payload: { open: false, project: null } });
    }
  }, [state.projectToDelete]);

  /**
   * 当选中项目变化时，重置内容面板到默认
   */
  useEffect(() => {
    dispatch({ type: "SET_ACTIVE_CONTENT_PANEL", payload: null });
  }, [state.selectedProject]);

  /**
   * 暴露切换面板函数到window，方便插件调用
   */
  useEffect(() => {
    (window as any).__setActiveContentPanel = (panelId: string) => {
      dispatch({ type: "SET_ACTIVE_CONTENT_PANEL", payload: panelId });
    };
    return () => {
      delete (window as any).__setActiveContentPanel;
    };
  }, []);

  /**
   * 初始化加载
   */
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const value = {
    state,
    dispatch,
    loadProjects,
    loadProjectProgress,
    confirmDeleteProject,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

/**
 * 自定义hook，方便使用应用状态
 */
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}

/**
 * 便捷hook：获取选中项目相关的操作
 */
export function useSelectedProject() {
  const { state, dispatch } = useAppState();
  
  const selectProject = useCallback((project: Project) => {
    dispatch({ type: "SELECT_PROJECT", payload: project });
  }, [dispatch]);

  return {
    selectedProject: state.selectedProject,
    selectProject,
  };
}