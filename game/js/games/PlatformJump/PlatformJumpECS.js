// PlatformJumpECS 基于ECS架构的平台跳跃游戏
import BaseGame from '../../base/BaseGame.js';
import World from '../../engine/core/World.js';
import Entity from '../../engine/core/Entity.js';
import Transform from '../../engine/components/Transform.js';
import Sprite from '../../engine/components/Sprite.js';
import Physics from '../../engine/components/Physics.js';
import RenderSystem from '../../engine/systems/RenderSystem.js';
import PhysicsSystem from '../../engine/systems/PhysicsSystem.js';

export default class PlatformJumpECS extends BaseGame {
  /**
   * 获取游戏配置信息
   * @returns {Object} 游戏配置信息
   */
  static getConfig() {
    return {
      name: '平台跳跃ECS',
      previewImage: 'images/PlatformJump/platform_jump.png'
    };
  }

  /**
   * 构造函数
   * @param {Canvas} canvas - Canvas对象
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {function} returnCallback - 返回主菜单的回调函数
   */
  constructor(canvas, ctx, returnCallback) {
    super(canvas, ctx, returnCallback);
    
    // 游戏状态常量
    this.GAME_STATUS = {
      READY: 0,
      PLAYING: 1,
      GAME_OVER: 2
    };
    
    // 游戏配置
    this.config = {
      gravity: 1200,
      jumpForce: -400,
      playerSpeed: 200,
      cameraSpeed: 100,
      platformWidth: 80,
      platformHeight: 20,
      platformGap: 150,
      platformMinY: 100,
      platformMaxY: 400,
      maxPlatforms: 10,
      scorePerPlatform: 10,
      initialLives: 3
    };
    
    // ECS世界
    this.world = null;
    this.playerEntity = null;
    this.cameraEntity = null;
    
    // 游戏状态
    this.gameStatus = this.GAME_STATUS.READY;
    this.score = 0;
    this.highScore = 0; // 将在init方法中安全加载
    this.lives = this.config.initialLives;
    
    // 游戏控制
    this.keys = {
      left: false,
      right: false,
      jump: false
    };
    
    // 按钮配置
    this.backButton = {
      x: 20,
      y: 20,
      width: 120,
      height: 40,
      text: '返回主菜单',
      color: '#4ecdc4',
      textColor: '#ffffff'
    };
    
    this.restartButton = {
      x: (canvas.width - 150) / 2,
      y: canvas.height / 2 + 50,
      width: 150,
      height: 50,
      text: '重新开始',
      color: '#4ecdc4',
      textColor: '#ffffff'
    };
    
    // 初始化ECS世界
    this.initECSWorld();
  }

  /**
   * 初始化ECS世界
   */
  initECSWorld() {
    // 创建世界
    this.world = new World('PlatformJumpWorld');
    
    // 添加系统
    this.world.addSystem(new RenderSystem(this.world, this.ctx));
    this.world.addSystem(new PhysicsSystem(this.world));
    
    // 设置物理系统参数
    const physicsSystem = this.world.getSystem('PhysicsSystem');
    if (physicsSystem) {
      physicsSystem.setGravity(0, this.config.gravity);
      physicsSystem.setWorldBounds({
        x: 0,
        y: 0,
        width: this.canvas.width,
        height: this.canvas.height * 10 // 更大的世界高度
      });
    }
    
    // 创建相机实体
    this.createCameraEntity();
    
    // 创建玩家实体
    this.createPlayerEntity();
    
    // 创建初始平台
    this.createInitialPlatforms();
    
    // 创建背景元素
    this.createBackgroundElements();
    
    console.log('ECS World initialized');
  }

  /**
   * 创建相机实体
   */
  createCameraEntity() {
    this.cameraEntity = this.world.createEntity('camera');
    this.cameraEntity.addComponent(new Transform({
      x: 0,
      y: 0
    }));
    
    // 添加相机组件
    const cameraComponent = {
      name: 'Camera',
      targetY: 0,
      speed: this.config.cameraSpeed,
      update: function(deltaTime) {
        // 相机跟随逻辑
        const transform = this.entity.getComponent(Transform);
        const camera = this;
        
        // 平滑跟随目标位置
        transform.y += (camera.targetY - transform.y) * camera.speed * deltaTime;
      }
    };
    this.cameraEntity.addComponent(cameraComponent);
    
    // 手动设置entity引用，因为这不是一个Component实例
    cameraComponent.entity = this.cameraEntity;
  }

