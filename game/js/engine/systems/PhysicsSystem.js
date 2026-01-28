/**
 * PhysicsSystem 物理系统
 * 负责处理实体的物理运动和碰撞检测
 */
import System from '../core/System.js';
import Transform from '../components/Transform.js';
import Physics from '../components/Physics.js';

export default class PhysicsSystem extends System {
  /**
   * 构造函数
   * @param {World} world - 所属世界
   */
  constructor(world) {
    super(world);
    this.setRequiredComponents([Transform, Physics]);
    this.setPriority(100); // 物理系统在渲染之前执行
    
    // 物理参数
    this.gravityX = 0;
    this.gravityY = 980; // 默认重力加速度（像素/秒²）
    this.worldBounds = null; // 世界边界
    this.collisionEnabled = true;
    
    // 碰撞检测缓存
    this.collisionPairs = [];
  }

  /**
   * 设置重力
   * @param {number} gx - X轴重力
   * @param {number} gy - Y轴重力
   * @returns {PhysicsSystem} 返回自身，支持链式调用
   */
  setGravity(gx, gy) {
    this.gravityX = gx;
    this.gravityY = gy;
    return this;
  }

  /**
   * 设置世界边界
   * @param {Object} bounds - 边界对象 {x, y, width, height}
   * @returns {PhysicsSystem} 返回自身，支持链式调用
   */
  setWorldBounds(bounds) {
    this.worldBounds = bounds;
    return this;
  }

  /**
   * 设置碰撞检测是否启用
   * @param {boolean} enabled - 是否启用
   * @returns {PhysicsSystem} 返回自身，支持链式调用
   */
  setCollisionEnabled(enabled) {
    this.collisionEnabled = enabled;
    return this;
  }

  /**
   * 系统初始化
   */
  init() {
    console.log('PhysicsSystem initialized');
  }

  /**
   * 系统更新
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    if (!this.isEnabled()) return;

    const entities = this.getMatchingEntities();
    
    // 更新物理状态
    entities.forEach(entity => {
      this.updateEntityPhysics(entity, deltaTime);
    });

    // 碰撞检测
    if (this.collisionEnabled) {
      this.detectCollisions(entities);
    }

    // 边界检测
    if (this.worldBounds) {
      entities.forEach(entity => {
        this.checkWorldBounds(entity);
      });
    }

    // 清除碰撞状态
    entities.forEach(entity => {
      const physics = entity.getComponent(Physics);
      physics.clearCollisions();
    });
  }

  /**
   * 更新实体物理状态
   * @param {Entity} entity - 要更新的实体
   * @param {number} deltaTime - 时间增量
   */
  updateEntityPhysics(entity, deltaTime) {
    const transform = entity.getComponent(Transform);
    const physics = entity.getComponent(Physics);
    
    if (physics.isStatic || physics.isSleeping) return;

    // 应用全局重力
    if (!physics.isKinematic) {
      physics.setGravity(this.gravityX, this.gravityY);
    }

    // 更新物理组件
    physics.update(deltaTime, transform);
  }

  /**
   * 检测碰撞
   * @param {Array<Entity>} entities - 实体数组
   */
  detectCollisions(entities) {
    this.collisionPairs = [];
    
    // 简单的碰撞检测（实际项目中应该使用空间分割优化）
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];
        
        this.checkCollision(entityA, entityB);
      }
    }
  }

  /**
   * 检查两个实体之间的碰撞
   * @param {Entity} entityA - 实体A
   * @param {Entity} entityB - 实体B
   */
  checkCollision(entityA, entityB) {
    const physicsA = entityA.getComponent(Physics);
    const physicsB = entityB.getComponent(Physics);
    const transformA = entityA.getComponent(Transform);
    const transformB = entityB.getComponent(Transform);
    
    if (!physicsA.collisionEnabled || !physicsB.collisionEnabled) return;
    
    // 检查碰撞
    const collision = physicsA.checkCollision(physicsB, transformA, transformB);
    
    if (collision) {
      // 处理碰撞响应
      physicsA.handleCollision(collision, physicsB);
      physicsB.handleCollision({
        normalX: -collision.normalX,
        normalY: -collision.normalY,
        depth: collision.depth
      }, physicsA);
      
      this.collisionPairs.push({
        entityA: entityA,
        entityB: entityB,
        collision: collision
      });
    }
  }

  /**
   * 检查世界边界
   * @param {Entity} entity - 要检查的实体
   */
  checkWorldBounds(entity) {
    const transform = entity.getComponent(Transform);
    const physics = entity.getComponent(Physics);
    
    if (physics.isStatic) return;
    
    const bounds = physics.getBounds(transform);
    const worldBounds = this.worldBounds;
    
    // 检查左边界
    if (bounds.x < worldBounds.x) {
      transform.x = worldBounds.x + bounds.width / 2;
      physics.velocityX = Math.abs(physics.velocityX) * physics.bounceFactor;
    }
    
    // 检查右边界
    if (bounds.x + bounds.width > worldBounds.x + worldBounds.width) {
      transform.x = worldBounds.x + worldBounds.width - bounds.width / 2;
      physics.velocityX = -Math.abs(physics.velocityX) * physics.bounceFactor;
    }
    
    // 检查上边界
    if (bounds.y < worldBounds.y) {
      transform.y = worldBounds.y + bounds.height / 2;
      physics.velocityY = Math.abs(physics.velocityY) * physics.bounceFactor;
    }
    
    // 检查下边界
    if (bounds.y + bounds.height > worldBounds.y + worldBounds.height) {
      transform.y = worldBounds.y + worldBounds.height - bounds.height / 2;
      physics.velocityY = -Math.abs(physics.velocityY) * physics.bounceFactor;
    }
  }

  /**
   * 获取碰撞对列表
   * @returns {Array} 碰撞对数组
   */
  getCollisionPairs() {
    return this.collisionPairs;
  }

  /**
   * 系统销毁
   */
  destroy() {
    this.collisionPairs = [];
    console.log('PhysicsSystem destroyed');
  }

  /**
   * 实体添加时的回调
   * @param {Entity} entity - 添加的实体
   */
  onEntityAdded(entity) {
    console.log(`Entity ${entity.id} added to PhysicsSystem`);
  }

  /**
   * 实体移除时的回调
   * @param {Entity} entity - 移除的实体
   */
  onEntityRemoved(entity) {
    console.log(`Entity ${entity.id} removed from PhysicsSystem`);
  }
}