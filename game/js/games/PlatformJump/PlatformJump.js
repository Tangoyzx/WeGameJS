// PlatformJump 平台跳跃游戏，继承自BaseGame
import BaseGame from '../../base/BaseGame.js';

export default class PlatformJump extends BaseGame {
  /**
   * 获取游戏配置信息
   * @returns {Object} 游戏配置信息
   */
  static getConfig() {
    return {
      name: '平台跳跃',
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
      gravity: 1200, // 重力加速度
      jumpForce: -400, // 跳跃力度
      playerSpeed: 200, // 玩家水平移动速度
      cameraSpeed: 100, // 相机跟随速度
      platformWidth: 80, // 平台宽度
      platformHeight: 20, // 平台高度
      platformGap: 150, // 平台间距
      platformMinY: 100, // 平台最小Y坐标
      platformMaxY: 400, // 平台最大Y坐标
      maxPlatforms: 10, // 最大平台数量
      scorePerPlatform: 10, // 每通过一个平台的得分
      initialLives: 3 // 初始生命值
    };
    
    // 游戏状态
    this.gameStatus = this.GAME_STATUS.READY;
    this.score = 0;
    this.highScore = wx.getStorageSync('platformJumpHighScore') || 0;
    this.lives = this.config.initialLives;
    
    // 玩家属性
    this.player = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: 30,
      height: 40,
      vx: 0,
      vy: 0,
      isJumping: false,
      isOnGround: false,
      color: '#ff6b6b'
    };
    
    // 相机属性
    this.camera = {
      x: 0,
      y: 0,
      targetY: 0
    };
    
    // 平台数组
    this.platforms = [];
    
    // 背景元素
    this.backgroundElements = [];
    
    // 游戏控制
    this.keys = {
      left: false,
      right: false,
      jump: false
    };
    
    // 返回按钮
    this.backButton = {
      x: 20,
      y: 20,
      width: 120,
      height: 40,
      text: '返回主菜单',
      color: '#4ecdc4',
      textColor: '#ffffff'
    };
    
    // 重新开始按钮
    this.restartButton = {
      x: (canvas.width - 150) / 2,
      y: canvas.height / 2 + 50,
      width: 150,
      height: 50,
      text: '重新开始',
      color: '#4ecdc4',
      textColor: '#ffffff'
    };
    
