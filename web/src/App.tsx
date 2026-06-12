import { useState, useEffect } from 'react'
import { ProjectCard } from './components/ProjectCard'
import { CreateProjectDialog } from './components/CreateProjectDialog'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { apiClient } from './api/client'
import type { Project } from './api/client'
import { Toaster } from './components/ui/sonner'
import { Separator } from './components/ui/separator'
import { Skeleton } from './components/ui/skeleton'
import { Plus, Target } from 'lucide-react'
import { toast } from 'sonner'
import './App.css'

/**
 * 主应用组件
 * 管理项目列表状态，处理项目创建和删除
 */
function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // 加载项目列表
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

  // 初始化加载
  useEffect(() => {
    loadProjects()
  }, [])

  // 处理项目创建成功
  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects])
    setCreateDialogOpen(false)
    toast.success(`项目 "${newProject.name}" 创建成功`)
  }

  // 处理项目删除
  const handleProjectDeleted = (projectId: number) => {
    setProjects(projects.filter(p => p.project_id !== projectId))
    toast.success('项目删除成功')
  }

  // 统计信息
  const totalProjects = projects.length

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">养成计划器</h1>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新建项目
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 统计卡片 */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">项目总数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Separator className="my-6" />

        {/* 项目列表 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">我的项目</h2>
          </div>

          {loading ? (
            // 加载骨架屏
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            // 空状态
            <Card className="text-center py-12">
              <CardContent>
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">还没有项目</h3>
                <p className="text-muted-foreground mb-6">创建第一个项目开始你的养成计划吧</p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  创建第一个项目
                </Button>
              </CardContent>
            </Card>
          ) : (
            // 项目列表
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard
                  key={project.project_id}
                  project={project}
                  onDelete={handleProjectDeleted}
                  onUpdate={loadProjects}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 创建项目对话框 */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleProjectCreated}
      />

      {/* Toast 通知 */}
      <Toaster />
    </div>
  )
}

export default App
