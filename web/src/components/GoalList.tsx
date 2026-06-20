import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import type { Project, Goal } from '../api/client'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Plus, Target, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { usePluginRegistry } from '../plugins/hooks'
import { GoalCard } from './GoalCard'

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

  // 查看目标详情对话框状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null)
  const [detailConstraints, setDetailConstraints] = useState<any[]>([])
  // 详情对话框编辑模式状态
  const [isDetailEditing, setIsDetailEditing] = useState(false)
  const [detailEditTitle, setDetailEditTitle] = useState('')
  const [detailEditDescription, setDetailEditDescription] = useState('')

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

  /**
   * 打开查看目标详情对话框
   * 加载目标详情（包含约束）并初始化编辑状态
   */
  /**
   * 查看目标详情
   */
  const handleViewDetail = async (goal: Goal) => {
    setDetailGoal(goal);
    setDetailEditTitle(goal.name);
    setDetailEditDescription(goal.description || '');
    setIsDetailEditing(false);
    setDetailDialogOpen(true);
  };

  /**
   * 保存详情对话框中的编辑
   * 同时更新基本信息和优先级约束
   */
  /**
   * 保存目标详情编辑
   */
  const handleSaveDetailEdit = async () => {
    if (!detailGoal) return;
    try {
      // 更新目标基本信息
      await apiClient.updateGoal(detailGoal.goal_id, {
        name: detailEditTitle.trim(),
        description: detailEditDescription.trim() || null
      });

      // 重新加载目标列表
      loadGoals();
      // 更新详情目标数据
      setDetailGoal({
        ...detailGoal,
        name: detailEditTitle.trim(),
        description: detailEditDescription.trim() || null
      });
      setIsDetailEditing(false);
      toast.success('目标更新成功');
    } catch (err) {
      console.error('更新目标失败:', err);
      toast.error('更新目标失败');
    }
  };



  // 获取插件注册表中的目标卡片渲染器
  const { pluginRegistry } = usePluginRegistry();
  const goalCardRenderers = pluginRegistry.getGoalCardRenderers();
  // 获取所有注册的表单字段扩展
  const formFieldExtensions = pluginRegistry.getFormFieldExtensions();

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
              // 使用默认卡片组件
              return (
                <GoalCard
                  key={goal.goal_id}
                  goal={goal}
                  projectId={selectedProject.project_id}
                  onToggleComplete={handleToggleGoal}
                  onDelete={handleDeleteGoal}
                  onViewDetail={handleViewDetail}
                />
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
            {/* 渲染插件注册的表单字段扩展 */}
            {formFieldExtensions.sort((a: any, b: any) => a.order - b.order).map((extension: any) => {
              const ExtensionComponent = extension.component;
              // TODO: 目前只支持创建目标，扩展字段由插件通过约束表存储
              const extensionValues = {};
              const handleExtensionChange = (_field: string, _value: any) => {
                // 扩展字段由插件自行管理，后续统一保存
              };
              return (
                <div key={extension.id} className="plugin-form-field-extension">
                  <ExtensionComponent
                    values={extensionValues}
                    onChange={handleExtensionChange}
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddGoal}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看/编辑目标详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isDetailEditing ? '编辑目标' : '目标详情'}</DialogTitle>
          </DialogHeader>
          {detailGoal && (
            <div className="space-y-4 py-4">
              {/* 基本信息 */}
              {isDetailEditing ? (
                // 编辑模式
                <>
                  <div className="space-y-2">
                    <Label htmlFor="detail-edit-title">目标名称</Label>
                    <Input
                      id="detail-edit-title"
                      placeholder="输入目标名称"
                      value={detailEditTitle}
                      onChange={(e) => setDetailEditTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="detail-edit-description">目标描述（可选）</Label>
                    <Input
                      id="detail-edit-description"
                      placeholder="输入目标描述"
                      value={detailEditDescription}
                      onChange={(e) => setDetailEditDescription(e.target.value)}
                    />
                  </div>
                  {/* 渲染插件注册的表单字段扩展 */}
                  {formFieldExtensions.sort((a: any, b: any) => a.order - b.order).map((extension: any) => {
                    const ExtensionComponent = extension.component;
                    const extensionValues = {};
                    const handleExtensionChange = (_field: string, _value: any) => {
                      // 扩展字段由插件自行管理
                    };
                    return (
                      <div key={extension.id} className="plugin-form-field-extension">
                        <ExtensionComponent
                          values={extensionValues}
                          onChange={handleExtensionChange}
                        />
                      </div>
                    );
                  })}
                </>
              ) : (
                // 查看模式
                <>
                  <div className="space-y-2">
                    <Label>目标名称</Label>
                    <div className="px-3 py-2 rounded-md border bg-muted/50">
                      {detailGoal.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>目标描述</Label>
                    {detailGoal.description ? (
                      <div className="px-3 py-2 rounded-md border bg-muted/50 min-h-[80px] whitespace-pre-wrap">
                        {detailGoal.description}
                      </div>
                    ) : (
                      <div className="px-3 py-2 rounded-md border bg-muted/50 text-muted-foreground italic">
                        无描述
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>目标ID</Label>
                      <div className="px-3 py-2 rounded-md border bg-muted/50">
                        {detailGoal.goal_id}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>完成状态</Label>
                      <div className="px-3 py-2 rounded-md border bg-muted/50">
                        {detailGoal.is_completed === 1 ? '已完成' : '未完成'}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>创建时间</Label>
                      <div className="px-3 py-2 rounded-md border bg-muted/50">
                        {detailGoal.created_at ? new Date(detailGoal.created_at).toLocaleString('zh-CN') : '未知'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>更新时间</Label>
                      <div className="px-3 py-2 rounded-md border bg-muted/50">
                        {detailGoal.updated_at ? new Date(detailGoal.updated_at).toLocaleString('zh-CN') : '未知'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter className="flex justify-between">
            {isDetailEditing ? (
              // 编辑模式底部按钮
              <>
                <Button variant="outline" onClick={() => setIsDetailEditing(false)}>
                  取消编辑
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                    关闭
                  </Button>
                  <Button onClick={handleSaveDetailEdit}>保存更改</Button>
                </div>
              </>
            ) : (
              // 查看模式底部按钮
              <>
                <Button variant="default" onClick={() => setIsDetailEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  编辑
                </Button>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  关闭
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}