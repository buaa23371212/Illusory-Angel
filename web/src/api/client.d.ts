/**
 * 插件API扩展的类型声明
 * 让TypeScript识别动态加载的插件API方法
 */

import type { ApiClient } from './client';
import type { AlarmConfig, SaveAlarmRequest, DueAlarm } from '@/plugins/registered/alarm-clock/types';

declare module './client' {
  interface ApiClient {
    // 闹钟插件API方法
    getAlarmConfig(goalId: number): Promise<AlarmConfig | null>;
    saveAlarmConfig(goalId: number, request: SaveAlarmRequest): Promise<AlarmConfig>;
    deleteAlarmConfig(goalId: number): Promise<void>;
    getDueAlarms(): Promise<DueAlarm[]>;
  }
}