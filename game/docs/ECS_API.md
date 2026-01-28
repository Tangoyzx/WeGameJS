# ECS游戏引擎API文档

## 概述

WeGameJS ECS（Entity-Component-System）游戏引擎是一个基于组件化架构的游戏开发框架，专为微信小游戏设计。该框架采用现代化的ECS模式，提供高性能的游戏对象管理和渲染能力。

## 核心概念

### ECS架构
- **Entity（实体）**: 游戏中的基本对象，由多个组件组成
- **Component（组件）**: 实体的数据和属性，如位置、精灵、物理属性等
- **System（系统）**: 处理特定组件集合的逻辑，如渲染、物理、动画等

### 目录结构
```
game/js/engine/
├── core/           # 核心类
│   ├── Component.js
│   ├── Entity.js
│   ├── System.js
│   ├── World.js
│   └── index.js
├── components/     # 组件库
│   ├── Transform.js
│   ├── Sprite.js
│   ├── Physics.js
│   ├── Animation.js
│   └── index.js
├── systems/        # 系统库
│   ├── RenderSystem.js
│   ├── PhysicsSystem.js
│   ├── AnimationSystem.js
│   ├── InputSystem.js
│   ├── AudioSystem.js
│   └── index.js
├── utils/          # 工具库
│   ├── Vector2.js
│   ├── MathUtils.js
│   ├── Color.js
│   ├── Timer.js
│   ├── EventEmitter.js
│   └── index.js
└── index.js        # 主入口文件
```

## 快速开始

### 1. 导入引擎
```javascript
import Engine from './js/engine/index.js';
```

### 2. 创建游戏世界
```javascript
const world = Engine.createWorld('MyGame');
```

### 3. 创建实体和组件
```javascript
// 创建玩家实体
const player = world.createEntity('player');

// 添加变换组件
player.addComponent(new Engine.Transform({
  position: new Engine.Vector2(100, 200),
  rotation: 0,
  scale: new Engine.Vector2(1, 1)
}));

// 添加精灵组件
player.addComponent(new Engine.Sprite({
  image: 'player.png',
  width: 64,
  height: 64
}));

// 添加物理组件
player.addComponent(new Engine.Physics({
  velocity: new Engine.Vector2(0, 0),
  acceleration: new Engine.Vector2(0, 300),
  mass: 1
}));
```

### 4. 添加系统
```javascript
// 添加渲染系统
world.addSystem(new Engine.RenderSystem({
  canvas: canvas,
  context: context
}));

// 添加物理系统
world.addSystem(new Engine.PhysicsSystem());

// 添加输入系统
world.addSystem(new Engine.InputSystem());
```

### 5. 游戏循环
```javascript
function gameLoop() {
  // 更新所有系统
  world.update(1/60);
  
  // 请求下一帧
  requestAnimationFrame(gameLoop);
}

gameLoop();
```

## 核心类文档

### World（世界）
游戏世界容器，管理所有实体和系统。

**构造函数**
```javascript
new World(name = 'GameWorld')
```

**方法**
- `createEntity(id = null)`: 创建新实体
- `addSystem(system)`: 添加系统
- `removeSystem(system)`: 移除系统
- `update(deltaTime)`: 更新所有系统
- `getEntity(id)`: 根据ID获取实体
- `getEntitiesWithComponents(...componentTypes)`: 获取包含指定组件的实体

### Entity（实体）
游戏中的基本对象。

**方法**
- `addComponent(component)`: 添加组件
- `removeComponent(componentType)`: 移除组件
- `getComponent(componentType)`: 获取组件
- `hasComponent(componentType)`: 检查是否包含组件
- `destroy()`: 销毁实体

### Component（组件）
实体的数据和属性基类。

**继承使用**
```javascript
class MyComponent extends Component {
  constructor(data) {
    super();
    this.property = data.property;
  }
}
```

### System（系统）
处理特定组件集合的逻辑基类。

**继承使用**
```javascript
class MySystem extends System {
  constructor() {
    super(['Transform', 'MyComponent']);
  }
  
  update(entity, deltaTime) {
    // 处理实体逻辑
  }
}
```

## 组件库

