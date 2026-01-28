// SnowGame游戏，继承自BaseGame
import BaseGame from '../../base/BaseGame';

export default class SnowGame extends BaseGame {
  /**
   * 获取游戏配置信息
   * @returns {Object} 游戏配置信息
   */
  static getConfig() {
    return {
      name: 'SnowGame',
      previewImage: 'images/SnowGame/snow_game.png'
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
      characterSpeed: 8,
      obstacleSpeed: 5,
      obstacleInterval: 1000,
      obstacleTypes: [
        { width: 50, height: 50, color: '#ff0000' },
        { width: 70, height: 70, color: '#00ff00' },
        { width: 40, height: 40, color: '#0000ff' },
        { width: 60, height: 60, color: '#ffff00' }
      ],
      maxLives: 3,
      invincibilityTime: 3000, // 无敌时间，单位毫秒
      healItem: {
        probability: 0.2, // 20%概率生成
        radius: 15, // 道具半径
        color: '#00ff00', // 道具颜色
        speed: 5, // 道具移动速度
        cooldown: 2000 // 生成冷却时间，单位毫秒
      }
    };
    
    // 游戏状态
    this.gameStatus = this.GAME_STATUS.READY;
    this.score = 0;
    this.lives = this.config.maxLives;
    this.isInvincible = false;
    this.invincibilityEndTime = 0;
    
    // 角色属性
    this.character = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: 40,
      height: 40,
      color: '#ffffff',
      speed: this.config.characterSpeed
    };
    
    // 障碍物数组
    this.obstacles = [];
    this.lastObstacleTime = 0;
    
    // 补血道具数组
    this.healItems = [];
    this.lastHealItemTime = 0;
    
    // 按钮属性
    this.leftButton = {
      x: 50,
      y: canvas.height - 120,
      width: 80,
      height: 80,
      text: '左',
      color: '#4ecdc4',
      textColor: '#ffffff'
    };
    
    this.rightButton = {
      x: canvas.width - 130,
      y: canvas.height - 120,
      width: 80,
      height: 80,
      text: '右',
      color: '#4ecdc4',
      textColor: '#ffffff'
    };
    
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
    
    // 游戏背景
    this.bgColor = '#87ceeb';
    
