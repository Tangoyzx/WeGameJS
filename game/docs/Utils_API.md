# 工具库API文档

## 概述

工具库提供了一系列实用的辅助类和函数，用于简化游戏开发中的常见任务，包括数学计算、几何运算、颜色处理、定时器和事件管理等。

## 数学工具

### Vector2（二维向量）
表示二维空间中的向量，用于位置、速度、加速度等计算。

**构造函数**
```javascript
new Vector2(x = 0, y = 0)
```

**使用示例**
```javascript
// 创建向量
const position = new Vector2(100, 200);
const velocity = new Vector2(50, -30);
const acceleration = new Vector2(0, 300);

// 基本操作
position.add(velocity); // 位置 += 速度
velocity.add(acceleration); // 速度 += 加速度

// 向量运算
const direction = new Vector2(1, 0);
direction.normalize(); // 单位化
const speed = velocity.length(); // 计算速度大小

// 插值运算
const start = new Vector2(0, 0);
const end = new Vector2(100, 100);
const current = Vector2.lerp(start, end, 0.5); // 中间点 (50, 50)
```

**属性**
- `x`: number - X分量
- `y`: number - Y分量

**方法**
- `set(x, y)`: 设置向量值
- `copy(v)`: 复制另一个向量
- `add(v)`: 向量加法
- `subtract(v)`: 向量减法
- `multiply(scalar)`: 标量乘法
- `divide(scalar)`: 标量除法
- `dot(v)`: 点积
- `cross(v)`: 叉积
- `length()`: 向量长度
- `lengthSquared()`: 向量长度的平方
- `normalize()`: 单位化
- `distance(v)`: 计算距离
- `distanceSquared(v)`: 计算距离的平方
- `rotate(angle)`: 旋转向量
- `lerp(v, t)`: 线性插值
- `angle()`: 计算角度
- `angleTo(v)`: 计算到另一个向量的角度

**静态方法**
- `Vector2.zero()`: 创建零向量
- `Vector2.one()`: 创建单位向量
- `Vector2.up()`: 创建向上向量 (0, -1)
- `Vector2.down()`: 创建向下向量 (0, 1)
- `Vector2.left()`: 创建向左向量 (-1, 0)
- `Vector2.right()`: 创建向右向量 (1, 0)
- `Vector2.lerp(a, b, t)`: 静态插值方法
- `Vector2.distance(a, b)`: 静态距离计算
- `Vector2.dot(a, b)`: 静态点积计算

### MathUtils（数学工具）
提供常用的数学函数和常量。

**常量**
```javascript
MathUtils.PI = Math.PI;
MathUtils.TWO_PI = Math.PI * 2;
MathUtils.HALF_PI = Math.PI / 2;
MathUtils.DEG_TO_RAD = Math.PI / 180;
MathUtils.RAD_TO_DEG = 180 / Math.PI;
MathUtils.EPSILON = 0.000001;
```

**方法**
```javascript
// 数值限制
MathUtils.clamp(value, 0, 100); // 限制在0-100之间
MathUtils.clamp01(value); // 限制在0-1之间

// 插值运算
MathUtils.lerp(0, 100, 0.5); // 50
MathUtils.lerpUnclamped(0, 100, 1.5); // 150

// 角度转换
MathUtils.degToRad(180); // π
MathUtils.radToDeg(Math.PI); // 180

// 随机数
MathUtils.random(10, 20); // 10-20之间的随机数
MathUtils.randomInt(1, 6); // 1-6之间的随机整数

// 数学运算
MathUtils.map(value, 0, 100, 0, 1); // 数值映射
MathUtils.approximately(a, b); // 近似相等判断
MathUtils.sign(value); // 符号函数
MathUtils.roundTo(value, 2); // 四舍五入到小数点后2位
```

