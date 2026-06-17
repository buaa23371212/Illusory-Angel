/**
 * 闹钟轮询检查 Hook
 * 定时调用后端API检查待触发的闹钟
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getDueAlarms } from '../api';
import type { DueAlarm } from '../types';

/**
 * 轮询配置选项
 */
interface UseAlarmPollingOptions {
  /** 轮询间隔（毫秒），默认1分钟 */
  interval?: number;
  /** 是否启用轮询 */
  enabled?: boolean;
}

/**
 * 从环境变量读取默认轮询间隔，单位毫秒
 * 如果环境变量未设置，默认1分钟
 */
const DEFAULT_INTERVAL = parseInt(import.meta.env.VITE_ALARM_POLLING_INTERVAL || '60000', 10);

/**
 * 闹钟轮询Hook
 * 定时检查后端，获取待触发的闹钟列表
 * @param options 配置选项
 * @returns 待触发闹钟列表和检查函数
 */
export function useAlarmPolling({
  interval = DEFAULT_INTERVAL,
  enabled = true,
}: UseAlarmPollingOptions = {}) {
  const [dueAlarms, setDueAlarms] = useState<DueAlarm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastTriggeredRef = useRef<Set<number>>(new Set());

  /**
   * 检查待触发闹钟
   */
  const checkAlarms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const alarms = await getDueAlarms();
      
      // 只返回今天还没触发过的闹钟
      // 避免同一个闹钟在同一天重复弹出
      const newAlarms = alarms.filter(alarm => !lastTriggeredRef.current.has(alarm.alarm_id));
      
      if (newAlarms.length > 0) {
        // 标记这些闹钟今天已触发
        newAlarms.forEach(alarm => lastTriggeredRef.current.add(alarm.alarm_id));
        setDueAlarms(newAlarms);
      } else {
        setDueAlarms([]);
      }
    } catch (err) {
      console.error('检查闹钟失败:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 清除已触发的闹钟
   */
  const clearAlarms = useCallback(() => {
    setDueAlarms([]);
  }, []);

  /**
   * 重置触发记录（比如跨天后重置）
   */
  const resetTriggered = useCallback(() => {
    lastTriggeredRef.current.clear();
  }, []);

  // 设置轮询
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 立即检查一次
    checkAlarms();

    // 设置定时轮询
    intervalRef.current = setInterval(checkAlarms, interval);

    // 清理
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, checkAlarms]);

  // 每天重置一次触发记录
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      resetTriggered();
    }, msUntilTomorrow);
    
    return () => clearTimeout(timeoutId);
  }, [resetTriggered]);

  return {
    dueAlarms,
    loading,
    error,
    checkAlarms,
    clearAlarms,
  };
}