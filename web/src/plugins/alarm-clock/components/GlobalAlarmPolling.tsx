/**
 * 全局闹钟轮询组件
 * 在应用全局挂载，定时检查待触发闹钟，显示通知弹窗
 */

import { useEffect, useState } from 'react';
import { useAlarmPolling } from '../hooks/useAlarmPolling';
import AlarmNotification from './AlarmNotification';

/**
 * 全局闹钟轮询组件
 * 这个组件是全局挂载的，负责轮询检查待触发闹钟
 * 当检测到闹钟时，自动弹出通知
 */
export default function GlobalAlarmPolling() {
  const { dueAlarms, clearAlarms } = useAlarmPolling();
  const [open, setOpen] = useState(false);

  // 当有待触发闹钟时，自动打开弹窗
  useEffect(() => {
    if (dueAlarms.length > 0) {
      setOpen(true);
    }
  }, [dueAlarms]);

  // 关闭处理
  const handleClose = () => {
    setOpen(false);
    // 延迟清除，让动画完成
    setTimeout(() => {
      clearAlarms();
    }, 300);
  };

  return (
    <AlarmNotification
      alarms={dueAlarms}
      onClose={handleClose}
      open={open}
    />
  );
}