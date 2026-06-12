-- ============================================
-- 养成计划器 - 数据库 schema 通用模板
-- 描述: 完全通用的核心表结构，支持各类养成/计划类任务（不限于游戏）
--       所有个性化需求通过约束系统(JSON)实现扩展
-- 架构: 项目 → 目标 → 约束 三级架构
-- ============================================

-- 创建数据库（使用占位符方便脚本替换：{{DB_NAME}}）
CREATE DATABASE IF NOT EXISTS {{DB_NAME}} 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE {{DB_NAME}};

-- ============================================
-- 表1: projects - 项目表
-- 描述: 一个项目对应一个养成/计划任务（可以是游戏养成，也可以是学习、健身、投资等各类计划）
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    project_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '项目ID',
    name VARCHAR(255) NOT NULL COMMENT '项目名称',
    description TEXT DEFAULT NULL COMMENT '项目描述',
    category VARCHAR(100) DEFAULT NULL COMMENT '项目分类（如：游戏养成、学习计划、健身目标等）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记: 0-未删除, 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- ============================================
-- 表2: goals - 目标表
-- 描述: 一个项目包含多个目标，目标可以嵌套依赖（前置任务也是目标）
-- 说明: 不包含业务特定字段，各类个性化信息通过约束系统扩展实现
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
    goal_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '目标ID',
    project_id INT UNSIGNED NOT NULL COMMENT '所属项目ID',
    name VARCHAR(255) NOT NULL COMMENT '目标名称',
    description TEXT DEFAULT NULL COMMENT '目标描述',
    priority TINYINT UNSIGNED NOT NULL DEFAULT 3 COMMENT '优先级: 1-最高, 2-高, 3-中, 4-低, 5-最低',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_completed TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否完成: 0-未完成, 1-已完成',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记: 0-未删除, 1-已删除',
    
    -- 外键约束
    FOREIGN KEY (project_id) REFERENCES projects(project_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='目标表';

-- 索引优化查询
CREATE INDEX idx_project_id ON goals(project_id);
CREATE INDEX idx_priority ON goals(priority);
CREATE INDEX idx_is_completed ON goals(is_completed);

-- ============================================
-- 表3: constraints - 约束表
-- 描述: 约束可以附加在项目或目标上，通过JSON存储灵活扩展不同类型
-- 所有者类型: 'project' 表示项目（全局约束），'goal' 表示目标（目标约束）
-- ============================================
CREATE TABLE IF NOT EXISTS constraints (
    constraint_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '约束ID',
    owner_type ENUM('project', 'goal') NOT NULL COMMENT '所有者类型: project-项目, goal-目标',
    owner_id INT UNSIGNED NOT NULL COMMENT '所有者ID（项目ID或目标ID）',
    constraint_name VARCHAR(100) DEFAULT NULL COMMENT '约束名称（可选）',
    
    -- 约束参数(JSON格式存储，灵活适应不同约束类型)
    params JSON NOT NULL COMMENT '约束参数(JSON格式)，不同类型参数结构不同：
        - dependency: { "target_goal_id": 123, "required_quantity": 1 } - 依赖目标
        - property: { "attribute": "required_quantity", "operator": ">=", "value": 100 } - 属性比较约束
        - comparison: { "goal_a_id": 1, "attribute_a": "level", "operator": ">", "goal_b_id": 2, "attribute_b": "level" } - 目标间比较约束
        - drop_limit: { "resource_goal_id": 123, "daily": 120, "weekly": 0 } - 每日/每周获取限制
        - quantity: { "min": 1, "max": 5 } - 数量范围约束
        - current: { "attribute": "current_quantity", "value": 0 } - 当前进度记录
    ',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '软删除标记: 0-未删除, 1-已删除',
    
    -- 索引优化查询
    INDEX idx_owner (owner_type, owner_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='约束表';

-- ============================================
-- 完成提示
-- ============================================
SELECT '数据库 schema 初始化完成！' AS message;
SELECT COUNT(*) AS project_count FROM projects WHERE is_deleted = 0;
SELECT COUNT(*) AS goal_count FROM goals WHERE is_deleted = 0;
SELECT COUNT(*) AS constraint_count FROM constraints WHERE is_deleted = 0;