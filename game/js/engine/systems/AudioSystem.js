/**
 * AudioSystem 音频系统
 * 负责管理游戏中的音频播放
 */
import System from '../core/System.js';

export default class AudioSystem extends System {
  /**
   * 构造函数
   * @param {World} world - 所属世界
   */
  constructor(world) {
    super(world);
    this.setRequiredComponents([]); // 音频系统不需要特定组件
    this.setPriority(300); // 音频系统优先级较低
    
    // 音频管理
    this.sounds = new Map();
    this.music = null;
    this.musicVolume = 0.5;
    this.soundVolume = 0.7;
    this.masterVolume = 1.0;
    this.enabled = true;
    
    // 音频上下文
    this.audioContext = null;
    this.initAudioContext();
  }

  /**
   * 初始化音频上下文
   */
  initAudioContext() {
    if (typeof AudioContext !== 'undefined') {
      try {
        this.audioContext = new AudioContext();
        console.log('AudioContext initialized');
      } catch (error) {
        console.warn('AudioContext not supported:', error);
      }
    }
  }

  /**
   * 设置主音量
   * @param {number} volume - 音量（0-1）
   * @returns {AudioSystem} 返回自身，支持链式调用
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    return this;
  }

  /**
   * 设置音效音量
   * @param {number} volume - 音量（0-1）
   * @returns {AudioSystem} 返回自身，支持链式调用
   */
  setSoundVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
    return this;
  }

  /**
   * 设置音乐音量
   * @param {number} volume - 音量（0-1）
   * @returns {AudioSystem} 返回自身，支持链式调用
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    return this;
  }

  /**
   * 启用音频系统
   */
  enable() {
    this.enabled = true;
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * 禁用音频系统
   */
  disable() {
    this.enabled = false;
    this.stopAllSounds();
    this.stopMusic();
  }

  /**
   * 预加载音频资源
   * @param {string} name - 音频名称
   * @param {string} url - 音频URL
   * @returns {Promise} 加载完成的Promise
   */
  async loadSound(name, url) {
    if (!this.enabled) return;
    
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.preload = 'auto';
      
      audio.oncanplaythrough = () => {
        this.sounds.set(name, audio);
        resolve(audio);
      };
      
      audio.onerror = (error) => {
        console.error(`Failed to load sound: ${name}`, error);
        reject(error);
      };
      
      audio.src = url;
    });
  }

  /**
   * 播放音效
   * @param {string} name - 音效名称
   * @param {Object} options - 播放选项
   * @param {number} options.volume - 音量（0-1）
   * @param {boolean} options.loop - 是否循环
   * @param {number} options.playbackRate - 播放速度
   * @returns {Audio|null} 音频对象，如果失败则返回null
   */
  playSound(name, options = {}) {
    if (!this.enabled) return null;
    
    const sound = this.sounds.get(name);
    if (!sound) {
      console.warn(`Sound '${name}' not found`);
      return null;
    }
    
    try {
      // 创建新的音频实例用于播放
      const audio = new Audio();
      audio.src = sound.src;
      audio.volume = (options.volume || 1) * this.soundVolume * this.masterVolume;
      audio.loop = options.loop || false;
      audio.playbackRate = options.playbackRate || 1.0;
      
      audio.play().catch(error => {
        console.warn(`Failed to play sound '${name}':`, error);
      });
      
      return audio;
    } catch (error) {
      console.error(`Error playing sound '${name}':`, error);
      return null;
    }
  }

  /**
   * 播放音乐
   * @param {string} name - 音乐名称
   * @param {Object} options - 播放选项
   * @param {number} options.volume - 音量（0-1）
   * @param {boolean} options.loop - 是否循环
   * @returns {Audio|null} 音频对象，如果失败则返回null
   */
  playMusic(name, options = {}) {
    if (!this.enabled) return null;
    
    const music = this.sounds.get(name);
    if (!music) {
      console.warn(`Music '${name}' not found`);
      return null;
    }
    
    // 停止当前音乐
    this.stopMusic();
    
    try {
      this.music = new Audio();
      this.music.src = music.src;
      this.music.volume = (options.volume || 1) * this.musicVolume * this.masterVolume;
      this.music.loop = options.loop !== undefined ? options.loop : true;
      
      this.music.play().catch(error => {
        console.warn(`Failed to play music '${name}':`, error);
      });
      
      return this.music;
    } catch (error) {
      console.error(`Error playing music '${name}':`, error);
      return null;
    }
  }

  /**
   * 停止音乐播放
   */
  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music.currentTime = 0;
      this.music = null;
    }
  }

  /**
   * 暂停音乐播放
   */
  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }

  /**
   * 恢复音乐播放
   */
  resumeMusic() {
    if (this.music) {
      this.music.play().catch(error => {
        console.warn('Failed to resume music:', error);
      });
    }
  }

  /**
   * 停止所有音效
   */
  stopAllSounds() {
    // 注意：由于音效是即时创建的，我们无法直接停止所有音效
    // 实际项目中可能需要更复杂的音效管理
    console.log('AudioSystem: stopAllSounds called (implementation depends on specific requirements)');
  }

  /**
   * 设置音乐播放位置
   * @param {number} time - 播放时间（秒）
   */
  setMusicTime(time) {
    if (this.music) {
      this.music.currentTime = Math.max(0, time);
    }
  }

  /**
   * 获取音乐播放位置
   * @returns {number} 播放时间（秒）
   */
  getMusicTime() {
    return this.music ? this.music.currentTime : 0;
  }

  /**
   * 获取音乐总时长
   * @returns {number} 总时长（秒）
   */
  getMusicDuration() {
    return this.music ? this.music.duration : 0;
  }

  /**
   * 检查音乐是否正在播放
   * @returns {boolean} 是否正在播放
   */
  isMusicPlaying() {
    return this.music ? !this.music.paused : false;
  }

  /**
   * 系统更新
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    // 音频系统不需要每帧更新
  }

  /**
   * 系统销毁
   */
  destroy() {
    this.stopMusic();
    this.stopAllSounds();
    this.sounds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    console.log('AudioSystem destroyed');
  }

  /**
   * 获取系统状态
   * @returns {Object} 状态信息
   */
  getStatus() {
    return {
      enabled: this.enabled,
      masterVolume: this.masterVolume,
      soundVolume: this.soundVolume,
      musicVolume: this.musicVolume,
      soundsLoaded: this.sounds.size,
      musicPlaying: this.isMusicPlaying(),
      audioContextState: this.audioContext ? this.audioContext.state : 'unsupported'
    };
  }
}