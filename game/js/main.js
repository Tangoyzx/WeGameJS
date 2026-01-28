// 游戏主逻辑
// 使用微信小游戏 API 创建 Canvas 对象
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 导入游戏类
import ThreeGame from './games/ThreeGame/ThreeGame';
import Game2048 from './games/Game2048/Game2048';
import FlippyBird from './games/FlippyBird/FlippyBird';
import SnowGame from './games/SnowGame/SnowGame';
import TetrisGame from './games/TetrisGame/TetrisGame';
import PlatformJump from './games/PlatformJump/PlatformJump';
import PlatformJumpECS from './games/PlatformJump/PlatformJumpECS';

/**
 * 游戏状态常量
 */
const GAME_STATE = {
  MAIN_MENU: 0,  // 主菜单页面
  GAME_RUNNING: 1   // 游戏运行中
};

/**
 * 游戏主类
 */
export default class Main {
  constructor() {
    this.gameState = GAME_STATE.MAIN_MENU; // 初始状态为主菜单
    this.aniId = 0; // 动画帧ID
    this.currentGame = null; // 当前运行的游戏实例
    
    // 获取系统信息和安全区
    const systemInfo = wx.getSystemInfoSync();
    this.safeArea = systemInfo.safeArea;
    this.statusBarHeight = systemInfo.statusBarHeight;
    
    // 主菜单相关属性
    this.page = 0; // 当前页码
    this.gamesPerPage = 12; // 每页显示的游戏数量（四行三列）
    
    // 导入的游戏类数组（直接导入，不需要映射）
    this.importedGames = [ThreeGame, Game2048, FlippyBird, SnowGame, TetrisGame, PlatformJump, PlatformJumpECS];
    
    // 游戏列表，将从游戏类的静态方法获取配置
    this.gameList = [];
    
    // 按钮相关属性
    this.gameButton = {
      width: 100,
      height: 100,
      margin: 20
    };
    
    // 翻页按钮属性
    this.pageButton = {
      width: 60,
      height: 60
    };
    
    this.init();
  }
  
  /**
   * 初始化游戏
   */
  init() {
    // 加载游戏配置
    this.loadGameConfig();
    
    // 绑定触摸事件
    this.bindEvents();
    
    // 开始游戏循环
    this.gameLoop();
  }
  
  /**
   * 加载游戏配置
   */
  loadGameConfig() {
    // 从游戏类的静态方法获取配置信息
    this.gameList = [];
    for (let i = 0; i < this.importedGames.length; i++) {
      const GameClass = this.importedGames[i];
      // 调用游戏类的静态方法获取配置
      const config = GameClass.getConfig();
      
      this.gameList.push({
        id: GameClass.name,
        name: config.name,
        className: GameClass,
        previewImage: config.previewImage,
        instance: null,
        image: null,
        imageSrc: config.previewImage
      });
    }
    
    // 加载游戏图片资源
    this.loadGameImages();
    
    console.log('Game config loaded from game classes:', this.gameList);
  }
  
  /**
   * 加载游戏图片资源
   */
  loadGameImages() {
    // 遍历游戏列表，加载每个游戏的图片
    for (let i = 0; i < this.gameList.length; i++) {
      const game = this.gameList[i];
      // 创建图片对象
      const img = wx.createImage();
      
      // 设置图片加载完成事件
      img.onload = () => {
        game.image = img;
        console.log(`Loaded image for ${game.name}`);
      };
      
      // 设置图片加载失败事件（使用颜色块作为后备）
      img.onerror = () => {
        console.warn(`Failed to load image for ${game.name}, using fallback color`);
        // 图片加载失败时，使用颜色块作为后备
        game.image = {
          draw: (ctx, x, y, width, height) => {
            // 使用不同的颜色作为后备
            const colors = ['#ff0000', '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4'];
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(x, y, width, height);
          }
        };
      };
      
      // 开始加载图片
      img.src = game.imageSrc;
    }
  }
  
