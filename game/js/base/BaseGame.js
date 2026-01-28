// 游戏基类，所有游戏都继承自这个类
export default class BaseGame {
  /**
   * 构造函数
   * @param {Canvas} canvas - Canvas对象
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {function} returnCallback - 返回主菜单的回调函数
   */
  constructor(canvas, ctx, returnCallback) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.isRunning = false;
    this.returnCallback = returnCallback; // 返回主菜单的回调函数
  }

  /**
   * 获取游戏配置信息（静态方法，子类可以重写）
   * @returns {Object} 游戏配置信息
   */
  static getConfig() {
    return {
      name: '默认游戏',
      previewImage: 'images/default.png'
    };
  }

  /**
   * 游戏初始化
   */
  init() {
    this.isRunning = true;
  }

  /**
   * 游戏每帧逻辑，子类必须重写
   */
  loop() {
    // 子类实现具体游戏逻辑
  }

  /**
   * 处理触摸事件，子类可以重写
   * @param {number} x - 点击x坐标
   * @param {number} y - 点击y坐标
   */
  handleTouch(x, y) {
    // 子类实现具体触摸事件处理
  }

  /**
   * 游戏释放资源，回到主界面时调用
   */
  release() {
    this.isRunning = false;
  }
}