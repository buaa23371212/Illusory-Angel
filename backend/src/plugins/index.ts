/**
 * 后端插件入口
 * 导入所有启用的插件，触发它们的自注册逻辑
 */

// 导入启用的插件，这样会执行插件的自注册代码
import './alarm-clock/routes';
import './bqtj/routes';