// 状态基类
export default class State {
  /**
   * 构造函数
   * @param {Object} gameData - 游戏数据对象
   */
  constructor(gameData) {
    this.gameData = gameData;
  }
  
  /**
   * 进入状态时调用
   */
  onEnter() {
    // 子类实现
  }
  
  /**
   * 每帧调用
   * @returns {Object|null} 状态转换信息，格式: { nextState: 'StateName', newData: {...} }
   */
  loop() {
    // 子类实现
    return null;
  }
  
  /**
   * 离开状态时调用
   */
  onLeave() {
    // 子类实现
  }
}
