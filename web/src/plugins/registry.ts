import type {
  PluginRegistry,
  NavigationMenuItem,
  GoalListRenderer,
  GoalCardExtension,
  SidebarPanelExtension,
  ProjectActionMenuItem,
  GoalActionMenuItem,
  FormFieldExtension,
  DetailBottomExtension,
  HeaderActionExtension,
  ContentPanelExtension,
  Plugin,
} from './types';
import { defaultRegistry } from './types';

/**
 * 插件注册表单例
 * 管理所有插件扩展点的注册信息
 */
class PluginRegistrySingleton {
  private registry: PluginRegistry;
  private plugins: Map<string, Plugin>;

  constructor() {
    this.registry = { ...defaultRegistry };
    this.plugins = new Map();
  }

  /**
   * 获取当前注册表
   */
  getRegistry(): PluginRegistry {
    return { ...this.registry };
  }

  /**
   * 获取已注册的插件列表
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 注册一个插件
   */
  registerPlugin(plugin: Plugin): void {
    this.plugins.set(plugin.id, plugin);
    if (plugin.initialize) {
      plugin.initialize();
    }
  }

  /**
   * 注销一个插件
   */
  unregisterPlugin(pluginId: string): void {
    this.plugins.delete(pluginId);
    // 移除该插件注册的所有扩展点
    // 需要保留其他插件的扩展点，所以这里不做清理
    // 如果需要完全清理，使用者应该重新初始化
  }

  /**
   * 注册导航栏菜单项
   */
  registerNavigationMenuItem(item: NavigationMenuItem): void {
    // 检查是否已存在相同ID，如果存在则替换
    this.registry.navigationMenuItems = this.registry.navigationMenuItems
      .filter(existing => existing.id !== item.id)
      .concat([item]);
    // 按排序权值排序
    this.sortByOrder(this.registry.navigationMenuItems);
  }

  /**
   * 注销导航栏菜单项
   */
  unregisterNavigationMenuItem(id: string): void {
    this.registry.navigationMenuItems = this.registry.navigationMenuItems
      .filter(item => item.id !== id);
  }

  /**
   * 获取所有注册的导航栏菜单项（已排序）
   */
  getNavigationMenuItems(): NavigationMenuItem[] {
    return [...this.registry.navigationMenuItems];
  }

  /**
   * 注册目标列表渲染器
   */
  registerGoalListRenderer(renderer: GoalListRenderer): void {
    this.registry.goalListRenderers = this.registry.goalListRenderers
      .filter(existing => existing.id !== renderer.id)
      .concat([renderer]);
  }

  /**
   * 注销目标列表渲染器
   */
  unregisterGoalListRenderer(id: string): void {
    this.registry.goalListRenderers = this.registry.goalListRenderers
      .filter(renderer => renderer.id !== id);
  }

  /**
   * 获取目标列表渲染器
   */
  getGoalListRenderers(): GoalListRenderer[] {
    return [...this.registry.goalListRenderers];
  }

  /**
   * 获取指定ID的目标列表渲染器
   */
  getGoalListRenderer(id: string): GoalListRenderer | undefined {
    return this.registry.goalListRenderers.find(r => r.id === id);
  }

  /**
   * 注册目标卡片扩展
   */
  registerGoalCardExtension(extension: GoalCardExtension): void {
    this.registry.goalCardExtensions = this.registry.goalCardExtensions
      .filter(existing => existing.id !== extension.id)
      .concat([extension]);
    this.sortByOrder(this.registry.goalCardExtensions);
  }

  /**
   * 注销目标卡片扩展
   */
  unregisterGoalCardExtension(id: string): void {
    this.registry.goalCardExtensions = this.registry.goalCardExtensions
      .filter(extension => extension.id !== id);
  }

  /**
   * 获取所有目标卡片扩展（已排序）
   */
  getGoalCardExtensions(): GoalCardExtension[] {
    return [...this.registry.goalCardExtensions];
  }

  /**
   * 注册侧边栏面板扩展
   */
  registerSidebarPanelExtension(extension: SidebarPanelExtension): void {
    this.registry.sidebarPanelExtensions = this.registry.sidebarPanelExtensions
      .filter(existing => existing.id !== extension.id)
      .concat([extension]);
    this.sortByOrder(this.registry.sidebarPanelExtensions);
  }

  /**
   * 注销侧边栏面板扩展
   */
  unregisterSidebarPanelExtension(id: string): void {
    this.registry.sidebarPanelExtensions = this.registry.sidebarPanelExtensions
      .filter(extension => extension.id !== id);
  }

  /**
   * 获取所有侧边栏面板扩展（已排序）
   */
  getSidebarPanelExtensions(): SidebarPanelExtension[] {
    return [...this.registry.sidebarPanelExtensions];
  }

