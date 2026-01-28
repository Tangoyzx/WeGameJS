/**
 * Physics 物理组件
 * 处理实体的物理属性，如速度、加速度、碰撞等
 */
import Component from '../core/Component.js';

export default class Physics extends Component {
  /**
   * 构造函数
   * @param {Object} data - 初始化数据
   */
  constructor(data = {}) {
    super(data);
    
    // 速度
    this.velocityX = data.velocityX || 0;
    this.velocityY = data.velocityY || 0;
    this.velocityZ = data.velocityZ || 0;
    
    // 加速度
    this.accelerationX = data.accelerationX || 0;
    this.accelerationY = data.accelerationY || 0;
    this.accelerationZ = data.accelerationZ || 0;
    
    // 角速度
    this.angularVelocity = data.angularVelocity || 0;
    this.angularAcceleration = data.angularAcceleration || 0;
    
    // 质量
    this.mass = data.mass || 1;
    
    // 摩擦力
    this.friction = data.friction || 0.1;
    this.airResistance = data.airResistance || 0.01;
    
    // 重力
    this.gravityX = data.gravityX || 0;
    this.gravityY = data.gravityY || 0;
    this.gravityScale = data.gravityScale || 1;
    
    // 碰撞属性
    this.collisionEnabled = data.collisionEnabled !== undefined ? data.collisionEnabled : true;
    this.collisionGroup = data.collisionGroup || 'default';
    this.collisionMask = data.collisionMask || ['default'];
    
    // 碰撞形状
    this.collisionShape = data.collisionShape || 'rectangle'; // rectangle, circle, polygon
    this.collisionWidth = data.collisionWidth || 0;
    this.collisionHeight = data.collisionHeight || 0;
    this.collisionRadius = data.collisionRadius || 0;
    this.collisionPolygon = data.collisionPolygon || [];
    
    // 物理约束
    this.maxSpeed = data.maxSpeed || Infinity;
    this.minSpeed = data.minSpeed || 0;
    this.bounceFactor = data.bounceFactor || 0.5;
    
    // 物理状态
    this.isKinematic = data.isKinematic !== undefined ? data.isKinematic : false;
    this.isStatic = data.isStatic !== undefined ? data.isStatic : false;
    this.isSleeping = data.isSleeping !== undefined ? data.isSleeping : false;
    
    // 碰撞检测结果
    this.collisions = [];
    this.isColliding = false;
    
    // 力场
    this.forces = [];
    this.impulses = [];
  }

  /**
   * 设置速度
   * @param {number} vx - X轴速度
   * @param {number} vy - Y轴速度
   * @param {number} vz - Z轴速度（可选）
   * @returns {Physics} 返回自身，支持链式调用
   */
  setVelocity(vx, vy, vz = this.velocityZ) {
    this.velocityX = vx;
    this.velocityY = vy;
    this.velocityZ = vz;
    return this;
  }

  /**
   * 设置加速度
   * @param {number} ax - X轴加速度
   * @param {number} ay - Y轴加速度
   * @param {number} az - Z轴加速度（可选）
   * @returns {Physics} 返回自身，支持链式调用
   */
  setAcceleration(ax, ay, az = this.accelerationZ) {
    this.accelerationX = ax;
    this.accelerationY = ay;
    this.accelerationZ = az;
    return this;
  }

  /**
   * 设置角速度
   * @param {number} angularVelocity - 角速度
   * @returns {Physics} 返回自身，支持链式调用
   */
  setAngularVelocity(angularVelocity) {
    this.angularVelocity = angularVelocity;
    return this;
  }

  /**
   * 设置重力
   * @param {number} gx - X轴重力
   * @param {number} gy - Y轴重力
   * @param {number} scale - 重力缩放（可选）
   * @returns {Physics} 返回自身，支持链式调用
   */
  setGravity(gx, gy, scale = this.gravityScale) {
    this.gravityX = gx;
    this.gravityY = gy;
    this.gravityScale = scale;
    return this;
  }

  /**
   * 设置碰撞形状
   * @param {string} shape - 形状类型（rectangle, circle, polygon）
   * @param {Object} options - 形状参数
   * @returns {Physics} 返回自身，支持链式调用
   */
  setCollisionShape(shape, options = {}) {
    this.collisionShape = shape;
    
    switch (shape) {
      case 'rectangle':
        this.collisionWidth = options.width || this.collisionWidth;
        this.collisionHeight = options.height || this.collisionHeight;
        break;
      case 'circle':
        this.collisionRadius = options.radius || this.collisionRadius;
        break;
      case 'polygon':
        this.collisionPolygon = options.points || this.collisionPolygon;
        break;
    }
    
    return this;
  }

