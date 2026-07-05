# Planner Backend

基于 Express + TypeScript + Prisma 的规划后端 API。

## 功能特性

- 📁 **项目管理** - 创建、编辑、删除项目
- 🎯 **目标管理** - 在项目中创建目标，支持优先级排序，标记完成状态
- 🔒 **约束系统** - 为项目和目标添加约束条件，支持插件通过约束实现个性化定制
- 🔌 **插件扩展** - 基于约束系统和额外数据表的插件式扩展架构，核心保持精简

## 技术栈

- **Node.js** - 运行时环境
- **TypeScript** - 类型安全的 JavaScript
- **Express** - Web 框架
- **Prisma ORM** - 数据库 ORM
- **Swagger UI** - API 文档界面
- **CORS** - 跨域资源共享

## 项目结构

```
backend/
├── openapi/
│   └── spec/          # OpenAPI 规范文件
├── prisma/            # Prisma ORM 配置
│   └── schema.prisma  # 数据库模型定义
├── src/
│   ├── controllers/   # 控制器（处理请求）
│   ├── lib/           # 工具库
│   ├── openapi/       # OpenAPI 相关代码
│   ├── repositories/  # 数据访问层
│   │   ├── json/      # JSON 文件存储实现
│   │   └── prisma/    # Prisma 存储实现
│   ├── routes/        # 路由定义
│   ├── utils/         # 工具函数
|   └── plugins/           # 插件系统核心代码
├── test/              # 测试脚本
└── dist/              # 编译输出（构建后生成）
```

## 快速开始

### 前置要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
cd backend
npm install
```

### 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

根据需要修改 `.env` 中的配置：

```env
# 端口配置
PORT=3000

# 存储类型: json 或 prisma
STORAGE_TYPE=prisma

# 数据库连接 URL（Prisma 使用）
DATABASE_URL="mysql://root:password@localhost:3306/planner?schema=public"
```

### 初始化数据库（使用 Prisma 时）

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行迁移
npx prisma migrate dev
```

### 开发模式运行

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## API 文档

启动服务器后，可以访问以下地址查看 API 文档：

```
http://localhost:3000/api-docs
```

API 文档基于 OpenAPI 3.0 规范，提供交互式文档页面，可以直接在线测试 API。

## API 端点

## 运行测试

## 存储切换

项目支持两种存储方式，通过环境变量 `STORAGE_TYPE` 切换：

- **json** - 使用 JSON 文件存储，适合开发和简单场景
- **prisma** - 使用 Prisma ORM，支持多种数据库，适合生产环境

修改 `.env` 文件中的 `STORAGE_TYPE` 即可切换存储引擎，无需修改代码。

## 开发

### 类型检查

```bash
npx tsc
```

### 代码规范

项目使用 TypeScript 编写，请确保代码通过类型检查。

## 许可证

MIT