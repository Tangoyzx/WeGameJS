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
// 导入ECS引擎
import Engine from './js/engine/index.js';

// 创建游戏世界
const world = Engine.createWorld('MyGame');
```

### 创建第一个游戏
```javascript
// 创建玩家实体
const player = world.createEntity('player');
player.addComponent(new Engine.Transform({ position: new Engine.Vector2(100, 200) }));
player.addComponent(new Engine.Sprite({ width: 64, height: 64, color: Engine.Color.red }));

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

## 核心概念详解

### 实体（Entity）
实体是游戏世界中的基本对象，本身不包含逻辑，仅作为组件的容器。

```javascript
const entity = world.createEntity('uniqueId');
entity.addComponent(new Transform({ position: new Vector2(100, 200) }));
entity.addComponent(new Sprite({ image: 'player.png' }));
```

### 组件（Component）
组件是纯数据容器，描述实体的特定属性。

```javascript
class HealthComponent extends Component {
  constructor(maxHealth = 100) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
  }
}
```

### 系统（System）
系统处理包含特定组件组合的实体，实现游戏逻辑。

```javascript
class MovementSystem extends System {
  constructor() {
    super(['Transform', 'Physics']); // 需要这些组件
  }
  
  update(entity, deltaTime) {
    const transform = entity.getComponent('Transform');
    const physics = entity.getComponent('Physics');
    
    // 更新位置
    transform.position.add(
      physics.velocity.clone().multiply(deltaTime)
    );
  }
}
```

## 内置组件

### Transform（变换组件）
- **功能**: 控制位置、旋转、缩放
- **属性**: position, rotation, scale
- **方法**: translate, rotate, setScale

### Sprite（精灵组件）
- **功能**: 渲染图像和外观
- **属性**: image, width, height, color, opacity
- **方法**: setSize, setColor, flipHorizontal

### Physics（物理组件）
- **功能**: 物理属性和运动
- **属性**: velocity, acceleration, mass, friction
- **方法**: applyForce, setVelocity, getMomentum

### Animation（动画组件）
- **功能**: 动画状态管理
- **属性**: animations, currentAnimation, frameRate
- **方法**: play, stop, pause, addAnimation

## 内置系统

### RenderSystem（渲染系统）
- **功能**: 渲染所有可见实体
- **配置**: canvas, context, clearColor
- **特性**: zIndex排序、批量渲染

### PhysicsSystem（物理系统）
- **功能**: 物理模拟和碰撞检测
- **配置**: gravity, worldBounds, collisionLayers
- **特性**: 刚体运动、碰撞响应

### AnimationSystem（动画系统）
- **功能**: 更新动画状态
- **配置**: defaultFrameRate, interpolation
- **特性**: 帧插值、动画事件

### InputSystem（输入系统）
- **功能**: 处理用户输入
- **支持**: 键盘、鼠标、触摸、手柄
- **特性**: 事件驱动、状态查询

### AudioSystem（音频系统）
- **功能**: 音频播放管理
- **配置**: masterVolume, maxChannels
- **特性**: 空间音频、音量控制

## 工具库

### Vector2（二维向量）
```javascript
const v1 = new Vector2(10, 20);
const v2 = new Vector2(5, 15);

v1.add(v2);           // (15, 35)
v1.multiply(2);       // (30, 70)
v1.normalize();       // 单位化
const distance = v1.distance(v2); // 计算距离
```

### MathUtils（数学工具）
```javascript
MathUtils.clamp(value, 0, 100);    // 限制范围
MathUtils.lerp(0, 100, 0.5);       // 线性插值
MathUtils.random(10, 20);          // 随机数
MathUtils.degToRad(180);           // 角度转弧度
```

### Color（颜色工具）
```javascript
const red = new Color(1, 0, 0, 1);
const blue = Color.fromHex('#0000FF');
const mixed = Color.lerp(red, blue, 0.5); // 颜色混合
```

### Timer（定时器）
```javascript
// 一次性定时器
Timer.delay(() => console.log('3秒后'), 3000);

// 重复定时器
Timer.repeat(() => console.log('每秒'), 1000);

// 帧定时器
Timer.frame((deltaTime) => updateGame(deltaTime), 60);
```

### EventEmitter（事件发射器）
```javascript
const emitter = new EventEmitter();
emitter.on('event', (data) => console.log(data));
emitter.emit('event', 'Hello World');
```

## 性能优化指南

### 1. 使用对象池
```javascript
// 创建对象池
const bulletPool = new ObjectPool(
  () => createBullet(),
  (bullet) => resetBullet(bullet)
);

// 使用对象池
const bullet = bulletPool.acquire();
// ...使用bullet
bulletPool.release(bullet);
```

### 2. 批量处理实体
```javascript
// 批量渲染
class OptimizedRenderSystem extends RenderSystem {
  updateAll(deltaTime) {
    const entities = this.getEntities();
    
    // 按zIndex排序
    entities.sort((a, b) => a.zIndex - b.zIndex);
    
    // 批量渲染
    this.context.save();
    for (const entity of entities) {
      this.renderEntity(entity);
    }
    this.context.restore();
  }
}
```

### 3. 合理使用查询缓存
```javascript
class CachedSystem extends System {
  constructor() {
    super(['Transform', 'Sprite']);
    this.cachedEntities = [];
    this.cacheDirty = true;
  }
  
  onEntityChanged() {
    this.cacheDirty = true;
  }
  
  getEntities() {
    if (this.cacheDirty) {
      this.cachedEntities = this.world.getEntitiesWithComponents(...this.requiredComponents);
      this.cacheDirty = false;
    }
    return this.cachedEntities;
  }
}
```

## 开发最佳实践

### 1. 组件设计原则
- **单一职责**: 每个组件只负责一个功能
- **纯数据**: 组件不包含业务逻辑
- **轻量级**: 避免在组件中存储大量数据

### 2. 系统设计原则
- **专注功能**: 每个系统处理特定功能
- **无状态**: 系统状态存储在组件中
- **事件驱动**: 使用事件进行系统间通信

### 3. 性能考虑
- **避免频繁创建**: 使用对象池重用对象
- **批量操作**: 减少函数调用开销
- **缓存查询**: 避免重复实体查找

### 4. 调试技巧
- **添加调试系统**: 显示实体状态和性能信息
- **使用事件日志**: 记录重要游戏事件
- **性能监控**: 实时监控帧率和内存使用

## 示例项目

查看 `game/js/games/` 目录下的示例游戏：

- **FlippyBird**: 简单的2D跳跃游戏
- **Game2048**: 数字合并益智游戏
- **SnowGame**: 雪花飘落效果演示
- **TetrisGame**: 俄罗斯方块游戏
- **ThreeGame**: 3D渲染演示

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

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

---

**开始使用WeGameJS ECS引擎，创建您的下一个精彩游戏！** 🎮