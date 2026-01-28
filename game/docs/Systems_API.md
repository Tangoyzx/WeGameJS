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
  onInitialize(world) {
    // 初始化逻辑
  }
  
  // 每帧更新
  update(entity, deltaTime) {
    // 实体处理逻辑
  }
  
  // 系统销毁
  onDestroy() {
    // 清理逻辑
  }
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

**使用示例**
```javascript
const renderSystem = new RenderSystem({
  canvas: canvas,
  context: ctx,
  clearColor: new Color(0.1, 0.1, 0.1, 1), // 深灰色背景
  sortByZIndex: true
});

world.addSystem(renderSystem);
```

**方法**
- `setClearColor(color)`: 设置清屏颜色
- `setCamera(camera)`: 设置摄像机
- `addRenderLayer(layer)`: 添加渲染层
- `removeRenderLayer(layer)`: 移除渲染层

**渲染流程**
1. 清屏
2. 按zIndex排序实体
3. 遍历所有包含Transform和Sprite的实体
4. 应用变换矩阵
5. 绘制精灵

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

**使用示例**
```javascript
const physicsSystem = new PhysicsSystem({
  gravity: new Vector2(0, 500), // 更强的重力
  worldBounds: {
    left: 0,
    top: 0,
    right: 800,
    bottom: 600
  },
  timeScale: 1.0
});

world.addSystem(physicsSystem);
```

**方法**
- `setGravity(gravity)`: 设置重力
- `setWorldBounds(bounds)`: 设置世界边界
- `addCollider(entity, collider)`: 添加碰撞器
- `removeCollider(entity)`: 移除碰撞器
- `raycast(start, end, options)`: 射线检测

**物理计算**
1. 应用重力加速度
2. 更新速度和位置
3. 检测碰撞
4. 处理碰撞响应
5. 约束在世界边界内

### AnimationSystem（动画系统）
更新实体动画状态。

**构造函数**
```javascript
new AnimationSystem(options)
```

**选项**
- `defaultFrameRate`: number - 默认帧率，默认 12
- `interpolation`: boolean - 是否启用插值，默认 true

**使用示例**
```javascript
const animationSystem = new AnimationSystem({
  defaultFrameRate: 24, // 更高的默认帧率
  interpolation: true
});

world.addSystem(animationSystem);
```

**方法**
- `setFrameRate(entity, frameRate)`: 设置实体帧率
- `playAnimation(entity, animationName)`: 播放动画
- `stopAnimation(entity)`: 停止动画
- `pauseAnimation(entity)`: 暂停动画

**动画更新流程**
1. 遍历所有包含Animation组件的实体
2. 更新动画时间
3. 计算当前帧
4. 应用插值（如果启用）
5. 触发动画事件

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

**使用示例**
```javascript
const inputSystem = new InputSystem({
  keyboardEnabled: true,
  mouseEnabled: true,
  touchEnabled: true
});

world.addSystem(inputSystem);

// 监听输入事件
inputSystem.on('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    // 处理右箭头键
  }
});

inputSystem.on('touchstart', (event) => {
  const touch = event.touches[0];
  console.log('Touch at:', touch.clientX, touch.clientY);
});
```

**事件类型**
- `keydown`, `keyup` - 键盘事件
- `mousedown`, `mouseup`, `mousemove` - 鼠标事件
- `touchstart`, `touchend`, `touchmove` - 触摸事件
- `gamepadconnected`, `gamepaddisconnected` - 手柄事件

**方法**
- `isKeyPressed(key)`: 检查按键是否按下
- `getMousePosition()`: 获取鼠标位置
- `getTouchPositions()`: 获取所有触摸点
- `vibrate(duration)`: 设备震动（移动端）

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

**使用示例**
```javascript
const audioSystem = new AudioSystem({
  masterVolume: 0.8,
  maxChannels: 16,
  spatialAudio: true
});

world.addSystem(audioSystem);

// 播放音效
audioSystem.play('jump.wav', {
  volume: 0.5,
  loop: false
});

// 播放背景音乐
audioSystem.play('bgm.mp3', {
  volume: 0.3,
  loop: true,
  channel: 'music'
});
```

**方法**
- `play(sound, options)`: 播放音效
- `stop(sound)`: 停止音效
- `pause(sound)`: 暂停音效
- `resume(sound)`: 恢复音效
- `setVolume(volume)`: 设置音量
- `setLoop(sound, loop)`: 设置循环

**音频选项**
- `volume`: number - 音量（0-1）
- `loop`: boolean - 是否循环
- `pan`: number - 声道平衡（-1到1）
- `rate`: number - 播放速率
- `channel`: string - 音频通道

## 自定义系统

### 创建自定义系统
```javascript
class HealthSystem extends System {
  constructor() {
    super(['HealthComponent', 'Transform']);
    this.damageEvents = [];
  }
  
  onInitialize(world) {
    // 初始化逻辑
    this.world = world;
  }
  
  update(entity, deltaTime) {
    const health = entity.getComponent('HealthComponent');
    const transform = entity.getComponent('Transform');
    
    // 处理伤害事件
    this.processDamageEvents(entity, health);
    
    // 更新健康状态
    if (health.currentHealth <= 0) {
      this.handleDeath(entity);
    }
    
    // 显示健康条
    this.renderHealthBar(entity, health, transform);
  }
  
  processDamageEvents(entity, health) {
    // 处理伤害逻辑
  }
  
  handleDeath(entity) {
    // 处理死亡逻辑
    entity.destroy();
  }
  
  renderHealthBar(entity, health, transform) {
    // 渲染健康条
  }
}
```