**完整方法列表**
- `clamp(value, min, max)`: 限制数值范围
- `clamp01(value)`: 限制在0-1之间
- `lerp(a, b, t)`: 线性插值
- `lerpUnclamped(a, b, t)`: 无限制线性插值
- `inverseLerp(a, b, value)`: 反向插值
- `smoothStep(min, max, value)`: 平滑插值
- `degToRad(degrees)`: 角度转弧度
- `radToDeg(radians)`: 弧度转角度
- `random(min, max)`: 随机浮点数
- `randomInt(min, max)`: 随机整数
- `randomBool(chance = 0.5)`: 随机布尔值
- `map(value, fromMin, fromMax, toMin, toMax)`: 数值映射
- `approximately(a, b, epsilon = EPSILON)`: 近似相等
- `sign(value)`: 符号函数
- `roundTo(value, decimals)`: 四舍五入
- `floorTo(value, decimals)`: 向下取整
- `ceilTo(value, decimals)`: 向上取整
- `isPowerOfTwo(value)`: 是否为2的幂
- `nextPowerOfTwo(value)`: 下一个2的幂

## 颜色工具

### Color（颜色）
表示RGBA颜色，支持颜色运算和转换。

**构造函数**
```javascript
new Color(r = 1, g = 1, b = 1, a = 1)
```

**使用示例**
```javascript
// 创建颜色
const red = new Color(1, 0, 0, 1); // 红色
const green = new Color(0, 1, 0, 0.5); // 半透明绿色
const blue = Color.fromHex('#0000FF'); // 从十六进制创建

// 颜色运算
const mixed = Color.lerp(red, blue, 0.5); // 紫色
const darker = red.darken(0.2); // 变暗20%
const brighter = green.lighten(0.3); // 变亮30%

// 颜色转换
const hex = red.toHex(); // '#FF0000'
const rgb = green.toRGB(); // 'rgb(0,255,0)'
const rgba = blue.toRGBA(); // 'rgba(0,0,255,1)'
```

**属性**
- `r`: number - 红色分量 (0-1)
- `g`: number - 绿色分量 (0-1)
- `b`: number - 蓝色分量 (0-1)
- `a`: number - 透明度 (0-1)

**方法**
- `set(r, g, b, a)`: 设置颜色值
- `copy(color)`: 复制颜色
- `lerp(color, t)`: 颜色插值
- `darken(amount)`: 变暗
- `lighten(amount)`: 变亮
- `saturate(amount)`: 增加饱和度
- `desaturate(amount)`: 降低饱和度
- `invert()`: 反色
- `toHex()`: 转换为十六进制
- `toRGB()`: 转换为RGB字符串
- `toRGBA()`: 转换为RGBA字符串
- `toHSL()`: 转换为HSL对象
- `fromHSL(h, s, l, a)`: 从HSL创建

**静态方法**
- `Color.fromHex(hex)`: 从十六进制创建
- `Color.fromRGB(r, g, b, a)`: 从RGB值创建
- `Color.fromHSL(h, s, l, a)`: 从HSL值创建
- `Color.lerp(a, b, t)`: 静态插值
- `Color.random()`: 随机颜色

**预定义颜色**
```javascript
Color.red = new Color(1, 0, 0, 1);
Color.green = new Color(0, 1, 0, 1);
Color.blue = new Color(0, 0, 1, 1);
Color.white = new Color(1, 1, 1, 1);
Color.black = new Color(0, 0, 0, 1);
Color.gray = new Color(0.5, 0.5, 0.5, 1);
Color.yellow = new Color(1, 1, 0, 1);
Color.cyan = new Color(0, 1, 1, 1);
Color.magenta = new Color(1, 0, 1, 1);
Color.transparent = new Color(0, 0, 0, 0);
```

## 定时器工具

### Timer（定时器）
提供定时和延时功能，支持一次性、重复和帧定时器。

**构造函数**
```javascript
new Timer(interval, callback, options)
```

