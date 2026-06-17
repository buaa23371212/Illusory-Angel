import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import type { Project, Goal } from '../api/client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { CheckCircle2, MoreVertical, Plus, Trash2, Target, Calendar } from 'lucide-react'
import { toast } from 'sonner'

/**
 * 项目卡片组件属性
 */
interface ProjectCardProps {
  project: Project
  onDelete: (projectId: number) => void
  onUpdate: () => void
}

/**
 * 项目卡片组件
 * 显示项目信息、目标列表，支持目标的增删改查
 */
export function ProjectCard({ project, onDelete, onUpdate }: ProjectCardProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState('')

  // 加载目标列表
  const loadGoals = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getGoals({ project_id: project.project_id })
      setGoals(data?.list || [])
    } catch (error) {
      console.error('加载目标失败:', error)
      toast.error('加载目标失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 添加新目标
  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) {
      toast.error('请输入目标名称')
      return
    }

    try {
      const newGoal = await apiClient.createGoal({
        project_id: project.project_id,
        name: newGoalTitle.trim(),
        description: '',
      })
      setGoals([...goals, newGoal])
      setNewGoalTitle('')
      setAddDialogOpen(false)
      toast.success('目标添加成功')
      onUpdate()
    } catch (error) {
      console.error('添加目标失败:', error)
      toast.error('添加目标失败')
    }
  }

  // 切换目标完成状态
  const handleToggleGoal = async (goal: Goal) => {
    try {
      // 使用 toggleGoalComplete 专门切换完成状态
      const toggledGoal = await apiClient.toggleGoalComplete(goal.goal_id, (goal.is_completed !== 1))
      setGoals(goals.map(g => g.goal_id === goal.goal_id ? toggledGoal : g))
      onUpdate()
    } catch (error) {
      console.error('更新目标失败:', error)
      toast.error('更新目标失败')
    }
  }

  // 删除目标
  const handleDeleteGoal = async (goalId: number) => {
    try {
      await apiClient.deleteGoal(goalId)
      setGoals(goals.filter(g => g.goal_id !== goalId))
      toast.success('目标删除成功')
      onUpdate()
    } catch (error) {
      console.error('删除目标失败:', error)
      toast.error('删除目标失败')
    }
  }

  // 删除项目
  const handleDeleteProject = async () => {
    try {
      await apiClient.deleteProject(project.project_id)
      onDelete(project.project_id)
    } catch (error) {
      console.error('删除项目失败:', error)
      toast.error('删除项目失败')
    }
  }

  // 统计信息
  const completedCount = goals.filter(g => g.is_completed === 1).length

  // 组件挂载时加载目标
  useEffect(() => {
    loadGoals()
  }, [project.project_id])
  const totalCount = goals.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {project.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除项目
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        {/* 进度条 */}
        {totalCount > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">进度</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* 目标列表 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">目标列表</h4>
            <Button size="sm" variant="ghost" onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-1 h-3 w-3" />
              添加
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded-full bg-muted h-4 w-4 animate-pulse" />
                  <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Target className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>还没有目标</p>
              <p className="text-xs">点击上方添加按钮开始</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1">
              {goals.map((goal) => (
                <div
                  key={goal.goal_id}
                  className={`flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 group ${
                    goal.is_completed === 1 ? 'opacity-60' : ''
                  }`}
                >
                  <Checkbox
                    checked={goal.is_completed === 1}
                    onCheckedChange={() => handleToggleGoal(goal)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm break-words ${
                        goal.is_completed === 1 ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {goal.name}
                    </p>
                    {goal.description && (
                      <p className="text-xs text-muted-foreground break-words">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    onClick={() => handleDeleteGoal(goal.goal_id)}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>{completedCount}/{totalCount} 已完成</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(project.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </CardFooter>

      {/* 添加目标对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新目标</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">目标名称</Label>
              <Input
                id="goal-title"
                placeholder="输入目标名称"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddGoal}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除项目确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除项目</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              你确定要删除项目 "{project.name}" 吗？此操作将删除该项目下的所有目标，且无法撤销。
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteProject()
                setDeleteDialogOpen(false)
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}