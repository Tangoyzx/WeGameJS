/**
 * Animation 动画组件
 * 处理实体的动画播放和状态管理
 */
import Component from '../core/Component.js';

export default class Animation extends Component {
  /**
   * 构造函数
   * @param {Object} data - 初始化数据
   */
  constructor(data = {}) {
    super(data);
    
    // 动画状态
    this.currentAnimation = data.currentAnimation || null;
    this.currentFrame = data.currentFrame || 0;
    this.animationSpeed = data.animationSpeed || 1;
    this.isPlaying = data.isPlaying !== undefined ? data.isPlaying : true;
    this.loop = data.loop !== undefined ? data.loop : true;
    
    // 动画数据
    this.animations = data.animations || new Map();
    this.frameTime = data.frameTime || 0;
    this.totalTime = data.totalTime || 0;
    
    // 动画事件
    this.onAnimationEnd = data.onAnimationEnd || null;
    this.onFrameChange = data.onFrameChange || null;
    
    // 动画混合
    this.blendWeight = data.blendWeight || 1;
    this.blendTime = data.blendTime || 0;
    this.targetAnimation = data.targetAnimation || null;
    
    // 动画队列
    this.animationQueue = data.animationQueue || [];
  }

  /**
   * 添加动画
   * @param {string} name - 动画名称
   * @param {Object} animationData - 动画数据
   * @param {Array} animationData.frames - 动画帧数组
   * @param {number} animationData.frameRate - 帧率
   * @param {boolean} animationData.loop - 是否循环
   * @returns {Animation} 返回自身，支持链式调用
   */
  addAnimation(name, animationData) {
    this.animations.set(name, {
      frames: animationData.frames || [],
      frameRate: animationData.frameRate || 24,
      loop: animationData.loop !== undefined ? animationData.loop : true,
      frameDuration: 1.0 / (animationData.frameRate || 24)
    });
    return this;
  }

  /**
   * 播放动画
   * @param {string} name - 动画名称
   * @param {boolean} restart - 是否重新开始
   * @param {number} blendTime - 混合时间（秒）
   * @returns {Animation} 返回自身，支持链式调用
   */
  playAnimation(name, restart = true, blendTime = 0.2) {
    if (!this.animations.has(name)) {
      console.warn(`Animation '${name}' not found`);
      return this;
    }
    
    if (this.currentAnimation === name && !restart) {
      return this;
    }
    
    const animation = this.animations.get(name);
    
    if (blendTime > 0 && this.currentAnimation) {
      // 开始动画混合
      this.targetAnimation = name;
      this.blendTime = blendTime;
      this.blendWeight = 0;
    } else {
      // 直接切换动画
      this.currentAnimation = name;
      this.currentFrame = 0;
      this.frameTime = 0;
      this.totalTime = 0;
      this.blendWeight = 1;
      this.targetAnimation = null;
    }
    
    this.isPlaying = true;
    return this;
  }

  /**
   * 停止动画
   * @returns {Animation} 返回自身，支持链式调用
   */
  stopAnimation() {
    this.isPlaying = false;
    return this;
  }

  /**
   * 暂停动画
   * @returns {Animation} 返回自身，支持链式调用
   */
  pauseAnimation() {
    this.isPlaying = false;
    return this;
  }

  /**
   * 恢复动画
   * @returns {Animation} 返回自身，支持链式调用
   */
  resumeAnimation() {
    this.isPlaying = true;
    return this;
  }

  /**
   * 设置动画帧
   * @param {number} frameIndex - 帧索引
   * @returns {Animation} 返回自身，支持链式调用
   */
  setFrame(frameIndex) {
    if (this.currentAnimation) {
      const animation = this.animations.get(this.currentAnimation);
      if (animation && animation.frames.length > 0) {
        this.currentFrame = Math.max(0, Math.min(frameIndex, animation.frames.length - 1));
        this.frameTime = this.currentFrame * animation.frameDuration;
      }
    }
    return this;
  }

  /**
   * 设置动画速度
   * @param {number} speed - 动画速度倍数
   * @returns {Animation} 返回自身，支持链式调用
   */
  setAnimationSpeed(speed) {
    this.animationSpeed = Math.max(0, speed);
    return this;
  }

  /**
   * 设置循环模式
   * @param {boolean} loop - 是否循环
   * @returns {Animation} 返回自身，支持链式调用
   */
  setLoop(loop) {
    this.loop = loop;
    return this;
  }

  /**
   * 获取当前动画帧数据
   * @returns {Object|null} 当前帧数据
   */
  getCurrentFrame() {
    if (!this.currentAnimation) return null;
    
    const animation = this.animations.get(this.currentAnimation);
    if (!animation || animation.frames.length === 0) return null;
    
    return animation.frames[this.currentFrame];
  }

  /**
   * 获取动画总帧数
   * @returns {number} 总帧数
   */
  getTotalFrames() {
    if (!this.currentAnimation) return 0;
    
    const animation = this.animations.get(this.currentAnimation);
    return animation ? animation.frames.length : 0;
  }

