/**
 * 闹钟设置菜单项组件
 * 在目标操作菜单中添加"闹钟设置"选项，点击后打开配置对话框
 */

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';
import type { Goal } from '@/api/client';

/**
 * 闹钟设置菜单项属性接口
 */
interface AlarmSettingsMenuItemProps {
  /** 目标数据 */
  goal: Goal;
  /** 项目ID（接口要求必须提供，但当前未使用） */
  projectId: number;
  /** 点击处理函数 */
  onClick: (e: React.MouseEvent) => void;
}

/**
 * 闹钟设置菜单项组件
 * 点击后触发打开闹钟配置对话框
 */
export function AlarmSettingsMenuItem({ goal, projectId: _projectId, onClick }: AlarmSettingsMenuItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发不必要的父元素点击事件（如卡片选中）
    e.stopPropagation();
    onClick(e);
  };

  return (
    <DropdownMenuItem onClick={handleClick}>
      <Settings className="mr-2 h-4 w-4" />
      闹钟设置
    </DropdownMenuItem>
  );
}

export default AlarmSettingsMenuItem;