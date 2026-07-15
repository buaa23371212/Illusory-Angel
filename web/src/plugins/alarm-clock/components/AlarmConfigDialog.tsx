/**
 * 闹钟配置对话框组件
 * 用于配置目标的闹钟提醒
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlarmClock, X } from 'lucide-react';
import { getAlarmConfig, saveAlarmConfig, deleteAlarmConfig } from '../api';
import type { SaveAlarmRequest } from '../types';
import { dayShortNames } from '../types';
import { toast } from 'sonner';

/**
 * 闹钟配置对话框属性接口
 */
interface AlarmConfigDialogProps {
  /** 是否打开对话框 */
  open: boolean;
  /** 关闭对话框回调 */
  onOpenChange: (open: boolean) => void;
  /** 目标ID */
  goalId: number;
  /** 目标名称 */
  goalName: string;
  /** 保存成功回调 */
  onSaved: () => void;
}

/**
 * 闹钟配置对话框组件
 * 提供图形界面配置闹钟的启用状态、提醒时间、重复日期和自定义消息
 */
export function AlarmConfigDialog({
  open,
  onOpenChange,
  goalId,
  goalName,
  onSaved,
}: AlarmConfigDialogProps) {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当对话框打开时，加载现有配置
  useEffect(() => {
    if (open && goalId) {
      loadExistingConfig();
    }
  }, [open, goalId]);

  /**
   * 加载现有闹钟配置
   */
  const loadExistingConfig = async () => {
    try {
      const config = await getAlarmConfig(goalId);
      if (config) {
        setEnabled(config.enabled);
        setTime(config.time);
        setSelectedDays(config.days);
        setMessage(config.message || '');
      } else {
        // 默认值
        setEnabled(true);
        setTime('09:00');
        setSelectedDays([1, 2, 3, 4, 5]);
        setMessage('');
      }
      setError(null);
    } catch (err) {
      console.error('加载闹钟配置失败:', err);
      setError('加载配置失败，请重试');
    }
  };

  /**
   * 切换日期选择
   */
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      // 不能取消最后一个选中的日期
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  /**
   * 验证表单
   */
  const validateForm = (): boolean => {
    if (!enabled) return true;

    // 验证时间格式 HH:mm
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      setError('时间格式不正确，请使用 HH:mm 格式（例如 09:00）');
      return false;
    }

    if (selectedDays.length === 0) {
      setError('请至少选择一个提醒日期');
      return false;
    }

    return true;
  };

  /**
   * 保存配置
   */
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const request: SaveAlarmRequest = {
        enabled,
        time,
        days: selectedDays,
        message: message.trim() || null,
      };

      await saveAlarmConfig(goalId, request);
      toast.success('闹钟配置保存成功');
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error('保存闹钟配置失败:', err);
      setError(err.response?.data?.error || '保存失败，请重试');
      toast.error('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除配置
   */
  const handleDelete = async () => {
    if (!confirm('确定要删除这个闹钟配置吗？')) return;

    setLoading(true);
    setError(null);

    try {
      await deleteAlarmConfig(goalId);
      toast.success('闹钟配置删除成功');
      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error('删除闹钟配置失败:', err);
      setError(err.response?.data?.error || '删除失败，请重试');
      toast.error('删除失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlarmClock className="h-5 w-5" />
            闹钟提醒配置
          </DialogTitle>
          <DialogDescription>
            为目标 "{goalName}" 配置定时提醒
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* 启用开关 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">启用提醒</span>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              {/* 提醒时间 */}
              <div className="grid gap-2">
                <label htmlFor="time" className="text-sm font-medium">
                  提醒时间
                </label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="HH:mm"
                />
                <p className="text-xs text-muted-foreground">
                  使用24小时制，格式为 HH:mm
                </p>
              </div>

              {/* 重复日期 */}
              <div className="grid gap-2">
                <span className="text-sm font-medium">重复日期</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(dayShortNames).map(([day, shortName]) => {
                    const dayNum = parseInt(day);
                    const isSelected = selectedDays.includes(dayNum);
                    return (
                      <Badge
                        key={day}
                        variant={isSelected ? 'default' : 'outline'}
                        className={`cursor-pointer hover:opacity-80 transition-opacity ${
                          isSelected ? '' : 'bg-background'
                        }`}
                        onClick={() => toggleDay(dayNum)}
                      >
                        {shortName}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* 自定义消息 */}
              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-medium">
                  自定义提醒消息（可选）
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="例如：该去完成这个目标了！"
                  rows={3}
                />
              </div>
            </>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" />
            删除
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AlarmConfigDialog;