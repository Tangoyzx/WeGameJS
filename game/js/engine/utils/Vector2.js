/**
 * Vector2 二维向量类
 * 提供2D向量运算功能
 */
export default class Vector2 {
  /**
   * 构造函数
   * @param {number} x - X分量
   * @param {number} y - Y分量
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * 创建零向量
   * @returns {Vector2} 零向量
   */
  static zero() {
    return new Vector2(0, 0);
  }

  /**
   * 创建单位向量
   * @returns {Vector2} 单位向量
   */
  static one() {
    return new Vector2(1, 1);
  }

  /**
   * 创建单位X轴向量
   * @returns {Vector2} X轴单位向量
   */
  static unitX() {
    return new Vector2(1, 0);
  }

  /**
   * 创建单位Y轴向量
   * @returns {Vector2} Y轴单位向量
   */
  static unitY() {
    return new Vector2(0, 1);
  }

  /**
   * 从角度创建向量
   * @param {number} angle - 角度（弧度）
   * @param {number} length - 向量长度
   * @returns {Vector2} 方向向量
   */
  static fromAngle(angle, length = 1) {
    return new Vector2(
      Math.cos(angle) * length,
      Math.sin(angle) * length
    );
  }

  /**
   * 复制向量
   * @returns {Vector2} 复制的新向量
   */
  clone() {
    return new Vector2(this.x, this.y);
  }

  /**
   * 设置向量值
   * @param {number} x - X分量
   * @param {number} y - Y分量
   * @returns {Vector2} 返回自身，支持链式调用
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * 复制另一个向量的值
   * @param {Vector2} other - 另一个向量
   * @returns {Vector2} 返回自身，支持链式调用
   */
  copy(other) {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  /**
   * 向量加法
   * @param {Vector2} other - 另一个向量
   * @returns {Vector2} 返回自身，支持链式调用
   */
  add(other) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  /**
   * 向量减法
   * @param {Vector2} other - 另一个向量
   * @returns {Vector2} 返回自身，支持链式调用
   */
  subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  /**
   * 向量数乘
   * @param {number} scalar - 标量
   * @returns {Vector2} 返回自身，支持链式调用
   */
  multiply(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * 向量数除
   * @param {number} scalar - 标量
   * @returns {Vector2} 返回自身，支持链式调用
   */
  divide(scalar) {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  /**
   * 向量点积
   * @param {Vector2} other - 另一个向量
   * @returns {number} 点积结果
   */
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * 向量叉积（2D叉积返回标量）
   * @param {Vector2} other - 另一个向量
   * @returns {number} 叉积结果
   */
  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  /**
   * 向量长度
   * @returns {number} 向量长度
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * 向量长度的平方
   * @returns {number} 向量长度的平方
   */
  lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * 向量归一化
   * @returns {Vector2} 返回自身，支持链式调用
   */
  normalize() {
    const len = this.length();
    if (len > 0) {
      this.divide(len);
    }
    return this;
  }

  /**
   * 向量旋转
   * @param {number} angle - 旋转角度（弧度）
   * @returns {Vector2} 返回自身，支持链式调用
   */
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * 向量角度
   * @returns {number} 向量角度（弧度）
   */
  angle() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * 向量到另一个向量的距离
   * @param {Vector2} other - 另一个向量
   * @returns {number} 距离
   */
  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 向量到另一个向量的距离的平方
   * @param {Vector2} other - 另一个向量
   * @returns {number} 距离的平方
   */
  distanceToSquared(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }

  /**
   * 向量线性插值
   * @param {Vector2} other - 另一个向量
   * @param {number} t - 插值系数（0-1）
   * @returns {Vector2} 返回自身，支持链式调用
   */
  lerp(other, t) {
    this.x += (other.x - this.x) * t;
    this.y += (other.y - this.y) * t;
    return this;
  }

  /**
   * 限制向量长度
   * @param {number} maxLength - 最大长度
   * @returns {Vector2} 返回自身，支持链式调用
   */
  clampLength(maxLength) {
    const len = this.length();
    if (len > maxLength) {
      this.normalize().multiply(maxLength);
    }
    return this;
  }

  /**
   * 向量反射
   * @param {Vector2} normal - 法线向量
   * @returns {Vector2} 返回自身，支持链式调用
   */
  reflect(normal) {
    const dot = this.dot(normal);
    this.x -= 2 * dot * normal.x;
    this.y -= 2 * dot * normal.y;
    return this;
  }

  /**
   * 检查向量是否为零向量
   * @param {number} epsilon - 容差
   * @returns {boolean} 是否为零向量
   */
  isZero(epsilon = 0.0001) {
    return Math.abs(this.x) < epsilon && Math.abs(this.y) < epsilon;
  }

  /**
   * 检查向量是否近似相等
   * @param {Vector2} other - 另一个向量
   * @param {number} epsilon - 容差
   * @returns {boolean} 是否近似相等
   */
  equals(other, epsilon = 0.0001) {
    return Math.abs(this.x - other.x) < epsilon && 
           Math.abs(this.y - other.y) < epsilon;
  }

  /**
   * 转换为数组
   * @returns {Array} [x, y]
   */
  toArray() {
    return [this.x, this.y];
  }

  /**
   * 转换为对象
   * @returns {Object} {x, y}
   */
  toObject() {
    return { x: this.x, y: this.y };
  }

  /**
   * 转换为字符串
   * @returns {string} 字符串表示
   */
  toString() {
    return `Vector2(${this.x}, ${this.y})`;
  }

  /**
   * 静态加法
   * @param {Vector2} a - 向量A
   * @param {Vector2} b - 向量B
   * @returns {Vector2} 结果向量
   */
  static add(a, b) {
    return new Vector2(a.x + b.x, a.y + b.y);
  }

  /**
   * 静态减法
   * @param {Vector2} a - 向量A
   * @param {Vector2} b - 向量B
   * @returns {Vector2} 结果向量
   */
  static subtract(a, b) {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  /**
   * 静态数乘
   * @param {Vector2} v - 向量
   * @param {number} scalar - 标量
   * @returns {Vector2} 结果向量
   */
  static multiply(v, scalar) {
    return new Vector2(v.x * scalar, v.y * scalar);
  }

  /**
   * 静态点积
   * @param {Vector2} a - 向量A
   * @param {Vector2} b - 向量B
   * @returns {number} 点积结果
   */
  static dot(a, b) {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * 静态距离
   * @param {Vector2} a - 向量A
   * @param {Vector2} b - 向量B
   * @returns {number} 距离
   */
  static distance(a, b) {
    return a.distanceTo(b);
  }

  /**
   * 静态线性插值
   * @param {Vector2} a - 起始向量
   * @param {Vector2} b - 目标向量
   * @param {number} t - 插值系数（0-1）
   * @returns {Vector2} 插值结果
   */
  static lerp(a, b, t) {
    return new Vector2(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    );
  }
}