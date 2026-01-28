// 2048游戏，继承自BaseGame
import BaseGame from '../../base/BaseGame';

export default class Game2048 extends BaseGame {
  /**
   * 获取游戏配置信息
   * @returns {Object} 游戏配置信息
   */
  static getConfig() {
    return {
      name: '2048',
      previewImage: 'images/Game2048/game_2048.png'
    };
  }

  /**
   * 构造函数
   * @param {Canvas} canvas - Canvas对象
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {function} returnCallback - 返回主菜单的回调函数
   */
  constructor(canvas, ctx, returnCallback) {
    super(canvas, ctx, returnCallback);
    
    // 获取系统信息和安全区
    const systemInfo = wx.getSystemInfoSync();
    this.safeArea = systemInfo.safeArea;
    
    // 游戏状态
    this.grid = this.initGrid(); // 4x4网格
    this.gameOver = false; // 游戏是否结束
    this.maxNumber = 0; // 最大数字
    
    // 动画相关状态
    this.isAnimating = false; // 是否正在播放动画
    this.animationStartTime = 0; // 动画开始时间
    this.animationDuration = 1000; // 动画持续时间（毫秒），调整为1秒
    this.oldGrid = null; // 动画前的网格状态
    this.newGrid = null; // 动画后的网格状态
    this.animationProgress = 0; // 动画进度（0-1）
    // 游戏尺寸配置
    this.gridSize = Math.min(canvas.width * 0.6, canvas.height * 0.6); // 减小网格大小，为右侧方向按钮留出空间
    this.cellSize = this.gridSize / 4; // 每个格子大小
    this.gridOffsetX = (canvas.width - this.gridSize) / 3; // 网格X偏移，向左移动，为右侧方向按钮留出空间
    this.gridOffsetY = (canvas.height - this.gridSize) / 2 + 20; // 网格Y偏移，稍微下移
    
    // 按钮配置
    this.buttonWidth = 150;
    this.buttonHeight = 50;
    this.buttonMargin = 20;
    
    // 方向按钮配置
    this.directionButtonSize = 50; // 减小按钮大小，更适合右侧布局
    this.directionButtonMargin = 8; // 减小按钮间距
    
    // 计算返回和重置按钮位置，并排放在页面下方安全区内
    const buttonY = this.safeArea.bottom - this.buttonHeight - 20; // 距离安全区底部20px
    const totalWidth = this.buttonWidth * 2 + this.buttonMargin;
    const startX = (canvas.width - totalWidth) / 2;
    
    // 返回按钮，位于左侧
    this.backButton = {
      x: startX,
      y: buttonY,
      width: this.buttonWidth,
      height: this.buttonHeight,
      text: '返回主菜单'
    };
    
    // 重置游戏按钮，位于右侧
    this.resetButton = {
      x: startX + this.buttonWidth + this.buttonMargin,
      y: buttonY,
      width: this.buttonWidth,
      height: this.buttonHeight,
      text: '重置游戏'
    };
    
    // 方向按钮位置（上、下、左、右） - 放置在棋盘右侧
    const directionStartX = this.gridOffsetX + this.gridSize + 20; // 棋盘右侧20px
    const directionStartY = this.gridOffsetY + (this.gridSize - (this.directionButtonSize * 4 + this.directionButtonMargin * 3)) / 2; // 垂直居中
    
    this.directionButtons = {
      up: {
        x: directionStartX,
        y: directionStartY,
        width: this.directionButtonSize,
        height: this.directionButtonSize,
        text: '上'
      },
      left: {
        x: directionStartX,
        y: directionStartY + this.directionButtonSize + this.directionButtonMargin,
        width: this.directionButtonSize,
        height: this.directionButtonSize,
        text: '左'
      },
      right: {
        x: directionStartX,
        y: directionStartY + this.directionButtonSize * 2 + this.directionButtonMargin * 2,
        width: this.directionButtonSize,
        height: this.directionButtonSize,
        text: '右'
      },
      down: {
        x: directionStartX,
        y: directionStartY + this.directionButtonSize * 3 + this.directionButtonMargin * 3,
        width: this.directionButtonSize,
        height: this.directionButtonSize,
        text: '下'
      }
    };
  }

  /**
   * 初始化4x4网格
   * @returns {Array} 初始化后的4x4网格
   */
  initGrid() {
    const grid = [];
    for (let i = 0; i < 4; i++) {
      grid[i] = [];
      for (let j = 0; j < 4; j++) {
        grid[i][j] = null;
      }
    }
    return grid;
  }

