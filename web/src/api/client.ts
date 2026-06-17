import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type { components } from '@/types/api'

/**
 * API 客户端配置
 */
interface ApiClientConfig {
  baseURL: string
  timeout?: number
}

/**
 * OpenAPI 生成的类型别名
 */
export type Project = components['schemas']['Project']
export type Goal = components['schemas']['Goal']
export type Constraint = components['schemas']['Constraint']
export type CreateProjectRequest = components['schemas']['CreateProjectRequest']
export type UpdateProjectRequest = components['schemas']['UpdateProjectRequest']
export type CreateGoalRequest = components['schemas']['CreateGoalRequest']
export type UpdateGoalRequest = components['schemas']['UpdateGoalRequest']
export type CreateConstraintRequest = components['schemas']['CreateConstraintRequest']
export type UpdateConstraintRequest = components['schemas']['UpdateConstraintRequest']
export type BatchMoveGoalsRequest = components['schemas']['BatchMoveGoalsRequest']
export type ProjectListResponse = components['schemas']['ProjectListResponse']
export type GoalListResponse = components['schemas']['GoalListResponse']
export type ConstraintListResponse = components['schemas']['ConstraintListResponse']
export type ProjectResponse = components['schemas']['ProjectResponse']
export type GoalResponse = components['schemas']['GoalResponse']
export type GoalDetailResponse = components['schemas']['GoalDetailResponse']
export type ConstraintResponse = components['schemas']['ConstraintResponse']
export type Error = components['schemas']['Error']

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number
  page_size?: number
}

/**
 * API 客户端类
 * 封装所有后端 API 调用
 */
export class ApiClient {
  /** axios实例，供插件扩展API使用 */
  public client: AxiosInstance

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 10000,
    })

    // 请求拦截器 - 添加debug日志
    this.client.interceptors.request.use(
      (config) => {
        console.debug(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
          params: config.params,
          data: config.data,
          headers: config.headers
        });
        return config;
      },
      (error) => {
        console.debug(`[API Request Error]`, error);
        return Promise.reject(error);
      }
    )

    // 响应拦截器 - 添加debug日志
    this.client.interceptors.response.use(
      (response) => {
        console.debug(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });
        return response;
      },
      (error) => {
        console.debug(`[API Response Error]`, error);
        return Promise.reject(error);
      }
    )
  }

  /**
   * 获取项目列表
   */
  async getProjects(params?: {
    keyword?: string
    category?: string
  } & PaginationParams): Promise<ProjectListResponse['data']> {
    const response: AxiosResponse<ProjectListResponse> = await this.client.get(
      '/projects',
      { params }
    )
    return response.data.data!
  }

  /**
   * 创建项目
   */
  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response: AxiosResponse<ProjectResponse> = await this.client.post(
      '/projects',
      data
    )
    return response.data.data!
  }

  /**
   * 获取项目详情
   */
  async getProject(projectId: number): Promise<Project> {
    const response: AxiosResponse<ProjectResponse> = await this.client.get(
      `/projects/${projectId}`
    )
    return response.data.data!
  }

  /**
   * 更新项目
   */
  async updateProject(projectId: number, data: UpdateProjectRequest): Promise<Project> {
    const response: AxiosResponse<ProjectResponse> = await this.client.put(
      `/projects/${projectId}`,
      data
    )
    return response.data.data!
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: number): Promise<void> {
    await this.client.delete(`/projects/${projectId}`)
  }

  /**
   * 获取项目的所有约束
   */
  async getProjectConstraints(projectId: number): Promise<Constraint[]> {
    const response: AxiosResponse<ConstraintListResponse> = await this.client.get(
      `/projects/${projectId}/constraints`
    )
    return response.data.data!
  }

  /**
   * 获取目标列表
   */
  async getGoals(params?: {
    project_id?: number
    is_completed?: boolean
  } & PaginationParams): Promise<GoalListResponse['data']> {
    const response: AxiosResponse<GoalListResponse> = await this.client.get('/goals', {
      params,
    })
    return response.data.data!
  }

  /**
   * 创建目标
   */
  async createGoal(data: CreateGoalRequest): Promise<Goal> {
    const response: AxiosResponse<GoalResponse> = await this.client.post('/goals', data)
    return response.data.data!
  }

  /**
   * 获取目标详情（包含约束）
   */
  async getGoalDetail(goalId: number): Promise<GoalDetailResponse['data']> {
    const response: AxiosResponse<GoalDetailResponse> = await this.client.get(
      `/goals/${goalId}`
    )
    return response.data.data!
  }

  /**
   * 更新目标
   */
  async updateGoal(goalId: number, data: UpdateGoalRequest): Promise<Goal> {
    const response: AxiosResponse<GoalResponse> = await this.client.put(
      `/goals/${goalId}`,
      data
    )
    return response.data.data!
  }

  /**
   * 删除目标
   */
  async deleteGoal(goalId: number): Promise<void> {
    await this.client.delete(`/goals/${goalId}`)
  }

  /**
   * 切换目标完成状态
   */
  async toggleGoalComplete(goalId: number, isCompleted: boolean): Promise<Goal> {
    const response: AxiosResponse<GoalResponse> = await this.client.post(
      `/goals/${goalId}/toggle-complete`,
      { is_completed: isCompleted }
    )
    return response.data.data!
  }

  /**
   * 批量移动目标到另一个项目
   */
  async batchMoveGoals(data: BatchMoveGoalsRequest): Promise<{
    success: boolean
    moved_count: number
  }> {
    const response = await this.client.post('/goals/batch-move', data)
    return response.data
  }

  /**
   * 添加约束
   */
  async createConstraint(data: CreateConstraintRequest): Promise<Constraint> {
    const response: AxiosResponse<ConstraintResponse> = await this.client.post(
      '/constraints',
      data
    )
    return response.data.data!
  }

  /**
   * 更新约束
   */
  async updateConstraint(
    constraintId: number,
    data: UpdateConstraintRequest
  ): Promise<Constraint> {
    const response: AxiosResponse<ConstraintResponse> = await this.client.put(
      `/constraints/${constraintId}`,
      data
    )
    return response.data.data!
  }

  /**
   * 删除约束
   */
  async deleteConstraint(constraintId: number): Promise<void> {
    await this.client.delete(`/constraints/${constraintId}`)
  }

  /**
   * 获取所有者的所有约束
   */
  async getConstraints(
    ownerType: 'project' | 'goal',
    ownerId: number
  ): Promise<Constraint[]> {
    const response: AxiosResponse<ConstraintListResponse> = await this.client.get(
      `/constraints/${ownerType}/${ownerId}`
    )
    return response.data.data!
  }

  /**
   * 动态注册插件扩展的API方法
   * @param id 方法ID
   * @param method API方法函数
   */
  registerApiMethod(id: string, method: (...args: any[]) => Promise<any>): void {
    // @ts-ignore - 动态添加方法
    this[id] = method.bind(this);
  }
}

// 导出默认实例，连接到后端 API
const apiBaseURL = import.meta.env.VITE_API_BASE_URL
export const apiClient = new ApiClient({
  baseURL: apiBaseURL,
})