  /**
   * 绑定触摸事件
   */
  bindEvents() {
    // 使用微信小游戏的触摸事件API
    wx.onTouchStart((res) => {
      const touch = res.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      
      if (this.gameState === GAME_STATE.MAIN_MENU) {
        // 检测游戏按钮点击
        this.checkGameButtonClick(x, y);
        // 检测翻页按钮点击
        this.checkPageButtonClick(x, y);
      } else if (this.gameState === GAME_STATE.GAME_RUNNING) {
        // 处理游戏内触摸事件
        if (this.currentGame) {
          this.currentGame.handleTouch(x, y);
        }
      }
    });
  }
  
  /**
   * 检测游戏按钮点击
   */
  checkGameButtonClick(x, y) {
    const startIndex = this.page * this.gamesPerPage;
    const endIndex = Math.min(startIndex + this.gamesPerPage, this.gameList.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const gameIndex = i - startIndex;
      const row = Math.floor(gameIndex / 3);
      const col = gameIndex % 3;
      
      // 计算按钮位置 - 确保在安全区内
    const buttonX = (canvas.width - (this.gameButton.width * 3 + this.gameButton.margin * 2)) / 2 + 
                   (this.gameButton.width + this.gameButton.margin) * col;
    // 按钮起始位置：标题下方 + 20px，确保在安全区内
    const buttonY = this.safeArea.top + 100 + (this.gameButton.height + this.gameButton.margin) * row;
      
      // 检测点击
      if (x >= buttonX && x <= buttonX + this.gameButton.width &&
          y >= buttonY && y <= buttonY + this.gameButton.height) {
        // 切换到游戏运行状态
        this.startGame(i);
        break;
      }
    }
  }
  
  /**
   * 检测翻页按钮点击
   */
  checkPageButtonClick(x, y) {
    const totalPages = Math.ceil(this.gameList.length / this.gamesPerPage);
    
    // 上一页按钮位置
    const prevButtonX = (canvas.width - this.pageButton.width) / 2 - 100;
    const prevButtonY = canvas.height - 100;
    
    // 下一页按钮位置
    const nextButtonX = (canvas.width - this.pageButton.width) / 2 + 100;
    const nextButtonY = canvas.height - 100;
    
    // 检测上一页按钮点击
    if (x >= prevButtonX && x <= prevButtonX + this.pageButton.width &&
        y >= prevButtonY && y <= prevButtonY + this.pageButton.height) {
      if (this.page > 0) {
        this.page--;
      }
    }
    
    // 检测下一页按钮点击
    if (x >= nextButtonX && x <= nextButtonX + this.pageButton.width &&
        y >= nextButtonY && y <= nextButtonY + this.pageButton.height) {
      if (this.page < totalPages - 1) {
        this.page++;
      }
    }
  }
  
  /**
   * 开始游戏
   */
  startGame(gameIndex) {
    // 如果当前有运行的游戏，先释放资源
    if (this.currentGame) {
      this.currentGame.release();
      this.currentGame = null;
    }
    
    // 创建游戏实例，传递返回主菜单的回调函数
    const gameInfo = this.gameList[gameIndex];
    this.currentGame = new gameInfo.className(canvas, ctx, this.returnToMainMenu.bind(this));
    this.currentGame.init();
    
    // 切换游戏状态
    this.gameState = GAME_STATE.GAME_RUNNING;
  }
  
  /**
   * 返回主菜单
   */
  returnToMainMenu() {
    // 释放当前游戏资源
    if (this.currentGame) {
      this.currentGame.release();
      this.currentGame = null;
    }
    
    // 切换游戏状态
    this.gameState = GAME_STATE.MAIN_MENU;
  }
  
  /**
   * 绘制主菜单
   */
  drawMainMenu() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置背景色
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制标题 - 确保在安全区内
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    // 标题位置：安全区顶部 + 40px，确保不被刘海遮挡
    const titleY = this.safeArea.top + 40;
    ctx.fillText('太阳鸟游戏', canvas.width / 2, titleY);
    
    // 绘制游戏按钮
    this.drawGameButtons();
    
