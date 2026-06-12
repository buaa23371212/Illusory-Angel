import { useState, useEffect } from 'react'
import { CreateProjectDialog } from './components/CreateProjectDialog'
import { GoalList } from './components/GoalList'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { apiClient } from './api/client'
import type { Project } from './api/client'
import { Toaster } from './components/ui/sonner'
import { Skeleton } from './components/ui/skeleton'
import { Plus, Target, MoreVertical, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog'
import { toast } from 'sonner'
import './App.css'

/**
 * 主应用组件
 * 左侧导航栏显示项目列表，右侧内容区显示选中项目的目标
 */
function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  /**
   * 加载项目列表
   */
  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getProjects()
      setProjects(data?.list || [])
    } catch (error) {
      console.error('加载项目失败:', error)
      toast.error('加载项目失败，请检查后端服务是否正常运行')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 处理项目创建成功
   */
  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects])
    setSelectedProject(newProject)
    setCreateDialogOpen(false)
    toast.success(`项目 "${newProject.name}" 创建成功`)
  }

  /**
   * 打开删除确认对话框
   */
  const openDeleteDialog = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  /**
   * 确认删除项目
   */
  const confirmDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      await apiClient.deleteProject(projectToDelete.project_id)
      setProjects(projects.filter(p => p.project_id !== projectToDelete.project_id))
      if (selectedProject?.project_id === projectToDelete.project_id) {
        setSelectedProject(null)
      }
      toast.success('项目删除成功')
    } catch (error) {
      console.error('删除项目失败:', error)
      toast.error('删除项目失败')
    } finally {
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }

  /**
   * 处理目标变化，重新加载项目统计
   */
  const handleGoalChange = () => {
    loadProjects()
  }

  // 初始化加载
  useEffect(() => {
    loadProjects()
  }, [])

  // 统计信息
  const totalProjects = projects.length

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 顶部标题栏 */}
      <header className="border-b bg-background z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Planner</h1>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </Button>
        </div>
      </header>

      {/* 主体内容：左侧导航 + 右侧内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航栏 - 项目列表 */}
        <aside className="w-80 border-r bg-muted/30 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">我的项目</h2>
              <span className="text-sm text-muted-foreground">{totalProjects} 个项目</span>
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
                <Button size="sm" className="w-full" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建项目
                </Button>
              </div>
            ) : (
              // 项目列表
              <div className="space-y-1">
                {projects.map((project) => (
                  <button
                    key={project.project_id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-3 rounded-lg transition-colors group flex items-start justify-between ${
                      selectedProject?.project_id === project.project_id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`font-medium truncate ${
                        selectedProject?.project_id === project.project_id
                          ? 'text-primary-foreground'
                          : ''
                      }`}>
                        {project.name}
                      </p>
                      {project.description && (
                        <p className={`text-xs truncate mt-1 ${
                          selectedProject?.project_id === project.project_id
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        }`}>
                          {project.description}
                        </p>
                      )}
                      <p className={`text-xs mt-1 ${
                        selectedProject?.project_id === project.project_id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(project.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className={`h-6 w-6 ${
                            selectedProject?.project_id === project.project_id
                              ? 'text-primary-foreground hover:bg-primary-foreground/20'
                              : 'opacity-0 group-hover:opacity-100'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => openDeleteDialog(project, e)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除项目
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* 右侧内容区 - 目标列表 */}
        <main className="flex-1 overflow-y-auto p-6">
          <GoalList
            selectedProject={selectedProject}
            onGoalChange={handleGoalChange}
          />
        </main>
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
              你确定要删除项目 "{projectToDelete?.name}" 吗？此操作将删除该项目下的所有目标，且无法撤销。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
  )
}

export default App
