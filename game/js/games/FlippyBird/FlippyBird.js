// FlippyBird游戏，继承自BaseGame
import BaseGame from '../../base/BaseGame';

export default class FlippyBird extends BaseGame {
  /**
   * 获取游戏配置信息
   * @returns {Object} 游戏配置信息
   */
  static getConfig() {
    return {
      name: 'FlippyBird',
      previewImage: 'images/FlippyBird/flippy_bird.png'
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
      gravity: 0.5,
      jumpForce: -8,
      birdRadius: 20,
      pipeWidth: 60,
      pipeGap: 220,
      pipeSpeed: 3,
      pipeInterval: 1500,
      maxLives: 3,
      invincibilityTime: 1000, // 无敌时间，单位毫秒
      healItem: {
        probability: 0.2, // 20%概率生成
        radius: 15, // 道具半径
        color: '#00ff00', // 道具颜色
        speed: 3 // 道具移动速度
      }
    };
    
    // 游戏状态
    this.gameStatus = this.GAME_STATUS.READY;
    this.score = 0;
    this.highScore = wx.getStorageSync('flippyBirdHighScore') || 0;
    this.lives = this.config.maxLives;
    this.isInvincible = false;
    this.invincibilityEndTime = 0;
    
    // 小鸟属性
    this.bird = {
      x: 80,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      radius: this.config.birdRadius,
      color: '#ffd700'
    };
    
    // 管道数组
    this.pipes = [];
    this.lastPipeTime = 0;
    
    // 回血道具数组
    this.healItems = [];
    this.canGenerateHealItem = true; // 是否可以生成回血道具
    
    // 地面属性
    this.ground = {
      y: canvas.height - 80,
      color: '#8b4513'
    };
    
    // 背景颜色
    this.bgColor = '#87ceeb';
    
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
  }

  /**
   * 游戏初始化
   */
  init() {
    super.init();
    this.resetGame();
    console.log('FlippyBird initialized');
  }
  
  /**
   * 重置游戏
   */
  resetGame() {
    // 重置游戏状态
    this.gameStatus = this.GAME_STATUS.READY;
    this.score = 0;
    this.lives = this.config.maxLives;
    this.isInvincible = false;
    this.invincibilityEndTime = 0;
    
    // 重置小鸟位置和速度
    this.bird.x = 80;
    this.bird.y = this.canvas.height / 2;
    this.bird.vy = 0;
    
    // 清空管道
    this.pipes = [];
    this.lastPipeTime = 0;
    
    // 清空回血道具
    this.healItems = [];
    this.canGenerateHealItem = true;
  }

  /**
   * 游戏每帧逻辑
   */
  loop() {
    if (!this.isRunning) return;
    
    // 清空画布
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 绘制地面
    this.drawGround();
    
    // 根据游戏状态执行不同逻辑
    switch (this.gameStatus) {
      case this.GAME_STATUS.READY:
        this.drawBird();
        this.drawLives();
        this.drawReadyText();
        break;
      
      case this.GAME_STATUS.PLAYING:
        this.updateBird();
        this.updatePipes();
        this.updateHealItems();
        this.checkCollisions();
        this.drawBird();
        this.drawLives();
        this.drawPipes();
        this.drawHealItems();
        this.drawScore();
        break;
      
      case this.GAME_STATUS.GAME_OVER:
        this.drawBird();
        this.drawLives();
        this.drawPipes();
        this.drawScore();
        this.drawGameOverText();
        this.drawRestartButton();
        break;
    }
    
    // 绘制返回按钮
    this.drawBackButton();
  }
  
  /**
   * 更新小鸟状态
   */
  updateBird() {
    // 应用重力
    this.bird.vy += this.config.gravity;
    
    // 更新小鸟位置
    this.bird.y += this.bird.vy;
    
    // 限制小鸟位置，防止飞出屏幕
    if (this.bird.y - this.bird.radius < 0) {
      this.bird.y = this.bird.radius;
      this.bird.vy = 0;
    }
    
    // 更新无敌状态
    if (this.isInvincible) {
      const now = Date.now();
      if (now > this.invincibilityEndTime) {
        this.isInvincible = false;
      }
    }
  }
  
