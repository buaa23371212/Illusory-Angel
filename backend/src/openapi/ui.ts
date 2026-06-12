/**
 * OpenAPI UI 集成
 * 在开发环境提供交互式API文档界面
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'yaml';
import path from 'path';

/**
 * 设置OpenAPI文档路由
 * @param app Express应用实例
 */
export function setupOpenAPIRoutes(app: express.Application): void {
  try {
    // 读取并解析OpenAPI YAML文件
    const specPath = path.join(__dirname, '../../openapi/spec/v1.yaml');
    const specContent = fs.readFileSync(specPath, 'utf-8');
    const openapiSpec = yaml.parse(specContent);

    // 挂载Swagger UI
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(openapiSpec, {
        explorer: true,
        customSiteTitle: 'Game Planner API Documentation'
      })
    );

    // 提供原始JSON格式spec
    app.get('/api-docs/spec.json', (req, res) => {
      res.json(openapiSpec);
    });

    console.log('📚 OpenAPI UI setup complete at /api-docs');
  } catch (err) {
    console.error('❌ Failed to setup OpenAPI UI:', err);
    console.warn('OpenAPI documentation will not be available');
  }
}