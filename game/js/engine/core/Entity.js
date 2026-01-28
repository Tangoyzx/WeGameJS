/**
 * Entity 实体类
 * 代表游戏世界中的一个实体，是组件的容器
 */
export default class Entity {
  /**
   * 构造函数
   * @param {string} id - 实体ID，如果未提供则自动生成
   */
  constructor(id = null) {
    this.id = id || this.generateId();
    this.components = new Map();
    this.tags = new Set();
    this.enabled = true;
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  generateId() {
    return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加组件
   * @param {Component} component - 要添加的组件
   * @returns {Entity} 返回实体本身，支持链式调用
   */
  addComponent(component) {
    const componentName = component.constructor.name;
    this.components.set(componentName, component);
    component.entity = this;
    return this;
  }

  /**
   * 获取组件
   * @param {Function|string} componentClass - 组件类或组件类名
   * @returns {Component|null} 返回组件实例，如果不存在则返回null
   */
  getComponent(componentClass) {
    // 安全检查
    if (!componentClass) {
      console.warn('getComponent called with null or undefined componentClass');
      return null;
    }
    
    const componentName = typeof componentClass === 'string' ? componentClass : componentClass.name;
    
    // 安全检查组件名称
    if (!componentName) {
      console.warn('Invalid component class provided to getComponent');
      return null;
    }
    
    return this.components.get(componentName) || null;
  }

  /**
   * 检查是否拥有指定组件
   * @param {Function|string} componentClass - 组件类或组件类名
   * @returns {boolean} 是否拥有该组件
   */
  hasComponent(componentClass) {
    const componentName = typeof componentClass === 'string' ? componentClass : componentClass.name;
    return this.components.has(componentName);
  }

  /**
   * 移除组件
   * @param {Function|string} componentClass - 组件类或组件类名
   * @returns {boolean} 是否成功移除
   */
  removeComponent(componentClass) {
    const componentName = typeof componentClass === 'string' ? componentClass : componentClass.name;
    const component = this.components.get(componentName);
    if (component) {
      component.entity = null;
      this.components.delete(componentName);
      return true;
    }
    return false;
  }

  /**
   * 获取所有组件
   * @returns {Array<Component>} 组件数组
   */
  getAllComponents() {
    return Array.from(this.components.values());
  }

  /**
   * 添加标签
   * @param {string} tag - 标签名称
   * @returns {Entity} 返回实体本身，支持链式调用
   */
  addTag(tag) {
    this.tags.add(tag);
    return this;
  }

  /**
   * 移除标签
   * @param {string} tag - 标签名称
   * @returns {boolean} 是否成功移除
   */
  removeTag(tag) {
    return this.tags.delete(tag);
  }

  /**
   * 检查是否拥有指定标签
   * @param {string} tag - 标签名称
   * @returns {boolean} 是否拥有该标签
   */
  hasTag(tag) {
    return this.tags.has(tag);
  }

  /**
   * 获取所有标签
   * @returns {Array<string>} 标签数组
   */
  getAllTags() {
    return Array.from(this.tags);
  }

  /**
   * 启用实体
   */
  enable() {
    this.enabled = true;
  }

  /**
   * 禁用实体
   */
  disable() {
    this.enabled = false;
  }

  /**
   * 检查实体是否启用
   * @returns {boolean} 是否启用
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * 销毁实体，释放资源
   */
  destroy() {
    this.components.forEach(component => {
      component.entity = null;
    });
    this.components.clear();
    this.tags.clear();
  }

  /**
   * 转换为字符串表示
   * @returns {string} 实体描述
   */
  toString() {
    const componentNames = Array.from(this.components.keys()).join(', ');
    const tagNames = Array.from(this.tags).join(', ');
    return `Entity[${this.id}] (Components: ${componentNames}, Tags: ${tagNames})`;
  }
}