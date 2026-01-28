# 组件库API文档

## 概述

组件是ECS架构中的核心数据容器，用于描述实体的各种属性和状态。本框架提供了一系列常用的游戏组件，开发者也可以自定义组件。

## 基础组件

### Component（组件基类）
所有组件的基类，提供基本的生命周期方法。

**构造函数**
```javascript
class MyComponent extends Component {
  constructor(data = {}) {
    super();
    // 初始化组件属性
    this.property = data.property || defaultValue;
  }
  
  // 可选：组件被添加到实体时调用
  onAttach(entity) {
    // 初始化逻辑
  }
  
  // 可选：组件从实体移除时调用
  onDetach(entity) {
    // 清理逻辑
  }
}
```

## 内置组件

### Transform（变换组件）
控制实体的位置、旋转和缩放。

**构造函数**
```javascript
new Transform(options)
```

**选项**
- `position`: Vector2 - 位置坐标，默认 (0, 0)
- `rotation`: number - 旋转角度（弧度），默认 0
- `scale`: Vector2 - 缩放比例，默认 (1, 1)

**属性**
```javascript
const transform = new Transform({
  position: new Vector2(100, 200),
  rotation: Math.PI / 4, // 45度
  scale: new Vector2(2, 1.5)
});

// 获取位置
console.log(transform.position.x, transform.position.y);

// 设置位置
transform.position.set(150, 250);

// 旋转角度（弧度）
console.log(transform.rotation);

// 缩放比例
console.log(transform.scale.x, transform.scale.y);
```

**方法**
- `translate(deltaX, deltaY)`: 平移实体
- `rotate(angle)`: 旋转实体
- `setScale(x, y)`: 设置缩放
- `getWorldMatrix()`: 获取世界变换矩阵

### Sprite（精灵组件）
渲染实体的图像和外观。

**构造函数**
```javascript
new Sprite(options)
```

**选项**
- `image`: string - 图像资源路径
- `width`: number - 显示宽度
- `height`: number - 显示高度
- `color`: Color - 颜色叠加，默认白色
- `opacity`: number - 透明度（0-1），默认 1
- `flipX`: boolean - 水平翻转，默认 false
- `flipY`: boolean - 垂直翻转，默认 false

**属性**
```javascript
const sprite = new Sprite({
  image: 'assets/player.png',
  width: 64,
  height: 64,
  color: new Color(1, 1, 1, 1), // 白色
  opacity: 0.8,
  flipX: false
});

// 设置图像源
sprite.image = 'assets/enemy.png';

// 调整透明度
sprite.opacity = 0.5;

// 颜色叠加
sprite.color = new Color(1, 0.5, 0.5, 1); // 淡红色
```

**方法**
- `setSize(width, height)`: 设置尺寸
- `setColor(r, g, b, a)`: 设置颜色
- `setOpacity(value)`: 设置透明度
- `flipHorizontal()`: 水平翻转
- `flipVertical()`: 垂直翻转

### Physics（物理组件）
定义实体的物理属性。

**构造函数**
```javascript
new Physics(options)
```

**选项**
- `velocity`: Vector2 - 速度向量，默认 (0, 0)
- `acceleration`: Vector2 - 加速度向量，默认 (0, 0)
- `mass`: number - 质量，默认 1
- `friction`: number - 摩擦力系数，默认 0.1
- `gravityScale`: number - 重力缩放，默认 1
- `collisionGroup`: number - 碰撞分组，默认 0
- `isStatic`: boolean - 是否为静态物体，默认 false

**属性**
```javascript
const physics = new Physics({
  velocity: new Vector2(100, 0), // 向右移动
  acceleration: new Vector2(0, 300), // 重力加速度
  mass: 2,
  friction: 0.2,
  gravityScale: 1.5 // 受重力影响更强
});

// 应用力
physics.applyForce(new Vector2(500, 0));

// 设置速度
physics.velocity.set(0, -200); // 向上跳跃
```

**方法**
- `applyForce(force)`: 施加力
- `applyImpulse(impulse)`: 施加冲量
- `setVelocity(x, y)`: 设置速度
- `setAcceleration(x, y)`: 设置加速度
- `getMomentum()`: 获取动量

### Animation（动画组件）
控制实体的动画播放。

**构造函数**
```javascript
new Animation(options)
```

**选项**
- `animations`: Object - 动画集合
- `currentAnimation`: string - 当前动画名称
- `frameRate`: number - 帧率，默认 12
- `loop`: boolean - 是否循环播放，默认 true
- `speed`: number - 播放速度倍数，默认 1

