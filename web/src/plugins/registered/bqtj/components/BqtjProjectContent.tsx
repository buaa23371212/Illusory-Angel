/**
 * 爆枪英雄养成项目内容组件
 * 展示目标树形结构和各种约束管理面板
 */

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Goal } from '../../../../api/client';
import { apiClient } from '../../../../api/client';
import { DropLimitPanel } from './DropLimitPanel';
import { InventoryPanel } from './InventoryPanel';
import { Button } from '../../../../components/ui/button';
import styles from './BqtjProjectContent.module.css';
import { createGoalWithAttributes, deleteGoal } from '../api';
import { BqtjDataManager } from '../utils';
import { BqtjGoalCard } from './BqtjGoalCard';
import type { DropLimitConfig, InventoryResource } from '../types';

/**
 * 爆枪英雄养成项目内容组件props接口
 */
interface BqtjProjectContentProps {
  /** 当前选中的项目 */
  selectedProject: any;
  /** 目标变化回调 */
  onGoalChange: () => void;
}

type TabKey = 'goals' | 'daily' | 'weekly' | 'inventory';

/**
 * 爆枪英雄养成项目内容主组件
 * 展示目标树形结构和各种约束管理面板
 */
function BqtjProjectContent({
  selectedProject,
  onGoalChange,
}: BqtjProjectContentProps): React.ReactElement {
  const projectId = selectedProject.project_id;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('goals');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');

  // 获取项目约束（包含 goal_attributes、掉落限制、背包资源等）
  const { data: constraints } = useQuery({
    queryKey: ['projectConstraints', projectId],
    queryFn: () => apiClient.getProjectConstraints(projectId),
  });

  // 获取项目下的目标列表
  const { data: goalsData } = useQuery({
    queryKey: ['goals', projectId],
    queryFn: () => apiClient.getGoals({ project_id: projectId }),
  });

  const goals: Goal[] = goalsData?.list ?? [];

  // 通过 BqtjDataManager 统一管理约束数据
  const dataManager = React.useMemo(
    () => (constraints ? new BqtjDataManager(constraints) : null),
    [constraints]
  );

  // 构建目标树（goal_attributes 中的 parentId 确定父子关系）
  const treeManager = React.useMemo(() => {
    if (!dataManager || goals.length === 0) return null;
    return dataManager.buildGoalTree(goals);
  }, [dataManager, goals]);

  // 材料名称映射表（用于掉落限制和背包面板显示）
  const materialNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    if (dataManager) {
      for (const [, def] of dataManager.materialDefinitions) {
        map.set(def.materialId, def.materialName);
      }
    }
    return map;
  }, [dataManager]);

  // 掉落限制和背包数据
  const dailyLimits: DropLimitConfig[] = dataManager?.dailyDropLimit ?? [];
  const weeklyLimits: DropLimitConfig[] = dataManager?.weeklyDropLimit ?? [];
  const inventory: InventoryResource[] = React.useMemo(
    () => Array.from(dataManager?.inventoryResources.values() ?? []),
    [dataManager]
  );

  /**
   * 处理添加新目标
   */
  const handleAddGoal = async () => {
    if (!newGoalName.trim()) {
      alert('请输入目标名称');
      return;
    }

    try {
      await createGoalWithAttributes(
        projectId,
        newGoalName.trim(),
        parentGoalId,
        1,
        'resource_collection',
        50
      );

      setNewGoalName('');
      setParentGoalId(null);
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ['goals', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectConstraints', projectId] });
      onGoalChange();
    } catch (err) {
      console.error('创建目标失败:', err);
      alert('创建目标失败');
    }
  };

  /**
   * 处理删除目标
   */
  const handleDeleteGoal = async (goalId: number) => {
    if (!window.confirm('确定要删除这个目标吗？')) return;

    try {
      await deleteGoal(goalId);
      queryClient.invalidateQueries({ queryKey: ['goals', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projectConstraints', projectId] });
      onGoalChange();
    } catch (err) {
      console.error('删除目标失败:', err);
      alert('删除目标失败');
    }
  };

  /**
   * 打开添加子目标对话框（复用添加弹窗，传入父目标ID）
   */
  const [parentGoalId, setParentGoalId] = React.useState<number | null>(null);
  const handleAddChild = (parentId: number) => {
    setParentGoalId(parentId);
    setShowAddModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'goals' ? styles.active : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          项目概览
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'daily' ? styles.active : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          每日限制
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'weekly' ? styles.active : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          每周限制
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'inventory' ? styles.active : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          背包资源
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'goals' && (
          <div className={styles.goalsTab}>
            <div className={styles.goalHeader}>
              <h3>目标树形结构</h3>
              <Button onClick={() => { setParentGoalId(null); setShowAddModal(true); }}>添加根目标</Button>
            </div>
            <div className={styles.goalTree}>
              {treeManager && treeManager.flatten().map(({ node, depth }) => (
                <BqtjGoalCard
                  key={node.id}
                  goalId={node.id}
                  name={node.data.name}
                  depth={depth}
                  showGuideLine={depth > 0}
                  onDelete={handleDeleteGoal}
                  onAddChild={handleAddChild}
                />
              ))}
              {(!treeManager || treeManager.flatten().length === 0) && (
                <div className={styles.empty}>暂无目标，请添加</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <DropLimitPanel
            projectId={projectId}
            title="每日掉落限制"
            type="daily"
            limits={dailyLimits}
            materialNames={materialNameMap}
          />
        )}

        {activeTab === 'weekly' && (
          <DropLimitPanel
            projectId={projectId}
            title="每周掉落限制"
            type="weekly"
            limits={weeklyLimits}
            materialNames={materialNameMap}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryPanel
            projectId={projectId}
            inventory={inventory}
            materialNames={materialNameMap}
          />
        )}
      </div>

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => { setParentGoalId(null); setShowAddModal(false); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>{parentGoalId ? '添加子目标' : '添加新目标'}</h3>
            <input
              type="text"
              placeholder="目标名称"
              value={newGoalName}
              onChange={e => setNewGoalName(e.target.value)}
              className={styles.input}
            />
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => { setParentGoalId(null); setShowAddModal(false); }}>
                取消
              </Button>
              <Button onClick={handleAddGoal}>创建</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BqtjProjectContent;