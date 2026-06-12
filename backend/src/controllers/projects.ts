/**
 * 项目管理控制器
 * 实现项目的CRUD操作
 */

import { Request, Response } from 'express';
import { getRepository } from '../repositories';
import { success, error, notFound, serverError } from '../utils/response';

import type { Project } from '@prisma/client';

/**
 * 获取项目列表
 * GET /api/v1/projects
 * 返回格式遵循OpenAPI规范: {success: true, data: {list: Project[], total, page, total_pages}}
 */
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const repo = await getRepository();
    const projects = await repo.project.findAll();
    // 按创建时间降序排序
    projects.sort((a: Project, b: Project) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // 遵循OpenAPI规范返回分页格式
    const responseData = {
      list: projects,
      total: projects.length,
      page: 1,
      total_pages: 1
    };
    
    success(res, responseData);
  } catch (err) {
    console.error('Failed to get projects:', err);
    serverError(res, 'Failed to get projects');
  }
}

/**
 * 创建项目
 * POST /api/v1/projects
 */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, category } = req.body;

    // 验证必填字段
    if (!name || name.trim() === '') {
      error(res, 'Project name is required');
      return;
    }

    const repo = await getRepository();
    const project = await repo.project.create({
      name: name.trim(),
      description: description || null,
      category: category || null
    });

    success(res, project, 'Project created successfully');
  } catch (err) {
    console.error('Failed to create project:', err);
    serverError(res, 'Failed to create project');
  }
}

/**
 * 获取项目详情
 * GET /api/v1/projects/:id
 */
export async function getProjectById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      error(res, 'Invalid project ID');
      return;
    }

    const repo = await getRepository();
    const project = await repo.project.findById(projectId);

    if (!project) {
      notFound(res, 'Project');
      return;
    }

    success(res, project);
  } catch (err) {
    console.error('Failed to get project:', err);
    serverError(res, 'Failed to get project');
  }
}

/**
 * 更新项目
 * PUT /api/v1/projects/:id
 */
export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);
    const { name, description, category } = req.body;

    if (isNaN(projectId)) {
      error(res, 'Invalid project ID');
      return;
    }

    const repo = await getRepository();
    // 检查项目是否存在
    const existing = await repo.project.findById(projectId);

    if (!existing) {
      notFound(res, 'Project');
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;

    const project = await repo.project.update(projectId, updateData);

    success(res, project, 'Project updated successfully');
  } catch (err) {
    console.error('Failed to update project:', err);
    serverError(res, 'Failed to update project');
  }
}

/**
 * 删除项目
 * DELETE /api/v1/projects/:id
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      error(res, 'Invalid project ID');
      return;
    }

    const repo = await getRepository();
    // 检查项目是否存在
    const existing = await repo.project.findById(projectId);

    if (!existing) {
      notFound(res, 'Project');
      return;
    }

    await repo.project.delete(projectId);

    success(res, null, 'Project deleted successfully');
  } catch (err) {
    console.error('Failed to delete project:', err);
    serverError(res, 'Failed to delete project');
  }
}

/**
 * 获取项目所有约束
 * GET /api/v1/projects/:projectId/constraints
 */
export async function getProjectConstraints(req: Request, res: Response): Promise<void> {
  try {
    const { projectId } = req.params;
    const projectIdNum = parseInt(projectId);

    if (isNaN(projectIdNum)) {
      error(res, 'Invalid project ID');
      return;
    }

    const repo = await getRepository();
    // 检查项目是否存在
    const existing = await repo.project.findById(projectIdNum);

    if (!existing) {
      notFound(res, 'Project');
      return;
    }

    const constraints = await repo.constraint.findByOwner('PROJECT', projectIdNum);
    success(res, constraints);
  } catch (err) {
    console.error('Failed to get project constraints:', err);
    serverError(res, 'Failed to get project constraints');
  }
}