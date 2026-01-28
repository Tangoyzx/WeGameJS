// TetrisGame游戏，继承自BaseGame
import BaseGame from '../../base/BaseGame';
// 导入状态类
import FallingState from './states/FallingState';
import ClearingState from './states/ClearingState';
import ReadyToSpawnState from './states/ReadyToSpawnState';

export default class TetrisGame extends BaseGame {
  /**
   * 获取游戏配置信息
   * @returns {Object} 游戏配置信息
   */
  static getConfig() {
    return {
      name: '俄罗斯方块',
      previewImage: 'images/TetrisGame/tetris_game.png'
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
    
    // 游戏尺寸配置
    this.cols = 12; // 12格宽
    this.rows = 20; // 20格高
    this.cellSize = Math.min(
      (canvas.width - 150) / this.cols, // 减少右侧预留空间，增大主界面
      (canvas.height - 120) / this.rows // 减少底部预留空间，增大主界面
    );
    
    // 主游戏区位置 - 居中显示
    this.gameAreaWidth = this.cols * this.cellSize;
    this.gameAreaHeight = this.rows * this.cellSize;
    this.gameAreaX = (canvas.width - this.gameAreaWidth - 120) / 2; // 留出右侧预览区空间
    this.gameAreaY = this.safeArea.top + 30;
    
    // 预览区位置
    this.previewAreaX = this.gameAreaX + this.gameAreaWidth + 20;
    this.previewAreaY = this.gameAreaY;
    this.previewAreaWidth = 100;
    this.previewAreaHeight = 100;
    
    // 按钮配置
    this.buttonWidth = 55;
    this.buttonHeight = 55;
    this.buttonMargin = 8;
    
    // 控制按钮位置（左移、右移、旋转、急速下降）
    const controlButtonsY = this.gameAreaY + this.gameAreaHeight + 15;
    const controlButtonsTotalWidth = (this.buttonWidth + this.buttonMargin) * 4 - this.buttonMargin;
    const controlButtonsX = (canvas.width - controlButtonsTotalWidth) / 2;
    
    this.leftButton = {
      x: controlButtonsX,
      y: controlButtonsY,
      width: this.buttonWidth,
      height: this.buttonHeight,
      text: '左'
    };
    this.rightButton = {
      x: controlButtonsX + this.buttonWidth + this.buttonMargin,
      y: controlButtonsY,
      width: this.buttonWidth,
      height: this.buttonHeight,
      text: '右'
    };
    this.rotateButton = {
      x: controlButtonsX + (this.buttonWidth + this.buttonMargin) * 2,
      y: controlButtonsY,
      width: this.buttonWidth,
      height: this.buttonHeight,
      text: '旋'
    };
    this.dropButton = {
      x: controlButtonsX + (this.buttonWidth + this.buttonMargin) * 3,
      y: controlButtonsY,
      width: this.buttonWidth,
      height: this.buttonHeight,
      text: '降'
    };
    
    // 返回主菜单按钮 - 放在控制按钮下方
    this.backButton = {
      x: (canvas.width - 150) / 2,
      y: controlButtonsY + this.buttonHeight + 15,
      width: 150,
      height: 50,
      text: '返回主菜单'
    };
    
    // 定义7种俄罗斯方块形状
    this.tetrominoes = {
      I: {
        shape: [[1, 1, 1, 1]],
        color: '#00ffff'
      },
      O: {
        shape: [[1, 1], [1, 1]],
        color: '#ffff00'
      },
      T: {
        shape: [[0, 1, 0], [1, 1, 1]],
        color: '#800080'
      },
      S: {
        shape: [[0, 1, 1], [1, 1, 0]],
        color: '#00ff00'
      },
      Z: {
        shape: [[1, 1, 0], [0, 1, 1]],
        color: '#ff0000'
      },
      J: {
        shape: [[1, 0, 0], [1, 1, 1]],
        color: '#0000ff'
      },
      L: {
        shape: [[0, 0, 1], [1, 1, 1]],
        color: '#ffa500'
      }
    };
    
    // 格子类型
    this.cellTypes = {
      EMPTY: 0,
      NORMAL: 1,
      EXPLOSIVE: 2
    };
    
    // 特殊属性枚举
    this.specialAttributes = {
      NONE: 0,
      EXPLOSIVE: 1
    };
    
    // 初始化游戏数据
    this.gameData = {
      gameBoard: [],
      currentPiece: null,
      nextPiece: null,
      currentPieceX: 0,
      currentPieceY: 0,
      gameSpeed: 500,
      lastDropTime: 0,
      cols: this.cols,
      rows: this.rows,
      cellSize: this.cellSize,
      cellTypes: this.cellTypes,
      specialAttributes: this.specialAttributes,
      tetrominoes: this.tetrominoes
    };
    
    // 当前状态
    this.currentState = null;
  }

  /**
   * 游戏初始化
   */
  init() {
    super.init();
    
    // 初始化游戏板
    this.initGameBoard();
    
    // 设置初始状态为准备生成状态
    this.setState('ReadyToSpawnState');
    
    console.log('TetrisGame initialized');
  }

  /**
   * 初始化游戏主界面
   */
  initGameBoard() {
    this.gameData.gameBoard = [];
    for (let col = 0; col < this.cols; col++) {
      this.gameData.gameBoard[col] = [];
      for (let row = 0; row < this.rows; row++) {
        this.gameData.gameBoard[col][row] = {
          type: this.cellTypes.EMPTY
        };
      }
    }
  }
  
  /**
   * 设置游戏状态
   * @param {string} stateName - 状态名称
   * @param {Object} newData - 新的游戏数据
   */
  setState(stateName, newData = null) {
    // 离开当前状态
    if (this.currentState) {
      this.currentState.onLeave();
    }
    
    // 更新游戏数据
    if (newData) {
      this.gameData = newData;
    }
    
    // 动态创建新的状态对象，确保持有最新的 gameData
    switch (stateName) {
      case 'FallingState':
        this.currentState = new FallingState(this.gameData);
        break;
      case 'ClearingState':
        this.currentState = new ClearingState(this.gameData);
        break;
      case 'ReadyToSpawnState':
        this.currentState = new ReadyToSpawnState(this.gameData);
        break;
      default:
        this.currentState = null;
    }
    
    // 进入新状态
    if (this.currentState) {
      this.currentState.onEnter();
    }
  }

  /**
   * 生成新的砖块
   */
  spawnNewPiece() {
    // 如果没有下一个砖块，先生成一个
    if (!this.nextPiece) {
      this.nextPiece = this.getRandomPiece();
    }
    
    // 设置当前砖块为下一个砖块
    this.currentPiece = this.nextPiece;
    // 生成新的下一个砖块
    this.nextPiece = this.getRandomPiece();
    
    // 将当前砖块放置在顶部中央
    this.currentPieceX = Math.floor(this.cols / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
    this.currentPieceY = 0;
    
    // 检查游戏是否结束（新砖块无法放置）
    if (!this.isValidPosition(this.currentPiece.shape, this.currentPieceX, this.currentPieceY)) {
      // 游戏结束逻辑，这里简单处理，实际可以添加游戏结束界面
      console.log('Game Over');
      // 重置游戏
      this.initGameBoard();
      this.spawnNewPiece();
    }
  }

  /**
   * 获取随机砖块
   * @returns {Object} 随机砖块
   */
  getRandomPiece() {
    const keys = Object.keys(this.tetrominoes);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const tetromino = this.tetrominoes[randomKey];
    
    const piece = {
      shape: JSON.parse(JSON.stringify(tetromino.shape)),
      color: tetromino.color,
      specialAttribute: this.specialAttributes.NONE,
      specialCell: null // 存储特殊属性格子的相对位置 {row, col}
    };
    
    // 20%概率生成特殊属性
    if (Math.random() < 0.2) {
      // 只生成爆炸属性
      piece.specialAttribute = this.specialAttributes.EXPLOSIVE;
      
      // 收集所有非空格子的位置
      const nonEmptyCells = [];
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            nonEmptyCells.push({row, col});
          }
        }
      }
      
      // 随机选择一个非空格子作为特殊属性格子
      if (nonEmptyCells.length > 0) {
        piece.specialCell = nonEmptyCells[Math.floor(Math.random() * nonEmptyCells.length)];
      }
    }
    