    // 触摸状态
    this.isLeftPressed = false;
    this.isRightPressed = false;
  }

  /**
   * 游戏初始化
   */
  init() {
    super.init();
    this.resetGame();
    console.log('SnowGame initialized');
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
    
    // 重置角色位置
    this.character.x = this.canvas.width / 2;
    this.character.y = this.canvas.height / 2;
    
    // 清空障碍物和补血道具
    this.obstacles = [];
    this.lastObstacleTime = 0;
    this.healItems = [];
    this.lastHealItemTime = 0;
    
    // 重置触摸状态
    this.isLeftPressed = false;
    this.isRightPressed = false;
  }

  /**
   * 游戏每帧逻辑
   */
  loop() {
    if (!this.isRunning) return;
    
    // 清空画布
    this.ctx.fillStyle = this.bgColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 根据游戏状态执行不同逻辑
    switch (this.gameStatus) {
      case this.GAME_STATUS.READY:
        this.drawCharacter();
        this.drawLives();
        this.drawReadyText();
        this.drawButtons();
        break;
      
      case this.GAME_STATUS.PLAYING:
        this.updateCharacter();
        this.updateObstacles();
        this.updateHealItems();
        this.checkCollisions();
        this.drawCharacter();
        this.drawLives();
        this.drawObstacles();
        this.drawHealItems();
        this.drawScore();
        this.drawButtons();
        break;
      
      case this.GAME_STATUS.GAME_OVER:
        this.drawCharacter();
        this.drawLives();
        this.drawObstacles();
        this.drawHealItems();
        this.drawScore();
        this.drawGameOverText();
        this.drawRestartButton();
        this.drawButtons();
        break;
    }
    
    // 绘制返回按钮
    this.drawBackButton();
  }
  
  /**
   * 更新角色状态
   */
  updateCharacter() {
    // 根据触摸状态移动角色
    if (this.isLeftPressed) {
      this.character.x -= this.character.speed;
    }
    if (this.isRightPressed) {
      this.character.x += this.character.speed;
    }
    
    // 限制角色在屏幕范围内
    if (this.character.x - this.character.width / 2 < 0) {
      this.character.x = this.character.width / 2;
    }
    if (this.character.x + this.character.width / 2 > this.canvas.width) {
      this.character.x = this.canvas.width - this.character.width / 2;
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
   * 更新障碍物状态
   */
  updateObstacles() {
    // 生成新障碍物
    const now = Date.now();
    if (now - this.lastObstacleTime > this.config.obstacleInterval) {
      this.generateObstacle();
      this.lastObstacleTime = now;
      
      // 只有当生命值未满时，才有概率生成补血道具
      if (this.lives < this.config.maxLives) {
        // 生命值越少，生成概率越高
        // 基础概率为0.2，生命值为1时概率为0.4，生命值为2时概率为0.2
        const baseProbability = this.config.healItem.probability;
        const maxProbability = baseProbability * 2; // 最大概率为基础概率的2倍
        // 计算当前概率：生命值越低，概率越高
        const currentProbability = maxProbability - (this.lives - 1) * baseProbability;
        
        if (Math.random() < currentProbability) {
          this.generateHealItem();
        }
      }
    }
    
    // 更新障碍物位置
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      // 障碍物向上移动（相对角色向下滑）
      obstacle.y -= this.config.obstacleSpeed;
      
      // 检查障碍物是否超出屏幕，超出则移除
      if (obstacle.y + obstacle.height < 0) {
        this.obstacles.splice(i, 1);
        // 障碍物成功避开，增加分数
        this.score++;
      }
    }
  }
  
  /**
   * 生成补血道具
   */
  generateHealItem() {
    const now = Date.now();
    // 检查冷却时间
    if (now - this.lastHealItemTime < this.config.healItem.cooldown) {
      return;
    }
    
    // 生成不与障碍物重叠的道具位置
    let validPosition = false;
    let x = 0;
    let attempts = 0;
    const maxAttempts = 10; // 最多尝试10次生成位置
    
    while (!validPosition && attempts < maxAttempts) {
      // 随机生成道具位置
      x = Math.random() * (this.canvas.width - this.config.healItem.radius * 2) + this.config.healItem.radius;
      validPosition = true;
      
      // 检查是否与现有障碍物重叠
      for (const obstacle of this.obstacles) {
        // 计算障碍物中心与道具中心的距离
        const dx = x - obstacle.x;
        const dy = this.canvas.height - obstacle.y; // 道具生成在底部，所以y坐标固定为底部
        
        // 矩形与圆形碰撞检测
        // 找到矩形上离圆心最近的点
        const closestX = Math.max(obstacle.x - obstacle.width / 2, Math.min(x, obstacle.x + obstacle.width / 2));
        const closestY = Math.max(obstacle.y - obstacle.height / 2, Math.min(this.canvas.height, obstacle.y + obstacle.height / 2));
        
        // 计算最近点与圆心的距离
        const distanceX = x - closestX;
        const distanceY = this.canvas.height - closestY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        // 如果距离小于道具半径，说明重叠
        if (distance < this.config.healItem.radius) {
          validPosition = false;
          break;
        }
      }
      
      attempts++;
    }
    
    // 如果找到有效位置，生成道具
    if (validPosition) {
      // 创建补血道具
      const healItem = {
        x: x,
        y: this.canvas.height + this.config.healItem.radius,
        radius: this.config.healItem.radius,
        color: this.config.healItem.color
      };
      
      this.healItems.push(healItem);
      this.lastHealItemTime = now;
    }
  }
  
  /**
   * 更新补血道具状态
   */
  updateHealItems() {
    // 更新补血道具位置
    for (let i = this.healItems.length - 1; i >= 0; i--) {
      const item = this.healItems[i];
      // 道具向上移动（相对角色向下滑）
      item.y -= this.config.healItem.speed;
      
      // 检查道具是否超出屏幕，超出则移除
      if (item.y + item.radius < 0) {
        this.healItems.splice(i, 1);
      }
    }
  }
  
  /**
   * 生成障碍物
   */
  generateObstacle() {
    // 随机选择障碍物类型
    const obstacleType = this.config.obstacleTypes[Math.floor(Math.random() * this.config.obstacleTypes.length)];
    
    // 随机生成障碍物位置
    const x = Math.random() * (this.canvas.width - obstacleType.width) + obstacleType.width / 2;
    
    // 创建障碍物
    const obstacle = {
      x: x,
      y: this.canvas.height + obstacleType.height / 2,
      width: obstacleType.width,
      height: obstacleType.height,
      color: obstacleType.color
    };
    
    this.obstacles.push(obstacle);
  }
  
  /**
   * 检查碰撞
   */
  checkCollisions() {
    // 检测障碍物碰撞
    if (!this.isInvincible) {
      for (const obstacle of this.obstacles) {
        // 矩形碰撞检测
        if (this.character.x + this.character.width / 2 > obstacle.x - obstacle.width / 2 &&
            this.character.x - this.character.width / 2 < obstacle.x + obstacle.width / 2 &&
            this.character.y + this.character.height / 2 > obstacle.y - obstacle.height / 2 &&
            this.character.y - this.character.height / 2 < obstacle.y + obstacle.height / 2) {
          // 碰撞发生，减少生命值
          this.loseLife();
          return;
        }
      }
    }
    
    // 检测补血道具碰撞
    for (let i = this.healItems.length - 1; i >= 0; i--) {
      const item = this.healItems[i];
      // 计算角色中心与道具中心的距离
      const dx = this.character.x - item.x;
      const dy = this.character.y - item.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // 圆形碰撞检测（角色视为矩形，简化为中心到圆形的距离检测）
      if (distance < this.character.width / 2 + item.radius) {
        // 吃到补血道具，增加生命值
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
   * 绘制角色
   */
  drawCharacter() {
    // 无敌状态下的闪动效果
    if (this.isInvincible) {
      const now = Date.now();
      // 每100毫秒闪烁一次
      if (Math.floor(now / 100) % 2 === 0) {
        this.ctx.fillStyle = '#ffffff';
      } else {
        this.ctx.fillStyle = '#ff0000';
      }
    } else {
      this.ctx.fillStyle = this.character.color;
    }
    
    this.ctx.fillRect(
      this.character.x - this.character.width / 2,
      this.character.y - this.character.height / 2,
      this.character.width,
      this.character.height
    );
  }
  
  /**
   * 绘制生命值
   */
  drawLives() {
    const heartSize = 12;
    const spacing = 5;
    // 计算起始位置，使其居中显示在角色上方
    const startX = this.character.x - (this.lives * heartSize + (this.lives - 1) * spacing) / 2;
    const startY = this.character.y - this.character.height / 2 - heartSize - 10;
    
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
   * 绘制障碍物
   */
  drawObstacles() {
    for (const obstacle of this.obstacles) {
      this.ctx.fillStyle = obstacle.color;
      this.ctx.fillRect(
        obstacle.x - obstacle.width / 2,
        obstacle.y - obstacle.height / 2,
        obstacle.width,
        obstacle.height
      );
    }
  }
  
  /**
   * 绘制补血道具
   */
  drawHealItems() {
    for (const item of this.healItems) {
      // 绘制绿色圆形补血道具
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
   * 绘制分数
   */
  drawScore() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.score, this.canvas.width / 2, 50);
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
   * 绘制左右移动按钮
   */
  drawButtons() {
    // 绘制左按钮
    this.ctx.fillStyle = this.leftButton.color;
    this.ctx.fillRect(this.leftButton.x, this.leftButton.y, this.leftButton.width, this.leftButton.height);
    
    this.ctx.strokeStyle = '#26a69a';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.leftButton.x, this.leftButton.y, this.leftButton.width, this.leftButton.height);
    
    this.ctx.fillStyle = this.leftButton.textColor;
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      this.leftButton.text,
      this.leftButton.x + this.leftButton.width / 2,
      this.leftButton.y + this.leftButton.height / 2
    );
    
    // 绘制右按钮
    this.ctx.fillStyle = this.rightButton.color;
    this.ctx.fillRect(this.rightButton.x, this.rightButton.y, this.rightButton.width, this.rightButton.height);
    
    this.ctx.strokeStyle = '#26a69a';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.rightButton.x, this.rightButton.y, this.rightButton.width, this.rightButton.height);
    
    this.ctx.fillStyle = this.rightButton.textColor;
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      this.rightButton.text,
      this.rightButton.x + this.rightButton.width / 2,
      this.rightButton.y + this.rightButton.height / 2
    );
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
        // 检查左右按钮点击
        this.checkButtonClick(x, y);
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
   * 检查按钮点击
   * @param {number} x - 点击x坐标
   * @param {number} y - 点击y坐标
   */
  checkButtonClick(x, y) {
    // 检查左按钮点击
    if (x >= this.leftButton.x && x <= this.leftButton.x + this.leftButton.width &&
        y >= this.leftButton.y && y <= this.leftButton.y + this.leftButton.height) {
      this.isLeftPressed = true;
      this.isRightPressed = false;
      setTimeout(() => {
        this.isLeftPressed = false;
      }, 100);
    }
    
    // 检查右按钮点击
    if (x >= this.rightButton.x && x <= this.rightButton.x + this.rightButton.width &&
        y >= this.rightButton.y && y <= this.rightButton.y + this.rightButton.height) {
      this.isRightPressed = true;
      this.isLeftPressed = false;
      setTimeout(() => {
        this.isRightPressed = false;
      }, 100);
    }
  }

  /**
   * 游戏释放资源，回到主界面时调用
   */
  release() {
    super.release();
    console.log('SnowGame released');
  }
}