  /**
   * 添加力
   * @param {number} fx - X轴力
   * @param {number} fy - Y轴力
   * @param {number} duration - 持续时间（秒）
   * @returns {Physics} 返回自身，支持链式调用
   */
  addForce(fx, fy, duration = 0) {
    this.forces.push({
      x: fx,
      y: fy,
      duration: duration,
      elapsed: 0
    });
    return this;
  }

  /**
   * 添加冲量
   * @param {number} ix - X轴冲量
   * @param {number} iy - Y轴冲量
   * @returns {Physics} 返回自身，支持链式调用
   */
  addImpulse(ix, iy) {
    this.impulses.push({ x: ix, y: iy });
    return this;
  }

  /**
   * 清除所有力和冲量
   * @returns {Physics} 返回自身，支持链式调用
   */
  clearForces() {
    this.forces = [];
    this.impulses = [];
    return this;
  }

  /**
   * 应用物理更新
   * @param {number} deltaTime - 时间增量（秒）
   * @param {Transform} transform - 变换组件
   */
  update(deltaTime, transform) {
    if (this.isSleeping || this.isStatic) return;
    
    // 应用重力
    if (!this.isKinematic) {
      this.accelerationX += this.gravityX * this.gravityScale;
      this.accelerationY += this.gravityY * this.gravityScale;
    }
    
    // 应用冲量
    this.impulses.forEach(impulse => {
      this.velocityX += impulse.x / this.mass;
      this.velocityY += impulse.y / this.mass;
    });
    this.impulses = [];
    
    // 应用力
    const activeForces = [];
    this.forces.forEach(force => {
      this.accelerationX += force.x / this.mass;
      this.accelerationY += force.y / this.mass;
      
      force.elapsed += deltaTime;
      if (force.duration === 0 || force.elapsed < force.duration) {
        activeForces.push(force);
      }
    });
    this.forces = activeForces;
    
    // 更新速度
    this.velocityX += this.accelerationX * deltaTime;
    this.velocityY += this.accelerationY * deltaTime;
    
    // 应用摩擦力
    if (!this.isKinematic) {
      const friction = this.isColliding ? this.friction : this.airResistance;
      this.velocityX *= (1 - friction);
      this.velocityY *= (1 - friction);
    }
    
    // 限制速度
    const speed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
    if (speed > this.maxSpeed) {
      const ratio = this.maxSpeed / speed;
      this.velocityX *= ratio;
      this.velocityY *= ratio;
    }
    if (speed < this.minSpeed) {
      this.velocityX = 0;
      this.velocityY = 0;
    }
    
    // 更新角速度
    this.angularVelocity += this.angularAcceleration * deltaTime;
    
    // 更新位置和旋转
    if (!this.isStatic) {
      transform.x += this.velocityX * deltaTime;
      transform.y += this.velocityY * deltaTime;
      transform.rotation += this.angularVelocity * deltaTime;
    }
    
    // 重置加速度（除非持续施加）
    if (this.forces.length === 0) {
      this.accelerationX = 0;
      this.accelerationY = 0;
      this.angularAcceleration = 0;
    }
    
    // 检查是否需要休眠
    if (speed < 0.1 && Math.abs(this.angularVelocity) < 0.1) {
      this.isSleeping = true;
    }
  }

  /**
   * 获取当前速度大小
   * @returns {number} 速度大小
   */
  getSpeed() {
    return Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
  }

  /**
   * 获取当前速度方向（角度）
   * @returns {number} 速度方向角度（弧度）
   */
  getDirection() {
    return Math.atan2(this.velocityY, this.velocityX);
  }

  /**
   * 设置速度方向和大小
   * @param {number} direction - 方向角度（弧度）
   * @param {number} speed - 速度大小
   * @returns {Physics} 返回自身，支持链式调用
   */
  setDirection(direction, speed) {
    this.velocityX = Math.cos(direction) * speed;
    this.velocityY = Math.sin(direction) * speed;
    return this;
  }

