/**
 * 字段转换工具
 * 将后端驼峰命名字段转换为OpenAPI规范要求的下划线命名
 */

/**
 * 字段映射：后端驼峰命名 -> OpenAPI下划线命名
 */
const fieldMapping: Record<string, string> = {
  projectId: 'project_id',
  goalId: 'goal_id',
  constraintId: 'constraint_id',
  project: 'project',
  goal: 'goal',
  ownerType: 'owner_type',
  ownerId: 'owner_id',
  constraintName: 'constraint_name',
  isCompleted: 'is_completed',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  isDeleted: 'is_deleted',
  targetProjectId: 'target_project_id',
  movedCount: 'moved_count',
}

/**
 * 将驼峰命名对象转换为下划线命名
 * @param data 原始数据（可以是单个对象、null 或数组）
 * @returns 转换后的数据，字段名符合OpenAPI规范
 */
export function convertCamelToSnake<T>(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data
  }

  // 特殊处理：Date 对象转换为 ISO 字符串
  if (data instanceof Date) {
    return data.toISOString()
  }

  if (Array.isArray(data)) {
    return data.map(item => convertCamelToSnake(item))
  }

  const result: any = {}
  for (const [key, value] of Object.entries(data)) {
    const snakeKey = fieldMapping[key] || key
    result[snakeKey] = typeof value === 'object' && value !== null ? convertCamelToSnake(value) : value
  }

  // 特殊处理：布尔类型转换为 0/1（符合OpenAPI类型定义）
  if (typeof result.is_completed === 'boolean') {
    result.is_completed = result.is_completed ? 1 : 0
  }
  if (typeof result.is_deleted === 'boolean') {
    result.is_deleted = result.is_deleted ? 1 : 0
  }

  return result
}