    // 初始化游戏
    this.initGame();
  }

  /**
   * 游戏初始化
   */
  init() {
    super.init();
    this.resetGame();
    console.log('PlatformJump initialized');
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
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isJumping = false;
    this.player.isOnGround = false;
    
    // 重置相机
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.targetY = 0;
    
    // 清空平台
    this.platforms = [];
    
    // 生成初始平台
    this.generateInitialPlatforms();
    
    // 生成背景元素
    this.generateBackgroundElements();
  }

  /**
   * 生成初始平台
   */
  generateInitialPlatforms() {
    // 生成起始平台
    this.platforms.push({
      x: this.canvas.width / 2 - this.config.platformWidth / 2,
      y: this.canvas.height - 100,
      width: this.config.platformWidth,
      height: this.config.platformHeight,
      color: '#4ecdc4'
    });
    
    // 生成一些随机平台
    for (let i = 0; i < 5; i++) {
      this.generatePlatform();
    }
  }

  /**
   * 生成新平台
   */
  generatePlatform() {
    if (this.platforms.length >= this.config.maxPlatforms) return;
    
    const lastPlatform = this.platforms[this.platforms.length - 1];
    const minX = 50;
    const maxX = this.canvas.width - 50 - this.config.platformWidth;
    
    // 随机生成平台位置
    const x = Math.random() * (maxX - minX) + minX;
    const y = lastPlatform.y - this.config.platformGap;
    
    // 确保平台在合理范围内
    if (y < this.config.platformMinY) return;
    
    this.platforms.push({
      x: x,
      y: y,
      width: this.config.platformWidth,
      height: this.config.platformHeight,
      color: this.getRandomPlatformColor()
    });
  }

  /**
   * 获取随机平台颜色
   */
  getRandomPlatformColor() {
    const colors = ['#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 生成背景元素
   */
  generateBackgroundElements() {
    this.backgroundElements = [];
    
    // 生成一些随机背景元素（云朵、星星等）
    for (let i = 0; i < 20; i++) {
      this.backgroundElements.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        width: Math.random() * 30 + 10,
        height: Math.random() * 20 + 5,
        color: '#ffffff',
        speed: Math.random() * 0.5 + 0.1,
        type: Math.random() > 0.5 ? 'cloud' : 'star'
      });
    }
  }

  /**
   * 游戏每帧逻辑
   */
  loop() {
    if (!this.isRunning) return;
    
    // 清空画布
    this.ctx.fillStyle = '#87ceeb';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 根据游戏状态执行不同逻辑
    switch (this.gameStatus) {
      case this.GAME_STATUS.READY:
        this.drawBackground();
        this.drawPlatforms();
        this.drawPlayer();
        this.drawScore();
        this.drawLives();
        this.drawReadyText();
        break;
      
      case this.GAME_STATUS.PLAYING:
        this.updatePlayer();
        this.updateCamera();
        this.updatePlatforms();
        this.checkCollisions();
        this.drawBackground();
        this.drawPlatforms();
        this.drawPlayer();
        this.drawScore();
        this.drawLives();
        break;
      
      case this.GAME_STATUS.GAME_OVER:
        this.drawBackground();
        this.drawPlatforms();
        this.drawPlayer();
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
   * 更新玩家状态
   */
  updatePlayer() {
    // 处理水平移动
    if (this.keys.left) {
      this.player.vx = -this.config.playerSpeed;
    } else if (this.keys.right) {
      this.player.vx = this.config.playerSpeed;
    } else {
      this.player.vx *= 0.8; // 摩擦力
    }
    
    // 处理跳跃
    if (this.keys.jump && this.player.isOnGround) {
      this.player.vy = this.config.jumpForce;
      this.player.isJumping = true;
      this.player.isOnGround = false;
    }
    
    // 应用重力
    this.player.vy += this.config.gravity / 60; // 假设60fps
    
    // 更新玩家位置
    this.player.x += this.player.vx / 60;
    this.player.y += this.player.vy / 60;
    
    // 边界检查
    if (this.player.x < this.player.width / 2) {
      this.player.x = this.player.width / 2;
    }
    if (this.player.x > this.canvas.width - this.player.width / 2) {
      this.player.x = this.canvas.width - this.player.width / 2;
    }
    
    // 检查是否掉出屏幕底部
    if (this.player.y > this.canvas.height + this.player.height) {
      this.loseLife();
    }
  }
  
  /**
   * 更新相机位置
   */
  updateCamera() {
    // 相机跟随玩家向上移动
    if (this.player.y < this.camera.targetY + this.canvas.height / 3) {
      this.camera.targetY = this.player.y - this.canvas.height / 3;
    }
    
    // 平滑移动相机
    this.camera.y += (this.camera.targetY - this.camera.y) * 0.1;
  }
  
  /**
   * 更新平台状态
   */
  updatePlatforms() {
    // 移除屏幕外的平台
    for (let i = this.platforms.length - 1; i >= 0; i--) {
      const platform = this.platforms[i];
      
      // 如果平台在屏幕下方太远，移除它
      if (platform.y - this.camera.y > this.canvas.height + 100) {
        this.platforms.splice(i, 1);
        this.score += this.config.scorePerPlatform;
        
        // 更新最高分
        if (this.score > this.highScore) {
          this.highScore = this.score;
          wx.setStorageSync('platformJumpHighScore', this.highScore);
        }
        
        // 生成新平台
        this.generatePlatform();
      }
    }
  }
  
  /**
   * 检查碰撞
   */
  checkCollisions() {
    this.player.isOnGround = false;
    
    for (const platform of this.platforms) {
      if (this.checkPlayerPlatformCollision(platform)) {
        // 玩家站在平台上
        if (this.player.vy > 0 && 
            this.player.y + this.player.height / 2 <= platform.y &&
            this.player.y + this.player.height / 2 + this.player.vy / 60 > platform.y) {
          
          this.player.y = platform.y - this.player.height / 2;
          this.player.vy = 0;
          this.player.isOnGround = true;
          this.player.isJumping = false;
        }
      }
    }
  }
  
  /**
   * 检查玩家与平台的碰撞
   */
  checkPlayerPlatformCollision(platform) {
    return this.player.x + this.player.width / 2 > platform.x &&
           this.player.x - this.player.width / 2 < platform.x + platform.width &&
           this.player.y + this.player.height / 2 > platform.y &&
           this.player.y - this.player.height / 2 < platform.y + platform.height;
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
      this.player.x = this.canvas.width / 2;
      this.player.y = this.camera.y + this.canvas.height / 2;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.isJumping = false;
      this.player.isOnGround = false;
    }
  }
  
  /**
   * 游戏结束
   */
  gameOver() {
    this.gameStatus = this.GAME_STATUS.GAME_OVER;
  }
  
  /**
   * 绘制背景
   */
  drawBackground() {
    // 绘制渐变背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#4682b4');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制背景元素
    for (const element of this.backgroundElements) {
      const screenY = element.y - this.camera.y * element.speed;
      
      // 如果元素移出屏幕，重置到顶部
      if (screenY > this.canvas.height) {
        element.y = this.camera.y - element.height;
        element.x = Math.random() * this.canvas.width;
      }
      
      this.ctx.fillStyle = element.color;
      
      if (element.type === 'cloud') {
        // 绘制云朵
        this.ctx.beginPath();
        this.ctx.arc(element.x, screenY, element.width / 2, 0, Math.PI * 2);
        this.ctx.arc(element.x + element.width / 3, screenY - element.height / 3, element.width / 3, 0, Math.PI * 2);
        this.ctx.arc(element.x - element.width / 3, screenY - element.height / 3, element.width / 3, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // 绘制星星
        this.ctx.fillRect(element.x, screenY, element.width, element.height);
      }
    }
  }
  
  /**
   * 绘制平台
   */
  drawPlatforms() {
    for (const platform of this.platforms) {
      const screenY = platform.y - this.camera.y;
      
      // 只绘制屏幕内的平台
      if (screenY > -platform.height && screenY < this.canvas.height) {
        // 绘制平台主体
        this.ctx.fillStyle = platform.color;
        this.ctx.fillRect(platform.x, screenY, platform.width, platform.height);
        
        // 绘制平台阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(platform.x, screenY + platform.height, platform.width, 2);
      }
    }
  }
  
  /**
   * 绘制玩家
   */
  drawPlayer() {
    const screenY = this.player.y - this.camera.y;
    
    // 绘制玩家身体
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(
      this.player.x - this.player.width / 2,
      screenY - this.player.height / 2,
      this.player.width,
      this.player.height
    );
    
    // 绘制玩家眼睛
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(
      this.player.x - this.player.width / 4,
      screenY - this.player.height / 4,
      5,
      5
    );
    this.ctx.fillRect(
      this.player.x + this.player.width / 4 - 5,
      screenY - this.player.height / 4,
      5,
      5
    );
    
    // 绘制玩家嘴巴（根据跳跃状态）
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    if (this.player.isJumping) {
      this.ctx.arc(this.player.x, screenY + this.player.height / 4, 5, 0, Math.PI);
    } else {
      this.ctx.moveTo(this.player.x - 5, screenY + this.player.height / 4);
      this.ctx.lineTo(this.player.x + 5, screenY + this.player.height / 4);
    }
    this.ctx.stroke();
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
    console.log('PlatformJump released');
  }
}