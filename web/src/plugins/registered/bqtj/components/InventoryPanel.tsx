/**
 * 背包资源编辑面板组件
 * 管理背包中已拥有的资源数量
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InventoryResource } from '../types';
import { updateInventoryResources } from '../api';
import { Button } from '../../../../components/ui/button';
import styles from './InventoryPanel.module.css';

interface InventoryPanelProps {
  projectId: number;
  inventory: InventoryResource[];
  materialNames: Map<string, string>;
}

/**
 * 背包资源项组件
 */
interface InventoryItemProps {
  resourceId: string;
  resourceName: string;
  quantity: number;
  onUpdate: (resourceId: string, newQuantity: number) => void;
  onDelete: (resourceId: string) => void;
}

function InventoryItem({
  resourceId,
  resourceName,
  quantity,
  onUpdate,
  onDelete,
}: InventoryItemProps): React.ReactElement {
  const [editing, setEditing] = useState(false);
  const [newQuantity, setNewQuantity] = useState(String(quantity));

  const handleSave = () => {
    const parsed = parseInt(newQuantity, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdate(resourceId, parsed);
      setEditing(false);
    }
  };

  return (
    <div className={styles.item}>
      <div className={styles.itemInfo}>
        <div className={styles.itemName}>{resourceName || resourceId}</div>
        <div className={styles.itemQuantity}>当前数量: {quantity}</div>
      </div>
      <div className={styles.itemActions}>
        {editing ? (
          <>
            <input
              type="number"
              min="0"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              className={styles.quantityInput}
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
          onClick={() => onDelete(resourceId)}
        >
          删除
        </Button>
      </div>
    </div>
  );
}

/**
 * 背包资源编辑面板
 */
export function InventoryPanel({
  projectId,
  inventory,
  materialNames,
}: InventoryPanelProps): React.ReactElement {
  const queryClient = useQueryClient();
  const [newResourceId, setNewResourceId] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');

  // 更新背包资源 mutation
  const updateInventoryMutation = useMutation({
    mutationFn: (params: InventoryResource[]) => {
      // 转换数组为对象格式，符合InventoryResourcesParams要求
      const paramsObj: Record<string, InventoryResource> = {};
      params.forEach(item => {
        paramsObj[item.resourceId] = item;
      });
      return updateInventoryResources(projectId, paramsObj);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bqtjData', projectId] });
    },
  });

  /**
   * 添加新资源
   */
  const handleAdd = () => {
    const resourceId = newResourceId.trim();
    const quantity = parseInt(newQuantity, 10);

    if (!resourceId || isNaN(quantity) || quantity < 0) {
      alert('请输入有效的资源ID和数量');
      return;
    }

    // 检查是否已存在
    const exists = inventory.some((item) => item.resourceId === resourceId);
    if (exists) {
      alert('该资源已存在，请直接修改数量');
      return;
    }

    const newInventory = [
      ...inventory,
      { resourceId, resourceName: '', quantity },
    ];
    updateInventoryMutation.mutate(newInventory);

    setNewResourceId('');
    setNewQuantity('1');
  };

  /**
   * 更新资源数量
   */
  const handleUpdate = (resourceId: string, newQuantityValue: number) => {
    const newInventory = inventory.map((item) =>
      item.resourceId === resourceId
        ? { ...item, quantity: newQuantityValue }
        : item
    );
    updateInventoryMutation.mutate(newInventory);
  };

  /**
   * 删除资源
   */
  const handleDelete = (resourceId: string) => {
    if (!window.confirm('确定要删除这个背包资源吗？')) return;

    const newInventory = inventory.filter(
      (item) => item.resourceId !== resourceId
    );
    updateInventoryMutation.mutate(newInventory);
  };

  // 计算总资源数量
  const totalItems = inventory.reduce(
    (sum, item) => sum + (item.quantity > 0 ? 1 : 0),
    0
  );
  const totalQuantity = inventory.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>背包资源管理</h3>
        <div className={styles.stats}>
          <span>总计: {totalItems} 种 / {totalQuantity} 个</span>
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
          placeholder="数量"
          value={newQuantity}
          onChange={(e) => setNewQuantity(e.target.value)}
          className={styles.smallInput}
        />
        <Button
          onClick={handleAdd}
          disabled={updateInventoryMutation.isPending}
        >
          添加
        </Button>
      </div>

      <div className={styles.list}>
        {inventory.length === 0 ? (
          <div className={styles.empty}>背包中还没有任何资源</div>
        ) : (
          inventory.map((item) => (
            <InventoryItem
              key={item.resourceId}
              resourceId={item.resourceId}
              resourceName={materialNames.get(item.resourceId) || item.resourceId}
              quantity={item.quantity}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {updateInventoryMutation.isError && (
        <div className={styles.error}>
          更新失败，请重试
        </div>
      )}
    </div>
  );
}