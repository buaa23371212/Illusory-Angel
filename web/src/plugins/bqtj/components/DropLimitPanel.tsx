/**
 * 掉落限制编辑面板组件
 * 管理每日和每周的掉落限制
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DropLimitConfig } from '../types';
import { updateDailyDropLimit, updateWeeklyDropLimit } from '../api';
import { Button } from '../../../../components/ui/button';
import styles from './DropLimitPanel.module.css';

interface DropLimitPanelProps {
  projectId: number;
  title: string;
  type: 'daily' | 'weekly';
  limits: DropLimitConfig[];
  materialNames: Map<string, string>;
}

/**
 * 掉落限制项组件属性接口
 */
interface DropLimitItemProps {
  item: DropLimitConfig;
  onSave: (resourceId: string, newLimit: number) => void;
  onDelete: (resourceId: string) => void;
  materialNames: Map<string, string>;
}

/**
 * 掉落限制项组件
 */
function DropLimitItem({
  item,
  onSave,
  onDelete,
  materialNames,
}: DropLimitItemProps): React.ReactElement {
  const [editing, setEditing] = useState(false);
  const [newLimit, setNewLimit] = useState(String(item.limit));

  const handleSave = () => {
    const parsed = parseInt(newLimit, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(item.resourceId, parsed);
      setEditing(false);
    }
  };

  // 计算进度百分比
  const percentage = Math.min((item.current / item.limit) * 100, 100);
  const isOverLimit = item.current > item.limit;

  return (
    <div className={styles.item}>
      <div className={styles.itemInfo}>
        <div className={styles.itemName}>
          {materialNames.get(item.resourceId) || item.resourceName || item.resourceId}
        </div>
        <div className={styles.itemLimit}>掉落限制: {item.limit}</div>
        <div className={styles.itemCurrent}>当前掉落: {item.current}</div>
      </div>
      <div className={styles.progressContainer}>
        <div
          className={`${styles.progressBar} ${isOverLimit ? styles.progressOver : ''}`}
          style={{ width: `${percentage}%` }}
        />
        <div className={styles.progressText}>
          {item.current} / {item.limit}
        </div>
      </div>
      <div className={styles.itemActions}>
        {editing ? (
          <>
            <input
              type="number"
              min="0"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className={styles.limitInput}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <Button size="sm" onClick={handleSave}>
              保存
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditing(false)}
            >
              取消
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => setEditing(true)}>
            修改
          </Button>
        )}
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(item.resourceId)}
        >
          删除
        </Button>
      </div>
    </div>
  );
}

/**
 * 掉落限制编辑面板
 */
export function DropLimitPanel({
  projectId,
  title,
  type,
  limits,
  materialNames,
}: DropLimitPanelProps): React.ReactElement {
  const queryClient = useQueryClient();
  const [newResourceId, setNewResourceId] = useState('');
  const [newLimit, setNewLimit] = useState('10');

  // 更新每日掉落限制 mutation
  const updateDailyMutation = useMutation({
    mutationFn: (newLimits: DropLimitConfig[]) => {
      // 转换数组为对象格式，符合DailyDropLimitParams要求
      const paramsObj: Record<string, DropLimitConfig> = {};
      newLimits.forEach(item => {
        paramsObj[item.resourceId] = item;
      });
      return updateDailyDropLimit(projectId, paramsObj);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
    },
  });

  // 更新每周掉落限制 mutation
  const updateWeeklyMutation = useMutation({
    mutationFn: (newLimits: DropLimitConfig[]) => {
      // 转换数组为对象格式，符合WeeklyDropLimitParams要求
      const paramsObj: Record<string, DropLimitConfig> = {};
      newLimits.forEach(item => {
        paramsObj[item.resourceId] = item;
      });
      return updateWeeklyDropLimit(projectId, paramsObj);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
    },
  });

  const mutation = type === 'daily' ? updateDailyMutation : updateWeeklyMutation;

  /**
   * 添加新限制
   */
  const handleAdd = () => {
    const resourceId = newResourceId.trim();
    const limitValue = parseInt(newLimit, 10);

    if (!resourceId || isNaN(limitValue) || limitValue < 0) {
      alert('请输入有效的资源ID和限制数量');
      return;
    }

    // 检查是否已存在
    const exists = limits.some((item) => item.resourceId === resourceId);
    if (exists) {
      alert('该资源已存在，请直接修改限制');
      return;
    }

    const newLimits = [
      ...limits,
      { resourceId, resourceName: '', limit: limitValue, current: 0 },
    ];
    mutation.mutate(newLimits);

    setNewResourceId('');
    setNewLimit('10');
  };

  /**
   * 更新限制数量
   */
  const handleUpdate = (resourceId: string, newLimitValue: number) => {
    const newLimits = limits.map((item) =>
      item.resourceId === resourceId
        ? { ...item, limit: newLimitValue }
        : item
    );
    mutation.mutate(newLimits);
  };

  /**
   * 删除限制
   */
  const handleDelete = (resourceId: string) => {
    if (!window.confirm('确定要删除这个掉落限制吗？')) return;

    const newLimits = limits.filter(
      (item) => item.resourceId !== resourceId
    );
    mutation.mutate(newLimits);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.stats}>
          <span>总计: {limits.length} 项限制</span>
        </div>
      </div>

      <div className={styles.addForm}>
        <input
          type="text"
          placeholder="资源ID"
          value={newResourceId}
          onChange={(e) => setNewResourceId(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          min="0"
          placeholder="限制数量"
          value={newLimit}
          onChange={(e) => setNewLimit(e.target.value)}
          className={styles.smallInput}
        />
        <Button
          onClick={handleAdd}
          disabled={mutation.isPending}
        >
          添加
        </Button>
      </div>

      <div className={styles.list}>
        {limits.length === 0 ? (
          <div className={styles.empty}>暂无设置掉落限制</div>
        ) : (
          limits.map((item) => (
            <DropLimitItem
              key={item.resourceId}
              item={item}
              onSave={handleUpdate}
              onDelete={handleDelete}
              materialNames={materialNames}
            />
          ))
        )}
      </div>

      {mutation.isError && (
        <div className={styles.error}>
          更新失败，请重试
        </div>
      )}
    </div>
  );
}