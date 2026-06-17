/**
 * 闹钟通知弹窗组件
 * 显示当前待触发的闹钟提醒
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlarmClock, BellRing } from 'lucide-react';
import type { DueAlarm } from '../types';

/**
 * 闹钟通知弹窗属性接口
 */
interface AlarmNotificationProps {
  /** 待触发的闹钟列表 */
  alarms: DueAlarm[];
  /** 关闭回调 */
  onClose: () => void;
  /** 是否打开 */
  open: boolean;
}

/**
 * 闹钟通知弹窗组件
 * 当检测到有待触发的闹钟时，显示弹窗通知用户
 * 同时会尝试发送浏览器系统通知（需要权限）
 */
export function AlarmNotification({
  alarms,
  onClose,
  open,
}: AlarmNotificationProps) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // 检查通知权限
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);

      // 如果有闹钟且有权限，发送系统通知
      if (open && alarms.length > 0 && Notification.permission === 'granted') {
        alarms.forEach(alarm => {
          const title = `闹钟提醒: ${alarm.goal_name}`;
          const body = alarm.message || `${alarm.project_name} - ${alarm.goal_name}`;
          new Notification(title, { body });
        });
      }
    }
  }, [open, alarms]);

  // 请求通知权限
  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // 如果没有闹钟，不显示
  if (alarms.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <BellRing className="h-5 w-5 animate-bounce" />
            闹钟提醒
          </DialogTitle>
          <DialogDescription>
            以下目标到了设定的提醒时间
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {alarms.map((alarm) => (
            <div
              key={alarm.alarm_id}
              className="rounded-lg border p-3 bg-muted/50"
            >
              <div className="flex items-start gap-2">
                <AlarmClock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">{alarm.goal_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {alarm.project_name}
                  </div>
                  {alarm.message && (
                    <div className="text-sm mt-1 text-foreground">
                      {alarm.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {notificationPermission === 'default' && (
          <div className="mb-4 text-sm text-muted-foreground">
            <p>
              💡 提示：点击下方按钮允许浏览器通知权限，
              即使最小化浏览器也能收到闹钟提醒！
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2"
              onClick={requestPermission}
            >
              允许通知
            </Button>
          </div>
        )}

        {notificationPermission === 'denied' && (
          <div className="mb-4 text-sm text-muted-foreground">
            <p>
              ⚠️ 浏览器通知权限已被拒绝，只能在当前页面内接收提醒。
              如需系统通知，请在浏览器设置中允许通知权限。
            </p>
          </div>
        )}

        <Button onClick={onClose} className="w-full">
          我知道了
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default AlarmNotification;