/**
 * Transform 变换组件
 * 处理实体的位置、旋转、缩放等变换信息
 */
import Component from '../core/Component.js';

export default class Transform extends Component {
  /**
   * 构造函数
   * @param {Object} data - 初始化数据
   */
  constructor(data = {}) {
    super(data);
    
    // 位置
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.z = data.z || 0;
    
    // 旋转（角度）
    this.rotation = data.rotation || 0;
    
    // 缩放
    this.scaleX = data.scaleX || 1;
    this.scaleY = data.scaleY || 1;
    
    // 锚点（0-1之间的值，表示相对于宽高的比例）
    this.anchorX = data.anchorX || 0.5;
    this.anchorY = data.anchorY || 0.5;
    
    // 父级变换（用于层级关系）
    this.parent = data.parent || null;
    
    // 子级变换列表
    this.children = data.children || [];
  }

  /**
   * 获取世界坐标位置
   * @returns {Object} 世界坐标 {x, y}
   */
  getWorldPosition() {
    if (this.parent) {
      const parentWorldPos = this.parent.getWorldPosition();
      return {
        x: parentWorldPos.x + this.x,
        y: parentWorldPos.y + this.y
      };
    }
    return { x: this.x, y: this.y };
  }

  /**
   * 获取世界旋转角度
   * @returns {number} 世界旋转角度
   */
  getWorldRotation() {
    if (this.parent) {
      return this.parent.getWorldRotation() + this.rotation;
    }
    return this.rotation;
  }

  /**
   * 获取世界缩放
   * @returns {Object} 世界缩放 {scaleX, scaleY}
   */
  getWorldScale() {
    if (this.parent) {
      const parentWorldScale = this.parent.getWorldScale();
      return {
        scaleX: parentWorldScale.scaleX * this.scaleX,
        scaleY: parentWorldScale.scaleY * this.scaleY
      };
    }
    return { scaleX: this.scaleX, scaleY: this.scaleY };
  }

  /**
   * 设置位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} z - Z坐标（可选）
   * @returns {Transform} 返回自身，支持链式调用
   */
  setPosition(x, y, z = this.z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * 移动位置
   * @param {number} dx - X方向移动量
   * @param {number} dy - Y方向移动量
   * @param {number} dz - Z方向移动量（可选）
   * @returns {Transform} 返回自身，支持链式调用
   */
  translate(dx, dy, dz = 0) {
    this.x += dx;
    this.y += dy;
    this.z += dz;
    return this;
  }

  /**
   * 设置旋转角度
   * @param {number} rotation - 旋转角度
   * @returns {Transform} 返回自身，支持链式调用
   */
  setRotation(rotation) {
    this.rotation = rotation;
    return this;
  }

  /**
   * 旋转
   * @param {number} angle - 旋转角度增量
   * @returns {Transform} 返回自身，支持链式调用
   */
  rotate(angle) {
    this.rotation += angle;
    return this;
  }

  /**
   * 设置缩放
   * @param {number} scaleX - X轴缩放
   * @param {number} scaleY - Y轴缩放
   * @returns {Transform} 返回自身，支持链式调用
   */
  setScale(scaleX, scaleY = scaleX) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    return this;
  }

  /**
   * 设置锚点
   * @param {number} anchorX - X轴锚点（0-1）
   * @param {number} anchorY - Y轴锚点（0-1）
   * @returns {Transform} 返回自身，支持链式调用
   */
  setAnchor(anchorX, anchorY = anchorX) {
    this.anchorX = anchorX;
    this.anchorY = anchorY;
    return this;
  }

  /**
   * 设置父级变换
   * @param {Transform} parent - 父级变换组件
   * @returns {Transform} 返回自身，支持链式调用
   */
  setParent(parent) {
    if (this.parent) {
      // 从原父级移除
      const index = this.parent.children.indexOf(this);
      if (index !== -1) {
        this.parent.children.splice(index, 1);
      }
    }
    
    this.parent = parent;
    
    if (parent) {
      parent.children.push(this);
    }
    
    return this;
  }

  /**
   * 添加子级变换
   * @param {Transform} child - 子级变换组件
   * @returns {Transform} 返回自身，支持链式调用
   */
  addChild(child) {
    if (!this.children.includes(child)) {
      this.children.push(child);
      child.setParent(this);
    }
    return this;
  }

  /**
   * 移除子级变换
   * @param {Transform} child - 子级变换组件
   * @returns {Transform} 返回自身，支持链式调用
   */
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.setParent(null);
    }
    return this;
  }

  /**
   * 获取变换矩阵（用于渲染）
   * @returns {Object} 变换矩阵信息
   */
  getTransformMatrix() {
    const worldPos = this.getWorldPosition();
    const worldRotation = this.getWorldRotation();
    const worldScale = this.getWorldScale();
    
    return {
      x: worldPos.x,
      y: worldPos.y,
      rotation: worldRotation,
      scaleX: worldScale.scaleX,
      scaleY: worldScale.scaleY,
      anchorX: this.anchorX,
      anchorY: this.anchorY
    };
  }

  /**
   * 计算两点之间的距离
   * @param {Transform} other - 另一个变换组件
   * @returns {number} 距离
   */
  distanceTo(other) {
    const pos1 = this.getWorldPosition();
    const pos2 = other.getWorldPosition();
    
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算两点之间的角度
   * @param {Transform} other - 另一个变换组件
   * @returns {number} 角度（弧度）
   */
  angleTo(other) {
    const pos1 = this.getWorldPosition();
    const pos2 = other.getWorldPosition();
    
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    
    return Math.atan2(dy, dx);
  }

  /**
   * 转换为字符串表示
   * @returns {string} 变换组件描述
   */
  toString() {
    return `Transform(x: ${this.x}, y: ${this.y}, rotation: ${this.rotation}, scale: ${this.scaleX}, ${this.scaleY})`;
  }
}