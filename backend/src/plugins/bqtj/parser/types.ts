/**
 * 存档解析器类型定义
 */

/**
 * 存档解析结果接口
 */
export interface ArchiveParseResult {
  /** 是否解析成功 */
  success: boolean;
  /** 错误信息（解析失败时） */
  error?: string;
  /** 解析出的背包资源（可存储为 inventory_resources 约束） */
  inventoryResources?: Array<{
    resourceId: string;
    resourceName: string;
    quantity: number;
  }>;
  /** 解析出的材料定义（可存储为 material_definitions 约束） */
  materialDefinitions?: Record<string, {
    materialId: string;
    materialName: string;
    materialImageURL: string;
    description?: string;
  }>;
  /** 解析出的其他数据（预留扩展字段） */
  extraData?: Record<string, unknown>;
}

/**
 * 存档解析器接口
 */
export interface ArchiveParser {
  /**
   * 解析存档文件内容
   * @param content 存档文件的原始内容（字符串或Buffer）
   * @param options 解析选项
   * @returns 解析结果
   */
  parse(content: string | Buffer, options?: ParseOptions): Promise<ArchiveParseResult>;

  /**
   * 获取支持的存档格式列表
   * @returns 格式名称列表
   */
  getSupportedFormats(): string[];
}

/**
 * 解析选项接口
 */
export interface ParseOptions {
  /** 是否验证数据完整性 */
  validate?: boolean;
  /** 是否合并重复资源 */
  mergeDuplicates?: boolean;
  /** 额外的解析参数 */
  [key: string]: unknown;
}