# ECS游戏引擎快速入门指南

## 简介

本指南将帮助您快速上手使用WeGameJS ECS游戏引擎。ECS（Entity-Component-System）是一种现代化的游戏架构模式，通过数据与逻辑分离的方式提供高性能的游戏开发体验。

## 环境准备

### 1. 项目结构确认
确保您的项目包含以下目录结构：
```
game/js/engine/
├── core/           # 核心类
├── components/     # 组件库
├── systems/       # 系统库
├── utils/         # 工具库
└── index.js       # 主入口文件
```

### 2. 导入引擎
在您的游戏主文件中导入ECS引擎：
```javascript
import Engine from './js/engine/index.js';
```

## 第一个游戏：跳跃的小球

### 步骤1：创建游戏世界
```javascript
// 创建游戏世界
const world = Engine.createWorld('JumpBallGame');
```

### 步骤2：创建小球实体
```javascript
// 创建小球实体
const ball = world.createEntity('ball');

// 添加变换组件（位置、旋转、缩放）
ball.addComponent(new Engine.Transform({
  position: new Engine.Vector2(400, 300),
  scale: new Engine.Vector2(1, 1)
}));

// 添加精灵组件（外观）
ball.addComponent(new Engine.Sprite({
  width: 50,
  height: 50,
  color: new Engine.Color(1, 0, 0, 1) // 红色
}));

// 添加物理组件（运动）
ball.addComponent(new Engine.Physics({
  velocity: new Engine.Vector2(0, 0),
  acceleration: new Engine.Vector2(0, 500), // 重力
  mass: 1
}));
```

### 步骤3：创建地面实体
```javascript
// 创建地面实体
const ground = world.createEntity('ground');

ground.addComponent(new Engine.Transform({
  position: new Engine.Vector2(400, 550),
  scale: new Engine.Vector2(800, 20)
}));

ground.addComponent(new Engine.Sprite({
  width: 800,
  height: 20,
  color: new Engine.Color(0.2, 0.2, 0.2, 1) // 深灰色
}));

ground.addComponent(new Engine.Physics({
  isStatic: true // 静态物体，不受物理影响
}));
```

### 步骤4：添加游戏系统
```javascript
// 获取画布和上下文
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 添加渲染系统
world.addSystem(new Engine.RenderSystem({
  canvas: canvas,
  context: ctx
}));

// 添加物理系统
world.addSystem(new Engine.PhysicsSystem({
  gravity: new Engine.Vector2(0, 500)
}));

// 添加输入系统
world.addSystem(new Engine.InputSystem());
```

### 步骤5：处理用户输入
```javascript
// 获取输入系统
const inputSystem = world.getSystem('InputSystem');

// 监听触摸事件
inputSystem.on('touchstart', (event) => {
  const ball = world.getEntity('ball');
  const physics = ball.getComponent('Physics');
  
  // 给小球一个向上的速度（跳跃）
  physics.velocity.y = -300;
});
```

### 步骤6：实现游戏循环
```javascript
let lastTime = 0;

function gameLoop(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000; // 转换为秒
  lastTime = currentTime;
  
  // 更新游戏世界
  world.update(deltaTime);
  
  // 请求下一帧
  requestAnimationFrame(gameLoop);
}

// 启动游戏循环
gameLoop(0);
```

## 进阶示例：太空射击游戏

### 创建玩家飞船
```javascript
class PlayerShip {
  static create(world, x, y) {
    const player = world.createEntity('player');
    
    player.addComponent(new Engine.Transform({
      position: new Engine.Vector2(x, y)
    }));
    
    player.addComponent(new Engine.Sprite({
      width: 60,
      height: 40,
      color: new Engine.Color(0, 0.5, 1, 1) // 蓝色
    }));
    
    player.addComponent(new Engine.Physics({
      velocity: new Engine.Vector2(0, 0),
      mass: 1
    }));
    
    // 自定义组件：玩家属性
    player.addComponent({
      type: 'PlayerComponent',
      health: 100,
      score: 0,
      weaponCooldown: 0
    });
    
    return player;
  }
}
```

### 创建子弹系统
```javascript
class BulletSystem extends Engine.System {
  constructor() {
    super(['Transform', 'Physics', 'BulletComponent']);
    this.bulletPool = [];
  }
  
  update(entity, deltaTime) {
    const transform = entity.getComponent('Transform');
    const physics = entity.getComponent('Physics');
    const bullet = entity.getComponent('BulletComponent');
    
    // 更新子弹生命周期
    bullet.lifetime -= deltaTime;
    if (bullet.lifetime <= 0) {
      entity.destroy();
      return;
    }
    
    // 检查碰撞（简化版）
    const enemies = this.world.getEntitiesWithComponents('EnemyComponent');
    for (const enemy of enemies) {
      if (this.checkCollision(entity, enemy)) {
        this.handleCollision(entity, enemy);
        break;
      }
    }
  }
  
  spawnBullet(position, direction) {
    const bullet = this.getBulletFromPool();
    
    bullet.getComponent('Transform').position.copy(position);
    bullet.getComponent('Physics').velocity.copy(direction).multiply(400);
    bullet.getComponent('BulletComponent').lifetime = 3;
    
    return bullet;
  }
}
```

