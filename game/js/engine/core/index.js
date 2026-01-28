/**
 * ECS框架核心模块导出
 */

// 导入核心类
import Entity from './Entity.js';
import Component from './Component.js';
import System from './System.js';
import World from './World.js';

// 导出核心类
export {
  Entity,
  Component,
  System,
  World
};

// 导出默认的ECS框架入口
export default {
  Entity,
  Component,
  System,
  World
};