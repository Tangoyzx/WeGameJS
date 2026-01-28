/**
 * Component 组件基类
 * 所有组件都应该继承自这个类
 */
export default class Component {
  /**
   * 构造函数
   * @param {Object} data - 组件初始化数据
   */
  constructor(data = {}) {
    this.entity = null; // 所属实体
    this.enabled = true;
    
    // 复制数据到组件实例
    Object.assign(this, data);
  }

  /**
   * 获取组件名称
   * @returns {string} 组件类名
   */
  getName() {
    return this.constructor.name;
  }

  /**
   * 启用组件
   */
  enable() {
    this.enabled = true;
  }

  /**
   * 禁用组件
   */
  disable() {
    this.enabled = false;
  }

  /**
   * 检查组件是否启用
   * @returns {boolean} 是否启用
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 组件初始化方法（子类可重写）
   */
  init() {
    // 子类实现具体的初始化逻辑
  }

  /**
   * 组件更新方法（子类可重写）
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    // 子类实现具体的更新逻辑
  }

  /**
   * 组件销毁方法（子类可重写）
   */
  destroy() {
    // 子类实现具体的销毁逻辑
  }

  /**
   * 序列化组件数据
   * @returns {Object} 序列化后的数据
   */
  serialize() {
    const data = {};
    
    // 复制所有可序列化的属性
    for (const key in this) {
      if (this.hasOwnProperty(key) && 
          key !== 'entity' && 
          typeof this[key] !== 'function') {
        data[key] = this[key];
      }
    }
    
    return data;
  }

  /**
   * 反序列化组件数据
   * @param {Object} data - 反序列化的数据
   */
  deserialize(data) {
    Object.assign(this, data);
  }

  /**
   * 克隆组件
   * @returns {Component} 新的组件实例
   */
  clone() {
    const ComponentClass = this.constructor;
    const clonedData = this.serialize();
    return new ComponentClass(clonedData);
  }

  /**
   * 转换为字符串表示
   * @returns {string} 组件描述
   */
  toString() {
    return `${this.getName()}`;
  }
}