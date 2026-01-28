/**
 * ECS工具库入口文件
 * 提供常用的数学、几何、颜色等工具函数
 */

// 导入工具类
import Vector2 from './Vector2.js';
import MathUtils from './MathUtils.js';
import Color from './Color.js';
import Timer from './Timer.js';
import EventEmitter from './EventEmitter.js';

// 导出所有工具类
export {
  Vector2,
  MathUtils,
  Color,
  Timer,
  EventEmitter
};

// 导出默认的工具库
export default {
  Vector2,
  MathUtils,
  Color,
  Timer,
  EventEmitter
};