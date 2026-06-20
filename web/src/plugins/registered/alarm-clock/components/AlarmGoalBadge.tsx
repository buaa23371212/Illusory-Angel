import { Badge } from '@/components/ui/badge';
import { AlarmClock } from 'lucide-react';
import type { Goal } from '@/api/client';
import { useEffect, useState } from 'react';
import { getAlarmConfig } from '../api';
import type { AlarmConfig } from '../types';

/**
 * 闹钟标签组件属性接口
 */
interface AlarmGoalBadgeProps {
  /** 目标数据 */
  goal: Goal;
  /** 项目ID（接口要求必须提供，但当前未使用） */
  projectId: number;
}

/**
 * 闹钟标签组件
 * 在目标卡片标题区域显示闹钟图标标签，表示该目标配置了闹钟提醒
 */
export function AlarmGoalBadge({ goal, projectId: _projectId }: AlarmGoalBadgeProps) {
  const [alarmConfig, setAlarmConfig] = useState<AlarmConfig | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * 加载当前目标的闹钟配置
   */
  const loadAlarmConfig = async () => {
    try {
      const config = await getAlarmConfig(goal.goal_id);
      setAlarmConfig(config);
    } catch (error) {
      console.error('加载闹钟配置失败:', error);
      setAlarmConfig(null);
    }
  };

  // 加载闹钟配置，当目标ID或刷新触发变化时重新加载
  useEffect(() => {
    loadAlarmConfig();
  }, [goal.goal_id, refreshTrigger]);

  /**
   * 强制刷新配置
   */
  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // 将refresh方法暴露给外部，让对话框保存后可以触发刷新
  // 使用ref将refresh方法保存到window上，方便调用
  if (typeof window !== 'undefined') {
    (window as any).__alarmRefresh = (window as any).__alarmRefresh || {};
    (window as any).__alarmRefresh[goal.goal_id] = refresh;
  }

  // 如果没有配置闹钟，不显示标签
  if (!alarmConfig) {
    return null;
  }

  // 显示闹钟提醒标签
  return (
    <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
      <AlarmClock className="h-3 w-3" />
      闹钟
    </Badge>
  );
}

export default AlarmGoalBadge;