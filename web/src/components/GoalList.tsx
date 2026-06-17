import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import type { Project, Goal } from '../api/client'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Trash2, Plus, Target, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import { usePluginRegistry } from '../plugins/hooks'
import { getGoalActionMenuItems } from '../plugins/registry'
import type { GoalActionMenuItem } from '../plugins/types'

/**
 * 目标列表组件属性
 */
interface GoalListProps {
  selectedProject: Project | null
  onGoalChange: () => void
}

/**
 * 目标列表组件
 * 在内容区展示选中项目的所有目标，支持增删改查操作
 * 如果插件注册了目标卡片渲染器，则使用插件提供的渲染方式
 */
export function GoalList({ selectedProject, onGoalChange }: GoalListProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newGoalTitle, setNewGoalTitle] = useState('')
  const [newGoalDescription, setNewGoalDescription] = useState('')

  /**
   * 加载目标列表
   */
  const loadGoals = async () => {
    if (!selectedProject) return

    try {
      setIsLoading(true)
      const data = await apiClient.getGoals({ project_id: selectedProject.project_id })
      setGoals(data?.list || [])
    } catch (error) {
      console.error('加载目标失败:', error)
      toast.error('加载目标失败')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 添加新目标
   */
  const handleAddGoal = async () => {
    if (!selectedProject) return
    if (!newGoalTitle.trim()) {
      toast.error('请输入目标名称')
      return
    }

    try {
      const newGoal = await apiClient.createGoal({
        project_id: selectedProject.project_id,
        name: newGoalTitle.trim(),
        description: newGoalDescription.trim() || null,
      })
      setGoals([...goals, newGoal])
      setNewGoalTitle('')
      setNewGoalDescription('')
      setAddDialogOpen(false)
      toast.success('目标添加成功')
      onGoalChange()
    } catch (error) {
      console.error('添加目标失败:', error)
      toast.error('添加目标失败')
    }
  }

  /**
   * 切换目标完成状态
   */
  const handleToggleGoal = async (goal: Goal) => {
    try {
      const toggledGoal = await apiClient.toggleGoalComplete(goal.goal_id, (goal.is_completed !== 1))
      setGoals(goals.map(g => g.goal_id === goal.goal_id ? toggledGoal : g))
      onGoalChange()
    } catch (error) {
      console.error('更新目标失败:', error)
      toast.error('更新目标失败')
    }
  }

  /**
   * 删除目标
   */
  const handleDeleteGoal = async (goalId: number) => {
    try {
      await apiClient.deleteGoal(goalId)
      setGoals(goals.filter(g => g.goal_id !== goalId))
      toast.success('目标删除成功')
      onGoalChange()
    } catch (error) {
      console.error('删除目标失败:', error)
      toast.error('删除目标失败')
    }
  }

  // 获取插件注册表中的目标卡片渲染器
  const { pluginRegistry } = usePluginRegistry();
  const goalCardRenderers = pluginRegistry.getGoalCardRenderers();
  // 获取所有注册的目标操作菜单项
  const goalActionMenuItems: GoalActionMenuItem[] = getGoalActionMenuItems();

  // 如果有自定义目标卡片渲染器，使用第一个注册的渲染器替换单个卡片设计
  // TODO: 未来可以支持用户选择使用哪个渲染器
  const customCardRenderer = goalCardRenderers.length > 0 ? goalCardRenderers[0] : null;

  // 当选中项目变化时重新加载目标
  useEffect(() => {
    loadGoals()
  }, [selectedProject?.project_id])

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="text-center py-12 max-w-md w-full">
          <CardContent>
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">请选择一个项目</h3>
            <p className="text-muted-foreground">从左侧导航栏选择一个项目查看目标</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 项目信息和添加按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
          {selectedProject.description && (
            <p className="text-muted-foreground mt-1">{selectedProject.description}</p>
          )}
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加目标
        </Button>
      </div>

      {/* 目标列表 */}
      <div className="space-y-3">
        {isLoading ? (
          // 加载骨架屏
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-muted h-5 w-5 animate-pulse" />
                    <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          // 空状态
          <Card className="text-center py-12">
            <CardContent>
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">还没有目标</h3>
              <p className="text-muted-foreground mb-6">点击右上角"添加目标"开始你的养成计划</p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                添加第一个目标
              </Button>
            </CardContent>
          </Card>
        ) : (
          // 目标列表 - 按顺序从上到下展示
          <div className="space-y-3">
            {goals.map((goal) => {
              // 如果有自定义卡片渲染器，使用自定义渲染器替换单个卡片设计
              if (customCardRenderer) {
                const CustomCardComponent = customCardRenderer.component;
                return (
                  <CustomCardComponent
                    key={goal.goal_id}
                    goal={goal}
                    projectId={selectedProject.project_id}
                    onToggleComplete={handleToggleGoal}
                    onDelete={handleDeleteGoal}
                  />
                );
              }
              // 使用默认卡片设计
              return (
                <Card key={goal.goal_id} className="transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={goal.is_completed === 1}
                        onCheckedChange={() => handleToggleGoal(goal)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-base break-words ${
                            goal.is_completed === 1 ? 'line-through text-muted-foreground' : 'font-medium'
                          }`}
                        >
                          {goal.name}
                        </p>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground break-words mt-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      {/* 目标操作折叠工具栏 */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* 渲染插件注册的自定义目标操作菜单项 */}
                          {goalActionMenuItems.map((item) => (
                            <DropdownMenuItem
                              key={item.id}
                              onClick={() => {
                                if (selectedProject) {
                                  item.onClick(goal, selectedProject.project_id);
                                }
                              }}
                            >
                              {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                              {item.label}
                            </DropdownMenuItem>
                          ))}
                          {/* 如果有自定义菜单项且有删除选项，添加分隔线 */}
                          {goalActionMenuItems.length > 0 && <DropdownMenuSeparator />}
                          {/* 默认删除操作 */}
                          <DropdownMenuItem
                            onClick={() => handleDeleteGoal(goal.goal_id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-description">目标描述（可选）</Label>
              <Input
                id="goal-description"
                placeholder="输入目标描述"
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
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
    </div>
  )
}