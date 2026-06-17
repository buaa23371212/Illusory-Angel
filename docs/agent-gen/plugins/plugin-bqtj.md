# 爆枪英雄养成插件开发文档

## 插件功能概述

## 约束数据结构

本插件定义三种约束类型，分别存储不同类型的养成数据：

---

### 1. 每日掉落限制约束

#### 约束基本信息

- **ownerType**: `PROJECT`（固定）
- **ownerId**: 项目ID（关联到具体项目）
- **constraintName**: `daily_drop_limit`（固定，表示每日掉落限制）

#### params JSON 结构

params 字段是一个 JSON 对象，key 为资源ID，value 为限制配置，包含以下字段：

- **resourceId**: 字符串，资源唯一标识
- **resourceName**: 字符串，资源名称（用于显示）
- **limit**: 整数，每日掉落限制数量
- **current**: 整数，当前已获取数量
- **resetAt**: 整数，下次重置时间戳（用于自动重置）

---

### 2. 每周掉落限制约束

#### 约束基本信息

- **ownerType**: `PROJECT`（固定）
- **ownerId**: 项目ID（关联到具体项目）
- **constraintName**: `weekly_drop_limit`（固定，表示每周掉落限制）

#### params JSON 结构

params 字段是一个 JSON 对象，key 为资源ID，value 为限制配置，包含以下字段：

- **resourceId**: 字符串，资源唯一标识
- **resourceName**: 字符串，资源名称（用于显示）
- **limit**: 整数，每周掉落限制数量
- **current**: 整数，当前已获取数量
- **resetAt**: 整数，下次重置时间戳（用于自动重置）

---

### 3. 目标属性约束

#### 约束基本信息

- **ownerType**: `GOAL`（固定）
- **ownerId**: 目标ID（关联到具体目标）
- **constraintName**: `goal_attributes`（固定，表示目标属性扩展）

#### params JSON 结构

params 字段是一个 JSON 对象，存储目标的扩展属性，这些属性不属于核心目标表的基础字段：

- **priority**: 整数，优先级，1-5，1 最高，5 最低，用于排序和展示
- **parentId**: 整数，可为 null，父目标ID，null 表示无父目标（根目标）
- **requiredQuantity**: 整数，需要的数量，表示完成此目标需要多少个该物品/资源
- **goalType**: 字符串，目标类型，如 "equipment_craft"（装备制作）、"resource_collection"（资源获取）等

---

### 4. 背包已有资源约束

#### 约束基本信息

- **ownerType**: `PROJECT`（固定）
- **ownerId**: 项目ID（关联到具体项目）
- **constraintName**: `inventory_resources`（固定，表示背包已有资源）

#### params JSON 结构

params 字段是一个 JSON 对象，key 为资源ID，value 为已有数量：

- **resourceId**: 字符串，资源唯一标识
- **resourceName**: 字符串，资源名称（用于显示）
- **quantity**: 整数，背包中已有的数量

## 语义说明

## 后端 API 设计

### 接口端点

所有接口统一使用前缀 `/api/v1/projects/:projectId/plugins/bqtj`

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/v1/projects/:projectId/plugins/bqtj` | 获取项目下所有养成约束数据（掉落限制、背包资源） |
| POST | `/api/v1/projects/:projectId/plugins/bqtj/constraint/:constraintName` | 更新指定约束的 params 数据 |

### 接口说明

- **GET 获取所有数据**：一次性返回项目下所有四种约束（每日掉落限制、每周掉落限制、背包已有资源）的完整数据，前端本地处理即可，不需要多次请求
- **POST 更新约束**：根据 `constraintName` 和项目信息找到对应约束记录，直接替换 params 数据，前端负责维护完整数据结构

### 请求响应格式

遵循项目统一的 RESTful 响应格式，使用标准的成功失败标记。

## 功能需求

### 基本功能

### 业务规则

## 前端功能需求

### 页面组件

### 集成位置

### 交互设计

## 后端目录结构

插件遵循项目插件目录规范，后端存放位置：

`src/plugins/bqtj/`

目录结构：
- `routes.ts` - 路由定义
- `controller.ts` - 控制器
- `service.ts` - 业务逻辑（自动重置、进度计算等）
- `types.ts` - 类型定义

因为掉落限制插件有自动重置和进度计算的业务逻辑，所以需要 Service 层处理这些复杂逻辑。

## 类型定义

在 `types.ts` 中定义掉落限制配置的 TypeScript 接口，与 params JSON 结构对应，保证类型安全。

## 业务逻辑处理

## 前端目录结构

前端存放位置：

`src/plugins/bqtj/`

目录结构：
- `components/` - React 组件
- `api.ts` - API 调用封装
- `types.ts` - 类型定义
- `index.tsx` - 插件入口组件
- `utils.ts` - 工具函数（进度计算、格式化等）

## 集成位置

### 布局结构

### 具体集成位置

## 数据迁移

本插件使用核心约束表，不需要新建表，不需要数据库迁移。开发完成直接部署使用。

## 与目标规划系统集成

### 进度提示语义

### 集成点
