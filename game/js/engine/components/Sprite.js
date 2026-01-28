/**
 * Sprite 精灵组件
 * 处理实体的图像渲染
 */
import Component from '../core/Component.js';

export default class Sprite extends Component {
  /**
   * 构造函数
   * @param {Object} data - 初始化数据
   */
  constructor(data = {}) {
    super(data);
    
    // 图像资源
    this.image = data.image || null; // Image对象或CanvasImageSource
    this.imageSrc = data.imageSrc || ''; // 图像源路径
    
    // 尺寸
    this.width = data.width || 0;
    this.height = data.height || 0;
    
    // 裁剪区域（用于精灵图集）
    this.sourceX = data.sourceX || 0;
    this.sourceY = data.sourceY || 0;
    this.sourceWidth = data.sourceWidth || 0;
    this.sourceHeight = data.sourceHeight || 0;
    
    // 颜色和透明度
    this.tint = data.tint || null; // 着色颜色
    this.alpha = data.alpha !== undefined ? data.alpha : 1; // 透明度（0-1）
    
    // 混合模式
    this.blendMode = data.blendMode || 'source-over'; // Canvas混合模式
    
    // 渲染顺序
    this.zIndex = data.zIndex || 0;
    
    // 可见性
    this.visible = data.visible !== undefined ? data.visible : true;
    
    // 动画相关
    this.animation = data.animation || null;
    this.currentFrame = data.currentFrame || 0;
    this.animationSpeed = data.animationSpeed || 1;
    
    // 加载状态
    this.loaded = false;
    this.loading = false;
    
    // 如果提供了imageSrc，尝试加载图像
    if (this.imageSrc && !this.image) {
      this.loadImage(this.imageSrc);
    }
  }

