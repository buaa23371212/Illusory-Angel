/**
 * 养成计划器后端API入口
 * 启动Express服务器，配置中间件和路由
 */

import express from 'express';
import cors from 'cors';
import { setupOpenAPIRoutes } from './openapi/ui';
import { apiRouter } from './routes';

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 基础中间件配置
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: NODE_ENV });
});

// API路由
app.use('/api/v1', apiRouter);

// 开发环境：提供OpenAPI UI文档
if (NODE_ENV === 'development') {
  setupOpenAPIRoutes(app);
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  if (NODE_ENV === 'development') {
    console.log(`📚 OpenAPI Documentation: http://localhost:${PORT}/api-docs`);
  }
});

export default app;