    return piece;
  }

  /**
   * 检查位置是否有效
   * @param {Array} shape - 砖块形状
   * @param {number} x - X位置
   * @param {number} y - Y位置
   * @returns {boolean} 是否有效位置
   */
  isValidPosition(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          
          // 检查是否超出边界
          if (newX < 0 || newX >= this.cols || newY >= this.rows) {
            return false;
          }
          
          // 检查是否与已有砖块重叠（只检查y >= 0的情况）
          if (newY >= 0 && this.gameBoard[newX][newY].type !== this.cellTypes.EMPTY) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * 旋转砖块形状并计算特殊属性格子的新位置
   * @param {Array} shape - 砖块形状
   * @param {Object} specialCell - 特殊属性格子的相对位置 {row, col}
   * @returns {Object} 包含旋转后的形状和特殊属性格子新位置
   */
  rotateShape(shape, specialCell = null) {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = [];
    let rotatedSpecialCell = null;
    
    // 创建旋转后的矩阵
    for (let col = 0; col < cols; col++) {
      rotated[col] = [];
      for (let row = 0; row < rows; row++) {
        rotated[col][rows - 1 - row] = shape[row][col];
      }
    }
    
    // 计算旋转后的特殊属性格子位置
    if (specialCell) {
      const { row, col } = specialCell;
      // 顺时针旋转90度的位置转换公式
      rotatedSpecialCell = {
        row: col,
        col: rows - 1 - row
      };
    }
    
    return {
      shape: rotated,
      specialCell: rotatedSpecialCell
    };
  }

  /**
   * 移动砖块
   * @param {number} dx - X方向移动量
   * @param {number} dy - Y方向移动量
   * @returns {boolean} 是否移动成功
   */
  movePiece(dx, dy) {
    const newX = this.currentPieceX + dx;
    const newY = this.currentPieceY + dy;
    
    if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
      this.currentPieceX = newX;
      this.currentPieceY = newY;
      return true;
    }
    return false;
  }

  /**
   * 旋转砖块
   */
  rotatePiece() {
    const result = this.rotateShape(this.currentPiece.shape, this.currentPiece.specialCell);
    if (this.isValidPosition(result.shape, this.currentPieceX, this.currentPieceY)) {
      this.currentPiece.shape = result.shape;
      this.currentPiece.specialCell = result.specialCell;
    }
  }

  /**
   * 急速下降砖块
   */
  dropPiece() {
    while (this.movePiece(0, 1)) {
      // 持续下移直到碰撞
    }
    this.lockPiece();
  }

  /**
   * 锁定砖块到游戏板上
   */
  lockPiece() {
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const boardX = this.currentPieceX + col;
          const boardY = this.currentPieceY + row;
          if (boardX >= 0 && boardX < this.cols && boardY >= 0 && boardY < this.rows) {
            let cellType = this.cellTypes.NORMAL;
            
            // 检查当前格子是否是特殊属性格子
            if (this.currentPiece.specialAttribute !== this.specialAttributes.NONE && 
                this.currentPiece.specialCell && 
                this.currentPiece.specialCell.row === row && 
                this.currentPiece.specialCell.col === col) {
              // 根据特殊属性设置对应的格子类型
              if (this.currentPiece.specialAttribute === this.specialAttributes.EXPLOSIVE) {
                cellType = this.cellTypes.EXPLOSIVE;
              }
            }
            
            this.gameBoard[boardX][boardY].type = cellType;
          }
        }
      }
    }
    
    // 检查并消除完整的行
    this.clearLines();
    
    // 生成新砖块
    this.spawnNewPiece();
  }

  /**
   * 检查并消除完整的行
   */
  clearLines() {
    // 1. 标记需要消除的行
    const linesToClear = [];
    
    for (let row = this.rows - 1; row >= 0; row--) {
      let isFull = true;
      
      for (let col = 0; col < this.cols; col++) {
        const cellType = this.gameBoard[col][row].type;
        if (cellType === this.cellTypes.EMPTY) {
          isFull = false;
          break;
        }
      }
      
      if (isFull) {
        // 标记为需要消除
        linesToClear.push(row);
      }
    }
    
    // 如果没有需要消除的行，直接返回
    if (linesToClear.length === 0) {
      return;
    }
    
    // 2. 收集爆炸中心
    const explosionCenters = [];
    for (const row of linesToClear) {
      for (let col = 0; col < this.cols; col++) {
        if (this.gameBoard[col][row].type === this.cellTypes.EXPLOSIVE) {
          explosionCenters.push({ col, row });
        }
      }
    }
    
    // 3. 执行消除：整行 + 爆炸范围的合集
    // 先标记所有需要消除的格子
    const cellsToClear = new Set();
    
    // 标记整行的格子
    for (const row of linesToClear) {
      for (let col = 0; col < this.cols; col++) {
        cellsToClear.add(`${col},${row}`);
      }
    }
    
    // 标记爆炸范围的格子
    for (const center of explosionCenters) {
      const startCol = Math.max(0, center.col - 2);
      const endCol = Math.min(this.cols - 1, center.col + 2);
      const startRow = Math.max(0, center.row - 2);
      const endRow = Math.min(this.rows - 1, center.row + 2);
      
      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          cellsToClear.add(`${col},${row}`);
        }
      }
    }
    
    // 将所有需要消除的格子标记为EMPTY
    cellsToClear.forEach(cellStr => {
      const [col, row] = cellStr.split(',').map(Number);
      this.gameBoard[col][row].type = this.cellTypes.EMPTY;
    });
    
    // 4. 按列处理下落逻辑
    // 统计每列被消除的格子数
    const clearedCounts = new Array(this.cols).fill(0);
    
    // 从下往上遍历每列，统计被消除的格子数
    for (let col = 0; col < this.cols; col++) {
      let count = 0;
      for (let row = this.rows - 1; row >= 0; row--) {
        if (this.gameBoard[col][row].type === this.cellTypes.EMPTY) {
          count++;
        } else if (count > 0) {
          // 将当前格子下移count行
          this.gameBoard[col][row + count].type = this.gameBoard[col][row].type;
          this.gameBoard[col][row].type = this.cellTypes.EMPTY;
        }
      }
    }
    
    // 5. 检查是否有新的满行需要消除
    // 标记需要消除的行
    const newLinesToClear = [];
    
    for (let row = this.rows - 1; row >= 0; row--) {
      let isFull = true;
      
      for (let col = 0; col < this.cols; col++) {
        if (this.gameBoard[col][row].type === this.cellTypes.EMPTY) {
          isFull = false;
          break;
        }
      }
      
      if (isFull) {
        newLinesToClear.push(row);
      }
    }
    
    // 如果有新的满行需要消除，递归调用clearLines
    if (newLinesToClear.length > 0) {
      this.clearLines();
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
    
    // 调用当前状态的loop方法
    if (this.currentState) {
      const stateResult = this.currentState.loop();
      
      // 处理状态转换
      if (stateResult && stateResult.nextState) {
        this.setState(stateResult.nextState, stateResult.newData);
      }
    }
    
    // 绘制游戏元素
    this.drawGameArea();
    this.drawCurrentPiece();
    this.drawPreviewArea();
    this.drawButtons();
  }

  /**
   * 绘制游戏主区域
   */
  drawGameArea() {
    // 绘制游戏区域背景
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(this.gameAreaX, this.gameAreaY, this.gameAreaWidth, this.gameAreaHeight);
    
    // 绘制网格线
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 1;
    
    // 绘制垂直线
    for (let col = 0; col <= this.cols; col++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.gameAreaX + col * this.cellSize, this.gameAreaY);
      this.ctx.lineTo(this.gameAreaX + col * this.cellSize, this.gameAreaY + this.gameAreaHeight);
      this.ctx.stroke();
    }
    
    // 绘制水平线
    for (let row = 0; row <= this.rows; row++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.gameAreaX, this.gameAreaY + row * this.cellSize);
      this.ctx.lineTo(this.gameAreaX + this.gameAreaWidth, this.gameAreaY + row * this.cellSize);
      this.ctx.stroke();
    }
    
    // 绘制已锁定的砖块
    for (let col = 0; col < this.cols; col++) {
      for (let row = 0; row < this.rows; row++) {
        const cellType = this.gameData.gameBoard[col][row].type;
        if (cellType !== this.cellTypes.EMPTY) {
          // 绘制基本格子
          this.ctx.fillStyle = '#333333';
          this.ctx.fillRect(
            this.gameAreaX + col * this.cellSize + 1,
            this.gameAreaY + row * this.cellSize + 1,
            this.cellSize - 2,
            this.cellSize - 2
          );
          
          // 为特殊属性格子添加视觉效果
          if (cellType === this.cellTypes.EXPLOSIVE) {
            // 爆炸属性：红色边框
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(
              this.gameAreaX + col * this.cellSize + 2,
              this.gameAreaY + row * this.cellSize + 2,
              this.cellSize - 4,
              this.cellSize - 4
            );
          }
        }
      }
    }
    
    // 如果是消除状态，绘制消除动画
    if (this.currentState instanceof ClearingState) {
      this.currentState.drawAnimation(this.ctx, {
        x: this.gameAreaX,
        y: this.gameAreaY
      });
    }
  }

  /**
   * 绘制当前砖块
   */
  drawCurrentPiece() {
    const { currentPiece, currentPieceX, currentPieceY } = this.gameData;
    if (!currentPiece) return;
    
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          const drawX = this.gameAreaX + (currentPieceX + col) * this.cellSize + 1;
          const drawY = this.gameAreaY + (currentPieceY + row) * this.cellSize + 1;
          
          // 绘制基本砖块颜色
          this.ctx.fillStyle = currentPiece.color;
          this.ctx.fillRect(drawX, drawY, this.cellSize - 2, this.cellSize - 2);
          
          // 检查当前格子是否是特殊属性格子
          if (currentPiece.specialAttribute !== this.specialAttributes.NONE && 
              currentPiece.specialCell && 
              currentPiece.specialCell.row === row && 
              currentPiece.specialCell.col === col) {
            // 为特殊属性格子添加视觉效果
            if (currentPiece.specialAttribute === this.specialAttributes.EXPLOSIVE) {
              // 爆炸属性：红色边框
              this.ctx.strokeStyle = '#ff0000';
              this.ctx.lineWidth = 3;
              this.ctx.strokeRect(
                drawX + 1,
                drawY + 1,
                this.cellSize - 4,
                this.cellSize - 4
              );
            }
          }
        }
      }
    }
  }

  /**
   * 绘制预览区域
   */
  drawPreviewArea() {
    // 绘制预览区域背景
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(this.previewAreaX, this.previewAreaY, this.previewAreaWidth, this.previewAreaHeight);
    
    // 绘制预览区域边框
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.previewAreaX, this.previewAreaY, this.previewAreaWidth, this.previewAreaHeight);
    
    // 绘制预览文字
    this.ctx.fillStyle = '#333333';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('下一个', this.previewAreaX + this.previewAreaWidth / 2, this.previewAreaY - 20);
    
    // 绘制下一个砖块
    if (this.gameData.nextPiece) {
      const previewCellSize = 20;
      const shape = this.gameData.nextPiece.shape;
      const offsetX = (this.previewAreaWidth - shape[0].length * previewCellSize) / 2;
      const offsetY = (this.previewAreaHeight - shape.length * previewCellSize) / 2;
      
      this.ctx.fillStyle = this.gameData.nextPiece.color;
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            this.ctx.fillRect(
              this.previewAreaX + offsetX + col * previewCellSize,
              this.previewAreaY + offsetY + row * previewCellSize,
              previewCellSize - 2,
              previewCellSize - 2
            );
          }
        }
      }
    }
  }

  /**
   * 绘制按钮
   */
  drawButtons() {
    // 绘制控制按钮
    this.drawButton(this.leftButton);
    this.drawButton(this.rightButton);
    this.drawButton(this.rotateButton);
    this.drawButton(this.dropButton);
    
    // 绘制返回主菜单按钮
    this.drawButton(this.backButton);
  }

  /**
   * 绘制单个按钮
   * @param {Object} button - 按钮对象
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
    
    // 只有在下落状态下处理控制按钮输入
    if (this.currentState instanceof FallingState) {
      // 检测左移按钮点击
      if (x >= this.leftButton.x && x <= this.leftButton.x + this.leftButton.width &&
          y >= this.leftButton.y && y <= this.leftButton.y + this.leftButton.height) {
        this.currentState.movePiece(-1, 0);
        return;
      }
      
      // 检测右移按钮点击
      if (x >= this.rightButton.x && x <= this.rightButton.x + this.rightButton.width &&
          y >= this.rightButton.y && y <= this.rightButton.y + this.rightButton.height) {
        this.currentState.movePiece(1, 0);
        return;
      }
      
      // 检测旋转按钮点击
      if (x >= this.rotateButton.x && x <= this.rotateButton.x + this.rotateButton.width &&
          y >= this.rotateButton.y && y <= this.rotateButton.y + this.rotateButton.height) {
        this.currentState.rotatePiece();
        return;
      }
      
      // 检测急速下降按钮点击
      if (x >= this.dropButton.x && x <= this.dropButton.x + this.dropButton.width &&
          y >= this.dropButton.y && y <= this.dropButton.y + this.dropButton.height) {
        this.currentState.dropPiece();
        return;
      }
    }
  }

  /**
   * 游戏释放资源
   */
  release() {
    super.release();
    console.log('TetrisGame released');
  }
}