    // 绘制翻页按钮
    this.drawPageButtons();
  }
  
  /**
   * 绘制游戏按钮
   */
  drawGameButtons() {
    const startIndex = this.page * this.gamesPerPage;
    const endIndex = Math.min(startIndex + this.gamesPerPage, this.gameList.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const gameIndex = i - startIndex;
      const row = Math.floor(gameIndex / 3);
      const col = gameIndex % 3;
      
      // 计算按钮位置 - 确保在安全区内
      const buttonX = (canvas.width - (this.gameButton.width * 3 + this.gameButton.margin * 2)) / 2 + 
                     (this.gameButton.width + this.gameButton.margin) * col;
      // 按钮起始位置：标题下方 + 20px，确保在安全区内
      const buttonY = this.safeArea.top + 100 + (this.gameButton.height + this.gameButton.margin) * row;
      
      // 绘制按钮背景
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(buttonX, buttonY, this.gameButton.width, this.gameButton.height);
      
      // 绘制按钮边框
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 2;
      ctx.strokeRect(buttonX, buttonY, this.gameButton.width, this.gameButton.height);
      
      // 获取游戏信息
      const gameInfo = this.gameList[i];
      
      // 绘制游戏图片
      if (gameInfo.image) {
        if (gameInfo.image.draw) {
          // 如果是自定义绘制对象（加载失败的后备）
          gameInfo.image.draw(ctx, buttonX, buttonY, this.gameButton.width, this.gameButton.height);
        } else {
          // 如果是Image对象（正常加载的图片）
          ctx.drawImage(gameInfo.image, buttonX, buttonY, this.gameButton.width, this.gameButton.height);
        }
      } else {
        // 图片还未加载完成，显示灰色背景
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(buttonX, buttonY, this.gameButton.width, this.gameButton.height);
      }
      
      // 绘制游戏名称
      ctx.fillStyle = '#333333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        gameInfo.name,
        buttonX + this.gameButton.width / 2,
        buttonY + this.gameButton.height - 5
      );
    }
  }
  
  /**
   * 绘制翻页按钮
   */
  drawPageButtons() {
    const totalPages = Math.ceil(this.gameList.length / this.gamesPerPage);
    
    // 上一页按钮 - 确保在安全区内
    const prevButtonX = (canvas.width - this.pageButton.width) / 2 - 100;
    // 按钮位置：安全区底部 - 80px，确保不被底部指示条遮挡
    const buttonY = this.safeArea.bottom - 80;
    
    ctx.fillStyle = this.page > 0 ? '#4ecdc4' : '#cccccc';
    ctx.fillRect(prevButtonX, buttonY, this.pageButton.width, this.pageButton.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('上页', prevButtonX + this.pageButton.width / 2, buttonY + this.pageButton.height / 2);
    
    // 下一页按钮 - 确保在安全区内
    const nextButtonX = (canvas.width - this.pageButton.width) / 2 + 100;
    
    ctx.fillStyle = this.page < totalPages - 1 ? '#4ecdc4' : '#cccccc';
    ctx.fillRect(nextButtonX, buttonY, this.pageButton.width, this.pageButton.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('下页', nextButtonX + this.pageButton.width / 2, buttonY + this.pageButton.height / 2);
    
    // 绘制页码 - 确保在安全区内
    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.page + 1}/${totalPages}`, canvas.width / 2, buttonY - 20);
  }
  
  /**
   * 游戏循环
   */
  gameLoop() {
    // 根据游戏状态执行不同逻辑
    if (this.gameState === GAME_STATE.MAIN_MENU) {
      this.drawMainMenu();
    } else if (this.gameState === GAME_STATE.GAME_RUNNING) {
      // 调用当前游戏的loop方法
      if (this.currentGame) {
        this.currentGame.loop();
      }
    }
    
    // 继续下一帧 - 使用 setInterval 替代 requestAnimationFrame，兼容微信小游戏
    this.aniId = setTimeout(this.gameLoop.bind(this), 16); // 约60fps
  }
}
