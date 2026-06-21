/**
 * 爆枪英雄养成 - 树形目标卡片组件
 * 展示带缩进层级关系的目标节点，参考 GoalCard 样式设计
 */

import React from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { Button } from '../../../../components/ui/button';
import { MoreVertical, Plus, Trash2 } from 'lucide-react';

/**
 * 树形目标卡片组件属性接口
 */
interface BqtjGoalCardProps {
  /** 目标 ID */
  goalId: number;
  /** 目标名称 */
  name: string;
  /** 在树中的层级深度（0=根节点） */
  depth: number;
  /** 是否显示左侧引导线 */
  showGuideLine: boolean;
  /** 删除目标回调 */
  onDelete: (goalId: number) => void;
  /** 添加子目标回调 */
  onAddChild: (parentId: number) => void;
}

/**
 * 树形目标卡片组件
 * 参考 GoalCard 样式设计，使用 Card + CardContent + DropdownMenu，
 * 通过 paddingLeft 实现层级缩进，不同深度使用不同背景色
 */

// 不同层级对应的背景色（使用 CSS 变量，支持暗黑模式）
const depthColors = [
  'bg-[var(--color-depth-0,oklch(0.45_0.12_260))]',  // 根节点（蓝紫色）
  'bg-[var(--color-depth-1,oklch(0.55_0.10_240))]',  // 第1层（蓝色）
  'bg-[var(--color-depth-2,oklch(0.60_0.08_200))]',  // 第2层（青蓝）
  'bg-[var(--color-depth-3,oklch(0.65_0.06_160))]',  // 第3层（青绿）
  'bg-[var(--color-depth-4,oklch(0.70_0.05_140))]',  // 第4层（绿色）
  'bg-[var(--color-depth-5,oklch(0.75_0.04_120))]',  // 第5层（黄绿）
];

export function BqtjGoalCard({
  goalId,
  name,
  depth,
  showGuideLine,
  onDelete,
  onAddChild,
}: BqtjGoalCardProps): React.ReactElement {
  // 根据深度选择背景色，超过5层取最后一层
  const depthClass = depthColors[Math.min(depth, depthColors.length - 1)];
  return (
    <div
      className="relative flex items-center"
      style={{ paddingLeft: `${depth * 2 + 0.5}rem` }}
    >
      {/* 左侧引导线：每级子目标显示一条垂直连接线 */}
      {showGuideLine && (
        <span
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-sm opacity-40"
          style={{
            left: `${depth * 2 + 0.25}rem`,
            backgroundColor: 'var(--color-border)',
          }}
        />
      )}

      <Card size="sm" className={`w-full ${depthClass}`}>
        <CardContent className="flex items-center justify-between gap-2 py-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {name}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="h-6 w-6 text-muted-foreground opacity-0 group-hover/card:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddChild(goalId)}>
                <Plus className="mr-2 h-4 w-4" />
                添加子目标
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(goalId)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
    </div>
  );
}

export default BqtjGoalCard;