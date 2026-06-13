/**
 * 优先级标签组件
 * 在目标卡片中显示优先级标签
 */

import type { Goal } from '../../../../api/client';

/**
 * 组件属性接口
 */
interface PriorityBadgeProps {
  /** 目标数据 */
  goal: Goal;
  /** 项目ID */
  projectId: number;
}

/**
 * 优先级定义（根据priority数值映射）
 * 1-2 = 高优先级，3 = 中优先级，4-5 = 低优先级
 */
const priorityConfig = {
  high: {
    label: '高',
    className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  },
  medium: {
    label: '中',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  low: {
    label: '低',
    className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  },
};

type PriorityLevel = keyof typeof priorityConfig;

/**
 * 从goal的priority数值转换为优先级级别
 * 1-2 = 高优先级，3 = 中优先级，4-5 = 低优先级
 */
function getPriorityLevel(priority: number): PriorityLevel {
  if (priority <= 2) return 'high';
  if (priority === 3) return 'medium';
  return 'low';
}

/**
 * 优先级标签组件
 * 在目标卡片中显示优先级标签
 */
export function PriorityBadge({ goal }: PriorityBadgeProps) {
  const priorityValue = goal.priority ?? 3;
  const level = getPriorityLevel(priorityValue);
  const config = priorityConfig[level];
  
  return (
    <div className="mt-2">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.label}优先级 ({priorityValue})
      </span>
    </div>
  );
}