  /**
   * 加载图像
   * @param {string} src - 图像源路径
   * @returns {Promise} 加载完成的Promise
   */
  loadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.loading) {
        reject(new Error('Image is already loading'));
        return;
      }
      
      this.loading = true;
      this.loaded = false;
      this.imageSrc = src;
      
      const img = wx.createImage();
      
      img.onload = () => {
        this.image = img;
        this.loaded = true;
        this.loading = false;
        
        // 如果未设置尺寸，使用图像原始尺寸
        if (this.width === 0) this.width = img.width;
        if (this.height === 0) this.height = img.height;
        if (this.sourceWidth === 0) this.sourceWidth = img.width;
        if (this.sourceHeight === 0) this.sourceHeight = img.height;
        
        resolve(this);
      };
      
      img.onerror = (error) => {
        this.loading = false;
        console.error(`Failed to load image: ${src}`, error);
        reject(error);
      };
      
      img.src = src;
    });
  }

  /**
   * 设置图像
   * @param {Image} image - 图像对象
   * @returns {Sprite} 返回自身，支持链式调用
   */
  setImage(image) {
    this.image = image;
    this.loaded = true;
    this.loading = false;
    
    if (this.width === 0) this.width = image.width;
    if (this.height === 0) this.height = image.height;
    
    return this;
  }

  /**
   * 设置尺寸
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @returns {Sprite} 返回自身，支持链式调用
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
    return this;
  }

  /**
   * 设置裁剪区域
   * @param {number} x - 裁剪区域X坐标
   * @param {number} y - 裁剪区域Y坐标
   * @param {number} width - 裁剪区域宽度
   * @param {number} height - 裁剪区域高度
   * @returns {Sprite} 返回自身，支持链式调用
   */
  setSourceRect(x, y, width, height) {
    this.sourceX = x;
    this.sourceY = y;
    this.sourceWidth = width;
    this.sourceHeight = height;
    return this;
  }

  /**
   * 设置透明度
   * @param {number} alpha - 透明度（0-1）
   * @returns {Sprite} 返回自身，支持链式调用
   */
  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
    return this;
  }

  /**
   * 设置着色
   * @param {string} color - 颜色值（CSS颜色字符串）
   * @returns {Sprite} 返回自身，支持链式调用
   */
  setTint(color) {
    this.tint = color;
    return this;
  }

  /**
   * 设置可见性
   * @param {boolean} visible - 是否可见
   * @returns {Sprite} 返回自身，支持链式调用
   */
  setVisible(visible) {
    this.visible = visible;
    return this;
  }

  /**
   * 设置渲染顺序
   * @param {number} zIndex - Z轴顺序
   * @returns {Sprite} 返回自身，支持链式调用
   */
  setZIndex(zIndex) {
    this.zIndex = zIndex;
    return this;
  }

  /**
   * 设置动画
   * @param {Object} animation - 动画配置
   * @param {Array} animation.frames - 动画帧数组
   * @param {number} animation.frameRate - 帧率
   * @param {boolean} animation.loop - 是否循环
   * @returns {Sprite} 返回自身，支持链式调用
   */
  setAnimation(animation) {
    this.animation = animation;
    this.currentFrame = 0;
    return this;
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 时间增量（秒）
   */
  updateAnimation(deltaTime) {
    if (!this.animation || !this.animation.frames) return;
    
    const frameCount = this.animation.frames.length;
    if (frameCount <= 1) return;
    
    // 计算帧索引增量
    const frameIncrement = this.animationSpeed * (this.animation.frameRate || 24) * deltaTime;
    this.currentFrame += frameIncrement;
    
    // 处理循环
    if (this.currentFrame >= frameCount) {
      if (this.animation.loop) {
        this.currentFrame %= frameCount;
      } else {
        this.currentFrame = frameCount - 1;
      }
    }
    
    // 更新当前帧的裁剪区域
    const frameIndex = Math.floor(this.currentFrame);
    const frame = this.animation.frames[frameIndex];
    
    if (frame) {
      this.setSourceRect(frame.x, frame.y, frame.width, frame.height);
    }
  }

  /**
   * 组件更新方法
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    if (this.animation) {
      this.updateAnimation(deltaTime);
    }
  }

  /**
   * 渲染精灵
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} transform - 变换矩阵信息
   */
  render(ctx, transform) {
    if (!this.visible || !this.loaded || !this.image) return;
    
    // 保存上下文状态
    ctx.save();
    
    // 应用变换
    ctx.translate(transform.x, transform.y);
    ctx.rotate(transform.rotation * Math.PI / 180);
    ctx.scale(transform.scaleX, transform.scaleY);
    
    // 应用透明度
    ctx.globalAlpha = this.alpha;
    
    // 应用混合模式
    ctx.globalCompositeOperation = this.blendMode;
    
    // 计算绘制位置（考虑锚点）
    const drawX = -this.width * transform.anchorX;
    const drawY = -this.height * transform.anchorY;
    
    // 绘制图像
    if (this.sourceWidth > 0 && this.sourceHeight > 0) {
      // 使用裁剪区域
      ctx.drawImage(
        this.image,
        this.sourceX, this.sourceY, this.sourceWidth, this.sourceHeight,
        drawX, drawY, this.width, this.height
      );
    } else {
      // 绘制完整图像
      ctx.drawImage(this.image, drawX, drawY, this.width, this.height);
    }
    
    // 应用着色
    if (this.tint) {
      ctx.fillStyle = this.tint;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(drawX, drawY, this.width, this.height);
    }
    
    // 恢复上下文状态
    ctx.restore();
  }

  /**
   * 检查点是否在精灵范围内
   * @param {number} x - 点的X坐标
   * @param {number} y - 点的Y坐标
   * @param {Object} transform - 变换矩阵信息
   * @returns {boolean} 是否在范围内
   */
  containsPoint(x, y, transform) {
    if (!this.visible) return false;
    
    // 计算精灵的世界边界
    const worldX = transform.x;
    const worldY = transform.y;
    const worldWidth = this.width * transform.scaleX;
    const worldHeight = this.height * transform.scaleY;
    
    // 考虑锚点偏移
    const offsetX = worldWidth * transform.anchorX;
    const offsetY = worldHeight * transform.anchorY;
    
    const left = worldX - offsetX;
    const top = worldY - offsetY;
    const right = left + worldWidth;
    const bottom = top + worldHeight;
    
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  /**
   * 转换为字符串表示
   * @returns {string} 精灵组件描述
   */
  toString() {
    return `Sprite(${this.imageSrc || 'no-image'}, ${this.width}x${this.height}, visible: ${this.visible})`;
  }
}