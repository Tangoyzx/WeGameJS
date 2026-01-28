/**
 * System 系统基类
 * 所有系统都应该继承自这个类
 */
export default class System {
  /**
   * 构造函数
   * @param {World} world - 所属的世界对象
   */
  constructor(world) {
    this.world = world;
    this.enabled = true;
    this.priority = 0; // 执行优先级，数值越小优先级越高
    this.requiredComponents = []; // 系统需要的组件类型
  }

  /**
   * 获取系统名称
   * @returns {string} 系统类名
   */
  getName() {
    return this.constructor.name;
  }

  /**
   * 启用系统
   */
  enable() {
    this.enabled = true;
  }

  /**
   * 禁用系统
   */
  disable() {
    this.enabled = false;
  }

  /**
   * 检查系统是否启用
   * @returns {boolean} 是否启用
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 设置执行优先级
   * @param {number} priority - 优先级数值
   * @returns {System} 返回系统本身，支持链式调用
   */
  setPriority(priority) {
    this.priority = priority;
    return this;
  }

  /**
   * 获取执行优先级
   * @returns {number} 优先级数值
   */
  getPriority() {
    return this.priority;
  }

  /**
   * 设置需要的组件类型
   * @param {Array<Function>} componentClasses - 组件类数组
   * @returns {System} 返回系统本身，支持链式调用
   */
  setRequiredComponents(componentClasses) {
    this.requiredComponents = componentClasses;
    return this;
  }

  /**
   * 获取需要的组件类型
   * @returns {Array<Function>} 组件类数组
   */
  getRequiredComponents() {
    return this.requiredComponents;
  }

  /**
   * 检查实体是否满足系统的组件要求
   * @param {Entity} entity - 要检查的实体
   * @returns {boolean} 是否满足要求
   */
  matches(entity) {
    if (!entity.isEnabled()) {
      return false;
    }

    for (const ComponentClass of this.requiredComponents) {
      if (!entity.hasComponent(ComponentClass)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 获取所有满足系统要求的实体
   * @returns {Array<Entity>} 实体数组
   */
  getMatchingEntities() {
    return this.world.getEntities().filter(entity => this.matches(entity));
  }

  /**
   * 系统初始化方法（子类可重写）
   */
  init() {
    // 子类实现具体的初始化逻辑
  }

  /**
   * 系统更新方法（子类必须重写）
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    throw new Error('System.update() must be implemented by subclass');
  }

  /**
   * 系统销毁方法（子类可重写）
   */
  destroy() {
    // 子类实现具体的销毁逻辑
  }

  /**
   * 实体添加时的回调（子类可重写）
   * @param {Entity} entity - 添加的实体
   */
  onEntityAdded(entity) {
    // 子类实现具体的逻辑
  }

  /**
   * 实体移除时的回调（子类可重写）
   * @param {Entity} entity - 移除的实体
   */
  onEntityRemoved(entity) {
    // 子类实现具体的逻辑
  }

  /**
   * 实体组件变化时的回调（子类可重写）
   * @param {Entity} entity - 变化的实体
   * @param {Component} component - 变化的组件
   * @param {string} operation - 操作类型（'added', 'removed', 'updated'）
   */
  onEntityComponentChanged(entity, component, operation) {
    // 子类实现具体的逻辑
  }

  /**
   * 转换为字符串表示
   * @returns {string} 系统描述
   */
  toString() {
    return `${this.getName()} (Priority: ${this.priority}, Components: ${this.requiredComponents.map(c => c.name).join(', ')})`;
  }
}