/**
 * EventEmitter 事件发射器类
 * 提供事件订阅和发布功能
 */
export default class EventEmitter {
  /**
   * 构造函数
   */
  constructor() {
    this._events = new Map();
    this._maxListeners = 10;
    this._onceListeners = new Map();
  }

  /**
   * 设置最大监听器数量
   * @param {number} n - 最大监听器数量
   * @returns {EventEmitter} 返回自身，支持链式调用
   */
  setMaxListeners(n) {
    this._maxListeners = n;
    return this;
  }

  /**
   * 获取最大监听器数量
   * @returns {number} 最大监听器数量
   */
  getMaxListeners() {
    return this._maxListeners;
  }

  /**
   * 添加事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   * @param {Object} options - 选项
   * @param {boolean} options.once - 是否只监听一次
   * @param {number} options.priority - 优先级（数字越大优先级越高）
   * @returns {EventEmitter} 返回自身，支持链式调用
   */
  on(eventName, listener, options = {}) {
    if (typeof listener !== 'function') {
      throw new TypeError('Listener must be a function');
    }

    if (!this._events.has(eventName)) {
      this._events.set(eventName, []);
    }

    const listeners = this._events.get(eventName);
    
    // 检查监听器是否已存在
    const existingIndex = listeners.findIndex(item => item.listener === listener);
    if (existingIndex !== -1) {
      console.warn(`Listener already exists for event '${eventName}'`);
      return this;
    }

    // 检查监听器数量限制
    if (listeners.length >= this._maxListeners) {
      console.warn(`Maximum listeners (${this._maxListeners}) reached for event '${eventName}'`);
    }

    const listenerInfo = {
      listener: listener,
      once: options.once || false,
      priority: options.priority || 0,
      context: options.context || null
    };

    listeners.push(listenerInfo);
    
    // 按优先级排序
    listeners.sort((a, b) => b.priority - a.priority);

    return this;
  }

  /**
   * 添加一次性事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   * @param {Object} options - 选项
   * @returns {EventEmitter} 返回自身，支持链式调用
   */
  once(eventName, listener, options = {}) {
    return this.on(eventName, listener, { ...options, once: true });
  }

  /**
   * 移除事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   * @returns {EventEmitter} 返回自身，支持链式调用
   */
  off(eventName, listener) {
    if (!this._events.has(eventName)) {
      return this;
    }

    const listeners = this._events.get(eventName);
    const index = listeners.findIndex(item => item.listener === listener);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      
      if (listeners.length === 0) {
        this._events.delete(eventName);
      }
    }

