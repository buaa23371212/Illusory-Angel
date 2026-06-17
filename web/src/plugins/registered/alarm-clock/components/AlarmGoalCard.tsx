import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Trash2, AlarmClock, MoreVertical, Settings } from 'lucide-react';
import type { Goal } from '@/api/client';
import { getGoalActionMenuItems } from '@/plugins/registry';
import type { GoalActionMenuItem } from '@/plugins/types';
import type { AlarmConfig } from '../types';
import { useEffect, useState } from 'react';
import { getAlarmConfig } from '../api';
import AlarmConfigDialog from './AlarmConfigDialog';

/**
 * 带闹钟提醒的目标卡片组件属性接口
 * 自定义目标卡片渲染器，在目标卡片显示闹钟提醒指示器
 */
interface AlarmGoalCardProps {
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
 * 带闹钟提醒指示器的目标卡片组件
 * 在标题栏显示闹钟提醒徽章（如果配置了闹钟）
 * 保留折叠工具栏设计，支持插件自定义目标操作菜单项
 */
export function AlarmGoalCard({
  goal,
  projectId,
  onToggleComplete,
  onDelete,
}: AlarmGoalCardProps) {
  const [alarmConfig, setAlarmConfig] = useState<AlarmConfig | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 加载闹钟配置
  useEffect(() => {
    loadAlarmConfig();
  }, [goal.goal_id]);

  /**
   * 加载目标的闹钟配置
   */
  const loadAlarmConfig = async () => {
    try {
      const config = await getAlarmConfig(goal.goal_id);
      setAlarmConfig(config);
    } catch (err) {
      console.error('加载闹钟配置失败:', err);
    }
  };

  // 已经不需要handleSave和handleDelete，因为AlarmConfigDialog内部处理保存和删除

  // 获取所有注册的自定义目标操作菜单项
  const goalActionMenuItems: GoalActionMenuItem[] = getGoalActionMenuItems();

  return (
    <>
      <Card className={`p-4 hover:shadow-md transition-shadow ${alarmConfig?.enabled ? 'border-primary/30' : ''}`}>
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
              {/* 如果配置了启用的闹钟，显示闹钟徽章 */}
              {alarmConfig?.enabled && (
                <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                  <AlarmClock className="w-3 h-3 mr-1" />
                  {alarmConfig.time}
                </Badge>
              )}
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
              {/* 闹钟设置菜单项 */}
              <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                闹钟设置
              </DropdownMenuItem>
              {/* 如果有自定义菜单项，添加分隔线 */}
              {goalActionMenuItems.length > 0 && (
                <>
                  <DropdownMenuSeparator />
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
                  <DropdownMenuSeparator />
                </>
              )}
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

      {/* 闹钟配置对话框 */}
      <AlarmConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goalId={goal.goal_id}
        goalName={goal.name}
        onSaved={() => {
          // 保存后重新加载配置
          loadAlarmConfig();
        }}
      />
    </>
  );
}

export default AlarmGoalCard;