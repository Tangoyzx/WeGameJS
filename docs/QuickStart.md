# ECS游戏引擎快速入门指南

## 简介

本指南将帮助您快速上手使用WeGameJS ECS游戏引擎。ECS（Entity-Component-System）是一种现代化的游戏架构模式，通过数据与逻辑分离的方式提供高性能的游戏开发体验。

## 环境准备

### 项目结构
确保您的项目包含以下目录结构：
```
game/js/engine/
├── core/           # 核心类
├── components/     # 组件库
├── systems/       # 系统库
├── utils/         # 工具库
└── index.js       # 主入口文件
```

### 导入引擎
```javascript
import Engine from './js/engine/index.js';
```

## 基本概念

### 实体（Entity）
游戏世界中的基本对象，作为组件的容器。

### 组件（Component）
纯数据容器，描述实体的特定属性。

### 系统（System）
逻辑处理器，处理包含特定组件组合的实体。

## 创建第一个游戏

### 基本步骤
1. 创建游戏世界
2. 创建实体并添加组件
3. 添加必要的系统
4. 实现游戏循环

### 示例代码结构
```javascript
const world = Engine.createWorld('MyGame');

// 创建实体
const entity = world.createEntity('player');
entity.addComponent(new Engine.Transform({ position: new Engine.Vector2(100, 200) }));
entity.addComponent(new Engine.Sprite({ width: 50, height: 50, color: Engine.Color.red }));

// 添加系统
world.addSystem(new Engine.RenderSystem({ canvas, context }));
world.addSystem(new Engine.PhysicsSystem());

// 游戏循环
function gameLoop(deltaTime) {
  world.update(deltaTime);
  requestAnimationFrame(gameLoop);
}
gameLoop(0);
```

## 核心流程

### 1. 创建世界
```javascript
const world = Engine.createWorld('GameName');
```

### 2. 实体管理
- `world.createEntity(id)`: 创建实体
- `entity.addComponent(component)`: 添加组件
- `entity.getComponent(type)`: 获取组件
- `entity.removeComponent(type)`: 移除组件

### 3. 系统管理
- `world.addSystem(system)`: 添加系统
- `world.getSystem(type)`: 获取系统
- `world.removeSystem(type)`: 移除系统

### 4. 游戏循环
```javascript
function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  world.update(deltaTime);
  requestAnimationFrame(gameLoop);
}
```

## 常用组件

### Transform（变换组件）
控制位置、旋转、缩放等变换属性。

### Sprite（精灵组件）
渲染图像和外观属性。

### Physics（物理组件）
物理属性和运动状态。

### Animation（动画组件）
动画状态和播放控制。

## 常用系统

### RenderSystem（渲染系统）
渲染所有可见实体。

### PhysicsSystem（物理系统）
物理模拟和碰撞检测。

### InputSystem（输入系统）
处理用户输入事件。

### AnimationSystem（动画系统）
更新动画状态和播放。

## 工具库

### Vector2（二维向量）
二维向量运算和几何计算。

### MathUtils（数学工具）
常用数学函数和常量。

### Color（颜色工具）
颜色表示、转换和运算。

### Timer（定时器）
定时和延时功能。

### EventEmitter（事件发射器）
事件订阅和发布功能。

## 性能优化

### 对象池
重用对象减少内存分配。

### 批量处理
优化渲染和更新性能。

### 查询缓存
快速实体查找。

## 调试技巧

### 调试系统
显示实体状态和性能信息。

### 性能监控
实时监控帧率和内存使用。

## 下一步

- 查看完整的[API文档](./ECS_API.md)了解所有功能
- 学习[组件系统](./Components_API.md)深入了解组件设计
- 探索[系统架构](./Systems_API.md)掌握系统开发技巧
- 参考[工具库](./Utils_API.md)使用各种实用工具

开始创建您的第一个ECS游戏吧！