/**
 * 统一API响应工具
 * 提供标准的成功和错误响应格式
 */

import { Response } from 'express';

/**
 * 标准API响应结构
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * 发送成功响应
 * @param res Express响应对象
 * @param data 响应数据
 * @param message 可选消息
 */
export function success<T>(res: Response, data: T, message?: string): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  res.json(response);
}

/**
 * 发送错误响应
 * @param res Express响应对象
 * @param error 错误信息
 * @param status HTTP状态码，默认400
 */
export function error(res: Response, error: string, status: number = 400): void {
  const response: ApiResponse = {
    success: false,
    error
  };
  res.status(status).json(response);
}

/**
 * 发送未找到响应
 * @param res Express响应对象
 * @param resource 资源名称
 */
export function notFound(res: Response, resource: string): void {
  error(res, `${resource} not found`, 404);
}

/**
 * 发送服务器错误响应
 * @param res Express响应对象
 * @param message 错误信息
 */
export function serverError(res: Response, message: string = 'Internal server error'): void {
  error(res, message, 500);
}