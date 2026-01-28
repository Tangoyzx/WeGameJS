/**
 * AnimationSystem 动画系统
 * 负责更新实体的动画状态
 */
import System from '../core/System.js';
import Animation from '../components/Animation.js';
import Sprite from '../components/Sprite.js';

export default class AnimationSystem extends System {
  /**
   * 构造函数
   * @param {World} world - 所属世界
   */
  constructor(world) {
    super(world);
    this.setRequiredComponents([Animation]);
    this.setPriority(200); // 动画系统在物理系统之后，渲染系统之前执行
    
    // 动画状态
    this.globalAnimationSpeed = 1.0;
    this.enableAnimationBlending = true;
  }

  /**
   * 设置全局动画速度
   * @param {number} speed - 动画速度倍数
   * @returns {AnimationSystem} 返回自身，支持链式调用
   */
  setGlobalAnimationSpeed(speed) {
    this.globalAnimationSpeed = Math.max(0, speed);
    return this;
  }

  /**
   * 设置是否启用动画混合
   * @param {boolean} enable - 是否启用混合
   * @returns {AnimationSystem} 返回自身，支持链式调用
   */
  setAnimationBlendingEnabled(enable) {
    this.enableAnimationBlending = enable;
    return this;
  }

  /**
   * 系统初始化
   */
  init() {
    console.log('AnimationSystem initialized');
  }

  /**
   * 系统更新
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    if (!this.isEnabled()) return;

    const entities = this.getMatchingEntities();
    const effectiveDeltaTime = deltaTime * this.globalAnimationSpeed;
    
    // 更新所有实体的动画
    entities.forEach(entity => {
      this.updateEntityAnimation(entity, effectiveDeltaTime);
    });
  }

  /**
   * 更新实体动画
   * @param {Entity} entity - 要更新的实体
   * @param {number} deltaTime - 时间增量
   */
  updateEntityAnimation(entity, deltaTime) {
    const animation = entity.getComponent(Animation);
    const sprite = entity.getComponent(Sprite);
    
    if (!animation.isPlaying) return;
    
    // 更新动画状态
    animation.update(deltaTime);
    
    // 同步Sprite组件的裁剪区域
    if (sprite && animation.getCurrentFrame()) {
      const frame = animation.getCurrentFrame();
      sprite.setSourceRect(frame.x, frame.y, frame.width, frame.height);
    }
    
    // 处理动画事件
    this.handleAnimationEvents(entity, animation);
  }

  /**
   * 处理动画事件
   * @param {Entity} entity - 实体
   * @param {Animation} animation - 动画组件
   */
  handleAnimationEvents(entity, animation) {
    // 检查动画是否结束
    if (animation.isAnimationEnd() && animation.onAnimationEnd) {
      animation.onAnimationEnd(animation.currentAnimation);
    }
    
    // 检查是否需要播放队列中的下一个动画
    if (!animation.isPlaying && animation.animationQueue.length > 0) {
      const nextAnimation = animation.animationQueue.shift();
      animation.playAnimation(nextAnimation.name, true, nextAnimation.blendTime);
    }
  }

  /**
   * 播放实体动画
   * @param {Entity} entity - 实体
   * @param {string} animationName - 动画名称
   * @param {boolean} restart - 是否重新开始
   * @param {number} blendTime - 混合时间
   * @returns {boolean} 是否成功播放
   */
  playAnimation(entity, animationName, restart = true, blendTime = 0.2) {
    const animation = entity.getComponent(Animation);
    if (!animation) return false;
    
    return animation.playAnimation(animationName, restart, blendTime);
  }

  /**
   * 停止实体动画
   * @param {Entity} entity - 实体
   * @returns {boolean} 是否成功停止
   */
  stopAnimation(entity) {
    const animation = entity.getComponent(Animation);
    if (!animation) return false;
    
    animation.stopAnimation();
    return true;
  }

  /**
   * 暂停实体动画
   * @param {Entity} entity - 实体
   * @returns {boolean} 是否成功暂停
   */
  pauseAnimation(entity) {
    const animation = entity.getComponent(Animation);
    if (!animation) return false;
    
    animation.pauseAnimation();
    return true;
  }

  /**
   * 恢复实体动画
   * @param {Entity} entity - 实体
   * @returns {boolean} 是否成功恢复
   */
  resumeAnimation(entity) {
    const animation = entity.getComponent(Animation);
    if (!animation) return false;
    
    animation.resumeAnimation();
    return true;
  }

  /**
   * 设置实体动画帧
   * @param {Entity} entity - 实体
   * @param {number} frameIndex - 帧索引
   * @returns {boolean} 是否成功设置
   */
  setAnimationFrame(entity, frameIndex) {
    const animation = entity.getComponent(Animation);
    if (!animation) return false;
    
    animation.setFrame(frameIndex);
    return true;
  }

  /**
   * 获取实体动画进度
   * @param {Entity} entity - 实体
   * @returns {number|null} 动画进度（0-1），如果不存在则返回null
   */
  getAnimationProgress(entity) {
    const animation = entity.getComponent(Animation);
    return animation ? animation.getProgress() : null;
  }

  /**
   * 检查实体动画是否结束
   * @param {Entity} entity - 实体
   * @returns {boolean|null} 是否结束，如果不存在则返回null
   */
  isAnimationEnd(entity) {
    const animation = entity.getComponent(Animation);
    return animation ? animation.isAnimationEnd() : null;
  }

  /**
   * 队列实体动画
   * @param {Entity} entity - 实体
   * @param {string} animationName - 动画名称
   * @param {number} blendTime - 混合时间
   * @returns {boolean} 是否成功队列
   */
  queueAnimation(entity, animationName, blendTime = 0.2) {
    const animation = entity.getComponent(Animation);
    if (!animation) return false;
    
    animation.queueAnimation(animationName, blendTime);
    return true;
  }

  /**
   * 清空实体动画队列
   * @param {Entity} entity - 实体
   * @returns {boolean} 是否成功清空
   */
  clearAnimationQueue(entity) {
    const animation = entity.getComponent(Animation);
    if (!animation) return false;
    
    animation.clearQueue();
    return true;
  }

  /**
   * 系统销毁
   */
  destroy() {
    console.log('AnimationSystem destroyed');
  }

  /**
   * 实体添加时的回调
   * @param {Entity} entity - 添加的实体
   */
  onEntityAdded(entity) {
    console.log(`Entity ${entity.id} added to AnimationSystem`);
  }

  /**
   * 实体移除时的回调
   * @param {Entity} entity - 移除的实体
   */
  onEntityRemoved(entity) {
    console.log(`Entity ${entity.id} removed from AnimationSystem`);
  }
}