  /**
   * 获取动画总时长
   * @returns {number} 总时长（秒）
   */
  getDuration() {
    if (!this.currentAnimation) return 0;
    
    const animation = this.animations.get(this.currentAnimation);
    return animation ? animation.frames.length * animation.frameDuration : 0;
  }

  /**
   * 获取当前动画进度
   * @returns {number} 进度（0-1）
   */
  getProgress() {
    const duration = this.getDuration();
    return duration > 0 ? this.totalTime / duration : 0;
  }

  /**
   * 检查动画是否结束
   * @returns {boolean} 是否结束
   */
  isAnimationEnd() {
    if (!this.currentAnimation) return true;
    
    const animation = this.animations.get(this.currentAnimation);
    if (!animation) return true;
    
    return !animation.loop && this.currentFrame >= animation.frames.length - 1;
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    if (!this.isPlaying || !this.currentAnimation) return;
    
    const animation = this.animations.get(this.currentAnimation);
    if (!animation || animation.frames.length === 0) return;
    
    // 处理动画混合
    if (this.targetAnimation && this.blendTime > 0) {
      this.blendWeight += deltaTime / this.blendTime;
      
      if (this.blendWeight >= 1) {
        // 混合完成，切换到目标动画
        this.currentAnimation = this.targetAnimation;
        this.currentFrame = 0;
        this.frameTime = 0;
        this.totalTime = 0;
        this.blendWeight = 1;
        this.targetAnimation = null;
        this.blendTime = 0;
      }
    }
    
    // 更新动画时间
    const effectiveDeltaTime = deltaTime * this.animationSpeed;
    this.frameTime += effectiveDeltaTime;
    this.totalTime += effectiveDeltaTime;
    
    // 计算当前帧
    const frameDuration = animation.frameDuration;
    const totalFrames = animation.frames.length;
    
    let newFrame = Math.floor(this.frameTime / frameDuration);
    
    if (newFrame >= totalFrames) {
      if (animation.loop) {
        // 循环播放
        newFrame %= totalFrames;
        this.frameTime %= (totalFrames * frameDuration);
      } else {
        // 播放到最后一帧
        newFrame = totalFrames - 1;
        this.isPlaying = false;
        
        // 触发动画结束事件
        if (this.onAnimationEnd) {
          this.onAnimationEnd(this.currentAnimation);
        }
      }
    }
    
    // 检查帧变化
    if (newFrame !== this.currentFrame) {
      const oldFrame = this.currentFrame;
      this.currentFrame = newFrame;
      
      // 触发帧变化事件
      if (this.onFrameChange) {
        this.onFrameChange(this.currentAnimation, oldFrame, newFrame);
      }
    }
    
    // 处理动画队列
    if (!this.isPlaying && this.animationQueue.length > 0) {
      const nextAnimation = this.animationQueue.shift();
      this.playAnimation(nextAnimation.name, true, nextAnimation.blendTime);
    }
  }

  /**
   * 队列动画
   * @param {string} name - 动画名称
   * @param {number} blendTime - 混合时间（秒）
   * @returns {Animation} 返回自身，支持链式调用
   */
  queueAnimation(name, blendTime = 0.2) {
    this.animationQueue.push({ name, blendTime });
    return this;
  }

  /**
   * 清空动画队列
   * @returns {Animation} 返回自身，支持链式调用
   */
  clearQueue() {
    this.animationQueue = [];
    return this;
  }

  /**
   * 设置动画结束回调
   * @param {Function} callback - 回调函数
   * @returns {Animation} 返回自身，支持链式调用
   */
  setAnimationEndCallback(callback) {
    this.onAnimationEnd = callback;
    return this;
  }

  /**
   * 设置帧变化回调
   * @param {Function} callback - 回调函数
   * @returns {Animation} 返回自身，支持链式调用
   */
  setFrameChangeCallback(callback) {
    this.onFrameChange = callback;
    return this;
  }

  /**
   * 获取动画数据
   * @param {string} name - 动画名称
   * @returns {Object|null} 动画数据
   */
  getAnimationData(name) {
    return this.animations.get(name) || null;
  }

  /**
   * 检查动画是否存在
   * @param {string} name - 动画名称
   * @returns {boolean} 是否存在
   */
  hasAnimation(name) {
    return this.animations.has(name);
  }

  /**
   * 获取所有动画名称
   * @returns {Array<string>} 动画名称数组
   */
  getAnimationNames() {
    return Array.from(this.animations.keys());
  }

  /**
   * 转换为字符串表示
   * @returns {string} 动画组件描述
   */
  toString() {
    const totalFrames = this.getTotalFrames();
    const progress = this.getProgress();
    return `Animation(${this.currentAnimation || 'none'}, frame: ${this.currentFrame}/${totalFrames}, progress: ${(progress * 100).toFixed(1)}%)`;
  }
}