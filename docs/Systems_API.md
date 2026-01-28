# 系统库API文档

## 概述

系统是ECS架构中的逻辑处理器，负责处理包含特定组件组合的实体。每个系统专注于单一职责，通过组合多个系统实现复杂的游戏逻辑。

## 基础系统

### System（系统基类）
所有系统的基类，提供基本的系统功能。

**构造函数**
```javascript
class MySystem extends System {
  constructor(requiredComponents = [], options = {}) {
    super(requiredComponents, options);
    this.priority = options.priority || 0;
  }
  
  // 系统初始化
  onInitialize(world) {}
  
  // 每帧更新
  update(entity, deltaTime) {}
  
  // 系统销毁
  onDestroy() {}
}
```

**选项**
- `priority`: number - 系统执行优先级（数字越大越先执行）
- `enabled`: boolean - 系统是否启用，默认 true

## 内置系统

### RenderSystem（渲染系统）
渲染所有包含Transform和Sprite组件的实体。

**构造函数**
```javascript
new RenderSystem(options)
```

**选项**
- `canvas`: HTMLCanvasElement - 画布元素
- `context`: CanvasRenderingContext2D - 绘图上下文
- `clearColor`: Color - 清屏颜色，默认黑色
- `sortByZIndex`: boolean - 是否按zIndex排序，默认 true

**方法**
- `setClearColor(color)`: 设置清屏颜色
- `setCamera(camera)`: 设置摄像机
- `addRenderLayer(layer)`: 添加渲染层
- `removeRenderLayer(layer)`: 移除渲染层

### PhysicsSystem（物理系统）
处理物理运动和碰撞检测。

**构造函数**
```javascript
new PhysicsSystem(options)
```

**选项**
- `gravity`: Vector2 - 重力加速度，默认 (0, 300)
- `worldBounds`: Object - 世界边界 {left, top, right, bottom}
- `collisionLayers`: Array - 碰撞层配置
- `timeScale`: number - 时间缩放，默认 1

**方法**
- `setGravity(gravity)`: 设置重力
- `setWorldBounds(bounds)`: 设置世界边界
- `addCollider(entity, collider)`: 添加碰撞器
- `removeCollider(entity)`: 移除碰撞器
- `raycast(start, end, options)`: 射线检测

### AnimationSystem（动画系统）
更新实体动画状态。

**构造函数**
```javascript
new AnimationSystem(options)
```

**选项**
- `defaultFrameRate`: number - 默认帧率，默认 12
- `interpolation`: boolean - 是否启用插值，默认 true

**方法**
- `setFrameRate(entity, frameRate)`: 设置实体帧率
- `playAnimation(entity, animationName)`: 播放动画
- `stopAnimation(entity)`: 停止动画
- `pauseAnimation(entity)`: 暂停动画

### InputSystem（输入系统）
处理用户输入事件。

**构造函数**
```javascript
new InputSystem(options)
```

**选项**
- `keyboardEnabled`: boolean - 启用键盘输入，默认 true
- `mouseEnabled`: boolean - 启用鼠标输入，默认 true
- `touchEnabled`: boolean - 启用触摸输入，默认 true
- `gamepadEnabled`: boolean - 启用手柄输入，默认 false

**事件类型**
- `keydown`, `keyup` - 键盘事件
- `mousedown`, `mouseup`, `mousemove` - 鼠标事件
- `touchstart`, `touchend`, `touchmove` - 触摸事件

**方法**
- `isKeyPressed(key)`: 检查按键是否按下
- `getMousePosition()`: 获取鼠标位置
- `getTouchPositions()`: 获取所有触摸点

### AudioSystem（音频系统）
管理游戏音频播放。

**构造函数**
```javascript
new AudioSystem(options)
```

**选项**
- `masterVolume`: number - 主音量（0-1），默认 1
- `maxChannels`: number - 最大音频通道数，默认 8
- `spatialAudio`: boolean - 是否启用空间音频，默认 false

**方法**
- `play(sound, options)`: 播放音效
- `stop(sound)`: 停止音效
- `pause(sound)`: 暂停音效
- `resume(sound)`: 恢复音效
- `setVolume(volume)`: 设置音量
- `setLoop(sound, loop)`: 设置循环

## 自定义系统

### 创建自定义系统
```javascript
class HealthSystem extends System {
  constructor() {
    super(['HealthComponent', 'Transform']);
  }
  
  update(entity, deltaTime) {
    const health = entity.getComponent('HealthComponent');
    const transform = entity.getComponent('Transform');
    
    // 处理健康逻辑
  }
}
```

## 系统管理

### 系统优先级
```javascript
// 设置系统执行顺序
world.addSystem(new InputSystem(), { priority: 100 });
world.addSystem(new PhysicsSystem(), { priority: 50 });
world.addSystem(new AnimationSystem(), { priority: 30 });
world.addSystem(new RenderSystem(), { priority: 10 });
```

### 系统启用/禁用
```javascript
const physicsSystem = new PhysicsSystem();
world.addSystem(physicsSystem);

// 暂停物理模拟
physicsSystem.enabled = false;

// 恢复物理模拟
physicsSystem.enabled = true;

// 移除系统
world.removeSystem(physicsSystem);
```

## 最佳实践

1. **单一职责原则**：每个系统只负责一个特定的功能
2. **无状态设计**：系统应该是无状态的，状态应该存储在组件中
3. **性能考虑**：合理使用缓存和批量处理
4. **事件驱动**：使用事件进行系统间通信
5. **测试友好**：系统应该易于单元测试