/**
 * InputSystem 输入系统
 * 负责处理用户输入事件
 */
import System from '../core/System.js';

export default class InputSystem extends System {
  /**
   * 构造函数
   * @param {World} world - 所属世界
   */
  constructor(world) {
    super(world);
    this.setRequiredComponents([]); // 输入系统不需要特定组件
    this.setPriority(10); // 输入系统优先级最高
    
    // 输入状态
    this.keys = new Map();
    this.mouse = {
      x: 0,
      y: 0,
      buttons: new Map(),
      wheel: 0
    };
    this.touches = new Map();
    
    // 事件监听器
    this.eventListeners = new Map();
    
    // 绑定事件处理器
    this.bindEvents();
  }

  /**
   * 绑定输入事件
   */
  bindEvents() {
    if (typeof window !== 'undefined') {
      // 键盘事件
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
      window.addEventListener('keyup', this.handleKeyUp.bind(this));
      
      // 鼠标事件
      window.addEventListener('mousemove', this.handleMouseMove.bind(this));
      window.addEventListener('mousedown', this.handleMouseDown.bind(this));
      window.addEventListener('mouseup', this.handleMouseUp.bind(this));
      window.addEventListener('wheel', this.handleWheel.bind(this));
      
      // 触摸事件
      window.addEventListener('touchstart', this.handleTouchStart.bind(this));
      window.addEventListener('touchmove', this.handleTouchMove.bind(this));
      window.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
  }

  /**
   * 键盘按下事件处理
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyDown(event) {
    this.keys.set(event.code, {
      pressed: true,
      timestamp: Date.now(),
      event: event
    });
    
    this.emit('keydown', event);
  }

  /**
   * 键盘释放事件处理
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyUp(event) {
    this.keys.set(event.code, {
      pressed: false,
      timestamp: Date.now(),
      event: event
    });
    
    this.emit('keyup', event);
  }

  /**
   * 鼠标移动事件处理
   * @param {MouseEvent} event - 鼠标事件
   */
  handleMouseMove(event) {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
    this.emit('mousemove', event);
  }

  /**
   * 鼠标按下事件处理
   * @param {MouseEvent} event - 鼠标事件
   */
  handleMouseDown(event) {
    this.mouse.buttons.set(event.button, {
      pressed: true,
      timestamp: Date.now(),
      event: event
    });
    this.emit('mousedown', event);
  }

  /**
   * 鼠标释放事件处理
   * @param {MouseEvent} event - 鼠标事件
   */
  handleMouseUp(event) {
    this.mouse.buttons.set(event.button, {
      pressed: false,
      timestamp: Date.now(),
      event: event
    });
    this.emit('mouseup', event);
  }

  /**
   * 鼠标滚轮事件处理
   * @param {WheelEvent} event - 滚轮事件
   */
  handleWheel(event) {
    this.mouse.wheel = event.deltaY;
    this.emit('wheel', event);
  }

  /**
   * 触摸开始事件处理
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchStart(event) {
    Array.from(event.changedTouches).forEach(touch => {
      this.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
        event: event
      });
    });
    this.emit('touchstart', event);
  }

  /**
   * 触摸移动事件处理
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchMove(event) {
    Array.from(event.changedTouches).forEach(touch => {
      const existingTouch = this.touches.get(touch.identifier);
      if (existingTouch) {
        existingTouch.x = touch.clientX;
        existingTouch.y = touch.clientY;
        existingTouch.timestamp = Date.now();
      }
    });
    this.emit('touchmove', event);
  }

  /**
   * 触摸结束事件处理
   * @param {TouchEvent} event - 触摸事件
   */
  handleTouchEnd(event) {
    Array.from(event.changedTouches).forEach(touch => {
      this.touches.delete(touch.identifier);
    });
    this.emit('touchend', event);
  }

  /**
   * 检查按键是否按下
   * @param {string} keyCode - 按键代码
   * @returns {boolean} 是否按下
   */
  isKeyPressed(keyCode) {
    const key = this.keys.get(keyCode);
    return key ? key.pressed : false;
  }

  /**
   * 检查按键是否刚刚按下
   * @param {string} keyCode - 按键代码
   * @param {number} threshold - 时间阈值（毫秒）
   * @returns {boolean} 是否刚刚按下
   */
  isKeyJustPressed(keyCode, threshold = 200) {
    const key = this.keys.get(keyCode);
    if (!key || !key.pressed) return false;
    
    return Date.now() - key.timestamp < threshold;
  }

  /**
   * 检查鼠标按钮是否按下
   * @param {number} button - 按钮编号（0=左键，1=中键，2=右键）
   * @returns {boolean} 是否按下
   */
  isMouseButtonPressed(button = 0) {
    const mouseButton = this.mouse.buttons.get(button);
    return mouseButton ? mouseButton.pressed : false;
  }

  /**
   * 获取鼠标位置
   * @returns {Object} 鼠标位置 {x, y}
   */
  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  /**
   * 获取触摸点
   * @returns {Array} 触摸点数组
   */
  getTouches() {
    return Array.from(this.touches.values());
  }

  /**
   * 添加事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   */
  on(eventName, listener) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(listener);
  }

  /**
   * 移除事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   */
  off(eventName, listener) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 事件数据
   */
  emit(eventName, data) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in input event listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * 系统更新
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    // 输入系统不需要每帧更新，事件驱动即可
  }

  /**
   * 系统销毁
   */
  destroy() {
    // 移除事件监听器
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mousedown', this.handleMouseDown);
      window.removeEventListener('mouseup', this.handleMouseUp);
      window.removeEventListener('wheel', this.handleWheel);
      window.removeEventListener('touchstart', this.handleTouchStart);
      window.removeEventListener('touchmove', this.handleTouchMove);
      window.removeEventListener('touchend', this.handleTouchEnd);
    }
    
    this.eventListeners.clear();
    console.log('InputSystem destroyed');
  }
}