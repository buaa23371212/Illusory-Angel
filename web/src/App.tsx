import { CreateProjectDialog } from "./components/CreateProjectDialog";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/ui/dialog";
import type { Project } from "./api/client";
import type { ContentPanelExtension, ProjectActionMenuItem } from "./plugins/types";
import { Toaster } from "./components/ui/sonner";
import { Target } from "lucide-react";
import { toast } from "sonner";
import { PluginProvider, usePlugins } from "./plugins";
import { AppStateProvider, useAppState } from "./store/AppState";
import { FeatureSidebar } from "./components/FeatureSidebar";
import { ProjectsNavigation } from "./components/ProjectsNavigation";
import { PluginsNavigation } from "./components/PluginsNavigation";
import { ContentArea } from "./components/ContentArea";
import "./App.css";

/**
 * 主应用内容组件
 * 使用usePlugins钩子获取插件扩展点数据
 * 使用独立的AppState管理全局状态
 */
function AppContent() {
  // 从独立状态管理获取状态和操作方法
  const { state, dispatch, confirmDeleteProject } = useAppState();

  // 获取插件扩展点数据
  const { getContentPanelExtensions, getProjectActionMenuItems } = usePlugins();
  const contentPanels: ContentPanelExtension[] = getContentPanelExtensions();
  const projectActionMenuItems: ProjectActionMenuItem[] = getProjectActionMenuItems();

  /**
   * 处理项目创建成功
   */
  const handleProjectCreated = (newProject: Project) => {
    dispatch({ type: "ADD_PROJECT", payload: newProject });
    dispatch({ type: "SET_CREATE_DIALOG", payload: false });
    toast.success(`项目 "${newProject.name}" 创建成功`);
  };

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
        {/* 最左侧：功能导航 */}
      <FeatureSidebar />

        {/* 中间：功能导航栏 - 根据选中的功能显示不同内容 */}
        {state.selectedFeature === "projects" && (
          <ProjectsNavigation
            projectActionMenuItems={projectActionMenuItems}
          />
        )}

        {state.selectedFeature === "plugins" && (
          <PluginsNavigation />
        )}

        {/* 最右侧：主体内容区 - 根据选中的功能显示不同内容 */}
        <ContentArea
          contentPanels={contentPanels}
        />
      </div>

      {/* 创建项目对话框 */}
      <CreateProjectDialog
        open={state.createDialogOpen}
        onOpenChange={(open) => dispatch({ type: "SET_CREATE_DIALOG", payload: open })}
        onCreated={handleProjectCreated}
      />

      {/* 删除项目确认对话框 */}
      <Dialog open={state.deleteDialogOpen} onOpenChange={(open) => 
        dispatch({ type: "SET_DELETE_DIALOG", payload: { open, project: null } })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除项目</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              你确定要删除项目 "{state.projectToDelete?.name}"
              吗？此操作将删除该项目下的所有目标，且无法撤销。
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => dispatch({ type: "SET_DELETE_DIALOG", payload: { open: false, project: null } })}
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
 * 使用AppStateProvider管理全局状态，方便插件扩展和状态共享
 */
function App() {
  return (
    <PluginProvider>
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </PluginProvider>
  );
}

export default App;
