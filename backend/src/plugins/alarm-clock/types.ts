/**
 * 闹钟配置参数接口
 * 对应约束表params字段的JSON结构
 */
export interface AlarmParams {
  [key: string]: any;
  /** 是否启用提醒 */
  enabled: boolean;
  /** 提醒时间，HH:mm 格式（24小时制） */
  time: string;
  /** 每周提醒天数，0=周日，1=周一...6=周六 */
  days: number[];
  /** 自定义提醒消息，可为空 */
  message?: string | null;
  /** 上次触发时间戳（毫秒），用于避免重复触发 */
  lastTriggered?: number | null;
}

/**
 * 完整的闹钟配置（包含关联信息）
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
 * 验证时间格式是否为HH:mm
 * @param time 时间字符串
 * @returns 是否有效
 */
export function isValidTimeFormat(time: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

/**
 * 验证天数数组是否有效（所有值在0-6之间）
 * @param days 天数数组
 * @returns 是否有效
 */
export function isValidDaysArray(days: number[]): boolean {
  if (!Array.isArray(days) || days.length === 0) {
    return false;
  }
  return days.every(day => Number.isInteger(day) && day >= 0 && day <= 6);
}