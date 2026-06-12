/**
 * JSON文件存储基类
 * 提供通用的JSON读写操作
 */

import * as fs from 'fs-extra';
import path from 'path';

/**
 * 基础实体接口
 * 所有实体都应包含软删除和时间戳字段
 */
export interface BaseEntity {
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

/**
 * JSON数据文件基类
 */
export abstract class BaseJsonRepository<T extends BaseEntity> {
  protected filePath: string;
  protected data: T[] = [];
  protected nextId: number = 1;

  /**
   * 构造函数
   * @param dataDir 数据目录
   * @param fileName 文件名
   */
  constructor(dataDir: string, fileName: string) {
    this.filePath = path.join(dataDir, `${fileName}.json`);
  }

  /**
   * 初始化加载数据
   */
  async initialize(): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.filePath));
      const exists = await fs.pathExists(this.filePath);
      if (exists) {
        const content = await fs.readJson(this.filePath);
        this.data = content.data || [];
        this.nextId = content.nextId || this.calculateNextId();
      } else {
        this.data = [];
        this.nextId = 1;
        await this.save();
      }
    } catch (error) {
      console.error(`Failed to load ${this.filePath}:`, error);
      this.data = [];
      this.nextId = 1;
    }
  }

  /**
   * 保存数据到文件
   */
  protected async save(): Promise<void> {
    await fs.writeJson(this.filePath, {
      data: this.data,
      nextId: this.nextId
    }, { spaces: 2 });
  }

  /**
   * 计算下一个ID
   */
  private calculateNextId(): number {
    if (this.data.length === 0) return 1;
    const maxId = Math.max(...this.data.map(item => this.getId(item)));
    return maxId + 1;
  }

  /**
   * 获取ID（子类覆盖）
   */
  protected abstract getId(item: T): number;

  /**
   * 获取所有数据
   */
  async findAll(): Promise<T[]> {
    return this.data.filter(item => !item.isDeleted);
  }

  /**
   * 根据ID查找
   */
  async findById(id: number): Promise<T | null> {
    const item = this.data.find(item => this.getId(item) === id && !item.isDeleted);
    return item || null;
  }

  /**
   * 创建
   */
  async create(data: Record<string, any>): Promise<T> {
    const now = new Date();
    const newItem = {
      ...data,
      [this.getIdName()]: this.nextId++,
      createdAt: now,
      updatedAt: now,
      isDeleted: false
    } as unknown as T;

    this.data.push(newItem);
    await this.save();
    return newItem;
  }

  /**
   * 更新
   */
  async update(id: number, data: Partial<T>): Promise<T> {
    const index = this.data.findIndex(item => this.getId(item) === id && !item.isDeleted);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    this.data[index] = {
      ...this.data[index],
      ...data,
      updatedAt: new Date()
    };

    await this.save();
    return this.data[index];
  }

  /**
   * 软删除
   */
  async delete(id: number): Promise<void> {
    const index = this.data.findIndex(item => this.getId(item) === id && !item.isDeleted);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    this.data[index].isDeleted = true;
    this.data[index].updatedAt = new Date();
    await this.save();
  }

  /**
   * 获取ID字段名
   */
  protected getIdName(): string {
    return 'id';
  }
}