  /**
   * 创建玩家实体
   */
  createPlayerEntity() {
    this.playerEntity = this.world.createEntity('player');
    
    // 添加变换组件
    this.playerEntity.addComponent(new Transform({
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      width: 30,
      height: 40
    }));
    
    // 添加精灵组件
    this.playerEntity.addComponent(new Sprite({
      width: 30,
      height: 40,
      color: '#ff6b6b',
      visible: true
    }));
    
    // 添加物理组件
    this.playerEntity.addComponent(new Physics({
      mass: 1,
      friction: 0.1,
      airResistance: 0.01,
      bounceFactor: 0.2,
      collisionShape: 'rectangle',
      collisionWidth: 30,
      collisionHeight: 40,
      collisionEnabled: true,
      isKinematic: false,
      isStatic: false
    }));
    
    // 添加玩家控制组件
    const playerControllerComponent = {
      name: 'PlayerController',
      speed: this.config.playerSpeed,
      jumpForce: this.config.jumpForce,
      isOnGround: false,
      isJumping: false,
      
      update: function(deltaTime) {
        const transform = this.entity.getComponent(Transform);
        const physics = this.entity.getComponent(Physics);
        
        // 处理玩家输入
        if (this.keys.left) {
          physics.velocityX = -this.speed;
        } else if (this.keys.right) {
          physics.velocityX = this.speed;
        } else {
          physics.velocityX *= 0.8; // 摩擦力
        }
        
        // 处理跳跃
        if (this.keys.jump && this.isOnGround) {
          physics.velocityY = this.jumpForce;
          this.isJumping = true;
          this.isOnGround = false;
        }
        
        // 更新相机目标位置
        const camera = this.platformJumpECS.cameraEntity.getComponent('Camera');
        if (camera) {
          camera.targetY = Math.min(transform.y - this.canvas.height / 3, 0);
        }
        
        // 检查是否掉出屏幕
        if (transform.y > this.canvas.height + 100) {
          this.loseLife();
        }
      }
    };
    this.playerEntity.addComponent(playerControllerComponent);
    
    // 手动设置entity引用，因为这不是一个Component实例
    playerControllerComponent.entity = this.playerEntity;
    
    // 设置组件引用
    const playerController = this.playerEntity.getComponent('PlayerController');
    playerController.keys = this.keys;
    playerController.cameraEntity = this.cameraEntity;
    playerController.canvas = this.canvas;
    playerController.loseLife = this.loseLife.bind(this);
    playerController.platformJumpECS = this; // Add reference to parent instance
  }

  /**
   * 创建初始平台
   */
  createInitialPlatforms() {
    // 创建起始平台
    this.createPlatform(
      this.canvas.width / 2 - this.config.platformWidth / 2,
      this.canvas.height - 100,
      this.config.platformWidth,
      this.config.platformHeight,
      '#4ecdc4'
    );
    
    // 创建一些随机平台
    for (let i = 0; i < 5; i++) {
      this.createRandomPlatform();
    }
  }

  /**
   * 创建平台实体
   */
  createPlatform(x, y, width, height, color) {
    const platform = this.world.createEntity(`platform_${Date.now()}`);
    
    platform.addComponent(new Transform({
      x: x,
      y: y,
      width: width,
      height: height
    }));
    
    platform.addComponent(new Sprite({
      width: width,
      height: height,
      color: color,
      visible: true
    }));
    
    platform.addComponent(new Physics({
      mass: 0, // 静态物体质量为0
      isStatic: true,
      collisionShape: 'rectangle',
      collisionWidth: width,
      collisionHeight: height,
      collisionEnabled: true
    }));
    
    return platform;
  }

