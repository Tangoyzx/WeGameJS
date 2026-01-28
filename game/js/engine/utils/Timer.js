/**
 * Timer 定时器类
 * 提供定时和延时功能
 */
export default class Timer {
  /**
   * 构造函数
   * @param {number} interval - 定时器间隔（毫秒）
   * @param {Function} callback - 回调函数
   * @param {Object} options - 配置选项
   */
  constructor(interval, callback, options = {}) {
    this.interval = interval;
    this.callback = callback;
    this.options = {
      autoStart: options.autoStart !== undefined ? options.autoStart : false,
      repeat: options.repeat !== undefined ? options.repeat : false,
      maxRepeats: options.maxRepeats !== undefined ? options.maxRepeats : -1,
      ...options
    };
    
    this.id = null;
    this.isRunning = false;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.repeatCount = 0;
    this.paused = false;
    this.pauseTime = 0;
    
    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * 启动定时器
   * @returns {Timer} 返回自身，支持链式调用
   */
  start() {
    if (this.isRunning) return this;
    
    this.isRunning = true;
    this.paused = false;
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.repeatCount = 0;
    
    if (this.options.repeat) {
      this.id = setInterval(() => {
        this.tick();
      }, this.interval);
    } else {
      this.id = setTimeout(() => {
        this.tick();
        this.stop();
      }, this.interval);
    }
    
    return this;
  }

  /**
   * 停止定时器
   * @returns {Timer} 返回自身，支持链式调用
   */
  stop() {
    if (!this.isRunning) return this;
    
    this.isRunning = false;
    this.paused = false;
    
    if (this.id) {
      if (this.options.repeat) {
        clearInterval(this.id);
      } else {
        clearTimeout(this.id);
      }
      this.id = null;
    }
    
    return this;
  }

  /**
   * 暂停定时器
   * @returns {Timer} 返回自身，支持链式调用
   */
  pause() {
    if (!this.isRunning || this.paused) return this;
    
    this.paused = true;
    this.pauseTime = Date.now();
    
    if (this.id) {
      if (this.options.repeat) {
        clearInterval(this.id);
      } else {
        clearTimeout(this.id);
      }
      this.id = null;
    }
    
    return this;
  }

  /**
   * 恢复定时器
   * @returns {Timer} 返回自身，支持链式调用
   */
  resume() {
    if (!this.isRunning || !this.paused) return this;
    
    this.paused = false;
    const pauseDuration = Date.now() - this.pauseTime;
    this.startTime += pauseDuration;
    
    if (this.options.repeat) {
      this.id = setInterval(() => {
        this.tick();
      }, this.interval);
    } else {
      const remainingTime = this.interval - this.elapsedTime;
      this.id = setTimeout(() => {
        this.tick();
        this.stop();
      }, remainingTime);
    }
    
    return this;
  }

  /**
   * 重置定时器
   * @returns {Timer} 返回自身，支持链式调用
   */
  reset() {
    this.stop();
    this.start();
    return this;
  }

  /**
   * 定时器触发
   */
  tick() {
    if (!this.isRunning) return;
    
    this.elapsedTime = Date.now() - this.startTime;
    this.repeatCount++;
    
    // 检查最大重复次数限制
    if (this.options.maxRepeats > 0 && this.repeatCount >= this.options.maxRepeats) {
      this.stop();
    }
    
    // 执行回调
    if (this.callback) {
      try {
        this.callback(this);
      } catch (error) {
        console.error('Timer callback error:', error);
      }
    }
  }

  /**
   * 获取已运行时间
   * @returns {number} 已运行时间（毫秒）
   */
  getElapsedTime() {
    if (!this.isRunning) return this.elapsedTime;
    
    if (this.paused) {
      return this.pauseTime - this.startTime;
    }
    
    return Date.now() - this.startTime;
  }

  /**
   * 获取剩余时间
   * @returns {number} 剩余时间（毫秒）
   */
  getRemainingTime() {
    if (!this.isRunning) return 0;
    
    const elapsed = this.getElapsedTime();
    return Math.max(0, this.interval - elapsed);
  }

  /**
   * 获取进度百分比
   * @returns {number} 进度（0-1）
   */
  getProgress() {
    if (!this.isRunning) return 1;
    
    const elapsed = this.getElapsedTime();
    return Math.min(1, elapsed / this.interval);
  }

  /**
   * 获取重复次数
   * @returns {number} 重复次数
   */
  getRepeatCount() {
    return this.repeatCount;
  }

  /**
   * 检查定时器是否正在运行
   * @returns {boolean} 是否正在运行
   */
  isActive() {
    return this.isRunning;
  }

  /**
   * 检查定时器是否已暂停
   * @returns {boolean} 是否已暂停
   */
  isPaused() {
    return this.paused;
  }

  /**
   * 设置定时器间隔
   * @param {number} interval - 新的间隔时间（毫秒）
   * @returns {Timer} 返回自身，支持链式调用
   */
  setInterval(interval) {
    const wasRunning = this.isRunning;
    const wasPaused = this.paused;
    
    if (wasRunning) {
      this.stop();
    }
    
    this.interval = interval;
    
    if (wasRunning) {
      if (wasPaused) {
        this.start();
        this.pause();
      } else {
        this.start();
      }
    }
    
    return this;
  }

  /**
   * 设置回调函数
   * @param {Function} callback - 新的回调函数
   * @returns {Timer} 返回自身，支持链式调用
   */
  setCallback(callback) {
    this.callback = callback;
    return this;
  }

  /**
   * 静态方法：创建一次性定时器
   * @param {number} delay - 延迟时间（毫秒）
   * @param {Function} callback - 回调函数
   * @returns {Timer} 定时器实例
   */
  static once(delay, callback) {
    return new Timer(delay, callback, { repeat: false });
  }

  /**
   * 静态方法：创建重复定时器
   * @param {number} interval - 间隔时间（毫秒）
   * @param {Function} callback - 回调函数
   * @param {number} maxRepeats - 最大重复次数（-1表示无限）
   * @returns {Timer} 定时器实例
   */
  static repeat(interval, callback, maxRepeats = -1) {
    return new Timer(interval, callback, { 
      repeat: true, 
      maxRepeats: maxRepeats 
    });
  }

  /**
   * 静态方法：延迟执行
   * @param {number} delay - 延迟时间（毫秒）
   * @param {Function} callback - 回调函数
   * @returns {Timer} 定时器实例
   */
  static delay(delay, callback) {
    const timer = new Timer(delay, callback, { 
      autoStart: true, 
      repeat: false 
    });
    return timer;
  }

  /**
   * 静态方法：创建帧定时器（基于requestAnimationFrame）
   * @param {Function} callback - 每帧回调函数
   * @param {Object} options - 配置选项
   * @returns {FrameTimer} 帧定时器实例
   */
  static frame(callback, options = {}) {
    return new FrameTimer(callback, options);
  }

  /**
   * 销毁定时器
   */
  destroy() {
    this.stop();
    this.callback = null;
  }
}

/**
 * FrameTimer 帧定时器类
 * 基于requestAnimationFrame的定时器
 */
class FrameTimer {
  /**
   * 构造函数
   * @param {Function} callback - 每帧回调函数
   * @param {Object} options - 配置选项
   */
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = {
      autoStart: options.autoStart !== undefined ? options.autoStart : true,
      targetFPS: options.targetFPS !== undefined ? options.targetFPS : 60,
      ...options
    };
    
