/**
 * World 世界类
 * 管理实体、组件和系统的容器
 */
export default class World {
  /**
   * 构造函数
   * @param {string} name - 世界名称
   */
  constructor(name = 'DefaultWorld') {
    this.name = name;
    this.entities = new Map();
    this.systems = new Map();
    this.entityCounter = 0;
    this.isRunning = false;
    this.lastUpdateTime = 0;
    
    // 事件监听器
    this.eventListeners = new Map();
  }

  /**
   * 创建新实体
   * @param {string} id - 实体ID，如果未提供则自动生成
   * @returns {Entity} 新创建的实体
   */
  createEntity(id = null) {
    const entity = new Entity(id);
    this.addEntity(entity);
    return entity;
  }

  /**
   * 添加实体到世界
   * @param {Entity} entity - 要添加的实体
   * @returns {boolean} 是否成功添加
   */
  addEntity(entity) {
    if (this.entities.has(entity.id)) {
      console.warn(`Entity with id ${entity.id} already exists in world ${this.name}`);
      return false;
    }

    this.entities.set(entity.id, entity);
    this.entityCounter++;

    // 通知所有系统有新实体添加
    this.systems.forEach(system => {
      if (system.matches(entity)) {
        system.onEntityAdded(entity);
      }
    });

    this.emit('entityAdded', entity);
    return true;
  }

  /**
   * 从世界移除实体
   * @param {string|Entity} entityOrId - 实体ID或实体对象
   * @returns {boolean} 是否成功移除
   */
  removeEntity(entityOrId) {
    const entityId = typeof entityOrId === 'string' ? entityOrId : entityOrId.id;
    const entity = this.entities.get(entityId);
    
    if (!entity) {
      return false;
    }

    // 通知所有系统有实体移除
    this.systems.forEach(system => {
      if (system.matches(entity)) {
        system.onEntityRemoved(entity);
      }
    });

    entity.destroy();
    this.entities.delete(entityId);
    this.emit('entityRemoved', entity);
    
    return true;
  }

  /**
   * 根据ID获取实体
   * @param {string} entityId - 实体ID
   * @returns {Entity|null} 实体对象，如果不存在则返回null
   */
  getEntity(entityId) {
    return this.entities.get(entityId) || null;
  }

  /**
   * 获取所有实体
   * @returns {Array<Entity>} 实体数组
   */
  getEntities() {
    return Array.from(this.entities.values());
  }

  /**
   * 根据组件类型获取实体
   * @param {Array<Function>} componentClasses - 组件类数组
   * @returns {Array<Entity>} 满足条件的实体数组
   */
  getEntitiesWithComponents(componentClasses) {
    return this.getEntities().filter(entity => {
      return componentClasses.every(ComponentClass => entity.hasComponent(ComponentClass));
    });
  }

  /**
   * 根据标签获取实体
   * @param {string} tag - 标签名称
   * @returns {Array<Entity>} 拥有该标签的实体数组
   */
  getEntitiesByTag(tag) {
    return this.getEntities().filter(entity => entity.hasTag(tag));
  }

  /**
   * 添加系统到世界
   * @param {System} system - 要添加的系统
   * @returns {boolean} 是否成功添加
   */
  addSystem(system) {
    const systemName = system.getName();
    
    if (this.systems.has(systemName)) {
      console.warn(`System ${systemName} already exists in world ${this.name}`);
      return false;
    }

    system.world = this;
    this.systems.set(systemName, system);
    
    // 初始化系统
    system.init();
    
    // 为系统匹配现有实体
    this.entities.forEach(entity => {
      if (system.matches(entity)) {
        system.onEntityAdded(entity);
      }
    });

    this.emit('systemAdded', system);
    return true;
  }

  /**
   * 从世界移除系统
   * @param {string|System} systemOrName - 系统名称或系统对象
   * @returns {boolean} 是否成功移除
   */
  removeSystem(systemOrName) {
    const systemName = typeof systemOrName === 'string' ? systemOrName : systemOrName.getName();
    const system = this.systems.get(systemName);
    
    if (!system) {
      return false;
    }

    system.destroy();
    this.systems.delete(systemName);
    this.emit('systemRemoved', system);
    
    return true;
  }

  /**
   * 根据名称获取系统
   * @param {string} systemName - 系统名称
   * @returns {System|null} 系统对象，如果不存在则返回null
   */
  getSystem(systemName) {
    return this.systems.get(systemName) || null;
  }

  /**
   * 获取所有系统
   * @returns {Array<System>} 系统数组
   */
  getSystems() {
    return Array.from(this.systems.values());
  }

  /**
   * 启动世界运行
   */
  start() {
    if (this.isRunning) {
      console.warn(`World ${this.name} is already running`);
      return;
    }

    this.isRunning = true;
    this.lastUpdateTime = Date.now();
    this.emit('worldStarted', this);
    
    console.log(`World ${this.name} started`);
  }

  /**
   * 停止世界运行
   */
  stop() {
    if (!this.isRunning) {
      console.warn(`World ${this.name} is not running`);
      return;
    }

    this.isRunning = false;
    this.emit('worldStopped', this);
    
    console.log(`World ${this.name} stopped`);
  }

  /**
   * 更新世界状态
   * @param {number} currentTime - 当前时间戳（毫秒）
   */
  update(currentTime = Date.now()) {
    if (!this.isRunning) {
      return;
    }

    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
    this.lastUpdateTime = currentTime;

    // 按优先级排序系统
    const sortedSystems = this.getSystems().sort((a, b) => a.getPriority() - b.getPriority());

    // 更新所有启用的系统
    sortedSystems.forEach(system => {
      if (system.isEnabled()) {
        system.update(deltaTime);
      }
    });

    this.emit('worldUpdated', { deltaTime, currentTime });
  }

  /**
   * 清空世界（移除所有实体和系统）
   */
  clear() {
    // 移除所有系统
    this.systems.forEach(system => {
      system.destroy();
    });
    this.systems.clear();

    // 移除所有实体
    this.entities.forEach(entity => {
      entity.destroy();
    });
    this.entities.clear();

    this.entityCounter = 0;
    this.emit('worldCleared', this);
  }

  /**
   * 销毁世界，释放所有资源
   */
  destroy() {
    this.stop();
    this.clear();
    this.eventListeners.clear();
    this.emit('worldDestroyed', this);
  }

  /**
   * 添加事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   */
  on(eventName, listener) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(listener);
  }

  /**
   * 移除事件监听器
   * @param {string} eventName - 事件名称
   * @param {Function} listener - 监听器函数
   */
  off(eventName, listener) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   * @param {string} eventName - 事件名称
   * @param {*} data - 事件数据
   */
  emit(eventName, data) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * 获取世界统计信息
   * @returns {Object} 统计信息对象
   */
  getStats() {
    return {
      name: this.name,
      entityCount: this.entities.size,
      systemCount: this.systems.size,
      isRunning: this.isRunning,
      entityCounter: this.entityCounter
    };
  }

  /**
   * 转换为字符串表示
   * @returns {string} 世界描述
   */
  toString() {
    const stats = this.getStats();
    return `World[${stats.name}] (Entities: ${stats.entityCount}, Systems: ${stats.systemCount}, Running: ${stats.isRunning})`;
  }
}