    return this;
  }

  /**
   * 移除所有事件监听器
   * @param {string} eventName - 事件名称（可选，如果未指定则移除所有事件）
   * @returns {EventEmitter} 返回自身，支持链式调用
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this._events.delete(eventName);
    } else {
      this._events.clear();
    }
    
    return this;
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {...*} args - 事件参数
   * @returns {boolean} 是否有监听器处理了事件
   */
  emit(eventName, ...args) {
    if (!this._events.has(eventName)) {
      return false;
    }

    const listeners = this._events.get(eventName).slice(); // 创建副本
    const onceListeners = [];

    let handled = false;

    for (const listenerInfo of listeners) {
      try {
        const result = listenerInfo.listener.apply(listenerInfo.context || this, args);
        
        if (result === false) {
          // 如果监听器返回false，停止事件传播
          break;
        }
        
        handled = true;
        
        // 标记一次性监听器
        if (listenerInfo.once) {
          onceListeners.push(listenerInfo.listener);
        }
      } catch (error) {
        console.error(`Error in event listener for '${eventName}':`, error);
      }
    }

    // 移除一次性监听器
    for (const listener of onceListeners) {
      this.off(eventName, listener);
    }

    return handled;
  }

  /**
   * 获取事件监听器数量
   * @param {string} eventName - 事件名称
   * @returns {number} 监听器数量
   */
  listenerCount(eventName) {
    if (!this._events.has(eventName)) {
      return 0;
    }
    
    return this._events.get(eventName).length;
  }

  /**
   * 获取所有事件名称
   * @returns {Array} 事件名称数组
   */
  eventNames() {
    return Array.from(this._events.keys());
  }

  /**
   * 获取事件的所有监听器
   * @param {string} eventName - 事件名称
   * @returns {Array} 监听器数组
   */
  listeners(eventName) {
    if (!this._events.has(eventName)) {
      return [];
    }
    
    return this._events.get(eventName).map(info => info.listener);
  }

  /**
   * 添加事件监听器（on的别名）
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   * @param {Object} options - 选项
   * @returns {EventEmitter} 返回自身，支持链式调用
   */
  addListener(eventName, listener, options = {}) {
    return this.on(eventName, listener, options);
  }

  /**
   * 移除事件监听器（off的别名）
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   * @returns {EventEmitter} 返回自身，支持链式调用
   */
  removeListener(eventName, listener) {
    return this.off(eventName, listener);
  }

  /**
   * 前置添加事件监听器（高优先级）
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   * @param {Object} options - 选项
   * @returns {EventEmitter} 返回自身，支持链式调用
   */
  prependListener(eventName, listener, options = {}) {
    return this.on(eventName, listener, { ...options, priority: 100 });
  }

  /**
   * 前置添加一次性事件监听器（高优先级）
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   * @param {Object} options - 选项
   * @returns {EventEmitter} 返回自身，支持链式调用
   */
  prependOnceListener(eventName, listener, options = {}) {
    return this.once(eventName, listener, { ...options, priority: 100 });
  }

  /**
   * 检查是否有监听器
   * @param {string} eventName - 事件名称
   * @returns {boolean} 是否有监听器
   */
  hasListeners(eventName) {
    return this._events.has(eventName) && this._events.get(eventName).length > 0;
  }

  /**
   * 等待事件（Promise版本）
   * @param {string} eventName - 事件名称
   * @param {Object} options - 选项
   * @param {number} options.timeout - 超时时间（毫秒）
   * @returns {Promise} 返回Promise，resolve时传递事件参数
   */
  waitFor(eventName, options = {}) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      
      const listener = (...args) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        this.off(eventName, listener);
        resolve(args.length === 1 ? args[0] : args);
      };
      
      this.once(eventName, listener);
      
      if (options.timeout) {
        timeoutId = setTimeout(() => {
          this.off(eventName, listener);
          reject(new Error(`Event '${eventName}' timeout after ${options.timeout}ms`));
        }, options.timeout);
      }
    });
  }

  /**
   * 创建事件发射器的子类
   * @param {Object} methods - 要添加的方法
   * @returns {Class} 子类
   */
  static extend(methods = {}) {
    class ExtendedEventEmitter extends EventEmitter {
      constructor() {
        super();
        
        // 添加自定义方法
        Object.keys(methods).forEach(key => {
          this[key] = methods[key].bind(this);
        });
      }
    }
    
    return ExtendedEventEmitter;
  }

  /**
   * 销毁事件发射器
   */
  destroy() {
    this._events.clear();
    this._onceListeners.clear();
  }

  /**
   * 创建新的事件发射器实例
   * @returns {EventEmitter} 新实例
   */
  static create() {
    return new EventEmitter();
  }

  /**
   * 混合事件发射器功能到目标对象
   * @param {Object} target - 目标对象
   * @returns {Object} 增强后的目标对象
   */
  static mixin(target) {
    const emitter = new EventEmitter();
    
    const methods = [
      'on', 'once', 'off', 'emit', 'removeAllListeners',
      'listenerCount', 'eventNames', 'listeners',
      'addListener', 'removeListener', 'prependListener',
      'prependOnceListener', 'hasListeners', 'waitFor'
    ];
    
    methods.forEach(method => {
      target[method] = emitter[method].bind(emitter);
    });
    
    // 保存emitter引用以便后续访问
    target._eventEmitter = emitter;
    
    return target;
  }
}