**使用示例**
```javascript
// 一次性定时器
const timeout = Timer.delay(() => {
  console.log('3秒后执行');
}, 3000);

// 重复定时器
const interval = Timer.repeat(() => {
  console.log('每秒执行一次');
}, 1000);

// 帧定时器
const frameTimer = Timer.frame((deltaTime, fps) => {
  console.log(`帧时间: ${deltaTime.toFixed(3)}s, FPS: ${fps.toFixed(1)}`);
}, 60);

// 高级定时器
const advancedTimer = new Timer(500, () => {
  console.log('高级定时器执行');
}, {
  repeat: true,
  maxRepeats: 10, // 最多执行10次
  autoStart: true
});

// 控制定时器
advancedTimer.pause();
setTimeout(() => advancedTimer.resume(), 2000);
setTimeout(() => advancedTimer.stop(), 5000);
```

**方法**
- `start()`: 启动定时器
- `stop()`: 停止定时器
- `pause()`: 暂停定时器
- `resume()`: 恢复定时器
- `reset()`: 重置定时器
- `setInterval(interval)`: 设置间隔时间
- `setCallback(callback)`: 设置回调函数
- `getElapsedTime()`: 获取已运行时间
- `getRemainingTime()`: 获取剩余时间
- `getProgress()`: 获取进度百分比
- `getRepeatCount()`: 获取重复次数
- `isActive()`: 是否正在运行
- `isPaused()`: 是否已暂停

**静态方法**
- `Timer.delay(callback, delay)`: 创建延时定时器
- `Timer.repeat(callback, interval, maxRepeats)`: 创建重复定时器
- `Timer.frame(callback, fps)`: 创建帧定时器
- `Timer.countdown(duration, onTick, onComplete, interval)`: 创建倒计时器

### FrameTimer（帧定时器）
基于requestAnimationFrame的高性能定时器。

**使用示例**
```javascript
const frameTimer = new FrameTimer((deltaTime, fps) => {
  // 游戏逻辑更新
  updateGame(deltaTime);
  
  // 渲染
  renderGame();
}, {
  targetFPS: 60,
  autoStart: true
});

// 获取性能信息
console.log('当前FPS:', frameTimer.getFPS());
console.log('帧时间:', frameTimer.getDeltaTime());
console.log('总帧数:', frameTimer.getFrameCount());

// 控制定时器
frameTimer.stop();
frameTimer.start();
```

## 事件管理工具

### EventEmitter（事件发射器）
提供事件订阅和发布功能，支持优先级和一次性监听器。

**使用示例**
```javascript
const emitter = new EventEmitter();

// 添加事件监听器
emitter.on('playerMove', (direction, speed) => {
  console.log(`玩家移动: ${direction}, 速度: ${speed}`);
});

// 一次性监听器
emitter.once('levelComplete', () => {
  console.log('关卡完成!');
});

// 高优先级监听器
emitter.on('collision', (entity1, entity2) => {
  console.log('碰撞检测优先处理');
}, { priority: 100 });

// 触发事件
emitter.emit('playerMove', 'right', 5);

// 移除监听器
const moveHandler = (direction) => console.log(direction);
emitter.on('move', moveHandler);
emitter.off('move', moveHandler);

// Promise方式等待事件
async function waitForEvent() {
  try {
    const result = await emitter.waitFor('gameStart', { timeout: 5000 });
    console.log('游戏开始:', result);
  } catch (error) {
    console.log('等待超时');
  }
}
```

**方法**
- `on(event, listener, options)`: 添加监听器
- `once(event, listener, options)`: 添加一次性监听器
- `off(event, listener)`: 移除监听器
- `emit(event, ...args)`: 触发事件
- `removeAllListeners(event)`: 移除所有监听器
- `listenerCount(event)`: 获取监听器数量
- `eventNames()`: 获取所有事件名称
- `listeners(event)`: 获取事件的所有监听器
- `prependListener(event, listener, options)`: 前置添加监听器
- `prependOnceListener(event, listener, options)`: 前置添加一次性监听器
- `hasListeners(event)`: 检查是否有监听器
- `waitFor(event, options)`: 等待事件（Promise）