  /**
   * 获取碰撞边界框
   * @param {Transform} transform - 变换组件
   * @returns {Object} 边界框 {x, y, width, height}
   */
  getBounds(transform) {
    const worldPos = transform.getWorldPosition();
    
    switch (this.collisionShape) {
      case 'rectangle':
        return {
          x: worldPos.x - this.collisionWidth / 2,
          y: worldPos.y - this.collisionHeight / 2,
          width: this.collisionWidth,
          height: this.collisionHeight
        };
      case 'circle':
        return {
          x: worldPos.x - this.collisionRadius,
          y: worldPos.y - this.collisionRadius,
          width: this.collisionRadius * 2,
          height: this.collisionRadius * 2
        };
      case 'polygon':
        // 计算多边形边界框
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.collisionPolygon.forEach(point => {
          const worldX = worldPos.x + point.x;
          const worldY = worldPos.y + point.y;
          minX = Math.min(minX, worldX);
          minY = Math.min(minY, worldY);
          maxX = Math.max(maxX, worldX);
          maxY = Math.max(maxY, worldY);
        });
        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };
      default:
        return { x: worldPos.x, y: worldPos.y, width: 0, height: 0 };
    }
  }

  /**
   * 检查碰撞
   * @param {Physics} other - 另一个物理组件
   * @param {Transform} transform - 当前变换组件
   * @param {Transform} otherTransform - 另一个变换组件
   * @returns {Object|null} 碰撞信息，如果没有碰撞则返回null
   */
  checkCollision(other, transform, otherTransform) {
    if (!this.collisionEnabled || !other.collisionEnabled) return null;
    
    // 检查碰撞组和掩码
    if (!this.collisionMask.includes(other.collisionGroup)) return null;
    if (!other.collisionMask.includes(this.collisionGroup)) return null;
    
    const bounds1 = this.getBounds(transform);
    const bounds2 = other.getBounds(otherTransform);
    
    // 快速边界框检查
    if (bounds1.x + bounds1.width < bounds2.x ||
        bounds1.x > bounds2.x + bounds2.width ||
        bounds1.y + bounds1.height < bounds2.y ||
        bounds1.y > bounds2.y + bounds2.height) {
      return null;
    }
    
    // 根据形状进行精确碰撞检测
    return this.performShapeCollision(other, transform, otherTransform);
  }

  /**
   * 执行形状碰撞检测
   * @param {Physics} other - 另一个物理组件
   * @param {Transform} transform - 当前变换组件
   * @param {Transform} otherTransform - 另一个变换组件
   * @returns {Object|null} 碰撞信息
   */
  performShapeCollision(other, transform, otherTransform) {
    // 简化的碰撞检测实现
    // 实际项目中应该使用更精确的碰撞检测算法
    
    const pos1 = transform.getWorldPosition();
    const pos2 = otherTransform.getWorldPosition();
    
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let collision = null;
    
    if (this.collisionShape === 'circle' && other.collisionShape === 'circle') {
      const radiusSum = this.collisionRadius + other.collisionRadius;
      if (distance < radiusSum) {
        collision = {
          normalX: dx / distance,
          normalY: dy / distance,
          depth: radiusSum - distance,
          point: {
            x: pos1.x + (dx / distance) * this.collisionRadius,
            y: pos1.y + (dy / distance) * this.collisionRadius
          }
        };
      }
    }
    
    return collision;
  }

  /**
   * 处理碰撞响应
   * @param {Object} collision - 碰撞信息
   * @param {Physics} other - 另一个物理组件
   */
  handleCollision(collision, other) {
    if (!collision) return;
    
    this.isColliding = true;
    this.collisions.push({
      other: other,
      normalX: collision.normalX,
      normalY: collision.normalY,
      depth: collision.depth
    });
    
    // 简单的碰撞响应
    if (!this.isStatic && !this.isKinematic) {
      // 分离物体
      const transform = this.entity.getComponent(Transform);
      if (transform) {
        transform.x += collision.normalX * collision.depth * 0.5;
        transform.y += collision.normalY * collision.depth * 0.5;
      }
      
      // 反弹
      const dotProduct = this.velocityX * collision.normalX + this.velocityY * collision.normalY;
      this.velocityX -= collision.normalX * dotProduct * (1 + this.bounceFactor);
      this.velocityY -= collision.normalY * dotProduct * (1 + this.bounceFactor);
    }
  }

  /**
   * 清除碰撞状态
   */
  clearCollisions() {
    this.isColliding = false;
    this.collisions = [];
  }

  /**
   * 转换为字符串表示
   * @returns {string} 物理组件描述
   */
  toString() {
    return `Physics(vx: ${this.velocityX.toFixed(2)}, vy: ${this.velocityY.toFixed(2)}, mass: ${this.mass})`;
  }
}