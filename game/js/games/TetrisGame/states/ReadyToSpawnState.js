// 准备生成状态，继承自State
import State from '../State';

export default class ReadyToSpawnState extends State {
  /**
   * 进入状态时调用
   */
  onEnter() {
    // 生成新砖块
    this.spawnNewPiece();
  }
  
  /**
   * 每帧调用
   * @returns {Object|null} 状态转换信息
   */
  loop() {
    // 检查游戏是否结束
    if (!this.isValidPosition(this.gameData.currentPiece.shape, this.gameData.currentPieceX, this.gameData.currentPieceY)) {
      // 游戏结束逻辑，这里简单处理，实际可以添加游戏结束界面
      console.log('Game Over');
      // 重置游戏
      this.initGameBoard();
      this.spawnNewPiece();
    }
    
    // 切换到下落状态
    return {
      nextState: 'FallingState',
      newData: { ...this.gameData }
    };
  }
  
  /**
   * 生成新的砖块
   */
  spawnNewPiece() {
    // 如果没有下一个砖块，先生成一个
    if (!this.gameData.nextPiece) {
      this.gameData.nextPiece = this.getRandomPiece();
    }
    
    // 设置当前砖块为下一个砖块
    this.gameData.currentPiece = this.gameData.nextPiece;
    // 生成新的下一个砖块
    this.gameData.nextPiece = this.getRandomPiece();
    
    // 将当前砖块放置在顶部中央
    this.gameData.currentPieceX = Math.floor(this.gameData.cols / 2) - Math.floor(this.gameData.currentPiece.shape[0].length / 2);
    this.gameData.currentPieceY = 0;
    
    // 重置下落时间
    this.gameData.lastDropTime = Date.now();
  }
  
  /**
   * 获取随机砖块
   * @returns {Object} 随机砖块
   */
  getRandomPiece() {
    const keys = Object.keys(this.gameData.tetrominoes);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const tetromino = this.gameData.tetrominoes[randomKey];
    
    const piece = {
      shape: JSON.parse(JSON.stringify(tetromino.shape)),
      color: tetromino.color,
      specialAttribute: this.gameData.specialAttributes.NONE,
      specialCell: null // 存储特殊属性格子的相对位置 {row, col}
    };
    
    // 20%概率生成特殊属性
    if (Math.random() < 0.2) {
      // 只生成爆炸属性
      piece.specialAttribute = this.gameData.specialAttributes.EXPLOSIVE;
      
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
          if (newX < 0 || newX >= this.gameData.cols || newY >= this.gameData.rows) {
            return false;
          }
          
          // 检查是否与已有砖块重叠（只检查y >= 0的情况）
          if (newY >= 0 && this.gameData.gameBoard[newX][newY].type !== this.gameData.cellTypes.EMPTY) {
            return false;
          }
        }
      }
    }
    return true;
  }
  
  /**
   * 初始化游戏主界面
   */
  initGameBoard() {
    this.gameData.gameBoard = [];
    for (let col = 0; col < this.gameData.cols; col++) {
      this.gameData.gameBoard[col] = [];
      for (let row = 0; row < this.gameData.rows; row++) {
        this.gameData.gameBoard[col][row] = {
          type: this.gameData.cellTypes.EMPTY
        };
      }
    }
  }
}
