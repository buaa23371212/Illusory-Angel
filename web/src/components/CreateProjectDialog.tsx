import { useState } from 'react'
import { apiClient } from '../api/client'
import type { Project } from '../api/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'

/**
 * 创建项目对话框属性
 */
interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (project: Project) => void
}

/**
 * 创建项目对话框组件
 * 提供表单用于创建新项目
 */
export function CreateProjectDialog({ open, onOpenChange, onCreated }: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入项目名称')
      return
    }

    try {
      setIsCreating(true)
      const project = await apiClient.createProject({
        name: name.trim(),
        description: description.trim(),
      })
      onCreated(project)
      // 重置表单
      setName('')
      setDescription('')
    } catch (error) {
      console.error('创建项目失败:', error)
      toast.error('创建项目失败，请检查后端服务是否正常运行')
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * 对话框关闭时重置表单
   */
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('')
      setDescription('')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新项目</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">项目名称</Label>
            <Input
              id="project-name"
              placeholder="输入项目名称，例如：每日健身计划"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">项目描述</Label>
            <Textarea
              id="project-description"
              placeholder="描述一下这个项目的目标（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isCreating}>
            {isCreating ? '创建中...' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}