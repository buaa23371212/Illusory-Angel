/**
 * 导航栏菜单项接口
 * 插件可以注册自定义菜单项到顶部导航栏
 */
export interface NavigationMenuItem {
  /** 菜单项唯一标识 */
  id: string;
  /** 菜单项显示文本 */
  label: string;
  /** 菜单项图标组件（可选） */
  icon?: React.ComponentType<{ className?: string }>;
  /** 点击菜单项时的回调函数 */
  onClick?: () => void;
  /** 菜单项链接地址（如果是路由跳转） */
  href?: string;
  /** 排序权值，越小越靠前 */
  order?: number;
}

/**
 * 目标列表展示组件接口
 * 插件可以注册自定义目标列表展示组件
 */
export interface GoalListRenderer {
  /** 渲染器唯一标识 */
  id: string;
  /** 渲染器名称 */
  name: string;
  /** 渲染器组件 */
  component: React.ComponentType<{
    /** 当前选中的项目 */
    selectedProject: any;
    /** 目标变化回调 */
    onGoalChange: () => void;
  }>;
}

/**
 * 目标卡片扩展内容接口
 * 插件可以在目标卡片中插入额外内容
 */
export interface GoalCardExtension {
  /** 扩展唯一标识 */
  id: string;
  /** 扩展组件 */
  component: React.ComponentType<{
    /** 目标数据 */
    goal: any;
    /** 项目ID */
    projectId: number;
  }>;
  /** 排序位置 */
  order?: number;
}

/**
 * 项目详情侧边栏面板接口
 * 插件可以在项目详情侧边栏添加自定义面板
 */
export interface SidebarPanelExtension {
  /** 面板唯一标识 */
  id: string;
  /** 面板标题 */
  title: string;
  /** 面板组件 */
  component: React.ComponentType<{
    /** 当前选中的项目 */
    selectedProject: any;
  }>;
  /** 排序位置 */
  order?: number;
}

/**
 * 项目操作菜单项接口
 * 插件可以在项目操作菜单添加自定义选项
 */
export interface ProjectActionMenuItem {
  /** 菜单项唯一标识 */
  id: string;
  /** 菜单项文本 */
  label: string;
  /** 图标组件（可选） */
  icon?: React.ComponentType<{ className?: string }>;
  /** 点击回调 */
  onClick: (project: any) => void;
  /** 是否分隔线 */
  separator?: boolean;
}

/**
 * 目标操作菜单项接口
 * 插件可以在目标操作菜单添加自定义选项
 */
export interface GoalActionMenuItem {
  /** 菜单项唯一标识 */
  id: string;
  /** 菜单项文本 */
  label: string;
  /** 图标组件（可选） */
  icon?: React.ComponentType<{ className?: string }>;
  /** 点击回调 */
  onClick: (goal: any, projectId: number) => void;
  /** 是否分隔线 */
  separator?: boolean;
}

/**
 * 表单项扩展接口
 * 插件可以在创建/编辑目标表单中插入自定义表单项
 */
export interface FormFieldExtension {
  /** 表单项唯一标识 */
  id: string;
  /** 表单项组件 */
  component: React.ComponentType<{
    /** 当前表单数据 */
    values: any;
    /** 表单数据变化回调 */
    onChange: (values: any) => void;
  }>;
  /** 排序位置 */
  order?: number;
}

/**
 * 详情页底部扩展接口
 * 插件可以在详情页底部添加自定义内容
 */
export interface DetailBottomExtension {
  /** 扩展唯一标识 */
  id: string;
  /** 扩展组件 */
  component: React.ComponentType<{
    /** 当前目标 */
    goal: any;
    /** 项目ID */
    projectId: number;
  }>;
  /** 排序位置 */
  order?: number;
}

/**
 * 页面头部操作区扩展接口
 * 插件可以在页面头部添加自定义操作按钮
 */
export interface HeaderActionExtension {
  /** 扩展唯一标识 */
  id: string;
  /** 按钮组件 */
  component: React.ComponentType<{
    /** 当前选中的项目 */
    selectedProject: any;
  }>;
  /** 排序位置 */
  order?: number;
}

/**
 * 内容区面板扩展接口
 * 插件可以注册自定义面板到内容展示区，通过操作菜单项控制显示
 */
export interface ContentPanelExtension {
  /** 面板唯一标识 */
  id: string;
  /** 面板显示名称 */
  label: string;
  /** 面板图标组件（可选） */
  icon?: React.ComponentType<{ className?: string }>;
  /** 面板组件 */
  component: React.ComponentType<{
    /** 当前选中的项目 */
    selectedProject: any;
    /** 目标变化回调 */
    onGoalChange: () => void;
  }>;
  /** 排序位置 */
  order?: number;
}

/**
 * 插件注册表，包含所有扩展点的注册信息
 */
export interface PluginRegistry {
  /** 导航栏菜单项 */
  navigationMenuItems: NavigationMenuItem[];
  /** 目标列表渲染器 */
  goalListRenderers: GoalListRenderer[];
  /** 目标卡片扩展内容 */
  goalCardExtensions: GoalCardExtension[];
  /** 项目详情侧边栏面板 */
  sidebarPanelExtensions: SidebarPanelExtension[];
  /** 项目操作菜单项 */
  projectActionMenuItems: ProjectActionMenuItem[];
  /** 目标操作菜单项 */
  goalActionMenuItems: GoalActionMenuItem[];
  /** 表单字段扩展 */
  formFieldExtensions: FormFieldExtension[];
  /** 详情页底部扩展 */
  detailBottomExtensions: DetailBottomExtension[];
  /** 页面头部操作区扩展 */
  headerActionExtensions: HeaderActionExtension[];
  /** 内容区面板扩展 */
  contentPanelExtensions: ContentPanelExtension[];
}

/**
 * 插件信息接口
 */
export interface Plugin {
  /** 插件唯一标识 */
  id: string;
  /** 插件名称 */
  name: string;
  /** 插件描述 */
  description?: string;
  /** 插件版本 */
  version?: string;
  /** 插件初始化函数 */
  initialize?: () => void;
}

/**
 * 默认空的插件注册表
 */
export const defaultRegistry: PluginRegistry = {
  navigationMenuItems: [],
  goalListRenderers: [],
  goalCardExtensions: [],
  sidebarPanelExtensions: [],
  projectActionMenuItems: [],
  goalActionMenuItems: [],
  formFieldExtensions: [],
  detailBottomExtensions: [],
  headerActionExtensions: [],
  contentPanelExtensions: [],
};