# WeGameJS ECS游戏引擎

## 项目概述

WeGameJS ECS游戏引擎是一个基于Entity-Component-System（实体-组件-系统）架构的现代化游戏开发框架，专为微信小游戏环境设计。该引擎提供高性能的游戏对象管理、渲染、物理、动画和输入处理功能。

## 核心特性

### 🏗️ ECS架构
- **实体（Entity）**: 游戏中的基本对象，由多个组件组成
- **组件（Component）**: 纯数据容器，描述实体的属性和状态
- **系统（System）**: 逻辑处理器，处理特定组件组合的实体

### 🎮 完整功能栈
- **渲染系统**: 支持2D精灵渲染、变换、颜色叠加
- **物理系统**: 重力、碰撞检测、运动模拟
- **动画系统**: 帧动画、插值、状态管理
- **输入系统**: 键盘、鼠标、触摸事件处理
- **音频系统**: 音效播放、音量控制、空间音频

### 🔧 丰富工具库
- **数学工具**: 向量运算、几何计算、随机数生成
- **颜色工具**: RGB/HSL/HEX转换、颜色插值
- **定时器工具**: 延时、重复、帧定时器
- **事件系统**: 发布订阅模式、优先级控制

### ⚡ 性能优化
- **对象池**: 减少内存分配和垃圾回收
- **批量处理**: 优化渲染和更新性能
- **查询缓存**: 快速实体查找
- **内存管理**: 自动资源回收

## 快速开始

### 安装和导入
```javascript
import Engine from './js/engine/index.js';
const world = Engine.createWorld('MyGame');
```

### 创建第一个游戏
```javascript
const player = world.createEntity('player');
player.addComponent(new Engine.Transform({ position: new Engine.Vector2(100, 200) }));
player.addComponent(new Engine.Sprite({ width: 64, height: 64, color: Engine.Color.red }));

world.addSystem(new Engine.RenderSystem({ canvas, context }));
world.addSystem(new Engine.PhysicsSystem());

function gameLoop(deltaTime) {
  world.update(deltaTime);
  requestAnimationFrame(gameLoop);
}
gameLoop(0);
```

## 目录结构

```
game/js/engine/
├── core/           # 核心架构
│   ├── Component.js    # 组件基类
│   ├── Entity.js       # 实体类
│   ├── System.js       # 系统基类
│   ├── World.js        # 世界容器
│   └── index.js        # 核心入口
├── components/     # 内置组件
│   ├── Transform.js   # 变换组件
│   ├── Sprite.js      # 精灵组件
│   ├── Physics.js     # 物理组件
│   ├── Animation.js   # 动画组件
│   └── index.js       # 组件库入口
├── systems/        # 内置系统
│   ├── RenderSystem.js    # 渲染系统
│   ├── PhysicsSystem.js   # 物理系统
│   ├── AnimationSystem.js # 动画系统
│   ├── InputSystem.js     # 输入系统
│   ├── AudioSystem.js     # 音频系统
│   └── index.js           # 系统库入口
├── utils/         # 工具库
│   ├── Vector2.js        # 二维向量
│   ├── MathUtils.js      # 数学工具
│   ├── Color.js          # 颜色工具
│   ├── Timer.js          # 定时器
│   ├── EventEmitter.js   # 事件发射器
│   └── index.js          # 工具库入口
└── index.js       # 引擎主入口
```

## 核心概念

### 实体（Entity）
游戏世界中的基本对象，作为组件的容器。

### 组件（Component）
纯数据容器，描述实体的特定属性。

### 系统（System）
逻辑处理器，处理包含特定组件组合的实体。

## 内置组件

### Transform（变换组件）
控制位置、旋转、缩放等变换属性。

### Sprite（精灵组件）
渲染图像和外观属性。

### Physics（物理组件）
物理属性和运动状态。

### Animation（动画组件）
动画状态和播放控制。

## 内置系统

### RenderSystem（渲染系统）
渲染所有可见实体。

### PhysicsSystem（物理系统）
物理模拟和碰撞检测。

### AnimationSystem（动画系统）
更新动画状态和播放。

### InputSystem（输入系统）
处理用户输入事件。

### AudioSystem（音频系统）
音频播放和管理。

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

## API文档

- [ECS核心API](./ECS_API.md) - 完整的API参考
- [组件库API](./Components_API.md) - 组件详细文档
- [系统库API](./Systems_API.md) - 系统详细文档
- [工具库API](./Utils_API.md) - 工具函数文档
- [快速入门](./QuickStart.md) - 快速上手指南

## 版本信息

- **当前版本**: v1.0.0
- **兼容性**: 微信小游戏环境
- **依赖**: 无外部依赖，纯JavaScript实现

---

**开始使用WeGameJS ECS引擎，创建您的下一个精彩游戏！** 🎮