  /**
   * 注册项目操作菜单项
   */
  registerProjectActionMenuItem(item: ProjectActionMenuItem): void {
    this.registry.projectActionMenuItems = this.registry.projectActionMenuItems
      .filter(existing => existing.id !== item.id)
      .concat([item]);
  }

  /**
   * 注销项目操作菜单项
   */
  unregisterProjectActionMenuItem(id: string): void {
    this.registry.projectActionMenuItems = this.registry.projectActionMenuItems
      .filter(item => item.id !== id);
  }

  /**
   * 获取所有项目操作菜单项
   */
  getProjectActionMenuItems(): ProjectActionMenuItem[] {
    return [...this.registry.projectActionMenuItems];
  }

  /**
   * 注册目标操作菜单项
   */
  registerGoalActionMenuItem(item: GoalActionMenuItem): void {
    this.registry.goalActionMenuItems = this.registry.goalActionMenuItems
      .filter(existing => existing.id !== item.id)
      .concat([item]);
  }

  /**
   * 注销目标操作菜单项
   */
  unregisterGoalActionMenuItem(id: string): void {
    this.registry.goalActionMenuItems = this.registry.goalActionMenuItems
      .filter(item => item.id !== id);
  }

  /**
   * 获取所有目标操作菜单项
   */
  getGoalActionMenuItems(): GoalActionMenuItem[] {
    return [...this.registry.goalActionMenuItems];
  }

  /**
   * 注册表单字段扩展
   */
  registerFormFieldExtension(extension: FormFieldExtension): void {
    this.registry.formFieldExtensions = this.registry.formFieldExtensions
      .filter(existing => existing.id !== extension.id)
      .concat([extension]);
    this.sortByOrder(this.registry.formFieldExtensions);
  }

  /**
   * 注销表单字段扩展
   */
  unregisterFormFieldExtension(id: string): void {
    this.registry.formFieldExtensions = this.registry.formFieldExtensions
      .filter(extension => extension.id !== id);
  }

  /**
   * 获取所有表单字段扩展（已排序）
   */
  getFormFieldExtensions(): FormFieldExtension[] {
    return [...this.registry.formFieldExtensions];
  }

  /**
   * 注册详情页底部扩展
   */
  registerDetailBottomExtension(extension: DetailBottomExtension): void {
    this.registry.detailBottomExtensions = this.registry.detailBottomExtensions
      .filter(existing => existing.id !== extension.id)
      .concat([extension]);
    this.sortByOrder(this.registry.detailBottomExtensions);
  }

  /**
   * 注销详情页底部扩展
   */
  unregisterDetailBottomExtension(id: string): void {
    this.registry.detailBottomExtensions = this.registry.detailBottomExtensions
      .filter(extension => extension.id !== id);
  }

  /**
   * 获取所有详情页底部扩展（已排序）
   */
  getDetailBottomExtensions(): DetailBottomExtension[] {
    return [...this.registry.detailBottomExtensions];
  }

  /**
   * 注册页面头部操作区扩展
   */
  registerHeaderActionExtension(extension: HeaderActionExtension): void {
    this.registry.headerActionExtensions = this.registry.headerActionExtensions
      .filter(existing => existing.id !== extension.id)
      .concat([extension]);
    this.sortByOrder(this.registry.headerActionExtensions);
  }

  /**
   * 注销页面头部操作区扩展
   */
  unregisterHeaderActionExtension(id: string): void {
    this.registry.headerActionExtensions = this.registry.headerActionExtensions
      .filter(extension => extension.id !== id);
  }

  /**
   * 获取所有页面头部操作区扩展（已排序）
   */
  getHeaderActionExtensions(): HeaderActionExtension[] {
    return [...this.registry.headerActionExtensions];
  }

  /**
   * 注册内容区面板扩展
   */
  registerContentPanelExtension(extension: ContentPanelExtension): void {
    this.registry.contentPanelExtensions = this.registry.contentPanelExtensions
      .filter(existing => existing.id !== extension.id)
      .concat([extension]);
    this.sortByOrder(this.registry.contentPanelExtensions);
  }

  /**
   * 注销内容区面板扩展
   */
  unregisterContentPanelExtension(id: string): void {
    this.registry.contentPanelExtensions = this.registry.contentPanelExtensions
      .filter(extension => extension.id !== id);
  }

  /**
   * 获取所有内容区面板扩展（已排序）
   */
  getContentPanelExtensions(): ContentPanelExtension[] {
    return [...this.registry.contentPanelExtensions];
  }

  /**
   * 获取指定ID的内容区面板扩展
   */
  getContentPanelExtension(id: string): ContentPanelExtension | undefined {
    return this.registry.contentPanelExtensions.find(e => e.id === id);
  }

