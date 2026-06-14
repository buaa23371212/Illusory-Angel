import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { apiClient } from '../../../../api/client';
import type { Project } from '../../../../api/client';
import { CheckCircle2, Target, TrendingUp, Clock } from 'lucide-react';

/**
 * 统计面板组件属性接口
 */
interface StatisticsPanelProps {
  /** 当前选中的项目 */
  selectedProject: Project;
  /** 目标变化回调（内容区面板接口要求） */
  onGoalChange: () => void;
}

/**
 * 项目统计数据接口
 */
interface ProjectStatistics {
  totalGoals: number;
  completedGoals: number;
  pendingGoals: number;
  completionRate: number;
}

/**
 * 项目统计面板组件
 * 在项目内容区显示项目统计信息
 */
export function StatisticsPanel({ selectedProject, onGoalChange }: StatisticsPanelProps) {
  const [statistics, setStatistics] = useState<ProjectStatistics>({
    totalGoals: 0,
    completedGoals: 0,
    pendingGoals: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // 保留onGoalChange引用以避免TypeScript错误
  onGoalChange;

  /**
   * 加载项目目标并计算统计信息
   */
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getGoals({
          project_id: selectedProject.project_id,
        });
        const goals = response?.list || [];
        
        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => g.is_completed === 1).length;
        const pendingGoals = totalGoals - completedGoals;
        const completionRate = totalGoals > 0
          ? Math.round((completedGoals / totalGoals) * 100)
          : 0;

        setStatistics({
          totalGoals,
          completedGoals,
          pendingGoals,
          completionRate,
        });
      } catch (error) {
        console.error('加载统计信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [selectedProject.project_id]);

  if (loading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        加载统计数据中...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* 总体进度卡片 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">总体完成度</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-primary mb-2">
            {statistics.completionRate}%
          </div>
          {/* 进度条 */}
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${statistics.completionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 各项统计卡片 */}
      <div className="grid grid-cols-2 gap-3">
        {/* 总目标数 */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <Target className="h-5 w-5 text-blue-500 mb-1" />
              <p className="text-xs text-muted-foreground">总目标</p>
              <p className="text-lg font-bold">{statistics.totalGoals}</p>
            </div>
          </CardContent>
        </Card>

        {/* 已完成 */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
              <p className="text-xs text-muted-foreground">已完成</p>
              <p className="text-lg font-bold text-green-600">{statistics.completedGoals}</p>
            </div>
          </CardContent>
        </Card>

        {/* 进行中 */}
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-5 w-5 text-orange-500 mb-1" />
              <p className="text-xs text-muted-foreground">进行中</p>
              <p className="text-lg font-bold text-orange-600">{statistics.pendingGoals}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 提示信息 */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        📊 本面板由统计概览插件提供
      </p>
    </div>
  );
}