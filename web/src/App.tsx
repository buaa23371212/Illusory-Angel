import { useState, useEffect, useCallback } from "react";
import { CreateProjectDialog } from "./components/CreateProjectDialog";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/ui/dialog";
import { apiClient } from "./api/client";
import type { Project, Goal } from "./api/client";
import type { Plugin } from "./plugins/types";
import type { ContentPanelExtension, ProjectActionMenuItem } from "./plugins/types";
import { Toaster } from "./components/ui/sonner";
import { Target } from "lucide-react";
import { toast } from "sonner";
import { PluginProvider, usePlugins } from "./plugins";
import { FeatureSidebar, type FeatureType } from "./components/FeatureSidebar";
import { ProjectsNavigation, type ProjectProgress } from "./components/ProjectsNavigation";
import { PluginsNavigation } from "./components/PluginsNavigation";
import { ContentArea } from "./components/ContentArea";
import "./App.css";

/**
 * 主应用内容组件
 * 使用usePlugins钩子获取插件扩展点数据
 */
function AppContent() {
  const [selectedFeature, setSelectedFeature] =
    useState<FeatureType>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [progressCache, setProgressCache] = useState<
    Record<number, ProjectProgress>
  >({});
  // 当前激活的内容区面板ID，null表示显示默认的目标列表
  const [activeContentPanel, setActiveContentPanel] = useState<string | null>(null);
  // 插件管理相关状态
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  // 获取插件扩展点数据
  const { getContentPanelExtensions, getProjectActionMenuItems } = usePlugins();
  const contentPanels: ContentPanelExtension[] = getContentPanelExtensions();
  const projectActionMenuItems: ProjectActionMenuItem[] = getProjectActionMenuItems();

  /**
   * 加载项目目标并计算进度
   */
  const loadProjectProgress = useCallback(async (projectId: number) => {
    try {
      const response = await apiClient.getGoals({ project_id: projectId });
      const goals = response?.list || [];
      const completed = goals.filter((g: Goal) => g.is_completed === 1).length;
      setProgressCache((prev) => ({
        ...prev,
        [projectId]: { total: goals.length, completed },
      }));
    } catch (error) {
      console.error("Failed to load project progress:", error);
    }
  }, []);

  /**
   * 刷新项目进度
   */
  const refreshProgress = useCallback(
    (projectId: number) => {
      loadProjectProgress(projectId);
    },
    [loadProjectProgress]
  );

  /**
   * 处理项目选择
   */
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  /**
   * 处理删除项目点击
   */
  const handleDeleteProjectClick = (project: Project, e: React.MouseEvent) => {
    openDeleteDialog(project, e);
  };

  /**
   * 加载项目列表
   */
  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjects();
      const projectList = response?.list || [];
      setProjects(projectList);
      if (projectList.length > 0 && !selectedProject) {
        setSelectedProject(projectList[0]);
      }
      // 预加载所有项目进度
      for (const project of projectList) {
        await loadProjectProgress(project.project_id);
      }
    } catch (error) {
      console.error("加载项目失败:", error);
      toast.error("加载项目失败，请检查后端服务是否正常运行");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理项目创建成功
   */
  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    setCreateDialogOpen(false);
    toast.success(`项目 "${newProject.name}" 创建成功`);
  };

  /**
   * 打开删除确认对话框
   */
  const openDeleteDialog = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  /**
   * 确认删除项目
   */
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await apiClient.deleteProject(projectToDelete.project_id);
      setProjects(
        projects.filter((p) => p.project_id !== projectToDelete.project_id)
      );
      if (selectedProject?.project_id === projectToDelete.project_id) {
        setSelectedProject(null);
      }
      toast.success("项目删除成功");
    } catch (error) {
      console.error("删除项目失败:", error);
      toast.error("删除项目失败");
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  /**
   * 处理目标变化，重新加载项目统计
   */
  const handleGoalChange = () => {
    if (selectedProject) {
      refreshProgress(selectedProject.project_id);
    }
  };

  /**
   * 切换内容面板
   */
  const handleContentPanelChange = (panelId: string | null) => {
    setActiveContentPanel(panelId);
  };

    // 将切换函数暴露到window，方便插件从项目操作菜单切换面板
  useEffect(() => {
    (window as any).__setActiveContentPanel = (panelId: string) => {
      setActiveContentPanel(panelId);
    };
    return () => {
      delete (window as any).__setActiveContentPanel;
    };
  }, []);

  // 当选中项目变化时，重置内容面板到默认
  useEffect(() => {
    setActiveContentPanel(null);
  }, [selectedProject]);

  // 初始化加载
  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 顶部标题栏 */}
      <header className="border-b bg-background z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Planner</h1>
          </div>
        </div>
      </header>

      {/* 主体内容：三栏布局 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 最左侧：功能选择栏 */}
        <FeatureSidebar
          selectedFeature={selectedFeature}
          onFeatureChange={setSelectedFeature}
        />

        {/* 中间：功能导航栏 - 根据选中的功能显示不同内容 */}
        {selectedFeature === "projects" && (
          <ProjectsNavigation
          projects={projects}
          selectedProject={selectedProject}
          onProjectSelect={handleProjectSelect}
          onDeleteProject={handleDeleteProjectClick}
          onCreateProject={() => setCreateDialogOpen(true)}
          loading={loading}
          progressCache={progressCache}
          projectActionMenuItems={projectActionMenuItems}
          activeContentPanel={activeContentPanel}
          onContentPanelChange={handleContentPanelChange}
        />
        )}

        {selectedFeature === "plugins" && (
          <PluginsNavigation
            selectedPlugin={selectedPlugin}
            onPluginSelect={setSelectedPlugin}
          />
        )}

        {/* 最右侧：主体内容区 - 根据选中的功能显示不同内容 */}
        <ContentArea
          selectedFeature={selectedFeature}
          selectedProject={selectedProject}
          onGoalChange={handleGoalChange}
          selectedPlugin={selectedPlugin}
          activeContentPanel={activeContentPanel}
          contentPanels={contentPanels}
        />
      </div>

      {/* 创建项目对话框 */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleProjectCreated}
      />

      {/* 删除项目确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除项目</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              你确定要删除项目 "{projectToDelete?.name}"
              吗？此操作将删除该项目下的所有目标，且无法撤销。
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProject}>
              删除
            </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast 通知 */}
      <Toaster />
    </div>
  );
}

/**
 * 主应用组件
 * 三栏布局：最左侧功能选择栏 + 中间功能导航栏 + 右侧主体内容区
 * 已将各部分提取为独立组件，保持主文件简洁
 */
function App() {
  return (
    <PluginProvider>
      <AppContent />
    </PluginProvider>
  );
}

export default App;