    this.isRunning = false;
    this.animationId = null;
    this.lastTime = 0;
    this.frameCount = 0;
    this.deltaTime = 0;
    this.fps = 0;
    
    if (this.options.autoStart) {
      this.start();
    }
  }

  /**
   * 启动帧定时器
   * @returns {FrameTimer} 返回自身，支持链式调用
   */
  start() {
    if (this.isRunning) return this;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.loop.bind(this));
    
    return this;
  }

  /**
   * 停止帧定时器
   * @returns {FrameTimer} 返回自身，支持链式调用
   */
  stop() {
    if (!this.isRunning) return this;
    
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    return this;
  }

  /**
   * 帧循环
   * @param {number} currentTime - 当前时间
   */
  loop(currentTime) {
    if (!this.isRunning) return;
    
    this.deltaTime = (currentTime - this.lastTime) / 1000; // 转换为秒
    this.lastTime = currentTime;
    
    // 计算FPS
    this.frameCount++;
    if (this.frameCount % 10 === 0) {
      this.fps = 1 / this.deltaTime;
    }
    
    // 执行回调
    if (this.callback) {
      try {
        this.callback(this.deltaTime, this.fps);
      } catch (error) {
        console.error('FrameTimer callback error:', error);
      }
    }
    
    // 继续下一帧
    this.animationId = requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * 获取帧率
   * @returns {number} 当前帧率
   */
  getFPS() {
    return this.fps;
  }

  /**
   * 获取帧时间增量
   * @returns {number} 帧时间增量（秒）
   */
  getDeltaTime() {
    return this.deltaTime;
  }

  /**
   * 获取帧计数
   * @returns {number} 帧计数
   */
  getFrameCount() {
    return this.frameCount;
  }

  /**
   * 销毁帧定时器
   */
  destroy() {
    this.stop();
    this.callback = null;
  }
}