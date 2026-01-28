# ECS游戏引擎API文档

## 概述

WeGameJS ECS（Entity-Component-System）游戏引擎是一个基于组件化架构的游戏开发框架，采用现代化的ECS模式提供高性能的游戏对象管理。

## 核心概念

### ECS架构
- **Entity（实体）**: 游戏中的基本对象，由多个组件组成
- **Component（组件）**: 实体的数据和属性，如位置、精灵、物理属性等
- **System（系统）**: 处理特定组件集合的逻辑，如渲染、物理、动画等

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