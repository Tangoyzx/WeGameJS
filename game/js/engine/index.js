/**
 * ECS游戏引擎主入口文件
 * 提供完整的ECS框架功能
 */

// 导入核心模块
import { Entity, Component, System, World } from './core/index.js';

// 导入组件库
import { Transform, Sprite, Physics, Animation } from './components/index.js';

// 导入系统库
import { RenderSystem, PhysicsSystem, AnimationSystem, InputSystem, AudioSystem } from './systems/index.js';

// 导入工具库
import { Vector2, MathUtils, Color, Timer, EventEmitter } from './utils/index.js';

// 导出所有核心类
export {
  // 核心类
  Entity,
  Component,
  System,
  World,
  
  // 组件类
  Transform,
  Sprite,
  Physics,
  Animation,
  
  // 系统类
  RenderSystem,
  PhysicsSystem,
  AnimationSystem,
  InputSystem,
  AudioSystem,
  
  // 工具类
  Vector2,
  MathUtils,
  Color,
  Timer,
  EventEmitter
};

// 导出默认的引擎实例
export default {
  // 核心类
  Entity,
  Component,
  System,
  World,
  
  // 组件类
  Transform,
  Sprite,
  Physics,
  Animation,
  
  // 系统类
  RenderSystem,
  PhysicsSystem,
  AnimationSystem,
  InputSystem,
  AudioSystem,
  
  // 工具类
  Vector2,
  MathUtils,
  Color,
  Timer,
  EventEmitter,
  
  /**
   * 快速创建世界实例
   * @param {string} name - 世界名称
   * @returns {World} 世界实例
   */
  createWorld(name = 'GameWorld') {
    return new World(name);
  },
  
  /**
   * 快速创建实体
   * @param {World} world - 所属世界
   * @param {string} id - 实体ID
   * @returns {Entity} 实体实例
   */
  createEntity(world, id = null) {
    return world.createEntity(id);
  }
};