  /**
   * 创建随机平台
   */
  createRandomPlatform() {
    const colors = ['#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const minX = 50;
    const maxX = this.canvas.width - 50 - this.config.platformWidth;
    const x = Math.random() * (maxX - minX) + minX;
    
    // 基于最后一个平台的位置生成新平台
    const platforms = this.world.getEntitiesByTag('platform');
    let lastY = this.canvas.height - 100;
    
    if (platforms.length > 0) {
      const lastPlatform = platforms[platforms.length - 1];
      const lastTransform = lastPlatform.getComponent(Transform);
      lastY = lastTransform.y;
    }
    
    const y = lastY - this.config.platformGap;
    
    if (y >= this.config.platformMinY) {
      return this.createPlatform(x, y, this.config.platformWidth, this.config.platformHeight, color);
    }
    
    return null;
  }

  /**
   * 创建背景元素
   */
  createBackgroundElements() {
    for (let i = 0; i < 20; i++) {
      this.createBackgroundElement(i);
    }
  }

  /**
   * 创建背景元素实体
   */
  createBackgroundElement(index) {
    const element = this.world.createEntity(`bg_element_${index}`);
    
    const type = Math.random() > 0.5 ? 'cloud' : 'star';
    const width = type === 'cloud' ? Math.random() * 30 + 20 : Math.random() * 5 + 2;
    const height = type === 'cloud' ? Math.random() * 20 + 10 : width;
    
    element.addComponent(new Transform({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height * 3,
      width: width,
      height: height
    }));
    
    element.addComponent(new Sprite({
      width: width,
      height: height,
      color: type === 'cloud' ? '#ffffff' : '#ffff00',
      visible: true
    }));
    
    // 添加背景元素组件
    const bgElementComponent = {
      name: 'BackgroundElement',
      type: type,
      speed: Math.random() * 0.5 + 0.1,
      
      update: function(deltaTime) {
        const transform = this.entity.getComponent(Transform);
        
        // 背景元素缓慢向下移动
        transform.y += this.speed;
        
        // 如果移出屏幕，重置到顶部
        if (transform.y > this.canvas.height + transform.height) {
          transform.y = -transform.height;
          transform.x = Math.random() * this.canvas.width;
        }
      }
    };
    element.addComponent(bgElementComponent);
    
    // 手动设置entity引用，因为这不是一个Component实例
    bgElementComponent.entity = element;
    bgElementComponent.canvas = this.canvas;
    
    return element;
  }

  /**
   * 游戏初始化
   */
  init() {
    super.init();
    
    // 安全地加载最高分
    try {
      if (typeof wx !== 'undefined' && wx.getStorageSync) {
        this.highScore = wx.getStorageSync('platformJumpECSHighScore') || 0;
      } else if (typeof localStorage !== 'undefined') {
        const savedScore = localStorage.getItem('platformJumpECSHighScore');
        this.highScore = savedScore ? parseInt(savedScore) : 0;
      }
    } catch (e) {
      console.warn('Failed to load high score:', e);
      this.highScore = 0;
    }
    
    this.resetGame();
    console.log('PlatformJumpECS initialized');
  }
  
  /**
   * 重置游戏
   */
  resetGame() {
    // 重置游戏状态
    this.gameStatus = this.GAME_STATUS.READY;
    this.score = 0;
    this.lives = this.config.initialLives;
    
    // 重置玩家位置
    const playerTransform = this.playerEntity.getComponent(Transform);
    const playerPhysics = this.playerEntity.getComponent(Physics);
    
    playerTransform.x = this.canvas.width / 2;
    playerTransform.y = this.canvas.height / 2;
    playerPhysics.velocityX = 0;
    playerPhysics.velocityY = 0;
    
    // 重置相机
    const cameraTransform = this.cameraEntity.getComponent(Transform);
    const camera = this.cameraEntity.getComponent('Camera');
    
    cameraTransform.y = 0;
    camera.targetY = 0;
    
    // 清空所有平台
    const platforms = this.world.getEntitiesByTag('platform');
    platforms.forEach(platform => {
      this.world.removeEntity(platform);
    });
    
    // 重新创建初始平台
    this.createInitialPlatforms();
  }

  /**
   * 游戏每帧逻辑
   */
  loop() {
    if (!this.isRunning) return;
    
    // 清空画布
    this.ctx.fillStyle = '#87ceeb';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 更新ECS世界
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
    this.lastUpdateTime = currentTime;
    
    this.world.update(deltaTime);
    
    // 根据游戏状态执行不同逻辑
    switch (this.gameStatus) {
      case this.GAME_STATUS.READY:
        this.drawScore();
        this.drawLives();
        this.drawReadyText();
        break;
      
      case this.GAME_STATUS.PLAYING:
        this.updateGameLogic(deltaTime);
        this.drawScore();
        this.drawLives();
        break;
      
      case this.GAME_STATUS.GAME_OVER:
        this.drawScore();
        this.drawLives();
        this.drawGameOverText();
        this.drawRestartButton();
        break;
    }
    
    // 绘制返回按钮
    this.drawBackButton();
  }
  
  /**
   * 更新游戏逻辑
   */
  updateGameLogic(deltaTime) {
    // 安全检查deltaTime
    if (!deltaTime || deltaTime <= 0) {
      deltaTime = 0.016; // 默认60FPS
    }
    
    // 限制deltaTime避免过大值
    deltaTime = Math.min(deltaTime, 0.1);
    
    // 检查平台生成
    this.checkPlatformGeneration();
    
    // 检查碰撞
    this.checkCollisions();
  }
  
  /**
   * 检查平台生成
   */
  checkPlatformGeneration() {
    const platforms = this.world.getEntitiesByTag('platform');
    const playerTransform = this.playerEntity.getComponent(Transform);
    
    // 安全检查
    if (!playerTransform) return;
    
    // 移除屏幕外的平台并生成新平台
    for (let i = platforms.length - 1; i >= 0; i--) {
      const platform = platforms[i];
      const platformTransform = platform.getComponent(Transform);
      
      // 安全检查
      if (!platformTransform) continue;
      
      // 如果平台在屏幕下方太远，移除它
      if (platformTransform.y - playerTransform.y > this.canvas.height + 100) {
        this.world.removeEntity(platform);
        this.score += this.config.scorePerPlatform;
        
        // 更新最高分
        if (this.score > this.highScore) {
          this.highScore = this.score;
          // 使用安全的存储方法
          try {
            if (typeof wx !== 'undefined' && wx.setStorageSync) {
              wx.setStorageSync('platformJumpECSHighScore', this.highScore);
            } else if (typeof localStorage !== 'undefined') {
              localStorage.setItem('platformJumpECSHighScore', this.highScore.toString());
            }
          } catch (e) {
            console.warn('Failed to save high score:', e);
          }
        }
        
        // 生成新平台
        this.createRandomPlatform();
      }
    }
  }
  
  /**
   * 检查碰撞
   */
  checkCollisions() {
    const playerController = this.playerEntity.getComponent('PlayerController');
    const playerTransform = this.playerEntity.getComponent(Transform);
    const playerPhysics = this.playerEntity.getComponent(Physics);
    const platforms = this.world.getEntitiesByTag('platform');
    
    // 安全检查
    if (!playerController || !playerTransform || !playerPhysics) {
      return;
    }
    
    playerController.isOnGround = false;
    
    for (const platform of platforms) {
      const platformTransform = platform.getComponent(Transform);
      const platformPhysics = platform.getComponent(Physics);
      
      // 安全检查
      if (!platformTransform || !platformPhysics) {
        continue;
      }
      
      // 检查碰撞
      const collision = playerPhysics.checkCollision(platformPhysics, playerTransform, platformTransform);
      
      if (collision) {
        // 玩家站在平台上
        if (playerPhysics.velocityY > 0 && 
            playerTransform.y + playerTransform.height / 2 <= platformTransform.y &&
            playerTransform.y + playerTransform.height / 2 + playerPhysics.velocityY * 0.016 > platformTransform.y) {
          
          playerTransform.y = platformTransform.y - playerTransform.height / 2;
          playerPhysics.velocityY = 0;
          playerController.isOnGround = true;
          playerController.isJumping = false;
        }
      }
    }
  }
  
  /**
   * 失去生命值
   */
  loseLife() {
    this.lives--;
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // 重置玩家位置
      const playerTransform = this.playerEntity.getComponent(Transform);
      const playerPhysics = this.playerEntity.getComponent(Physics);
      const camera = this.cameraEntity.getComponent('Camera');
      
      // 安全检查
      if (!playerTransform || !playerPhysics) return;
      
      playerTransform.x = this.canvas.width / 2;
      
      // 安全检查相机组件
      if (camera) {
        playerTransform.y = camera.targetY + this.canvas.height / 2;
      } else {
        playerTransform.y = this.canvas.height / 2;
      }
      
      playerPhysics.velocityX = 0;
      playerPhysics.velocityY = 0;
      
      const playerController = this.playerEntity.getComponent('PlayerController');
      if (playerController) {
        playerController.isJumping = false;
        playerController.isOnGround = false;
      }
    }
  }
  