  /**
   * 游戏初始化
   */
  init() {
    super.init();
    this.resetGame();
    console.log('Game2048 initialized');
  }

  /**
   * 重置游戏
   */
  resetGame() {
    this.grid = this.initGrid();
    this.gameOver = false;
    this.maxNumber = 0;
    this.moveDirection = null;
    this.isAnimating = false;
    this.oldGrid = null;
    this.newGrid = null;
    this.mergeGrid = null;
    this.animationProgress = 0;
    this.animationStage = 0;
    this.needMerge = false;
    // 初始生成四个随机位置的1或2
    for (let i = 0; i < 4; i++) {
      this.generateRandomNumber();
    }
  }

  /**
   * 生成随机数字（1或2）在随机空位置
   */
  generateRandomNumber() {
    const emptyCells = [];
    // 收集所有空位置
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.grid[i][j] === null) {
          emptyCells.push({row: i, col: j});
        }
      }
    }
    
    if (emptyCells.length > 0) {
      // 随机选择一个空位置
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      // 随机生成1或2
      const randomNumber = Math.random() < 0.5 ? 1 : 2;
      this.grid[randomCell.row][randomCell.col] = randomNumber;
      // 更新最大数字
      if (randomNumber > this.maxNumber) {
        this.maxNumber = randomNumber;
      }
    }
  }

  /**
   * 游戏每帧逻辑
   */
  loop() {
    if (!this.isRunning) return;
    
    // 清空画布
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制游戏元素
    this.drawGrid();
    this.drawNumbers();
    this.drawButtons();
    this.drawDirectionButtons();
    this.drawGameResult();
  }
  
  /**
   * 绘制网格
   */
  drawGrid() {
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 3;
    this.ctx.fillStyle = '#f0f0f0';
    
    // 绘制网格背景
    this.ctx.fillRect(this.gridOffsetX, this.gridOffsetY, this.gridSize, this.gridSize);
    
    // 绘制垂直线
    for (let i = 1; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffsetX + i * this.cellSize, this.gridOffsetY);
      this.ctx.lineTo(this.gridOffsetX + i * this.cellSize, this.gridOffsetY + this.gridSize);
      this.ctx.stroke();
    }
    
    // 绘制水平线
    for (let i = 1; i < 4; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffsetX, this.gridOffsetY + i * this.cellSize);
      this.ctx.lineTo(this.gridOffsetX + this.gridSize, this.gridOffsetY + i * this.cellSize);
      this.ctx.stroke();
    }
  }
  
  /**
   * 绘制数字
   */
  drawNumbers() {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const number = this.grid[row][col];
        if (number !== null) {
          const x = this.gridOffsetX + col * this.cellSize + this.cellSize / 2;
          const y = this.gridOffsetY + row * this.cellSize + this.cellSize / 2;
          
          // 根据数字大小设置不同背景色
          this.setCellBackgroundColor(number);
          // 绘制单元格背景
          this.ctx.fillRect(
            this.gridOffsetX + col * this.cellSize + 5,
            this.gridOffsetY + row * this.cellSize + 5,
            this.cellSize - 10,
            this.cellSize - 10
          );
          
          // 绘制数字
          this.ctx.fillStyle = '#333333';
          this.ctx.font = 'bold 24px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(number, x, y);
        }
      }
    }
  }
  
  /**
   * 设置单元格背景色
   * @param {number} number - 单元格数字
   */
  setCellBackgroundColor(number) {
    switch(number) {
      case 1: this.ctx.fillStyle = '#eee4da'; break;
      case 2: this.ctx.fillStyle = '#ede0c8'; break;
      case 4: this.ctx.fillStyle = '#f2b179'; break;
      case 8: this.ctx.fillStyle = '#f59563'; break;
      case 16: this.ctx.fillStyle = '#f67c5f'; break;
      case 32: this.ctx.fillStyle = '#f65e3b'; break;
      case 64: this.ctx.fillStyle = '#edcf72'; break;
      case 128: this.ctx.fillStyle = '#edcc61'; break;
      case 256: this.ctx.fillStyle = '#edc850'; break;
      case 512: this.ctx.fillStyle = '#edc53f'; break;
      case 1024: this.ctx.fillStyle = '#edc22e'; break;
      case 2048: this.ctx.fillStyle = '#edc01e'; break;
      default: this.ctx.fillStyle = '#edc01e'; break;
    }
  }
  
  /**
   * 绘制按钮
   */
  drawButtons() {
    // 绘制返回按钮
    this.drawButton(this.backButton);
    
    // 绘制重置游戏按钮
    this.drawButton(this.resetButton);
  }
  
  /**
   * 绘制方向按钮
   */
  drawDirectionButtons() {
    for (const direction in this.directionButtons) {
      this.drawButton(this.directionButtons[direction]);
    }
  }
  
  /**
   * 绘制单个按钮
   */
  drawButton(button) {
    // 按钮背景
    this.ctx.fillStyle = '#4ecdc4';
    this.ctx.fillRect(button.x, button.y, button.width, button.height);
    
    // 按钮边框
    this.ctx.strokeStyle = '#26a69a';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(button.x, button.y, button.width, button.height);
    
    // 按钮文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  }
  
  /**
   * 绘制游戏结果
   */
  drawGameResult() {
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      this.ctx.fillText('游戏结束！', this.canvas.width / 2, this.canvas.height / 2 - 50);
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`最大数字: ${this.maxNumber}`, this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.fillText('点击重置游戏按钮继续', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
  }
  
  /**
   * 处理向上移动
   */
  moveUp() {
    let moved = false;
    
    for (let col = 0; col < 4; col++) {
      // 处理每一列
      const newCol = [];
      
      // 收集非空单元格
      for (let row = 0; row < 4; row++) {
        if (this.grid[row][col] !== null) {
          newCol.push(this.grid[row][col]);
        }
      }
      
      // 合并相同数字（允许多次合并）
      let i = 0;
      while (i < newCol.length - 1) {
        if (newCol[i] === newCol[i + 1]) {
          newCol[i] *= 2;
          newCol.splice(i + 1, 1);
          moved = true;
          // 更新最大数字
          if (newCol[i] > this.maxNumber) {
            this.maxNumber = newCol[i];
          }
        } else {
          i++;
        }
      }
      
      // 填充空单元格
      while (newCol.length < 4) {
        newCol.push(null);
      }
      
      // 检查是否有移动
      for (let row = 0; row < 4; row++) {
        if (this.grid[row][col] !== newCol[row]) {
          moved = true;
        }
        this.grid[row][col] = newCol[row];
      }
    }
    
    if (moved) {
      // 生成新数字
      this.generateRandomNumber();
      // 检查游戏是否结束
      this.gameOver = this.checkGameOver();
    }
    
    return moved;
  }
  
  /**
   * 处理向下移动
   */
  moveDown() {
    let moved = false;
    
    for (let col = 0; col < 4; col++) {
      // 处理每一列
      const newCol = [];
      
      // 收集非空单元格（从下到上）
      for (let row = 3; row >= 0; row--) {
        if (this.grid[row][col] !== null) {
          newCol.push(this.grid[row][col]);
        }
      }
      
      // 合并相同数字（允许多次合并）
      let i = 0;
      while (i < newCol.length - 1) {
        if (newCol[i] === newCol[i + 1]) {
          newCol[i] *= 2;
          newCol.splice(i + 1, 1);
          moved = true;
          // 更新最大数字
          if (newCol[i] > this.maxNumber) {
            this.maxNumber = newCol[i];
          }
        } else {
          i++;
        }
      }
      
      // 填充空单元格到底部
      const finalCol = new Array(4).fill(null);
      for (let i = 0; i < newCol.length; i++) {
        finalCol[3 - i] = newCol[i];
      }
      
      // 检查是否有移动
      for (let row = 0; row < 4; row++) {
        if (this.grid[row][col] !== finalCol[row]) {
          moved = true;
        }
        this.grid[row][col] = finalCol[row];
      }
    }
    
    if (moved) {
      // 生成新数字
      this.generateRandomNumber();
      // 检查游戏是否结束
      this.gameOver = this.checkGameOver();
    }
    
    return moved;
  }
  
  /**
   * 处理向左移动
   */
  moveLeft() {
    let moved = false;
    
    for (let row = 0; row < 4; row++) {
      // 处理每一行
      const newRow = [];
      
      // 收集非空单元格
      for (let col = 0; col < 4; col++) {
        if (this.grid[row][col] !== null) {
          newRow.push(this.grid[row][col]);
        }
      }
      
      // 合并相同数字（允许多次合并）
      let i = 0;
      while (i < newRow.length - 1) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          newRow.splice(i + 1, 1);
          moved = true;
          // 更新最大数字
          if (newRow[i] > this.maxNumber) {
            this.maxNumber = newRow[i];
          }
        } else {
          i++;
        }
      }
      
      // 填充空单元格
      while (newRow.length < 4) {
        newRow.push(null);
      }
      
      // 检查是否有移动
      for (let col = 0; col < 4; col++) {
        if (this.grid[row][col] !== newRow[col]) {
          moved = true;
        }
        this.grid[row][col] = newRow[col];
      }
    }
    
    if (moved) {
      // 生成新数字
      this.generateRandomNumber();
      // 检查游戏是否结束
      this.gameOver = this.checkGameOver();
    }
    
    return moved;
  }
  
  /**
   * 处理向右移动
   */
  moveRight() {
    let moved = false;
    
    for (let row = 0; row < 4; row++) {
      // 处理每一行
      const newRow = [];
      
      // 收集非空单元格（从右到左）
      for (let col = 3; col >= 0; col--) {
        if (this.grid[row][col] !== null) {
          newRow.push(this.grid[row][col]);
        }
      }
      
      // 合并相同数字（允许多次合并）
      let i = 0;
      while (i < newRow.length - 1) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          newRow.splice(i + 1, 1);
          moved = true;
          // 更新最大数字
          if (newRow[i] > this.maxNumber) {
            this.maxNumber = newRow[i];
          }
        } else {
          i++;
        }
      }
      
      // 填充空单元格到右侧
      const finalRow = new Array(4).fill(null);
      for (let i = 0; i < newRow.length; i++) {
        finalRow[3 - i] = newRow[i];
      }
      
      // 检查是否有移动
      for (let col = 0; col < 4; col++) {
        if (this.grid[row][col] !== finalRow[col]) {
          moved = true;
        }
        this.grid[row][col] = finalRow[col];
      }
    }
    
    if (moved) {
      // 生成新数字
      this.generateRandomNumber();
      // 检查游戏是否结束
      this.gameOver = this.checkGameOver();
    }
    
    return moved;
  }
  
  /**
   * 检查游戏是否结束
   */
  checkGameOver() {
    // 检查是否有空格
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (this.grid[row][col] === null) {
          return false;
        }
      }
    }
    
    // 检查是否有相邻相同数字
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const current = this.grid[row][col];
        // 检查右边
        if (col < 3 && this.grid[row][col + 1] === current) {
          return false;
        }
        // 检查下边
        if (row < 3 && this.grid[row + 1][col] === current) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * 处理触摸事件
   * @param {number} x - 点击x坐标
   * @param {number} y - 点击y坐标
   */
  handleTouch(x, y) {
    // 检测返回按钮点击
    if (x >= this.backButton.x && x <= this.backButton.x + this.backButton.width &&
        y >= this.backButton.y && y <= this.backButton.y + this.backButton.height) {
      if (this.returnCallback) {
        this.returnCallback();
      }
      return;
    }
    
    // 检测重置游戏按钮点击
    if (x >= this.resetButton.x && x <= this.resetButton.x + this.resetButton.width &&
        y >= this.resetButton.y && y <= this.resetButton.y + this.resetButton.height) {
      this.resetGame();
      return;
    }
    
    // 检测方向按钮点击
    if (x >= this.directionButtons.up.x && x <= this.directionButtons.up.x + this.directionButtons.up.width &&
        y >= this.directionButtons.up.y && y <= this.directionButtons.up.y + this.directionButtons.up.height) {
      if (!this.gameOver) {
        this.moveUp();
      }
      return;
    }
    
    if (x >= this.directionButtons.down.x && x <= this.directionButtons.down.x + this.directionButtons.down.width &&
        y >= this.directionButtons.down.y && y <= this.directionButtons.down.y + this.directionButtons.down.height) {
      if (!this.gameOver) {
        this.moveDown();
      }
      return;
    }
    
    if (x >= this.directionButtons.left.x && x <= this.directionButtons.left.x + this.directionButtons.left.width &&
        y >= this.directionButtons.left.y && y <= this.directionButtons.left.y + this.directionButtons.left.height) {
      if (!this.gameOver) {
        this.moveLeft();
      }
      return;
    }
    
    if (x >= this.directionButtons.right.x && x <= this.directionButtons.right.x + this.directionButtons.right.width &&
        y >= this.directionButtons.right.y && y <= this.directionButtons.right.y + this.directionButtons.right.height) {
      if (!this.gameOver) {
        this.moveRight();
      }
      return;
    }
  }

  /**
   * 游戏释放资源
   */
  release() {
    super.release();
    console.log('Game2048 released');
  }
}
