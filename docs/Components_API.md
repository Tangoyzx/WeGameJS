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
  }
  
  // 可选：组件被添加到实体时调用
  onAttach(entity) {}
  
  // 可选：组件从实体移除时调用
  onDetach(entity) {}
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
    // 处理伤害逻辑
  }
  
  heal(amount) {
    // 治疗逻辑
  }
  
  getHealthPercent() {
    return this.currentHealth / this.maxHealth;
  }
}
```

## 组件查询

### 查询包含特定组件的实体
```javascript
// 获取所有包含Transform和Sprite组件的实体
const renderableEntities = world.getEntitiesWithComponents('Transform', 'Sprite');

// 获取特定实体
const player = world.getEntity('player');
if (player.hasComponent('HealthComponent')) {
  const health = player.getComponent('HealthComponent');
}
```

## 最佳实践

1. **组件应该是纯数据容器**，不包含复杂的业务逻辑
2. **使用组合而非继承**，通过多个简单组件组合复杂行为
3. **组件命名要清晰**，使用描述性的名称
4. **合理使用默认值**，减少构造函数参数
5. **考虑性能影响**，避免在组件中创建大量临时对象