  /**
   * 游戏结束
   */
  gameOver() {
    this.gameStatus = this.GAME_STATUS.GAME_OVER;
  }
  
  /**
   * 绘制分数
   */
  drawScore() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`分数: ${this.score}`, 20, 40);
    this.ctx.fillText(`最高分: ${this.highScore}`, 20, 70);
  }
  
  /**
   * 绘制生命值
   */
  drawLives() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`生命: ${this.lives}`, this.canvas.width - 20, 40);
  }
  
  /**
   * 绘制准备开始文字
   */
  drawReadyText() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('点击屏幕开始游戏', this.canvas.width / 2, this.canvas.height / 2);
  }
  
  /**
   * 绘制游戏结束文字
   */
  drawGameOverText() {
    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
  }
  
  /**
   * 绘制返回按钮
   */
  drawBackButton() {
    // 绘制按钮背景
    this.ctx.fillStyle = this.backButton.color;
    this.ctx.fillRect(this.backButton.x, this.backButton.y, this.backButton.width, this.backButton.height);
    
    // 绘制按钮边框
    this.ctx.strokeStyle = '#26a69a';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.backButton.x, this.backButton.y, this.backButton.width, this.backButton.height);
    
    // 绘制按钮文字
    this.ctx.fillStyle = this.backButton.textColor;
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      this.backButton.text,
      this.backButton.x + this.backButton.width / 2,
      this.backButton.y + this.backButton.height / 2
    );
  }
  
  /**
   * 绘制重新开始按钮
   */
  drawRestartButton() {
    // 绘制按钮背景
    this.ctx.fillStyle = this.restartButton.color;
    this.ctx.fillRect(this.restartButton.x, this.restartButton.y, this.restartButton.width, this.restartButton.height);
    
    // 绘制按钮边框
    this.ctx.strokeStyle = '#26a69a';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.restartButton.x, this.restartButton.y, this.restartButton.width, this.restartButton.height);
    
    // 绘制按钮文字
    this.ctx.fillStyle = this.restartButton.textColor;
    this.ctx.font = '18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      this.restartButton.text,
      this.restartButton.x + this.restartButton.width / 2,
      this.restartButton.y + this.restartButton.height / 2
    );
  }

  /**
   * 处理触摸事件
   * @param {number} x - 点击x坐标
   * @param {number} y - 点击y坐标
   */
  handleTouch(x, y) {
    // 检查返回按钮点击
    if (x >= this.backButton.x && x <= this.backButton.x + this.backButton.width &&
        y >= this.backButton.y && y <= this.backButton.y + this.backButton.height) {
      if (this.returnCallback) {
        this.returnCallback();
      }
      return;
    }
    
    // 根据游戏状态处理不同的触摸事件
    switch (this.gameStatus) {
      case this.GAME_STATUS.READY:
        // 开始游戏
        this.gameStatus = this.GAME_STATUS.PLAYING;
        break;
      
      case this.GAME_STATUS.PLAYING:
        // 处理游戏内触摸（跳跃）
        this.keys.jump = true;
        break;
      
      case this.GAME_STATUS.GAME_OVER:
        // 检查重新开始按钮点击
        if (x >= this.restartButton.x && x <= this.restartButton.x + this.restartButton.width &&
            y >= this.restartButton.y && y <= this.restartButton.y + this.restartButton.height) {
          // 重新开始游戏
          this.resetGame();
          this.gameStatus = this.GAME_STATUS.PLAYING;
        }
        break;
    }
  }

  /**
   * 处理触摸结束事件
   */
  handleTouchEnd() {
    this.keys.jump = false;
  }

  /**
   * 处理键盘输入
   * @param {string} key - 按键名称
   * @param {boolean} isDown - 是否按下
   */
  handleKey(key, isDown) {
    switch (key) {
      case 'ArrowLeft':
      case 'a':
        this.keys.left = isDown;
        break;
      case 'ArrowRight':
      case 'd':
        this.keys.right = isDown;
        break;
      case 'ArrowUp':
      case 'w':
      case ' ':
        this.keys.jump = isDown;
        break;
    }
  }

  /**
   * 游戏释放资源，回到主界面时调用
   */
  release() {
    super.release();
    if (this.world) {
      this.world.destroy();
    }
    console.log('PlatformJumpECS released');
  }
}