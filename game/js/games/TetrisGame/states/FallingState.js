// 下落状态，继承自State
import State from '../State';

export default class FallingState extends State {
  /**
   * 进入状态时调用
   */
  onEnter() {
    // 重置下落时间
    if (!this.gameData.lastDropTime) {
      this.gameData.lastDropTime = Date.now();
    }
  }
  
  /**
   * 每帧调用
   * @returns {Object|null} 状态转换信息
   */
  loop() {
    const currentTime = Date.now();
    
    // 处理砖块自动下落
    if (currentTime - this.gameData.lastDropTime >= this.gameData.gameSpeed) {
      if (!this.movePiece(0, 1)) {
        // 砖块无法下落，需要锁定并检查消除
        return {
          nextState: 'ClearingState',
          newData: { ...this.gameData }
        };
      }
      this.gameData.lastDropTime = currentTime;
    }
    
    return null;
  }
  
  /**
   * 移动砖块
   * @param {number} dx - X方向移动量
   * @param {number} dy - Y方向移动量
   * @returns {boolean} 是否移动成功
   */
  movePiece(dx, dy) {
    const newX = this.gameData.currentPieceX + dx;
    const newY = this.gameData.currentPieceY + dy;
    
    if (this.isValidPosition(this.gameData.currentPiece.shape, newX, newY)) {
      this.gameData.currentPieceX = newX;
      this.gameData.currentPieceY = newY;
      return true;
    }
    return false;
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
   * 旋转砖块
   * @returns {boolean} 是否旋转成功
   */
  rotatePiece() {
    const { shape, specialCell } = this.rotateShape(this.gameData.currentPiece.shape, this.gameData.currentPiece.specialCell);
    
    if (this.isValidPosition(shape, this.gameData.currentPieceX, this.gameData.currentPieceY)) {
      this.gameData.currentPiece.shape = shape;
      this.gameData.currentPiece.specialCell = specialCell;
      return true;
    }
    return false;
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
   * 急速下降砖块
   */
  dropPiece() {
    while (this.movePiece(0, 1)) {
      // 持续下移直到碰撞
    }
  }
}