### AI系统示例
```javascript
class AISystem extends System {
  constructor() {
    super(['AIComponent', 'Transform']);
    this.decisionInterval = 1000; // 1秒决策间隔
  }
  
  update(entity, deltaTime) {
    const ai = entity.getComponent('AIComponent');
    const transform = entity.getComponent('Transform');
    
    // 定期决策
    if (Date.now() - ai.lastDecisionTime > this.decisionInterval) {
      this.makeDecision(entity, ai, transform);
    }
    
    // 执行当前行为
    this.executeBehavior(entity, ai, transform, deltaTime);
  }
  
  makeDecision(entity, ai, transform) {
    // AI决策逻辑
    switch (ai.behavior) {
      case 'idle':
        this.idleBehavior(entity, ai, transform);
        break;
      case 'patrol':
        this.patrolBehavior(entity, ai, transform);
        break;
      case 'chase':
        this.chaseBehavior(entity, ai, transform);
        break;
    }
    
    ai.lastDecisionTime = Date.now();
  }
  
  executeBehavior(entity, ai, transform, deltaTime) {
    // 执行行为逻辑
  }
}
```

### 粒子系统示例
```javascript
class ParticleSystem extends System {
  constructor() {
    super(['ParticleComponent', 'Transform']);
    this.particlePool = [];
  }
  
  update(entity, deltaTime) {
    const particle = entity.getComponent('ParticleComponent');
    const transform = entity.getComponent('Transform');
    
    // 更新粒子生命周期
    particle.lifetime -= deltaTime;
    
    if (particle.lifetime <= 0) {
      // 回收粒子
      this.recycleParticle(entity);
      return;
    }
    
    // 更新粒子属性
    this.updateParticle(particle, transform, deltaTime);
    
    // 渲染粒子
    this.renderParticle(entity, particle, transform);
  }
  
  emitParticle(position, options) {
    // 发射新粒子
    const entity = this.getOrCreateParticle();
    const particle = entity.getComponent('ParticleComponent');
    const transform = entity.getComponent('Transform');
    
    // 初始化粒子属性
    particle.reset(options);
    transform.position.copy(position);
    
    return entity;
  }
}
```

## 系统管理

### 系统优先级
```javascript
// 设置系统执行顺序
world.addSystem(new InputSystem(), { priority: 100 });    // 最先执行
world.addSystem(new PhysicsSystem(), { priority: 50 });   // 其次执行
world.addSystem(new AnimationSystem(), { priority: 30 }); // 然后执行
world.addSystem(new RenderSystem(), { priority: 10 });     // 最后执行
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

### 系统间通信
```javascript
class GameManagerSystem extends System {
  constructor() {
    super([]); // 不需要特定组件
    this.score = 0;
  }
  
  update(entity, deltaTime) {
    // 游戏管理逻辑
  }
  
  addScore(points) {
    this.score += points;
    this.emit('scoreChanged', this.score);
  }
}

// 在其他系统中监听事件
const gameManager = world.getSystem('GameManagerSystem');
gameManager.on('scoreChanged', (score) => {
  console.log('New score:', score);
});
```

## 性能优化

### 系统查询优化
```javascript
class OptimizedSystem extends System {
  constructor() {
    super(['Transform', 'Sprite']);
    this.cachedEntities = [];
    this.lastCacheTime = 0;
    this.cacheInterval = 1000; // 1秒缓存一次
  }
  
  update(entity, deltaTime) {
    // 使用缓存实体
    if (Date.now() - this.lastCacheTime > this.cacheInterval) {
      this.updateCache();
    }
    
    // 处理实体逻辑
  }
  
  updateCache() {
    this.cachedEntities = this.world.getEntitiesWithComponents(...this.requiredComponents);
    this.lastCacheTime = Date.now();
  }
}
```

### 批量处理
```javascript
class BatchRenderSystem extends System {
  constructor() {
    super(['Transform', 'Sprite']);
    this.batchSize = 100;
  }
  
  updateAll(deltaTime) {
    const entities = this.world.getEntitiesWithComponents(...this.requiredComponents);
    
    // 分批处理
    for (let i = 0; i < entities.length; i += this.batchSize) {
      const batch = entities.slice(i, i + this.batchSize);
      this.renderBatch(batch);
    }
  }
  
  renderBatch(entities) {
    // 批量渲染逻辑
  }
}
```

## 最佳实践

1. **单一职责原则**：每个系统只负责一个特定的功能
2. **无状态设计**：系统应该是无状态的，状态应该存储在组件中
3. **性能考虑**：合理使用缓存和批量处理
4. **事件驱动**：使用事件进行系统间通信
5. **测试友好**：系统应该易于单元测试

## 调试技巧

### 系统调试信息
```javascript
class DebugSystem extends System {
  constructor() {
    super([]);
    this.debugInfo = {};
  }
  
  update(entity, deltaTime) {
    // 收集调试信息
    this.debugInfo.frameTime = deltaTime;
    this.debugInfo.entityCount = this.world.entityCount;
    this.debugInfo.systemCount = this.world.systemCount;
  }
  
  getDebugInfo() {
    return this.debugInfo;
  }
}
```

### 性能分析
```javascript
class ProfilingSystem extends System {
  constructor() {
    super([]);
    this.profileData = {};
    this.frameTimes = [];
  }
  
  update(entity, deltaTime) {
    this.frameTimes.push(deltaTime);
    
    // 保留最近60帧数据
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
    
    // 计算平均帧时间
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
    this.profileData.avgFPS = 1 / avgFrameTime;
  }
}
```