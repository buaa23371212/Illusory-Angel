/**
 * 导航栏菜单项接口
 * 插件可以注册自定义菜单项到中间功能导航栏的操作菜单
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
  /** 是否分隔线 */
  separator?: boolean;
}

/**
 * 导航栏面板扩展接口
 * 插件可以注册自定义面板替换中间功能导航栏的内容
 * 类似于 contentPanelExtensions 替换内容区，此扩展点替换导航栏
 */
export interface NavigationPanelExtension {
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
    /** 项目变化回调 */
    onProjectChange: () => void;
  }>;
  /** 排序位置 */
  order?: number;
  /** 匹配的项目分类：选中该分类的项目时自动使用此导航栏面板 */
  matchProjectCategory?: string;
}

/**
 * 目标卡片渲染器接口
 * 插件可以注册自定义目标卡片渲染，替换单个目标卡片的设计
 * 列表框架保持默认，只替换单个卡片的渲染
 */
export interface GoalCardRenderer {
  /** 渲染器唯一标识 */
  id: string;
  /** 渲染器名称 */
  name: string;
  /** 渲染器组件 - 接收单个目标数据，负责渲染单个卡片 */
  component: React.ComponentType<{
    /** 目标数据 */
    goal: any;
    /** 项目ID */
    projectId: number;
    /** 目标切换完成状态回调 */
    onToggleComplete: (goal: any) => void;
    /** 删除目标回调 */
    onDelete: (goalId: number) => void;
  }>;
}

/**
 * 目标卡片标签接口
 * 插件可以在默认目标卡片的标题区域添加标签
 * 不需要替换整个卡片，只添加额外的标签展示
 */
export interface GoalCardBadge {
  /** 标签唯一标识 */
  id: string;
  /** 标签组件 - 接收目标数据，返回要显示的标签内容 */
  component: React.ComponentType<{
    /** 目标数据 */
    goal: any;
    /** 项目ID */
    projectId: number;
  }>;
}

/**
 * 项目操作菜单项接口
 * 插件可以在项目操作菜单添加自定义选项
 * 支持两种方式：
 * 1. 简单方式：提供 label, icon, onClick
 * 2. 组件方式：提供自定义 component，完全控制渲染
 */
export interface ProjectActionMenuItem {
  /** 菜单项唯一标识 */
  id: string;
  /** 菜单项文本（简单方式必填） */
  label?: string;
  /** 图标组件（可选） */
  icon?: React.ComponentType<{ className?: string }>;
  /** 点击回调（简单方式必填） */
  onClick?: (project: any) => void;
  /** 自定义组件（组件方式必填） */
  component?: React.ComponentType<{
    /** 项目数据 */
    project: any;
  }>;
  /** 是否分隔线 */
  separator?: boolean;
}

/**
 * 目标操作菜单项接口
 * 插件可以在目标操作菜单添加自定义选项
 * 支持两种方式：
 * 1. 简单方式：提供 label, icon, onClick
 * 2. 组件方式：提供自定义 component，完全控制渲染
 * 3. 对话框方式：提供 dialogComponent，点击后打开对话框
 */
export interface GoalActionMenuItem {
  /** 菜单项唯一标识 */
  id: string;
  /** 菜单项文本（简单方式必填） */
  label?: string;
  /** 图标组件（可选） */
  icon?: React.ComponentType<{ className?: string }>;
  /** 点击回调（简单方式必填） */
  onClick?: (goal: any, projectId: number) => void;
  /** 自定义组件（组件方式必填） */
  component?: React.ComponentType<{
    /** 目标数据 */
    goal: any;
    /** 项目ID */
    projectId: number;
  }>;
  /** 对话框组件（对话框方式） */
  dialogComponent?: React.ComponentType<{
    /** 对话框是否打开 */
    open: boolean;
    /** 对话框打开状态变化回调 */
    onOpenChange: (open: boolean) => void;
    /** 目标数据 */
    goal: any;
    /** 项目ID */
    projectId: number;
  }>;
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
  /** 匹配的项目分类：选中该分类的项目时自动显示此面板，而非默认的 GoalList */
  matchProjectCategory?: string;
}

/**
 * 全局组件接口
 * 插件可以注册全局组件，这些组件会在应用根节点渲染
 * 适合实现轮询、通知、全局监听等功能
 */
export interface GlobalComponent {
  /** 全局组件唯一标识 */
  id: string;
  /** 全局组件，不需要接收props */
  component: React.ComponentType;
}

/**
 * API扩展接口
 * 插件可以注册自定义API方法，供其他地方调用
 */
export interface ApiExtension {
  /** API方法唯一标识，格式为: pluginId.methodName */
  id: string;
  /** API方法 */
  method: (...args: any[]) => any;
}

/**
 * 插件注册表，包含所有扩展点的注册信息
 */
export interface PluginRegistry {
  /** 导航栏菜单项 */
  navigationMenuItems: NavigationMenuItem[];
  /** 导航栏面板扩展 */
  navigationPanelExtensions: NavigationPanelExtension[];
  /** 目标卡片渲染器 */
  goalCardRenderers: GoalCardRenderer[];
  /** 目标卡片标签 */
  goalCardBadges: GoalCardBadge[];
  /** 项目操作菜单项 */
  projectActionMenuItems: ProjectActionMenuItem[];
  /** 目标操作菜单项 */
  goalActionMenuItems: GoalActionMenuItem[];
  /** 表单字段扩展 */
  formFieldExtensions: FormFieldExtension[];
  /** 内容区面板扩展 */
  contentPanelExtensions: ContentPanelExtension[];
  /** 全局组件 - 在应用根节点渲染 */
  globalComponents: GlobalComponent[];
  /** API扩展 - 插件注册的自定义API方法 */
  apiExtensions: ApiExtension[];
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
  /** 插件提供的API扩展方法 */
  apiExtensions?: ApiExtension[];
  /** 插件初始化函数 */
  initialize?: () => void;
}

/**
 * 默认空的插件注册表
 */
export const defaultRegistry: PluginRegistry = {
  navigationMenuItems: [],
  navigationPanelExtensions: [],
  goalCardRenderers: [],
  goalCardBadges: [],
  projectActionMenuItems: [],
  goalActionMenuItems: [],
  formFieldExtensions: [],
  contentPanelExtensions: [],
  globalComponents: [],
  apiExtensions: [],
};