### Transform（变换组件）
控制实体的位置、旋转和缩放。

**属性**
- `position`: Vector2 - 位置
- `rotation`: number - 旋转角度（弧度）
- `scale`: Vector2 - 缩放

### Sprite（精灵组件）
渲染实体的图像。

**属性**
- `image`: string - 图像路径
- `width`: number - 宽度
- `height`: number - 高度
- `color`: Color - 颜色叠加
- `opacity`: number - 透明度（0-1）

### Physics（物理组件）
实体的物理属性。

**属性**
- `velocity`: Vector2 - 速度
- `acceleration`: Vector2 - 加速度
- `mass`: number - 质量
- `friction`: number - 摩擦力系数

### Animation（动画组件）
控制实体动画。

**属性**
- `animations`: Object - 动画集合
- `currentAnimation`: string - 当前动画名称
- `frameRate`: number - 帧率
- `loop`: boolean - 是否循环

## 系统库

### RenderSystem（渲染系统）
渲染所有包含Transform和Sprite组件的实体。

**构造函数**
```javascript
new RenderSystem(options)
```

**选项**
- `canvas`: HTMLCanvasElement - 画布元素
- `context`: CanvasRenderingContext2D - 绘图上下文

### PhysicsSystem（物理系统）
处理物理运动和碰撞检测。

**方法**
- `setGravity(gravity)`: 设置重力
- `addCollider(entity, collider)`: 添加碰撞器

### AnimationSystem（动画系统）
更新实体动画状态。

### InputSystem（输入系统）
处理用户输入事件。

**事件**
- `keydown`, `keyup` - 键盘事件
- `mousedown`, `mouseup`, `mousemove` - 鼠标事件
- `touchstart`, `touchend`, `touchmove` - 触摸事件

### AudioSystem（音频系统）
管理游戏音频播放。

**方法**
- `play(sound, options)`: 播放音效
- `stop(sound)`: 停止音效
- `setVolume(volume)`: 设置音量

## 工具库

### Vector2（二维向量）
表示二维空间中的向量。

**方法**
- `add(v)`, `subtract(v)`, `multiply(scalar)`, `divide(scalar)`
- `length()`, `normalize()`, `dot(v)`, `distance(v)`
- `rotate(angle)`, `lerp(v, t)`

### MathUtils（数学工具）
提供常用数学函数。

**方法**
- `clamp(value, min, max)`: 限制数值范围
- `lerp(a, b, t)`: 线性插值
- `degToRad(degrees)`, `radToDeg(radians)`: 角度弧度转换
- `random(min, max)`: 随机数生成

### Color（颜色）
表示RGBA颜色。

**方法**
- `fromHex(hex)`: 从十六进制创建颜色
- `fromRGB(r, g, b, a)`: 从RGB创建颜色
- `lerp(color, t)`: 颜色插值

### Timer（定时器）
提供定时和延时功能。

**方法**
- `start()`, `stop()`, `pause()`, `resume()`
- `setInterval(interval)`, `setCallback(callback)`
- `Timer.delay(callback, delay)`: 静态延时方法
- `Timer.interval(callback, interval)`: 静态重复方法

### EventEmitter（事件发射器）
提供事件订阅和发布功能。

**方法**
- `on(event, listener)`: 添加监听器
- `once(event, listener)`: 添加一次性监听器
- `off(event, listener)`: 移除监听器
- `emit(event, ...args)`: 触发事件

## 最佳实践

### 1. 组件设计原则
- 组件应该是纯数据容器
- 避免在组件中包含逻辑
- 使用组合而非继承

### 2. 系统设计原则
- 每个系统只关注特定的组件组合
- 系统应该是无状态的
- 避免系统间的直接依赖

### 3. 性能优化
- 使用查询缓存优化实体查找
- 批量处理实体更新
- 合理使用对象池

## 示例项目

查看 `game/js/games/` 目录下的示例游戏，了解实际使用方式。

## 版本历史

- v1.0.0: 初始版本，包含完整的ECS框架
- 支持微信小游戏环境
- 提供丰富的组件和系统库
- 包含完整的工具函数集合

## 技术支持

如有问题或建议，请参考项目README.md文件或联系开发团队。