  /**
   * 重置注册表到初始状态
   */
  reset(): void {
    this.registry = { ...defaultRegistry };
    this.plugins.clear();
  }

  /**
   * 按排序权值排序数组
   */
  private sortByOrder<T extends { order?: number }>(array: T[]): void {
    array.sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  }
}

/**
 * 全局插件注册表单例实例
 */
export const pluginRegistry = new PluginRegistrySingleton();

/**
 * 方便插件使用的注册函数导出
 * 使用箭头函数绑定this到pluginRegistry实例
 */
export const registerPlugin = (plugin: Plugin) => pluginRegistry.registerPlugin(plugin);
export const registerNavigationMenuItem = (item: NavigationMenuItem) => pluginRegistry.registerNavigationMenuItem(item);
export const registerGoalListRenderer = (renderer: GoalListRenderer) => pluginRegistry.registerGoalListRenderer(renderer);
export const registerGoalCardExtension = (extension: GoalCardExtension) => pluginRegistry.registerGoalCardExtension(extension);
export const registerSidebarPanelExtension = (extension: SidebarPanelExtension) => pluginRegistry.registerSidebarPanelExtension(extension);
export const registerProjectActionMenuItem = (item: ProjectActionMenuItem) => pluginRegistry.registerProjectActionMenuItem(item);
export const registerGoalActionMenuItem = (item: GoalActionMenuItem) => pluginRegistry.registerGoalActionMenuItem(item);
export const registerFormFieldExtension = (extension: FormFieldExtension) => pluginRegistry.registerFormFieldExtension(extension);
export const registerDetailBottomExtension = (extension: DetailBottomExtension) => pluginRegistry.registerDetailBottomExtension(extension);
export const registerHeaderActionExtension = (extension: HeaderActionExtension) => pluginRegistry.registerHeaderActionExtension(extension);
export const registerContentPanelExtension = (extension: ContentPanelExtension) => pluginRegistry.registerContentPanelExtension(extension);
export const registerProjectToolbarItem = (item: ProjectToolbarItem) => pluginRegistry.registerProjectToolbarItem(item);

// 注销方法导出
export const unregisterNavigationMenuItem = (id: string) => pluginRegistry.unregisterNavigationMenuItem(id);
export const unregisterGoalListRenderer = (id: string) => pluginRegistry.unregisterGoalListRenderer(id);
export const unregisterGoalCardExtension = (id: string) => pluginRegistry.unregisterGoalCardExtension(id);
export const unregisterSidebarPanelExtension = (id: string) => pluginRegistry.unregisterSidebarPanelExtension(id);
export const unregisterProjectActionMenuItem = (id: string) => pluginRegistry.unregisterProjectActionMenuItem(id);
export const unregisterGoalActionMenuItem = (id: string) => pluginRegistry.unregisterGoalActionMenuItem(id);
export const unregisterFormFieldExtension = (id: string) => pluginRegistry.unregisterFormFieldExtension(id);
export const unregisterDetailBottomExtension = (id: string) => pluginRegistry.unregisterDetailBottomExtension(id);
export const unregisterHeaderActionExtension = (id: string) => pluginRegistry.unregisterHeaderActionExtension(id);
export const unregisterContentPanelExtension = (id: string) => pluginRegistry.unregisterContentPanelExtension(id);
export const unregisterProjectToolbarItem = (id: string) => pluginRegistry.unregisterProjectToolbarItem(id);

// 获取方法导出
export function getNavigationMenuItems() { return pluginRegistry.getNavigationMenuItems(); }
export function getGoalListRenderers() { return pluginRegistry.getGoalListRenderers(); }
export function getGoalCardExtensions() { return pluginRegistry.getGoalCardExtensions(); }
export function getSidebarPanelExtensions() { return pluginRegistry.getSidebarPanelExtensions(); }
export function getProjectActionMenuItems() { return pluginRegistry.getProjectActionMenuItems(); }
export function getGoalActionMenuItems() { return pluginRegistry.getGoalActionMenuItems(); }
export function getFormFieldExtensions() { return pluginRegistry.getFormFieldExtensions(); }
export function getDetailBottomExtensions() { return pluginRegistry.getDetailBottomExtensions(); }
export function getHeaderActionExtensions() { return pluginRegistry.getHeaderActionExtensions(); }
export function getContentPanelExtensions() { return pluginRegistry.getContentPanelExtensions(); }
export function getContentPanelExtension(id: string) { return pluginRegistry.getContentPanelExtension(id); }
export function getProjectToolbarItems() { return pluginRegistry.getProjectToolbarItems(); }
export function getRegistry() { return pluginRegistry.getRegistry(); }