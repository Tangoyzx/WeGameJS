/**
 * ECS系统库入口文件
 * 提供常用的游戏系统实现
 */

// 导入系统类
import RenderSystem from './RenderSystem.js';
import PhysicsSystem from './PhysicsSystem.js';
import AnimationSystem from './AnimationSystem.js';
import InputSystem from './InputSystem.js';
import AudioSystem from './AudioSystem.js';

// 导出所有系统类
export {
  RenderSystem,
  PhysicsSystem,
  AnimationSystem,
  InputSystem,
  AudioSystem
};

// 导出默认的系统库
export default {
  RenderSystem,
  PhysicsSystem,
  AnimationSystem,
  InputSystem,
  AudioSystem
};