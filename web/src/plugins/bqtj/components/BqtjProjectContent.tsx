/**
 * 爆枪英雄养成项目内容组件
 * 展示目标树形结构和各种约束管理面板
 */

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Goal } from '../../../api/client';
import { apiClient } from '../../../api/client';
import { DropLimitPanel } from './DropLimitPanel';
import { InventoryPanel } from './InventoryPanel';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Checkbox } from '../../../components/ui/checkbox';
import styles from './BqtjProjectContent.module.css';
import { createGoalWithAttributes, deleteGoal, getAllBqtjData, setGoalParentId, updateSingleGoalAttributes } from '../api';
import { BqtjDataManager } from '../utils';
import { BqtjGoalCard } from './BqtjGoalCard';
import type { DropLimitConfig, InventoryResource } from '../types';
import type { TreeNode } from '../utils';

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
 * 递归渲染树节点及其子节点
 */
function TreeBranch({
  nodeId,
  depth,
  nodes,
  onDelete,
  onAddChild,
  onAddParent,
  onViewDetail,
  onToggleComplete,
  showCompleted,
}: {
  nodeId: number;
  depth: number;
  nodes: Map<number, TreeNode<any>>;
  onDelete: (id: number) => void;
  onAddChild: (id: number) => void;
  onAddParent?: (id: number) => void;
  onViewDetail?: (id: number) => void;
  onToggleComplete: (id: number) => void;
  showCompleted: boolean;
}): React.ReactElement | null {
  const node = nodes.get(nodeId);
  if (!node) return null;

  if (!showCompleted && (node.data as any)?.is_completed === 1) {
    return null;
  }

  return (
    <div className={styles.treeNode}>
      <div className={styles.nodeContent}>
        <BqtjGoalCard
          goalId={node.id}
          name={node.data?.name ?? ''}
          depth={depth}
          isCompleted={(node.data as any)?.is_completed === 1}
          requiredQuantity={node.meta?.requiredQuantity as number | undefined}
          priority={node.meta?.priority as number | undefined}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onAddParent={onAddParent}
          onViewDetail={onViewDetail}
          onToggleComplete={onToggleComplete}
        />
      </div>
      {node.children.length > 0 && (
        <div className={styles.treeChildren}>
          {node.children.map(childId => (
            <TreeBranch
              key={childId}
              nodeId={childId}
              depth={depth + 1}
              nodes={nodes}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onAddParent={onAddParent}
              onViewDetail={onViewDetail}
              onToggleComplete={onToggleComplete}
              showCompleted={showCompleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [newGoalQuantity, setNewGoalQuantity] = useState(1);
  const [newGoalPriority, setNewGoalPriority] = useState(3);
  const [newGoalType, setNewGoalType] = useState<'equipment_craft' | 'resource_collection'>('resource_collection');
  const [showCompleted, setShowCompleted] = useState(true);

  /** 添加子目标模式：创建新目标或选择现有目标 */
  const [addChildMode, setAddChildMode] = useState<'create' | 'select'>('create');
  const [selectedChildGoalId, setSelectedChildGoalId] = useState<number | null>(null);

  /** 添加父目标模式：创建新目标或选择现有目标 */
  const [addParentMode, setAddParentMode] = useState<'create' | 'select'>('create');
  const [selectedParentGoalId, setSelectedParentGoalId] = useState<number | null>(null);
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [addParentChildId, setAddParentChildId] = useState<number | null>(null);
  const [newParentName, setNewParentName] = useState('');

  // 通过插件专属 API 获取所有养成数据（含 goal_attributes、掉落限制、背包资源等）
  const { data: bqtjData } = useQuery({
    queryKey: ['bqtjData', projectId],
    queryFn: () => getAllBqtjData(projectId),
  });

  // 获取项目下的目标列表
  const { data: goalsData } = useQuery({
    queryKey: ['goals', projectId],
    queryFn: () => apiClient.getGoals({ project_id: projectId }),
  });

  const goals: Goal[] = goalsData?.list ?? [];

  // 通过 BqtjDataManager 统一管理插件数据（直接从插件 API 响应构建）
  const dataManager = React.useMemo(
    () => (bqtjData ? new BqtjDataManager(bqtjData) : null),
    [bqtjData]
  );

  // 构建目标树（goal_attributes 中的 parentId 确定父子关系）
  const treeManager = React.useMemo(() => {
    if (!dataManager || goals.length === 0) return null;
    const tree = dataManager.buildGoalTree(goals);
    console.debug('[BqtjProjectContent] 目标树:', tree);
    return tree;
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
   * 处理切换目标完成状态（递归影响所有子目标）
   */
  const handleToggleComplete = async (goalId: number) => {
    const node = treeManager?.getTreeData().nodes.get(goalId);
    if (!node) return;

    const currentCompleted = (node.data as any)?.is_completed === 1;
    const newCompleted = !currentCompleted;

    try {
      const allNodeIds = [goalId, ...(treeManager?.getDescendants(goalId) ?? [])];
      
      for (const id of allNodeIds) {
        await apiClient.toggleGoalComplete(id, newCompleted);
      }

      queryClient.invalidateQueries({ queryKey: ['goals', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
      onGoalChange();
    } catch (err) {
      console.error('切换目标完成状态失败:', err);
      alert('切换目标完成状态失败');
    }
  };

  /**
   * 处理添加新目标
   */
  const handleAddGoal = async () => {
    if (addChildMode === 'create') {
      if (!newGoalName.trim()) {
        alert('请输入目标名称');
        return;
      }

      try {
        await createGoalWithAttributes(
          projectId,
          newGoalName.trim(),
          parentGoalId,
          newGoalQuantity,
          newGoalType,
          newGoalPriority
        );

        setNewGoalName('');
        setNewGoalQuantity(1);
        setNewGoalPriority(3);
        setNewGoalType('resource_collection');
        setParentGoalId(null);
        setShowAddModal(false);
        queryClient.invalidateQueries({ queryKey: ['goals', projectId] });
        queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
        onGoalChange();
      } catch (err) {
        console.error('创建目标失败:', err);
        alert('创建目标失败');
      }
    } else {
      if (!selectedChildGoalId || !parentGoalId) {
        alert('请选择一个目标作为子目标');
        return;
      }

      if (selectedChildGoalId === parentGoalId) {
        alert('不能将目标添加为自己的子目标');
        return;
      }

      const ancestors = treeManager?.getAncestors(selectedChildGoalId) ?? [];
      if (ancestors.includes(parentGoalId)) {
        alert('不能形成循环依赖：所选目标已是父目标的祖先');
        return;
      }

      const descendants = treeManager?.getDescendants(parentGoalId) ?? [];
      if (descendants.includes(selectedChildGoalId)) {
        alert('不能形成循环依赖：所选目标已是父目标的后代');
        return;
      }

      try {
        await setGoalParentId(selectedChildGoalId, parentGoalId);

        setSelectedChildGoalId(null);
        setParentGoalId(null);
        setShowAddModal(false);
        queryClient.invalidateQueries({ queryKey: ['goals', projectId] });
        queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
        onGoalChange();
      } catch (err) {
        console.error('添加子目标失败:', err);
        alert('添加子目标失败');
      }
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
      queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
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
    setAddChildMode('create');
    setSelectedChildGoalId(null);
    setShowAddModal(true);
  };

  /**
   * 处理添加父目标
   * 创建一个新目标作为当前目标的父级，或选择现有目标作为父级
   */
  const handleAddParent = (goalId: number) => {
    setAddParentChildId(goalId);
    setAddParentMode('create');
    setSelectedParentGoalId(null);
    setNewParentName('');
    setShowAddParentModal(true);
  };

  /**
   * 确认创建父目标或选择现有目标作为父目标
   */
  const handleConfirmAddParent = async () => {
    if (addParentChildId === null) return;

    if (addParentMode === 'create') {
      if (!newParentName.trim()) {
        alert('请输入父目标名称');
        return;
      }

      try {
        const { goal_id: newParentId } = await createGoalWithAttributes(
          projectId,
          newParentName.trim(),
          null,
          newGoalQuantity,
          newGoalType,
          newGoalPriority
        );

        await setGoalParentId(addParentChildId, newParentId);

        setNewParentName('');
        setAddParentChildId(null);
        setShowAddParentModal(false);
        queryClient.invalidateQueries({ queryKey: ['goals', projectId] });
        queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
        onGoalChange();
      } catch (err) {
        console.error('添加父目标失败:', err);
        alert('添加父目标失败');
      }
    } else {
      if (!selectedParentGoalId) {
        alert('请选择一个目标作为父目标');
        return;
      }

      if (selectedParentGoalId === addParentChildId) {
        alert('不能将目标设置为自己的父目标');
        return;
      }

      const ancestors = treeManager?.getAncestors(addParentChildId) ?? [];
      if (ancestors.includes(selectedParentGoalId)) {
        alert('不能形成循环依赖：所选目标已是当前目标的祖先');
        return;
      }

      const descendants = treeManager?.getDescendants(addParentChildId) ?? [];
      if (descendants.includes(selectedParentGoalId)) {
        alert('不能形成循环依赖：所选目标已是当前目标的后代');
        return;
      }

      try {
        await setGoalParentId(addParentChildId, selectedParentGoalId);

        setSelectedParentGoalId(null);
        setAddParentChildId(null);
        setShowAddParentModal(false);
        queryClient.invalidateQueries({ queryKey: ['goals', projectId] });
        queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
        onGoalChange();
      } catch (err) {
        console.error('添加父目标失败:', err);
        alert('添加父目标失败');
      }
    }
  };

  /**
   * 查看/编辑目标详情对话框状态
   */
  const [detailDialogGoalId, setDetailDialogGoalId] = useState<number | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [detailName, setDetailName] = useState('');
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailPriority, setDetailPriority] = useState(3);
  const [detailGoalType, setDetailGoalType] = useState<'equipment_craft' | 'resource_collection'>('resource_collection');

  /**
   * 打开查看详情对话框
   */
  const handleViewDetail = (goalId: number) => {
    const node = treeManager?.getTreeData().nodes.get(goalId);
    setDetailDialogGoalId(goalId);
    setDetailName((node?.data as any)?.name ?? '');
    setDetailQuantity((node?.meta?.requiredQuantity as number) ?? 1);
    setDetailPriority((node?.meta?.priority as number) ?? 3);
    setDetailGoalType((node?.meta?.goalType as 'equipment_craft' | 'resource_collection') ?? 'resource_collection');
    setIsDetailEditing(false);
    setShowDetailDialog(true);
  };

  /**
   * 保存编辑的目标信息
   */
  const handleSaveDetail = async () => {
    if (detailDialogGoalId === null) return;

    try {
      // 更新目标名称
      await apiClient.updateGoal(detailDialogGoalId, { name: detailName });

      // 更新goal_attributes
      await updateSingleGoalAttributes(detailDialogGoalId, {
        requiredQuantity: detailQuantity,
        priority: detailPriority,
        goalType: detailGoalType,
      });

      setShowDetailDialog(false);
      setDetailDialogGoalId(null);
      queryClient.invalidateQueries({ queryKey: ['goals', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
      onGoalChange();
    } catch (err) {
      console.error('更新目标信息失败:', err);
      alert('更新目标信息失败');
    }
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
              <div className="flex items-center gap-2">
                <Button onClick={() => { setParentGoalId(null); setAddChildMode('create'); setShowAddModal(true); }}>添加根目标</Button>
                <Button variant="outline" size="sm" onClick={() => setShowCompleted(!showCompleted)}>
                  {showCompleted ? '隐藏已完成' : '显示已完成'}
                </Button>
              </div>
            </div>
            <div className={styles.goalTree}>
              {treeManager && treeManager.getTreeData().rootIds.map(rootId => (
                <TreeBranch
                  key={rootId}
                  nodeId={rootId}
                  depth={0}
                  nodes={treeManager.getTreeData().nodes}
                  onDelete={handleDeleteGoal}
                  onAddChild={handleAddChild}
                  onAddParent={handleAddParent}
                  onViewDetail={handleViewDetail}
                  onToggleComplete={handleToggleComplete}
                  showCompleted={showCompleted}
                />
              ))}
              {(!treeManager || treeManager.getTreeData().rootIds.length === 0) && (
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

      <Dialog open={showAddModal} onOpenChange={(open) => { if (!open) { setNewGoalName(''); setNewGoalQuantity(1); setNewGoalPriority(3); setNewGoalType('resource_collection'); setParentGoalId(null); setAddChildMode('create'); setSelectedChildGoalId(null); setShowAddModal(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{parentGoalId ? '添加子目标' : '添加新目标'}</DialogTitle>
          </DialogHeader>
          {parentGoalId && (
            <div className="flex space-x-2 mb-4">
              <Button
                variant={addChildMode === 'create' ? 'default' : 'outline'}
                onClick={() => { setAddChildMode('create'); setSelectedChildGoalId(null); }}
              >
                创建新目标
              </Button>
              <Button
                variant={addChildMode === 'select' ? 'default' : 'outline'}
                onClick={() => { setAddChildMode('select'); setSelectedChildGoalId(null); }}
              >
                选择现有目标
              </Button>
            </div>
          )}
          <div className="space-y-4 py-4">
            {addChildMode === 'create' ? (
              <>
                <div className="space-y-2">
                  <Label>目标名称</Label>
                  <Input
                    placeholder="目标名称"
                    value={newGoalName}
                    onChange={e => setNewGoalName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>需求数量</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="完成所需数量"
                    value={newGoalQuantity}
                    onChange={e => setNewGoalQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>优先级</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={newGoalPriority}
                    onChange={e => setNewGoalPriority(Number(e.target.value))}
                  >
                    <option value={1}>1 - 最高</option>
                    <option value={2}>2 - 高</option>
                    <option value={3}>3 - 中</option>
                    <option value={4}>4 - 低</option>
                    <option value={5}>5 - 最低</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>目标类型</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={newGoalType}
                    onChange={e => setNewGoalType(e.target.value as 'equipment_craft' | 'resource_collection')}
                  >
                    <option value="resource_collection">资源收集</option>
                    <option value="equipment_craft">装备制作</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>选择目标作为子目标</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  {goals.map(goal => {
                    const node = treeManager?.getTreeData().nodes.get(goal.goal_id);
                    const isCompleted = (goal as any).is_completed === 1;
                    const isSelected = selectedChildGoalId === goal.goal_id;
                    return (
                      <div
                        key={goal.goal_id}
                        className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-accent/50' : ''}`}
                        onClick={() => setSelectedChildGoalId(goal.goal_id)}
                      >
                        <Checkbox checked={isSelected} onCheckedChange={() => setSelectedChildGoalId(goal.goal_id)} />
                        <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>{goal.name}</span>
                        {isCompleted && <span className="text-xs text-muted-foreground">已完成</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setParentGoalId(null); setShowAddModal(false); }}>
              取消
            </Button>
            <Button onClick={handleAddGoal}>{addChildMode === 'create' ? '创建' : '添加'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加父目标对话框 */}
      <Dialog open={showAddParentModal} onOpenChange={(open) => { if (!open) { setNewParentName(''); setAddParentChildId(null); setAddParentMode('create'); setSelectedParentGoalId(null); setShowAddParentModal(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加父目标</DialogTitle>
          </DialogHeader>
          <div className="flex space-x-2 mb-4">
            <Button
              variant={addParentMode === 'create' ? 'default' : 'outline'}
              onClick={() => { setAddParentMode('create'); setSelectedParentGoalId(null); }}
            >
              创建新目标
            </Button>
            <Button
              variant={addParentMode === 'select' ? 'default' : 'outline'}
              onClick={() => { setAddParentMode('select'); setSelectedParentGoalId(null); }}
            >
              选择现有目标
            </Button>
          </div>
          <div className="space-y-4 py-4">
            {addParentMode === 'create' ? (
              <>
                <div className="space-y-2">
                  <Label>父目标名称</Label>
                  <Input
                    placeholder="新父目标的名称"
                    value={newParentName}
                    onChange={e => setNewParentName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>需求数量</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="完成所需数量"
                    value={newGoalQuantity}
                    onChange={e => setNewGoalQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>优先级</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={newGoalPriority}
                    onChange={e => setNewGoalPriority(Number(e.target.value))}
                  >
                    <option value={1}>1 - 最高</option>
                    <option value={2}>2 - 高</option>
                    <option value={3}>3 - 中</option>
                    <option value={4}>4 - 低</option>
                    <option value={5}>5 - 最低</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>目标类型</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={newGoalType}
                    onChange={e => setNewGoalType(e.target.value as 'equipment_craft' | 'resource_collection')}
                  >
                    <option value="resource_collection">资源收集</option>
                    <option value="equipment_craft">装备制作</option>
                  </select>
                </div>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  将创建一个新目标，当前目标会成为其子目标
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <Label>选择目标作为父目标</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  {goals.map(goal => {
                    const isCompleted = (goal as any).is_completed === 1;
                    const isSelected = selectedParentGoalId === goal.goal_id;
                    return (
                      <div
                        key={goal.goal_id}
                        className={`flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-accent/50' : ''}`}
                        onClick={() => setSelectedParentGoalId(goal.goal_id)}
                      >
                        <Checkbox checked={isSelected} onCheckedChange={() => setSelectedParentGoalId(goal.goal_id)} />
                        <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>{goal.name}</span>
                        {isCompleted && <span className="text-xs text-muted-foreground">已完成</span>}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  当前目标会成为所选目标的子目标
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewParentName(''); setAddParentChildId(null); setShowAddParentModal(false); }}>
              取消
            </Button>
            <Button onClick={handleConfirmAddParent}>{addParentMode === 'create' ? '创建父目标' : '设置父目标'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 目标详情/编辑对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={(open) => { if (!open) { setShowDetailDialog(false); setDetailDialogGoalId(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isDetailEditing ? '编辑目标' : '目标详情'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>目标名称</Label>
              {isDetailEditing ? (
                <Input value={detailName} onChange={e => setDetailName(e.target.value)} />
              ) : (
                <div className="px-3 py-2 rounded-md border bg-muted/50">{detailName}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label>需求数量</Label>
              {isDetailEditing ? (
                <Input type="number" min={1} value={detailQuantity} onChange={e => setDetailQuantity(Number(e.target.value))} />
              ) : (
                <div className="px-3 py-2 rounded-md border bg-muted/50">{detailQuantity}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label>优先级</Label>
              {isDetailEditing ? (
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={detailPriority}
                  onChange={e => setDetailPriority(Number(e.target.value))}
                >
                  <option value={1}>1 - 最高</option>
                  <option value={2}>2 - 高</option>
                  <option value={3}>3 - 中</option>
                  <option value={4}>4 - 低</option>
                  <option value={5}>5 - 最低</option>
                </select>
              ) : (
                <div className="px-3 py-2 rounded-md border bg-muted/50">{detailPriority}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label>目标类型</Label>
              {isDetailEditing ? (
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={detailGoalType}
                  onChange={e => setDetailGoalType(e.target.value as 'equipment_craft' | 'resource_collection')}
                >
                  <option value="resource_collection">资源收集</option>
                  <option value="equipment_craft">装备制作</option>
                </select>
              ) : (
                <div className="px-3 py-2 rounded-md border bg-muted/50">{detailGoalType === 'resource_collection' ? '资源收集' : '装备制作'}</div>
              )}
            </div>
          </div>
          <DialogFooter>
            {isDetailEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsDetailEditing(false)}>取消编辑</Button>
                <Button onClick={handleSaveDetail}>保存</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowDetailDialog(false)}>关闭</Button>
                <Button onClick={() => setIsDetailEditing(true)}>编辑</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BqtjProjectContent;