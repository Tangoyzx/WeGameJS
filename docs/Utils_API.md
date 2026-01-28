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
- `length()`: 向量长度
- `normalize()`: 单位化
- `distance(v)`: 计算距离
- `rotate(angle)`: 旋转向量
- `lerp(v, t)`: 线性插值

**静态方法**
- `Vector2.zero()`: 创建零向量
- `Vector2.one()`: 创建单位向量
- `Vector2.up()`: 创建向上向量 (0, -1)
- `Vector2.down()`: 创建向下向量 (0, 1)
- `Vector2.left()`: 创建向左向量 (-1, 0)
- `Vector2.right()`: 创建向右向量 (1, 0)
- `Vector2.lerp(a, b, t)`: 静态插值方法
- `Vector2.distance(a, b)`: 静态距离计算

### MathUtils（数学工具）
提供常用的数学函数和常量。

**常量**
- `PI`: Math.PI
- `TWO_PI`: Math.PI * 2
- `DEG_TO_RAD`: Math.PI / 180
- `RAD_TO_DEG`: 180 / Math.PI

**方法**
- `clamp(value, min, max)`: 限制数值范围
- `lerp(a, b, t)`: 线性插值
- `degToRad(degrees)`: 角度转弧度
- `radToDeg(radians)`: 弧度转角度
- `random(min, max)`: 随机浮点数
- `randomInt(min, max)`: 随机整数
- `map(value, fromMin, fromMax, toMin, toMax)`: 数值映射

## 颜色工具

### Color（颜色）
表示RGBA颜色，支持颜色运算和转换。

**构造函数**
```javascript
new Color(r = 1, g = 1, b = 1, a = 1)
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
- `toHex()`: 转换为十六进制
- `toRGB()`: 转换为RGB字符串

**静态方法**
- `Color.fromHex(hex)`: 从十六进制创建
- `Color.fromRGB(r, g, b, a)`: 从RGB值创建
- `Color.lerp(a, b, t)`: 静态插值
- `Color.random()`: 随机颜色

**预定义颜色**
- `Color.red`, `Color.green`, `Color.blue`
- `Color.white`, `Color.black`, `Color.gray`
- `Color.yellow`, `Color.cyan`, `Color.magenta`

## 定时器工具

### Timer（定时器）
提供定时和延时功能。

**构造函数**
```javascript
new Timer(interval, callback, options)
```

**方法**
- `start()`: 启动定时器
- `stop()`: 停止定时器
- `pause()`: 暂停定时器
- `resume()`: 恢复定时器
- `reset()`: 重置定时器

**静态方法**
- `Timer.delay(callback, delay)`: 创建延时定时器
- `Timer.repeat(callback, interval)`: 创建重复定时器
- `Timer.frame(callback, fps)`: 创建帧定时器

## 事件管理工具

### EventEmitter（事件发射器）
提供事件订阅和发布功能。

**方法**
- `on(event, listener)`: 添加监听器
- `once(event, listener)`: 添加一次性监听器
- `off(event, listener)`: 移除监听器
- `emit(event, ...args)`: 触发事件
- `removeAllListeners(event)`: 移除所有监听器

## 实用工具函数

### 对象池管理
```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
  }
  
  acquire() {
    // 获取对象
  }
  
  release(obj) {
    // 释放对象
  }
}
```

### 状态机
```javascript
class StateMachine {
  constructor(initialState) {
    this.currentState = initialState;
  }
  
  addState(name, enterFn, updateFn, exitFn) {
    // 添加状态
  }
  
  update(deltaTime) {
    // 更新状态机
  }
  
  changeState(newState) {
    // 切换状态
  }
}
```

## 调试工具

### 调试绘制
```javascript
class DebugDraw {
  static drawRect(context, x, y, width, height, color = 'red') {
    // 绘制矩形
  }
  
  static drawCircle(context, x, y, radius, color = 'blue') {
    // 绘制圆形
  }
  
  static drawLine(context, x1, y1, x2, y2, color = 'green') {
    // 绘制直线
  }
  
  static drawText(context, text, x, y, color = 'white') {
    // 绘制文本
  }
}
```

这些工具类为游戏开发提供了强大的基础功能，可以大大简化开发过程并提高代码质量。