**选项参数**
- `priority`: number - 优先级（数字越大优先级越高）
- `context`: Object - 回调函数的上下文
- `once`: boolean - 是否一次性监听器

**静态方法**
- `EventEmitter.create()`: 创建新实例
- `EventEmitter.extend(methods)`: 创建扩展类
- `EventEmitter.mixin(target)`: 混合功能到目标对象

## 实用工具函数

### 对象池管理
```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  release(obj) {
    if (this.resetFn) {
      this.resetFn(obj);
    }
    this.pool.push(obj);
  }
  
  get size() {
    return this.pool.length;
  }
}

// 使用示例
const vectorPool = new ObjectPool(
  () => new Vector2(),
  (vec) => vec.set(0, 0)
);

const vec = vectorPool.acquire();
vec.set(10, 20);
// 使用完毕
vectorPool.release(vec);
```

### 状态机
```javascript
class StateMachine {
  constructor(initialState) {
    this.currentState = initialState;
    this.states = new Map();
    this.transitions = new Map();
  }
  
  addState(name, enterFn, updateFn, exitFn) {
    this.states.set(name, { enterFn, updateFn, exitFn });
  }
  
  addTransition(fromState, toState, conditionFn) {
    if (!this.transitions.has(fromState)) {
      this.transitions.set(fromState, []);
    }
    this.transitions.get(fromState).push({ toState, conditionFn });
  }
  
  update(deltaTime) {
    // 检查状态转换
    const transitions = this.transitions.get(this.currentState) || [];
    for (const transition of transitions) {
      if (transition.conditionFn()) {
        this.changeState(transition.toState);
        break;
      }
    }
    
    // 更新当前状态
    const state = this.states.get(this.currentState);
    if (state && state.updateFn) {
      state.updateFn(deltaTime);
    }
  }
  
  changeState(newState) {
    const oldState = this.states.get(this.currentState);
    if (oldState && oldState.exitFn) {
      oldState.exitFn();
    }
    
    this.currentState = newState;
    
    const newStateObj = this.states.get(newState);
    if (newStateObj && newStateObj.enterFn) {
      newStateObj.enterFn();
    }
  }
}
```

## 性能优化工具

### 性能监控
```javascript
class PerformanceMonitor {
  constructor() {
    this.frames = [];
    this.maxFrames = 60;
    this.startTime = performance.now();
  }
  
  beginFrame() {
    this.frameStart = performance.now();
  }
  
  endFrame() {
    const frameTime = performance.now() - this.frameStart;
    this.frames.push(frameTime);
    
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
  }
  
  getFPS() {
    if (this.frames.length === 0) return 0;
    const avgFrameTime = this.frames.reduce((a, b) => a + b) / this.frames.length;
    return 1000 / avgFrameTime;
  }
  
  getAverageFrameTime() {
    if (this.frames.length === 0) return 0;
    return this.frames.reduce((a, b) => a + b) / this.frames.length;
  }
  
  getMinFrameTime() {
    return Math.min(...this.frames);
  }
  
  getMaxFrameTime() {
    return Math.max(...this.frames);
  }
}
```

## 调试工具

### 调试绘制
```javascript
class DebugDraw {
  static drawRect(context, x, y, width, height, color = 'red') {
    context.strokeStyle = color;
    context.strokeRect(x, y, width, height);
  }
  
  static drawCircle(context, x, y, radius, color = 'blue') {
    context.strokeStyle = color;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.stroke();
  }
  
  static drawLine(context, x1, y1, x2, y2, color = 'green') {
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }
  
  static drawText(context, text, x, y, color = 'white', font = '12px Arial') {
    context.fillStyle = color;
    context.font = font;
    context.fillText(text, x, y);
  }
}
```

这些工具类为游戏开发提供了强大的基础功能，可以大大简化开发过程并提高代码质量。