### 玩家控制系统
```javascript
class PlayerControlSystem extends Engine.System {
  constructor() {
    super(['Transform', 'Physics', 'PlayerComponent']);
    this.input = new Engine.Vector2(0, 0);
  }
  
  onInitialize(world) {
    // 监听输入事件
    const inputSystem = world.getSystem('InputSystem');
    
    inputSystem.on('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft': this.input.x = -1; break;
        case 'ArrowRight': this.input.x = 1; break;
        case 'ArrowUp': this.input.y = -1; break;
        case 'ArrowDown': this.input.y = 1; break;
        case ' ': this.fireWeapon(); break;
      }
    });
    
    inputSystem.on('keyup', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight': this.input.x = 0; break;
        case 'ArrowUp':
        case 'ArrowDown': this.input.y = 0; break;
      }
    });
  }
  
  update(entity, deltaTime) {
    const transform = entity.getComponent('Transform');
    const physics = entity.getComponent('Physics');
    const player = entity.getComponent('PlayerComponent');
    
    // 移动玩家
    physics.velocity.x = this.input.x * 200;
    physics.velocity.y = this.input.y * 200;
    
    // 边界检查
    transform.position.x = Engine.MathUtils.clamp(transform.position.x, 0, 800);
    transform.position.y = Engine.MathUtils.clamp(transform.position.y, 0, 600);
    
    // 武器冷却
    if (player.weaponCooldown > 0) {
      player.weaponCooldown -= deltaTime;
    }
  }
  
  fireWeapon() {
    const player = this.world.getEntity('player');
    const playerComp = player.getComponent('PlayerComponent');
    
    if (playerComp.weaponCooldown <= 0) {
      const transform = player.getComponent('Transform');
      const bulletSystem = this.world.getSystem('BulletSystem');
      
      bulletSystem.spawnBullet(
        transform.position.clone(),
        new Engine.Vector2(0, -1)
      );
      
      playerComp.weaponCooldown = 0.2; // 200ms冷却
    }
  }
}
```

## 性能优化技巧

### 1. 使用对象池
```javascript
// 创建子弹对象池
class BulletPool {
  constructor(world) {
    this.world = world;
    this.pool = [];
  }
  
  getBullet() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    
    return this.createBullet();
  }
  
  releaseBullet(bullet) {
    bullet.getComponent('BulletComponent').lifetime = 0;
    this.pool.push(bullet);
  }
}
```

### 2. 批量处理实体
```javascript
// 优化渲染系统
class OptimizedRenderSystem extends Engine.RenderSystem {
  updateAll(deltaTime) {
    const entities = this.world.getEntitiesWithComponents('Transform', 'Sprite');
    
    // 按zIndex排序
    entities.sort((a, b) => {
      const spriteA = a.getComponent('Sprite');
      const spriteB = b.getComponent('Sprite');
      return (spriteA.zIndex || 0) - (spriteB.zIndex || 0);
    });
    
    // 批量渲染
    this.context.save();
    
    for (const entity of entities) {
      this.renderEntity(entity);
    }
    
    this.context.restore();
  }
}
```

### 3. 使用事件系统减少耦合
```javascript
// 游戏事件管理器
class GameEventSystem extends Engine.System {
  constructor() {
    super([]);
    this.emitter = new Engine.EventEmitter();
  }
  
  emitScoreChanged(score) {
    this.emitter.emit('scoreChanged', score);
  }
  
  emitPlayerDied() {
    this.emitter.emit('playerDied');
  }
  
  emitLevelComplete() {
    this.emitter.emit('levelComplete');
  }
}

// 在其他系统中监听事件
const gameEvents = world.getSystem('GameEventSystem');
gameEvents.emitter.on('scoreChanged', (score) => {
  // 更新UI显示
  updateScoreDisplay(score);
});
```

## 调试和开发工具

### 1. 调试绘制
```javascript
// 添加调试信息显示
class DebugSystem extends Engine.System {
  constructor() {
    super([]);
    this.debugInfo = {};
  }
  
  update(entity, deltaTime) {
    this.debugInfo.fps = 1 / deltaTime;
    this.debugInfo.entityCount = this.world.entityCount;
    this.debugInfo.frameTime = deltaTime * 1000;
  }
  
  renderDebugInfo(context) {
    context.fillStyle = 'white';
    context.font = '14px Arial';
    
    context.fillText(`FPS: ${this.debugInfo.fps.toFixed(1)}`, 10, 20);
    context.fillText(`实体数: ${this.debugInfo.entityCount}`, 10, 40);
    context.fillText(`帧时间: ${this.debugInfo.frameTime.toFixed(1)}ms`, 10, 60);
  }
}
```

### 2. 性能监控
```javascript
// 性能监控系统
class PerformanceMonitor extends Engine.System {
  constructor() {
    super([]);
    this.frameTimes = [];
    this.maxFrames = 60;
  }
  
  update(entity, deltaTime) {
    this.frameTimes.push(deltaTime);
    
    if (this.frameTimes.length > this.maxFrames) {
      this.frameTimes.shift();
    }
    
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b) / this.frameTimes.length;
    this.avgFPS = 1 / avgFrameTime;
    
    // 性能警告
    if (this.avgFPS < 30) {
      console.warn('性能警告：帧率低于30FPS');
    }
  }
}
```

## 常见问题解答

### Q: 如何在不同实体间共享数据？
A: 使用全局状态或事件系统，避免直接组件间通信。

### Q: 如何处理实体间的依赖关系？
A: 在系统层面处理依赖，确保组件添加顺序正确。

### Q: 如何优化大量实体的性能？
A: 使用对象池、批量处理、查询缓存等技术。

### Q: 如何调试ECS架构的游戏？
A: 添加调试系统，显示实体状态和性能信息。

## 下一步

- 查看完整的[API文档](./ECS_API.md)了解所有功能
- 学习[组件系统](./Components_API.md)深入了解组件设计
- 探索[系统架构](./Systems_API.md)掌握系统开发技巧
- 参考[工具库](./Utils_API.md)使用各种实用工具

开始创建您的第一个ECS游戏吧！