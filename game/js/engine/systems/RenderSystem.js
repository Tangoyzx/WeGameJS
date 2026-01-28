/**
 * RenderSystem 渲染系统
 * 负责渲染所有拥有Sprite和Transform组件的实体
 */
import System from '../core/System.js';
import Transform from '../components/Transform.js';
import Sprite from '../components/Sprite.js';

export default class RenderSystem extends System {
  /**
   * 构造函数
   * @param {World} world - 所属世界
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  constructor(world, ctx) {
    super(world);
    this.ctx = ctx;
    this.setRequiredComponents([Transform, Sprite]);
    this.setPriority(1000); // 渲染系统通常最后执行
    
    // 渲染状态
    this.clearColor = '#000000';
    this.enableClear = true;
    this.enableSorting = true;
  }

  /**
   * 设置清除颜色
   * @param {string} color - CSS颜色值
   * @returns {RenderSystem} 返回自身，支持链式调用
   */
  setClearColor(color) {
    this.clearColor = color;
    return this;
  }

  /**
   * 设置是否清除画布
   * @param {boolean} enable - 是否启用清除
   * @returns {RenderSystem} 返回自身，支持链式调用
   */
  setClearEnabled(enable) {
    this.enableClear = enable;
    return this;
  }

  /**
   * 设置是否启用Z轴排序
   * @param {boolean} enable - 是否启用排序
   * @returns {RenderSystem} 返回自身，支持链式调用
   */
  setSortingEnabled(enable) {
    this.enableSorting = enable;
    return this;
  }

  /**
   * 系统初始化
   */
  init() {
    console.log('RenderSystem initialized');
  }

  /**
   * 系统更新
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    if (!this.ctx || !this.isEnabled()) return;

    // 清除画布
    if (this.enableClear) {
      this.ctx.fillStyle = this.clearColor;
      this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    // 获取所有需要渲染的实体
    const entities = this.getMatchingEntities();
    
    // 按Z轴排序
    if (this.enableSorting) {
      entities.sort((a, b) => {
        const spriteA = a.getComponent(Sprite);
        const spriteB = b.getComponent(Sprite);
        return (spriteA.zIndex || 0) - (spriteB.zIndex || 0);
      });
    }

    // 渲染所有实体
    entities.forEach(entity => {
      this.renderEntity(entity);
    });
  }

  /**
   * 渲染单个实体
   * @param {Entity} entity - 要渲染的实体
   */
  renderEntity(entity) {
    const transform = entity.getComponent(Transform);
    const sprite = entity.getComponent(Sprite);
    
    if (!transform || !sprite || !sprite.visible) return;

    // 获取变换矩阵
    const matrix = transform.getTransformMatrix();
    
    // 渲染精灵
    sprite.render(this.ctx, matrix);
  }

  /**
   * 系统销毁
   */
  destroy() {
    this.ctx = null;
    console.log('RenderSystem destroyed');
  }

  /**
   * 实体添加时的回调
   * @param {Entity} entity - 添加的实体
   */
  onEntityAdded(entity) {
    console.log(`Entity ${entity.id} added to RenderSystem`);
  }

  /**
   * 实体移除时的回调
   * @param {Entity} entity - 移除的实体
   */
  onEntityRemoved(entity) {
    console.log(`Entity ${entity.id} removed from RenderSystem`);
  }
}