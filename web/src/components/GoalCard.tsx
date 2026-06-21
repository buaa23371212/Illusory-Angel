import React, { useState } from 'react';
import { Card } from './ui/card';
import { CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import type { Goal } from '../api/client';
import { getGoalActionMenuItems, getGoalCardBadges } from '../plugins/registry';
import type { GoalActionMenuItem, GoalCardBadge } from '../plugins/types';
import { AlarmConfigDialog } from '../plugins/registered/alarm-clock/components/AlarmConfigDialog';

/**
 * 默认目标卡片组件属性接口
 */
interface GoalCardProps {
  /** 目标数据 */
  goal: Goal;
  /** 项目ID */
  projectId: number;
  /** 切换目标完成状态回调 */
  onToggleComplete: (goal: Goal) => void;
  /** 删除目标回调 */
  onDelete: (goalId: number) => void;
  /** 查看目标详情回调 */
  onViewDetail: (goal: Goal) => void;
}

/**
 * 默认目标卡片组件
 * 展示单个目标信息，包含操作菜单
 */
export function GoalCard({
  goal,
  projectId,
  onToggleComplete,
  onDelete,
  onViewDetail,
}: GoalCardProps) {
  // 获取所有注册的自定义目标操作菜单项
  const goalActionMenuItems: GoalActionMenuItem[] = getGoalActionMenuItems();
  // 获取所有注册的目标卡片标签
  const goalCardBadges: GoalCardBadge[] = getGoalCardBadges();

  // 闹钟对话框状态
  const [alarmDialogOpen, setAlarmDialogOpen] = useState(false);

  /**
   * 处理闹钟设置菜单项点击
   * 打开闹钟配置对话框
   */
  const handleAlarmSettingsClick = () => {
    setAlarmDialogOpen(true);
  };

  return (
    <>
      <Card className="transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 group">
            <Checkbox
              checked={goal.is_completed === 1}
              onCheckedChange={() => onToggleComplete(goal)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2">
                <p
                  className={`text-base break-words ${
                    goal.is_completed === 1 ? 'line-through text-muted-foreground' : 'font-medium'
                  }`}
                >
                  {goal.name}
                </p>
                {/* 渲染插件注册的目标卡片标签 */}
                {goalCardBadges.map((badge) => {
                  const BadgeComponent = badge.component;
                  return (
                    <BadgeComponent
                      key={badge.id}
                      goal={goal}
                      projectId={projectId}
                    />
                  );
                })}
              </div>
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
                  size="icon-xs"
                  className={`h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* 查看详情操作 */}
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(goal);
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  查看详情
                </DropdownMenuItem>
                {/* 分隔线 */}
                {goalActionMenuItems.length > 0 && <DropdownMenuSeparator />}
                {/* 渲染插件注册的自定义目标操作菜单项 */}
                {goalActionMenuItems.map((item) => {
                  // 如果是闹钟设置，使用自定义点击处理器
                  if (item.id === 'alarm-settings') {
                    const Icon = item.icon;
                    return (
                      <React.Fragment key={item.id}>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlarmSettingsClick();
                          }}
                        >
                          {Icon && <Icon className="mr-2 h-4 w-4" />}
                          {item.label}
                        </DropdownMenuItem>
                        {item.separator && <DropdownMenuSeparator />}
                      </React.Fragment>
                    );
                  }
                  // 如果提供了component，则使用组件渲染
                  if (item.component) {
                    const ItemComponent = item.component;
                    return (
                      <ItemComponent
                        key={item.id}
                        goal={goal}
                        projectId={projectId}
                      />
                    );
                  }
                  // 否则使用默认方式渲染
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={item.id}>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          item.onClick?.(goal, projectId);
                        }}
                      >
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        {item.label}
                      </DropdownMenuItem>
                      {item.separator && <DropdownMenuSeparator />}
                    </React.Fragment>
                  );
                })}

                {/* 删除目标选项 */}
                {goalActionMenuItems.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(goal.goal_id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* 闹钟配置对话框 - 在DropdownMenu外部渲染 */}
      <AlarmConfigDialog
        open={alarmDialogOpen}
        onOpenChange={setAlarmDialogOpen}
        goalId={goal.goal_id}
        goalName={goal.name}
        onSaved={() => {
          // 配置保存后触发闹钟标签刷新
          if (typeof window !== 'undefined' && (window as any).__alarmRefresh) {
            const refreshFn = (window as any).__alarmRefresh[goal.goal_id];
            if (typeof refreshFn === 'function') {
              refreshFn();
            }
          }
        }}
      />
    </>
  );
}

export default GoalCard;