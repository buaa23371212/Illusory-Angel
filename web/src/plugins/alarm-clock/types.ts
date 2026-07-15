/**
 * 闹钟配置参数接口
 * 对应后端闹钟配置类型定义
 */

/**
 * 闹钟配置（完整配置信息）
 * 用于API响应返回
 */
export interface AlarmConfig {
  /** 关联的目标ID */
  goal_id: number;
  /** 目标名称（用于显示通知） */
  goal_name: string;
  /** 所属项目名称（用于显示通知） */
  project_name: string;
  /** 是否启用提醒 */
  enabled: boolean;
  /** 提醒时间，HH:mm 格式 */
  time: string;
  /** 每周提醒天数 */
  days: number[];
  /** 自定义提醒消息 */
  message: string | null;
  /** 上次触发时间戳（毫秒） */
  last_triggered: number | null;
}

/**
 * 保存闹钟配置请求体
 */
export interface SaveAlarmRequest {
  /** 是否启用提醒 */
  enabled: boolean;
  /** 提醒时间，HH:mm 格式 */
  time: string;
  /** 每周提醒天数 */
  days: number[];
  /** 自定义提醒消息 */
  message?: string | null;
}

/**
 * 待触发闹钟项
 * 用于/alarm/due接口返回
 */
export interface DueAlarm {
  /** 闹钟约束ID */
  alarm_id: number;
  /** 目标ID */
  goal_id: number;
  /** 目标名称 */
  goal_name: string;
  /** 项目名称 */
  project_name: string;
  /** 提醒消息 */
  message: string | null;
}

/**
 * 星期名称映射
 */
export const dayNames: Record<number, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
};

/**
 * 星期简称映射
 */
export const dayShortNames: Record<number, string> = {
  0: '日',
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
};