  /**
   * 更新管道状态
   */
  updatePipes() {
    // 生成新管道
    const now = Date.now();
    if (now - this.lastPipeTime > this.config.pipeInterval) {
      this.generatePipe();
      this.lastPipeTime = now;
    }
    
    // 更新管道位置
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.x -= this.config.pipeSpeed;
      
      // 检查管道是否超出屏幕，超出则移除
      if (pipe.x + this.config.pipeWidth < 0) {
        this.pipes.splice(i, 1);
      } else {
        // 检查是否穿过管道，得分
        if (!pipe.passed && pipe.x + this.config.pipeWidth < this.bird.x) {
          pipe.passed = true;
          this.score++;
          // 更新最高分
          if (this.score > this.highScore) {
            this.highScore = this.score;
            wx.setStorageSync('flippyBirdHighScore', this.highScore);
          }
        }
      }
    }
  }
  
  /**
   * 生成管道
   */
  generatePipe() {
    // 随机生成管道高度
    const minHeight = 80;
    const maxHeight = this.ground.y - minHeight - this.config.pipeGap;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    // 创建上下管道
    const pipe = {
      x: this.canvas.width,
      topHeight: topHeight,
      bottomHeight: this.ground.y - topHeight - this.config.pipeGap,
      passed: false,
      color: '#228b22'
    };
    
    this.pipes.push(pipe);
    
    // 生成回血道具 - 20%概率，且不能连续生成
    if (this.canGenerateHealItem && Math.random() < this.config.healItem.probability) {
      // 在管道间隙中随机位置生成
      const gapTop = topHeight;
      const gapBottom = topHeight + this.config.pipeGap;
      const itemY = Math.floor(Math.random() * (gapBottom - gapTop - this.config.healItem.radius * 2)) + gapTop + this.config.healItem.radius;
      
      const healItem = {
        x: this.canvas.width + this.config.pipeWidth / 2,
        y: itemY,
        radius: this.config.healItem.radius,
        color: this.config.healItem.color
      };
      
      this.healItems.push(healItem);
      this.canGenerateHealItem = false; // 标记为不能生成，防止连续生成
    } else {
      this.canGenerateHealItem = true; // 本次没生成，下次可以生成
    }
  }
  
  /**
   * 更新回血道具
   */
  updateHealItems() {
    for (let i = this.healItems.length - 1; i >= 0; i--) {
      const item = this.healItems[i];
      // 移动回血道具
      item.x -= this.config.healItem.speed;
      
      // 检查是否超出屏幕，超出则移除
      if (item.x + item.radius < 0) {
        this.healItems.splice(i, 1);
      }
    }
  }
  
  /**
   * 检查碰撞
   */
  checkCollisions() {
    // 如果是无敌状态，不检测碰撞
    if (this.isInvincible) {
      return;
    }
    
    // 检查是否碰到地面 - 直接死亡
    if (this.bird.y + this.bird.radius >= this.ground.y) {
      this.gameOver();
      return;
    }
    
    // 检查是否碰到管道
    for (const pipe of this.pipes) {
      // 检查水平碰撞
      if (this.bird.x + this.bird.radius > pipe.x && 
          this.bird.x - this.bird.radius < pipe.x + this.config.pipeWidth) {
        // 检查垂直碰撞
        if (this.bird.y - this.bird.radius < pipe.topHeight || 
            this.bird.y + this.bird.radius > this.ground.y - pipe.bottomHeight) {
          this.loseLife();
          return;
        }
      }
    }
    
    // 检查是否吃到回血道具
    for (let i = this.healItems.length - 1; i >= 0; i--) {
      const item = this.healItems[i];
      // 计算小鸟与道具的距离
      const dx = this.bird.x - item.x;
      const dy = this.bird.y - item.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 碰撞检测
      if (distance < this.bird.radius + item.radius) {
        // 吃到回血道具，增加生命值
        if (this.lives < this.config.maxLives) {
          this.lives++;
        }
        // 移除道具
        this.healItems.splice(i, 1);
      }
    }
  }
  
  /**
   * 失去生命值
   */
  loseLife() {
    // 生命值减1
    this.lives--;
    
    // 检查生命值是否为0
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // 进入无敌状态
      this.isInvincible = true;
      this.invincibilityEndTime = Date.now() + this.config.invincibilityTime;
    }
  }
  
  /**
   * 游戏结束
   */
  gameOver() {
    this.gameStatus = this.GAME_STATUS.GAME_OVER;
  }
  
  /**
   * 绘制小鸟
   */
  drawBird() {
    // 无敌状态下的闪烁效果
    if (this.isInvincible) {
      const now = Date.now();
      // 每100毫秒闪烁一次
      if (Math.floor(now / 100) % 2 === 0) {
        this.ctx.fillStyle = '#ffffff';
      } else {
        this.ctx.fillStyle = this.bird.color;
      }
    } else {
      this.ctx.fillStyle = this.bird.color;
    }
    
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();
    
    // 绘制小鸟眼睛
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x + 10, this.bird.y - 5, 3, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  /**
   * 绘制回血道具
   */
  drawHealItems() {
    for (const item of this.healItems) {
      // 绘制绿色圆形回血道具
      this.ctx.fillStyle = item.color;
      this.ctx.beginPath();
      this.ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // 绘制道具中心的白色十字
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      // 绘制十字的横线
      this.ctx.beginPath();
      this.ctx.moveTo(item.x - item.radius / 2, item.y);
      this.ctx.lineTo(item.x + item.radius / 2, item.y);
      this.ctx.stroke();
      // 绘制十字的竖线
      this.ctx.beginPath();
      this.ctx.moveTo(item.x, item.y - item.radius / 2);
      this.ctx.lineTo(item.x, item.y + item.radius / 2);
      this.ctx.stroke();
    }
  }
  
  /**
   * 绘制管道
   */
  drawPipes() {
    for (const pipe of this.pipes) {
      // 绘制上管道
      this.ctx.fillStyle = pipe.color;
      this.ctx.fillRect(pipe.x, 0, this.config.pipeWidth, pipe.topHeight);
      
      // 绘制下管道
      this.ctx.fillRect(pipe.x, this.ground.y - pipe.bottomHeight, this.config.pipeWidth, pipe.bottomHeight);
      
      // 绘制管道口
      this.ctx.fillStyle = '#006400';
      this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.config.pipeWidth + 10, 20);
      this.ctx.fillRect(pipe.x - 5, this.ground.y - pipe.bottomHeight, this.config.pipeWidth + 10, 20);
    }
  }
  
  /**
   * 绘制地面
   */
  drawGround() {
    this.ctx.fillStyle = this.ground.color;
    this.ctx.fillRect(0, this.ground.y, this.canvas.width, this.canvas.height - this.ground.y);
  }
  
  /**
   * 绘制分数
   */
  drawScore() {
    // 绘制当前分数
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score, this.canvas.width / 2, 50);
    
    // 绘制最高分
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`最高分: ${this.highScore}`, this.canvas.width / 2, 80);
  }
  
  /**
   * 绘制生命值（血条）在小鸟头上
   */
  drawLives() {
    // 绘制生命值在小鸟头上
    const heartSize = 12;
    const spacing = 5;
    const startX = this.bird.x - (this.lives * heartSize + (this.lives - 1) * spacing) / 2;
    const startY = this.bird.y - this.bird.radius - heartSize - 10;
    
    // 绘制生命值
    for (let i = 0; i < this.lives; i++) {
      const x = startX + i * (heartSize + spacing);
      this.ctx.fillStyle = '#ff0000';
      
      // 绘制心形
      this.ctx.beginPath();
      this.ctx.moveTo(x + heartSize / 2, startY);
      this.ctx.bezierCurveTo(x + heartSize, startY - heartSize / 2, x + heartSize, startY - heartSize, x + heartSize / 2, startY - heartSize);
      this.ctx.bezierCurveTo(x, startY - heartSize, x, startY - heartSize / 2, x + heartSize / 2, startY);
      this.ctx.fill();
    }
  }
  
  /**
   * 绘制准备开始文字
   */
  drawReadyText() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
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
        this.bird.vy = this.config.jumpForce;
        break;
      
      case this.GAME_STATUS.PLAYING:
        // 小鸟跳跃
        this.bird.vy = this.config.jumpForce;
        break;
      
      case this.GAME_STATUS.GAME_OVER:
        // 检查重新开始按钮点击
        if (x >= this.restartButton.x && x <= this.restartButton.x + this.restartButton.width &&
            y >= this.restartButton.y && y <= this.restartButton.y + this.restartButton.height) {
          // 重新开始游戏
          this.resetGame();
        }
        break;
    }
  }

  /**
   * 游戏释放资源，回到主界面时调用
   */
  release() {
    super.release();
    console.log('FlippyBird released');
  }
}