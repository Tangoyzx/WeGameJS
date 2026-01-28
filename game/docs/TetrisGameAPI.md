# TetrisGame API 文档

## 1. 游戏概述

TetrisGame 是一个基于 Canvas 的俄罗斯方块游戏实现，继承自 BaseGame 类。游戏采用状态管理模式，包含下落状态、消除状态和准备生成状态。

## 2. 核心类

### 2.1 TetrisGame 类

**继承关系**：继承自 BaseGame 类

**主要职责**：
- 游戏初始化和配置
- 游戏状态管理
- 游戏逻辑处理
- 用户输入处理
- 游戏渲染

### 2.2 状态类

游戏使用状态模式管理不同阶段的逻辑：

- **FallingState**：处理砖块下落逻辑
- **ClearingState**：处理砖块消除和动画
- **ReadyToSpawnState**：处理新砖块生成

## 3. 游戏配置

### 3.1 静态方法

```javascript
static getConfig()
```

**返回值**：游戏配置对象

**配置内容**：
- `name`：游戏名称（"俄罗斯方块"）
- `previewImage`：预览图片路径

## 4. 构造函数

```javascript
constructor(canvas, ctx, returnCallback)
```

**参数**：
- `canvas`：Canvas 对象
- `ctx`：Canvas 2D 上下文
- `returnCallback`：返回主菜单的回调函数

**初始化内容**：
- 游戏尺寸配置（12列×20行）
- 游戏区域位置计算
- 预览区位置设置
- 控制按钮位置配置
- 砖块类型定义
- 游戏数据初始化

## 5. 核心方法

### 5.1 游戏初始化

```javascript
init()
```

**功能**：初始化游戏，设置初始状态为 ReadyToSpawnState

### 5.2 状态管理

```javascript
setState(stateName, newData = null)
```

**参数**：
- `stateName`：状态名称（"FallingState"、"ClearingState"、"ReadyToSpawnState"）
- `newData`：新的游戏数据（可选）

**功能**：切换游戏状态，处理状态进入/离开逻辑

### 5.3 砖块管理

#### 5.3.1 生成新砖块

```javascript
spawnNewPiece()
```

**功能**：生成新的游戏砖块，处理游戏结束逻辑

#### 5.3.2 获取随机砖块

```javascript
getRandomPiece()
```

**返回值**：随机砖块对象

**砖块结构**：
- `shape`：砖块形状矩阵
- `color`：砖块颜色
- `specialAttribute`：特殊属性
- `specialCell`：特殊属性格子位置

#### 5.3.3 检查位置有效性

```javascript
isValidPosition(shape, x, y)
```

**参数**：
- `shape`：砖块形状
- `x`：X 坐标
- `y`：Y 坐标

**返回值**：位置是否有效（布尔值）

#### 5.3.4 旋转砖块

```javascript
rotateShape(shape, specialCell = null)
```

**参数**：
- `shape`：砖块形状
- `specialCell`：特殊属性格子位置（可选）

**返回值**：包含旋转后形状和特殊属性格子新位置的对象

#### 5.3.5 移动砖块

```javascript
movePiece(dx, dy)
```

**参数**：
- `dx`：X 方向移动量
- `dy`：Y 方向移动量

**返回值**：移动是否成功（布尔值）

#### 5.3.6 旋转当前砖块

```javascript
rotatePiece()
```

**功能**：旋转当前游戏砖块

#### 5.3.7 急速下降

```javascript
dropPiece()
```

**功能**：使当前砖块急速下降到最低点

#### 5.3.8 锁定砖块

```javascript
lockPiece()
```

**功能**：将当前砖块锁定到游戏板上，检查并处理消除逻辑

### 5.4 行消除

```javascript
clearLines()
```

**功能**：检查并消除完整的行，处理爆炸效果

### 5.5 游戏循环

```javascript
loop()
```

**功能**：游戏主循环，处理状态更新和渲染

### 5.6 渲染方法

#### 5.6.1 绘制游戏区域

```javascript
drawGameArea()
```

**功能**：绘制游戏主区域，包括背景、网格和已锁定的砖块

#### 5.6.2 绘制当前砖块

```javascript
drawCurrentPiece()
```

**功能**：绘制当前正在移动的砖块

#### 5.6.3 绘制预览区域

```javascript
drawPreviewArea()
```

**功能**：绘制下一个砖块预览区域

#### 5.6.4 绘制按钮

```javascript
drawButtons()
```

**功能**：绘制游戏控制按钮

```javascript
drawButton(button)
```

**参数**：
- `button`：按钮对象

**功能**：绘制单个按钮

### 5.7 事件处理

```javascript
handleTouch(x, y)
```