**属性**
```javascript
const animation = new Animation({
  animations: {
    idle: {
      frames: [0, 1, 2, 3], // 帧索引
      duration: 1.0 // 动画时长（秒）
    },
    walk: {
      frames: [4, 5, 6, 7],
      duration: 0.5
    }
  },
  currentAnimation: 'idle',
  frameRate: 12,
  loop: true
});

// 播放动画
animation.play('walk');

// 停止动画
animation.stop();

// 设置播放速度
animation.speed = 2.0; // 2倍速播放
```

**方法**
- `play(animationName)`: 播放指定动画
- `stop()`: 停止动画
- `pause()`: 暂停动画
- `resume()`: 恢复动画
- `addAnimation(name, config)`: 添加动画
- `removeAnimation(name)`: 移除动画
- `getCurrentFrame()`: 获取当前帧

## 自定义组件

### 创建自定义组件
```javascript
class HealthComponent extends Component {
  constructor(maxHealth = 100) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.isAlive = true;
  }
  
  takeDamage(amount) {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.isAlive = this.currentHealth > 0;
    return this.isAlive;
  }
  
  heal(amount) {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }
  
  getHealthPercent() {
    return this.currentHealth / this.maxHealth;
  }
}

// 使用自定义组件
const player = world.createEntity('player');
player.addComponent(new HealthComponent(150));
```

### 输入组件
```javascript
class InputComponent extends Component {
  constructor() {
    super();
    this.moveDirection = new Vector2(0, 0);
    this.isJumping = false;
    this.isAttacking = false;
  }
  
  setMoveDirection(x, y) {
    this.moveDirection.set(x, y);
  }
  
  setJumping(jumping) {
    this.isJumping = jumping;
  }
  
  setAttacking(attacking) {
    this.isAttacking = attacking;
  }
}
```

### AI组件
```javascript
class AIComponent extends Component {
  constructor(behavior = 'idle') {
    super();
    this.behavior = behavior;
    this.targetEntity = null;
    this.aggression = 0.5;
    this.lastDecisionTime = 0;
  }
  
  setTarget(entity) {
    this.targetEntity = entity;
  }
  
  makeDecision() {
    this.lastDecisionTime = Date.now();
    // AI决策逻辑
  }
}
```

## 组件查询

### 查询包含特定组件的实体
```javascript
// 获取所有包含Transform和Sprite组件的实体
const renderableEntities = world.getEntitiesWithComponents('Transform', 'Sprite');

// 获取所有包含Physics组件的实体
const physicsEntities = world.getEntitiesWithComponents('Physics');

// 获取特定实体
const player = world.getEntity('player');
if (player.hasComponent('HealthComponent')) {
  const health = player.getComponent('HealthComponent');
  console.log('Player health:', health.currentHealth);
}
```

### 组件事件监听
```javascript
// 在组件中添加事件支持
class DamageableComponent extends Component {
  constructor() {
    super();
    this.onDamage = new EventEmitter();
    this.onDeath = new EventEmitter();
  }
  
  takeDamage(amount, source) {
    this.onDamage.emit(amount, source);
    if (this.currentHealth <= 0) {
      this.onDeath.emit(source);
    }
  }
}

// 监听组件事件
const damageable = entity.getComponent('DamageableComponent');
damageable.onDamage.on((amount, source) => {
  console.log(`Took ${amount} damage from ${source}`);
});
```

## 性能优化

### 组件池
```javascript
class ComponentPool {
  constructor(componentClass) {
    this.componentClass = componentClass;
    this.pool = [];
  }
  
  acquire(data) {
    if (this.pool.length > 0) {
      const component = this.pool.pop();
      Object.assign(component, data);
      return component;
    }
    return new this.componentClass(data);
  }
  
  release(component) {
    this.pool.push(component);
  }
}

// 使用组件池
const transformPool = new ComponentPool(Transform);
const spritePool = new ComponentPool(Sprite);
```

### 批量操作
```javascript
// 批量更新组件
function updateAllTransforms(deltaTime) {
  const entities = world.getEntitiesWithComponents('Transform');
  
  for (const entity of entities) {
    const transform = entity.getComponent('Transform');
    // 批量处理逻辑
  }
}
```

## 最佳实践

1. **组件应该是纯数据容器**，不包含复杂的业务逻辑
2. **使用组合而非继承**，通过多个简单组件组合复杂行为
3. **组件命名要清晰**，使用描述性的名称
4. **合理使用默认值**，减少构造函数参数
5. **考虑性能影响**，避免在组件中创建大量临时对象

## 常见问题

### Q: 如何在不同实体间共享组件数据？
A: 使用共享组件或全局状态管理，避免直接修改其他实体的组件。

### Q: 组件之间如何通信？
A: 通过系统协调或使用事件机制，避免组件间的直接依赖。

### Q: 如何处理组件依赖？
A: 在系统层面处理依赖关系，确保组件添加顺序正确。