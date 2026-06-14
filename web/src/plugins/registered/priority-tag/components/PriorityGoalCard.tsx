import { Card } from '../../../../components/ui/card';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../../../components/ui/dropdown-menu';
import { Trash2, Flag, MoreVertical } from 'lucide-react';
import type { Goal } from '../../../../api/client';
import { getGoalActionMenuItems } from '../../../../plugins/registry';
import type { GoalActionMenuItem } from '../../../../plugins/types';

/**
 * 优先级标签颜色映射
 */
const priorityColors: Record<number, string> = {
  1: 'bg-red-500 hover:bg-red-600',
  2: 'bg-yellow-500 hover:bg-yellow-600',
  3: 'bg-blue-500 hover:bg-blue-600',
  4: 'bg-gray-500 hover:bg-gray-600',
};

/**
 * 优先级标签文本
 */
const priorityLabels: Record<number, string> = {
  1: '高',
  2: '中高',
  3: '中',
  4: '低',
};

/**
 * 优先级目标卡片组件属性接口
 * 自定义目标卡片渲染器只替换单个卡片设计
 */
interface PriorityGoalCardProps {
  /** 目标数据 */
  goal: Goal;
  /** 项目ID */
  projectId: number;
  /** 切换目标完成状态回调 */
  onToggleComplete: (goal: Goal) => void;
  /** 删除目标回调 */
  onDelete: (goalId: number) => void;
}

/**
 * 带优先级标签的目标卡片组件
 * 根据目标优先级显示不同颜色的标签，高优先级会有特殊边框样式
 * 保留折叠工具栏设计，支持插件自定义目标操作菜单项
 */
export function PriorityGoalCard({
  goal,
  projectId,
  onToggleComplete,
  onDelete,
}: PriorityGoalCardProps) {
  const priority = goal.priority ?? 3;
  // 获取所有注册的自定义目标操作菜单项
  const goalActionMenuItems: GoalActionMenuItem[] = getGoalActionMenuItems();

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${priority <= 2 ? 'border-destructive/30' : ''}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={goal.is_completed === 1}
          onCheckedChange={() => onToggleComplete(goal)}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3
              className={`font-medium leading-tight ${
                goal.is_completed === 1
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              }`}
            >
              {goal.name}
            </h3>
            <Badge
              className={`${priorityColors[priority]} text-white shrink-0`}
            >
              <Flag className="w-3 h-3 mr-1" />
              {priorityLabels[priority]}
            </Badge>
          </div>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
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
                  item.onClick(goal, projectId);
                }}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.label}
              </DropdownMenuItem>
            ))}
            {/* 如果有自定义菜单项，添加分隔线 */}
            {goalActionMenuItems.length > 0 && <DropdownMenuSeparator />}
            {/* 默认删除操作 */}
            <DropdownMenuItem
              onClick={() => onDelete(goal.goal_id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

export default PriorityGoalCard;