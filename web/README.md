# Planner Web Frontend

基于 React + TypeScript + Vite 构建的规划前端应用，采用插件化架构设计。

## 📖 项目概述

Planner 是一个用于规划管理的应用，帮助玩家规划目标和进度。前端采用现代化插件化架构设计，支持通过插件扩展功能。

### 核心特性

- 🎮 **项目管理** - 创建和管理多个规划项目
- ✅ **目标追踪** - 记录和追踪目标完成进度
- 🔌 **插件化架构** - 灵活的插件系统支持功能扩展
- 🎯 **多种扩展点** - 支持UI各个层面的定制和扩展
- 🎨 **现代化UI** - 基于 Tailwind CSS + shadcn/ui 构建
- ⚡ **快速开发** - 使用 Vite 提供极速开发体验

## 🏗️ 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **UI组件**: shadcn/ui
- **HTTP客户端**: Axios
- **状态管理**: React Hooks (useState/useEffect/useCallback)
- **代码规范**: ESLint

## 📁 项目结构

```
web/
├── public/              # 静态资源
├── src/
│   ├── api/            # API客户端和类型定义
│   ├── components/     # 通用UI组件
│   ├── hooks/          # 自定义React Hooks
│   ├── lib/            # 工具函数库
│   ├── plugins/        # 插件系统核心代码
│   │   ├── types.ts    # 插件类型定义
│   │   ├── registry.ts # 插件注册中心
│   │   ├── context.tsx # React Context
│   │   └── hooks.ts    # 插件相关Hooks
│   ├── App.tsx         # 应用入口组件
│   └── main.tsx        # 应用入口文件
├── docs/               # 设计文档
├── .env.example        # 环境变量示例
├── package.json        # 依赖配置
├── tsconfig.json       # TypeScript配置
├── vite.config.ts      # Vite配置
└── tailwind.config.js  # Tailwind配置
```

## 🔌 插件化架构

本项目采用插件化设计理念，核心功能保持简洁，通过插件支持功能扩展。

### 预定义扩展点

| 扩展点 | 说明 |
|--------|------|
| `featureSidebarItems` | 最左侧导航栏菜单项 |
| `navigationMenuItems` | 中间对应功能导航栏 |
| `projectActionMenuItems` | 项目操作菜单项 |
| `projectFormFieldItems` | 项目级别的表单字段操作菜单项 |
| `contentPanelExtensions` | 内容区面板扩展 |
| `goalListFilters` | 目标列表筛选器扩展 |
| `goalListSorters` | 目标列表排序方式扩展 |
| `goalCardRenderers` | 目标卡片渲染器（可替换默认设计） |
| `goalCardBadge` | 目标卡片标签接口（可用于约束的可视化展示） |
| `goalActionMenuItems` | 目标操作菜单项 |
| `goalFormFieldExtensions` | 目标创建/更新表单字段扩展 |
| `globalComponents` | 全局组件扩展（如闹钟轮循） |
| `apiExtensions` | API扩展点（如自定义API调用） |

注：
表单字段扩展主要修改约束，前端显示不一定是描述约束，可以是目标本身

### 插件开发

1. **创建插件**: 实现 `Plugin` 接口
2. **注册扩展**: 在初始化函数中向注册中心注册扩展
3. **启用/禁用**: 通过 localStorage 持久化插件状态，无需数据库存储

详细设计文档请参考 [docs/agent-gen/ui-design.md](./docs/agent-gen/ui-design.md)

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置后端API地址：

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 开发模式

启动开发服务器：

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动，支持热更新。

## 📝 开发指南

### 创建新插件

```typescript
import type { Plugin } from '@/plugins/types';

export const myPlugin: Plugin = {
  id: 'my-plugin',
  name: '我的插件',
  description: '这是我的第一个插件',
  version: '1.0.0',
  initialize: () => {
    // 在这里注册你的扩展
    // pluginRegistry.registerProjectActionMenuItem(...);
  }
};
```

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run lint` - 运行 ESLint 检查
- `npm run preview` - 预览生产构建

## 🎨 UI 设计

- 使用 Tailwind CSS 进行样式开发
- 采用 shadcn/ui 组件库提供一致的用户体验
- 支持响应式布局，适配不同屏幕尺寸
- 使用深色/浅色主题（可扩展）

## 🔧 配置说明

### Vite 配置

配置文件位于 `vite.config.ts`，已配置路径别名 `@` 指向 `src` 目录。

### TypeScript 配置

配置文件位于 `tsconfig.json`，开启了严格类型检查。

## 📄 许可证

本项目为私有项目。