**参数**：
- `x`：触摸 X 坐标
- `y`：触摸 Y 坐标

**功能**：处理用户触摸事件，响应按钮点击

### 5.8 资源释放

```javascript
release()
```

**功能**：释放游戏资源

## 6. 状态类 API

### 6.1 FallingState

**主要方法**：
- `onEnter()`：进入状态时调用
- `loop()`：每帧调用，处理砖块自动下落
- `movePiece(dx, dy)`：移动砖块
- `isValidPosition(shape, x, y)`：检查位置有效性
- `rotatePiece()`：旋转砖块
- `rotateShape(shape, specialCell)`：旋转砖块形状
- `dropPiece()`：急速下降

### 6.2 ClearingState

**主要方法**：
- `onEnter()`：进入状态时调用
- `loop()`：每帧调用，处理消除动画
- `lockPiece()`：锁定砖块到游戏板
- `findLinesToClear()`：查找需要消除的行
- `findExplosionCenters()`：查找爆炸中心
- `findCellsToClear()`：查找需要消除的格子
- `performClear()`：执行实际消除
- `handleFalling()`：处理消除后的下落逻辑
- `drawAnimation(ctx, gameArea)`：绘制消除动画

### 6.3 ReadyToSpawnState

**主要方法**：
- `onEnter()`：进入状态时调用
- `loop()`：每帧调用，检查游戏是否结束
- `spawnNewPiece()`：生成新砖块
- `getRandomPiece()`：获取随机砖块
- `isValidPosition(shape, x, y)`：检查位置有效性
- `initGameBoard()`：初始化游戏板

## 7. 游戏数据结构

### 7.1 游戏数据对象 (gameData)

```javascript
{
  gameBoard: [],           // 游戏板数据
  currentPiece: null,      // 当前砖块
  nextPiece: null,         // 下一个砖块
  currentPieceX: 0,        // 当前砖块X位置
  currentPieceY: 0,        // 当前砖块Y位置
  gameSpeed: 500,          // 游戏速度（毫秒）
  lastDropTime: 0,         // 上次下落时间
  cols: 12,                // 列数
  rows: 20,                // 行数
  cellSize: 0,             // 格子大小
  cellTypes: {},           // 格子类型
  specialAttributes: {},   // 特殊属性
  tetrominoes: {}          // 砖块类型定义
}
```

### 7.2 砖块类型 (tetrominoes)

包含 7 种经典俄罗斯方块形状：I、O、T、S、Z、J、L

### 7.3 格子类型 (cellTypes)

- `EMPTY`：空格子
- `NORMAL`：普通格子
- `EXPLOSIVE`：爆炸格子

### 7.4 特殊属性 (specialAttributes)

- `NONE`：无特殊属性
- `EXPLOSIVE`：爆炸属性

## 8. 控制按钮

游戏包含以下控制按钮：
- **左移按钮**：向左移动砖块
- **右移按钮**：向右移动砖块
- **旋转按钮**：旋转砖块
- **下降按钮**：急速下降砖块
- **返回主菜单按钮**：返回游戏主菜单

## 9. 游戏流程

1. **初始化**：调用 `init()` 方法，设置初始状态为 ReadyToSpawnState
2. **生成砖块**：ReadyToSpawnState 生成新砖块，检查游戏是否结束
3. **下落过程**：切换到 FallingState，砖块自动下落
4. **碰撞检测**：砖块无法下落后，切换到 ClearingState
5. **消除处理**：ClearingState 处理行消除和爆炸效果
6. **循环**：消除完成后，切换回 ReadyToSpawnState，开始新一轮循环

## 10. 特殊功能

### 10.1 爆炸效果

- 20% 概率生成具有爆炸属性的砖块
- 爆炸砖块消除时会清除周围 2 格范围内的所有砖块
- 爆炸效果有视觉反馈（红色边框）

### 10.2 消除动画

- 行消除时会有闪烁动画效果
- 动画持续 1 秒

## 11. 游戏结束条件

当新生成的砖块无法放置在初始位置时，游戏结束并自动重置

## 12. 代码示例

### 12.1 创建游戏实例

```javascript
import TetrisGame from './js/games/TetrisGame/TetrisGame';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function returnToMainMenu() {
  // 返回主菜单逻辑
}

const tetrisGame = new TetrisGame(canvas, ctx, returnToMainMenu);
tetrisGame.init();
```

### 12.2 游戏循环

```javascript
function gameLoop() {
  tetrisGame.loop();
  requestAnimationFrame(gameLoop);
}

gameLoop();
```

### 12.3 处理触摸事件

```javascript
canvas.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  tetrisGame.handleTouch(x, y);
});
```