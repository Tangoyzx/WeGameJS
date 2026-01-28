// 井字过三关游戏，继承自BaseGame
import BaseGame from '../../base/BaseGame';

export default class ThreeGame extends BaseGame {
  /**
   * 获取游戏配置信息
   * @returns {Object} 游戏配置信息
   */
  static getConfig() {
    return {
      name: '井字过三关',
      previewImage: 'images/ThreeGame/three_game.png'
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
    this.grid = this.initGrid(); // 3x3网格
    this.currentPlayer = 'X'; // 当前玩家，X先开始
    this.gameOver = false; // 游戏是否结束
    this.winner = null; // 获胜者
    
    // 游戏尺寸配置
    this.gridSize = Math.min(canvas.width * 0.8, canvas.height * 0.6); // 网格大小
    this.cellSize = this.gridSize / 3; // 每个格子大小
    this.gridOffsetX = (canvas.width - this.gridSize) / 2; // 网格X偏移
    this.gridOffsetY = (canvas.height - this.gridSize) / 2 + 20; // 网格Y偏移，稍微下移
    
    // 按钮配置
    this.buttonWidth = 150;
    this.buttonHeight = 50;
    this.buttonMargin = 20;
    
    // 计算按钮位置，并排放在页面下方安全区内
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
    
    // 重新开始按钮，位于右侧
    this.restartButton = {
      x: startX + this.buttonWidth + this.buttonMargin,
      y: buttonY,
      width: this.buttonWidth,
      height: this.buttonHeight,
      text: '重新开始'
    };
  }

  /**
   * 初始化3x3网格
   * @returns {Array} 初始化后的3x3网格
   */
  initGrid() {
    const grid = [];
    for (let i = 0; i < 3; i++) {
      grid[i] = [];
      for (let j = 0; j < 3; j++) {
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
    console.log('ThreeGame initialized');
  }

  /**
   * 重置游戏
   */
  resetGame() {
    this.grid = this.initGrid();
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.winner = null;
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
    this.drawSymbols();
    this.drawButtons();
    this.drawPlayerInfo();
    this.drawGameResult();
  }
  
  /**
   * 绘制网格
   */
  drawGrid() {
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 3;
    
    // 绘制垂直线
    for (let i = 1; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffsetX + i * this.cellSize, this.gridOffsetY);
      this.ctx.lineTo(this.gridOffsetX + i * this.cellSize, this.gridOffsetY + this.gridSize);
      this.ctx.stroke();
    }
    
    // 绘制水平线
    for (let i = 1; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.gridOffsetX, this.gridOffsetY + i * this.cellSize);
      this.ctx.lineTo(this.gridOffsetX + this.gridSize, this.gridOffsetY + i * this.cellSize);
      this.ctx.stroke();
    }
  }
  
  /**
   * 绘制玩家符号（X和O）
   */
  drawSymbols() {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const symbol = this.grid[row][col];
        if (symbol) {
          const x = this.gridOffsetX + col * this.cellSize + this.cellSize / 2;
          const y = this.gridOffsetY + row * this.cellSize + this.cellSize / 2;
          
          if (symbol === 'X') {
            this.drawX(x, y);
          } else {
            this.drawO(x, y);
          }
        }
      }
    }
  }
  
  /**
   * 绘制X符号
   */
  drawX(x, y) {
    const size = this.cellSize * 0.6;
    
    this.ctx.strokeStyle = '#ff6b6b';
    this.ctx.lineWidth = 4;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x - size / 2, y - size / 2);
    this.ctx.lineTo(x + size / 2, y + size / 2);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + size / 2, y - size / 2);
    this.ctx.lineTo(x - size / 2, y + size / 2);
    this.ctx.stroke();
  }
  
  /**
   * 绘制O符号
   */
  drawO(x, y) {
    const size = this.cellSize * 0.6;
    
    this.ctx.strokeStyle = '#4ecdc4';
    this.ctx.lineWidth = 4;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    this.ctx.stroke();
  }
  
  /**
   * 绘制按钮
   */
  drawButtons() {
    // 绘制返回按钮
    this.drawButton(this.backButton);
    
    // 绘制重新开始按钮
    this.drawButton(this.restartButton);
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
   * 绘制当前玩家信息
   */
  drawPlayerInfo() {
    this.ctx.fillStyle = '#333333';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    
    const text = this.gameOver ? '游戏结束' : `当前玩家: ${this.currentPlayer}`;
    this.ctx.fillText(text, this.canvas.width / 2, this.safeArea.top + 40);
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
      
      let resultText;
      if (this.winner) {
        resultText = `${this.winner} 获胜！`;
      } else {
        resultText = '平局！';
      }
      
      this.ctx.fillText(resultText, this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.font = '24px Arial';
      this.ctx.fillText('点击重新开始按钮继续游戏', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
  }
  
  /**
   * 检测胜负
   */
  checkWin() {
    const grid = this.grid;
    
    // 检测行
    for (let i = 0; i < 3; i++) {
      if (grid[i][0] && grid[i][0] === grid[i][1] && grid[i][0] === grid[i][2]) {
        return grid[i][0];
      }
    }
    
    // 检测列
    for (let i = 0; i < 3; i++) {
      if (grid[0][i] && grid[0][i] === grid[1][i] && grid[0][i] === grid[2][i]) {
        return grid[0][i];
      }
    }
    
    // 检测对角线
    if (grid[0][0] && grid[0][0] === grid[1][1] && grid[0][0] === grid[2][2]) {
      return grid[0][0];
    }
    if (grid[0][2] && grid[0][2] === grid[1][1] && grid[0][2] === grid[2][0]) {
      return grid[0][2];
    }
    
    // 检测平局
    let isDraw = true;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i][j] === null) {
          isDraw = false;
          break;
        }
      }
      if (!isDraw) break;
    }
    if (isDraw) {
      return 'draw';
    }
    
    return null;
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
    
    // 检测重新开始按钮点击
    if (x >= this.restartButton.x && x <= this.restartButton.x + this.restartButton.width &&
        y >= this.restartButton.y && y <= this.restartButton.y + this.restartButton.height) {
      this.resetGame();
      return;
    }
    
    // 如果游戏已结束，不处理其他触摸
    if (this.gameOver) return;
    
    // 检测网格点击
    if (x >= this.gridOffsetX && x <= this.gridOffsetX + this.gridSize &&
        y >= this.gridOffsetY && y <= this.gridOffsetY + this.gridSize) {
      
      // 计算点击的格子坐标
      const col = Math.floor((x - this.gridOffsetX) / this.cellSize);
      const row = Math.floor((y - this.gridOffsetY) / this.cellSize);
      
      // 确保坐标在有效范围内
      if (row >= 0 && row < 3 && col >= 0 && col < 3) {
        // 如果格子为空，放置当前玩家的符号
        if (this.grid[row][col] === null) {
          this.grid[row][col] = this.currentPlayer;
          
          // 检查是否获胜
          const winner = this.checkWin();
          if (winner) {
            this.gameOver = true;
            this.winner = winner === 'draw' ? null : winner;
          } else {
            // 切换玩家
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
          }
        }
      }
    }
  }

  /**
   * 游戏释放资源
   */
  release() {
    super.release();
    console.log('ThreeGame released');
  }
}