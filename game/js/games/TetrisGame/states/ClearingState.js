// 消除状态，继承自State
import State from '../State';

export default class ClearingState extends State {
  /**
   * 进入状态时调用
   */
  onEnter() {
    // 记录动画开始时间
    this.animationStartTime = Date.now();
    
    // 锁定砖块到游戏板
    this.lockPiece();
    
    // 检查需要消除的行
    this.linesToClear = this.findLinesToClear();
    
    // 收集爆炸中心
    this.explosionCenters = this.findExplosionCenters();
    
    // 标记需要消除的格子
    this.cellsToClear = this.findCellsToClear();
    
    // 检查是否有需要消除的格子
    this.hasLinesToClear = this.cellsToClear.size > 0;
  }
  
  /**
   * 每帧调用
   * @returns {Object|null} 状态转换信息
   */
  loop() {
    // 如果没有需要消除的行，直接切换到准备生成状态
    if (!this.hasLinesToClear) {
      return {
        nextState: 'ReadyToSpawnState',
        newData: { ...this.gameData }
      };
    }
    
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.animationStartTime;
    
    // 动画持续1秒
    if (elapsedTime >= 1000) {
      // 执行实际消除
      this.performClear();
      
      // 切换到准备生成状态
      return {
        nextState: 'ReadyToSpawnState',
        newData: { ...this.gameData }
      };
    }
    
    return null;
  }
  
  /**
   * 锁定砖块到游戏板
   */
  lockPiece() {
    const { currentPiece, currentPieceX, currentPieceY, gameBoard, cellTypes, specialAttributes } = this.gameData;
    
    for (let row = 0; row < currentPiece.shape.length; row++) {
      for (let col = 0; col < currentPiece.shape[row].length; col++) {
        if (currentPiece.shape[row][col]) {
          const boardX = currentPieceX + col;
          const boardY = currentPieceY + row;
          if (boardX >= 0 && boardX < this.gameData.cols && boardY >= 0 && boardY < this.gameData.rows) {
            let cellType = cellTypes.NORMAL;
            
            // 检查当前格子是否是特殊属性格子
            if (currentPiece.specialAttribute !== specialAttributes.NONE && 
                currentPiece.specialCell && 
                currentPiece.specialCell.row === row && 
                currentPiece.specialCell.col === col) {
              if (currentPiece.specialAttribute === specialAttributes.EXPLOSIVE) {
                cellType = cellTypes.EXPLOSIVE;
              }
            }
            
            gameBoard[boardX][boardY].type = cellType;
          }
        }
      }
    }
  }
  
  /**
   * 查找需要消除的行
   * @returns {Array} 需要消除的行索引数组
   */
  findLinesToClear() {
    const linesToClear = [];
    const { gameBoard, cols, rows, cellTypes } = this.gameData;
    
    for (let row = rows - 1; row >= 0; row--) {
      let isFull = true;
      
      for (let col = 0; col < cols; col++) {
        if (gameBoard[col][row].type === cellTypes.EMPTY) {
          isFull = false;
          break;
        }
      }
      
      if (isFull) {
        linesToClear.push(row);
      }
    }
    
    return linesToClear;
  }
  
  /**
   * 查找爆炸中心
   * @returns {Array} 爆炸中心数组
   */
  findExplosionCenters() {
    const explosionCenters = [];
    const { gameBoard, cellTypes } = this.gameData;
    
    for (const row of this.linesToClear) {
      for (let col = 0; col < this.gameData.cols; col++) {
        if (gameBoard[col][row].type === cellTypes.EXPLOSIVE) {
          explosionCenters.push({ col, row });
        }
      }
    }
    
    return explosionCenters;
  }
  
  /**
   * 查找需要消除的格子
   * @returns {Set} 需要消除的格子集合，格式: "col,row"
   */
  findCellsToClear() {
    const cellsToClear = new Set();
    const { cols, rows } = this.gameData;
    
    // 标记整行的格子
    for (const row of this.linesToClear) {
      for (let col = 0; col < cols; col++) {
        cellsToClear.add(`${col},${row}`);
      }
    }
    
    // 标记爆炸范围的格子
    for (const center of this.explosionCenters) {
      const startCol = Math.max(0, center.col - 2);
      const endCol = Math.min(cols - 1, center.col + 2);
      const startRow = Math.max(0, center.row - 2);
      const endRow = Math.min(rows - 1, center.row + 2);
      
      for (let col = startCol; col <= endCol; col++) {
        for (let row = startRow; row <= endRow; row++) {
          cellsToClear.add(`${col},${row}`);
        }
      }
    }
    
    return cellsToClear;
  }
  
  /**
   * 执行实际消除
   */
  performClear() {
    const { gameBoard, cols, rows, cellTypes } = this.gameData;
    
    // 将需要消除的格子标记为EMPTY
    this.cellsToClear.forEach(cellStr => {
      const [col, row] = cellStr.split(',').map(Number);
      gameBoard[col][row].type = cellTypes.EMPTY;
    });
    
    // 处理下落逻辑
    this.handleFalling();
    
    // 检查是否有新的满行需要消除
    const newLinesToClear = this.findLinesToClear();
    if (newLinesToClear.length > 0) {
      // 递归处理
      this.linesToClear = newLinesToClear;
      this.explosionCenters = this.findExplosionCenters();
      this.cellsToClear = this.findCellsToClear();
      this.performClear();
    }
  }
  
  /**
   * 处理消除后的下落逻辑
   */
  handleFalling() {
    const { gameBoard, cols, rows, cellTypes } = this.gameData;
    
    // 按列处理下落逻辑
    for (let col = 0; col < cols; col++) {
      let count = 0;
      for (let row = rows - 1; row >= 0; row--) {
        if (gameBoard[col][row].type === cellTypes.EMPTY) {
          count++;
        } else if (count > 0) {
          // 将当前格子下移count行
          gameBoard[col][row + count].type = gameBoard[col][row].type;
          gameBoard[col][row].type = cellTypes.EMPTY;
        }
      }
    }
  }
  
  /**
   * 绘制消除动画
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} gameArea - 游戏区域信息
   */
  drawAnimation(ctx, gameArea) {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.animationStartTime;
    
    // 闪烁效果：每100毫秒切换一次可见性
    const visible = Math.floor(elapsedTime / 100) % 2 === 0;
    
    if (visible) {
      // 绘制需要消除的格子（只绘制非空的格子）
      this.cellsToClear.forEach(cellStr => {
        const [col, row] = cellStr.split(',').map(Number);
        
        // 检查格子是否非空
        if (this.gameData.gameBoard[col][row].type !== this.gameData.cellTypes.EMPTY) {
          // 绘制闪烁效果
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(
            gameArea.x + col * this.gameData.cellSize + 1,
            gameArea.y + row * this.gameData.cellSize + 1,
            this.gameData.cellSize - 2,
            this.gameData.cellSize - 2
          );
        }
      });
    }
  }
}
