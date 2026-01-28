/**
 * Color 颜色类
 * 提供颜色操作和转换功能
 */
export default class Color {
  /**
   * 构造函数
   * @param {number} r - 红色分量（0-255）
   * @param {number} g - 绿色分量（0-255）
   * @param {number} b - 蓝色分量（0-255）
   * @param {number} a - 透明度分量（0-1）
   */
  constructor(r = 255, g = 255, b = 255, a = 1.0) {
    this.r = Math.max(0, Math.min(255, r));
    this.g = Math.max(0, Math.min(255, g));
    this.b = Math.max(0, Math.min(255, b));
    this.a = Math.max(0, Math.min(1, a));
  }

  /**
   * 常用颜色常量
   */
  static get WHITE() { return new Color(255, 255, 255); }
  static get BLACK() { return new Color(0, 0, 0); }
  static get RED() { return new Color(255, 0, 0); }
  static get GREEN() { return new Color(0, 255, 0); }
  static get BLUE() { return new Color(0, 0, 255); }
  static get YELLOW() { return new Color(255, 255, 0); }
  static get CYAN() { return new Color(0, 255, 255); }
  static get MAGENTA() { return new Color(255, 0, 255); }
  static get GRAY() { return new Color(128, 128, 128); }
  static get TRANSPARENT() { return new Color(0, 0, 0, 0); }

  /**
   * 从十六进制字符串创建颜色
   * @param {string} hex - 十六进制颜色字符串（如"#FF0000"或"FF0000"）
   * @param {number} alpha - 透明度（0-1）
   * @returns {Color} 颜色对象
   */
  static fromHex(hex, alpha = 1.0) {
    hex = hex.replace(/^#/, '');
    
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    if (hex.length !== 6) {
      console.warn('Invalid hex color format:', hex);
      return new Color();
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return new Color(r, g, b, alpha);
  }

  /**
   * 从HSL颜色空间创建颜色
   * @param {number} h - 色相（0-360）
   * @param {number} s - 饱和度（0-1）
   * @param {number} l - 亮度（0-1）
   * @param {number} alpha - 透明度（0-1）
   * @returns {Color} 颜色对象
   */
  static fromHSL(h, s, l, alpha = 1.0) {
    h = h % 360;
    if (h < 0) h += 360;
    
    s = Math.max(0, Math.min(1, s));
    l = Math.max(0, Math.min(1, l));
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return new Color(r, g, b, alpha);
  }

  /**
   * 从HSV颜色空间创建颜色
   * @param {number} h - 色相（0-360）
   * @param {number} s - 饱和度（0-1）
   * @param {number} v - 明度（0-1）
   * @param {number} alpha - 透明度（0-1）
   * @returns {Color} 颜色对象
   */
  static fromHSV(h, s, v, alpha = 1.0) {
    h = h % 360;
    if (h < 0) h += 360;
    
    s = Math.max(0, Math.min(1, s));
    v = Math.max(0, Math.min(1, v));
    
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return new Color(r, g, b, alpha);
  }

  /**
   * 生成随机颜色
   * @param {number} alpha - 透明度（0-1）
   * @returns {Color} 随机颜色
   */
  static random(alpha = 1.0) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return new Color(r, g, b, alpha);
  }

  /**
   * 从灰度值创建颜色
   * @param {number} gray - 灰度值（0-255）
   * @param {number} alpha - 透明度（0-1）
   * @returns {Color} 灰度颜色
   */
  static fromGray(gray, alpha = 1.0) {
    gray = Math.max(0, Math.min(255, gray));
    return new Color(gray, gray, gray, alpha);
  }

  /**
   * 复制颜色
   * @returns {Color} 复制的新颜色
   */
  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  /**
   * 设置颜色值
   * @param {number} r - 红色分量
   * @param {number} g - 绿色分量
   * @param {number} b - 蓝色分量
   * @param {number} a - 透明度分量
   * @returns {Color} 返回自身，支持链式调用
   */
  set(r, g, b, a = this.a) {
    this.r = Math.max(0, Math.min(255, r));
    this.g = Math.max(0, Math.min(255, g));
    this.b = Math.max(0, Math.min(255, b));
    this.a = Math.max(0, Math.min(1, a));
    return this;
  }

  /**
   * 复制另一个颜色的值
   * @param {Color} other - 另一个颜色
   * @returns {Color} 返回自身，支持链式调用
   */
  copy(other) {
    this.r = other.r;
    this.g = other.g;
    this.b = other.b;
    this.a = other.a;
    return this;
  }

  /**
   * 转换为十六进制字符串
   * @returns {string} 十六进制颜色字符串
   */
  toHex() {
    const r = this.r.toString(16).padStart(2, '0');
    const g = this.g.toString(16).padStart(2, '0');
    const b = this.b.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  /**
   * 转换为RGB字符串
   * @returns {string} RGB颜色字符串
   */
  toRGB() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }

  /**
   * 转换为RGBA字符串
   * @returns {string} RGBA颜色字符串
   */
  toRGBA() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  /**
   * 转换为HSL颜色空间
   * @returns {Object} HSL值 {h, s, l}
   */
  toHSL() {
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (delta !== 0) {
      s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      
      if (max === r) {
        h = (g - b) / delta + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else {
        h = (r - g) / delta + 4;
      }
      
      h /= 6;
    }
    
    return {
      h: h * 360,
      s: s,
      l: l
    };
  }

  /**
   * 转换为HSV颜色空间
   * @returns {Object} HSV值 {h, s, v}
   */
  toHSV() {
    const r = this.r / 255;
    const g = this.g / 255;
    const b = this.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0, s = 0, v = max;
    
    if (delta !== 0) {
      s = delta / max;
      
      if (max === r) {
        h = (g - b) / delta + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else {
        h = (r - g) / delta + 4;
      }
      
      h /= 6;
    }
    
    return {
      h: h * 360,
      s: s,
      v: v
    };
  }

  /**
   * 获取灰度值
   * @returns {number} 灰度值（0-255）
   */
  toGray() {
    return Math.round(0.299 * this.r + 0.587 * this.g + 0.114 * this.b);
  }

  /**
   * 颜色混合
   * @param {Color} other - 另一个颜色
   * @param {number} factor - 混合因子（0-1）
   * @returns {Color} 混合后的颜色
   */
  blend(other, factor) {
    factor = Math.max(0, Math.min(1, factor));
    const invFactor = 1 - factor;
    
    return new Color(
      this.r * invFactor + other.r * factor,
      this.g * invFactor + other.g * factor,
      this.b * invFactor + other.b * factor,
      this.a * invFactor + other.a * factor
    );
  }

  /**
   * 颜色变亮
   * @param {number} factor - 变亮因子（0-1）
   * @returns {Color} 变亮后的颜色
   */
  lighten(factor) {
    factor = Math.max(0, Math.min(1, factor));
    const hsl = this.toHSL();
    hsl.l = Math.min(1, hsl.l + factor);
    return Color.fromHSL(hsl.h, hsl.s, hsl.l, this.a);
  }

  /**
   * 颜色变暗
   * @param {number} factor - 变暗因子（0-1）
   * @returns {Color} 变暗后的颜色
   */
  darken(factor) {
    factor = Math.max(0, Math.min(1, factor));
    const hsl = this.toHSL();
    hsl.l = Math.max(0, hsl.l - factor);
    return Color.fromHSL(hsl.h, hsl.s, hsl.l, this.a);
  }

  /**
   * 增加饱和度
   * @param {number} factor - 饱和度增加因子（0-1）
   * @returns {Color} 增加饱和度后的颜色
   */
  saturate(factor) {
    factor = Math.max(0, Math.min(1, factor));
    const hsl = this.toHSL();
    hsl.s = Math.min(1, hsl.s + factor);
    return Color.fromHSL(hsl.h, hsl.s, hsl.l, this.a);
  }

  /**
   * 降低饱和度
   * @param {number} factor - 饱和度降低因子（0-1）
   * @returns {Color} 降低饱和度后的颜色
   */
  desaturate(factor) {
    factor = Math.max(0, Math.min(1, factor));
    const hsl = this.toHSL();
    hsl.s = Math.max(0, hsl.s - factor);
    return Color.fromHSL(hsl.h, hsl.s, hsl.l, this.a);
  }

  /**
   * 设置透明度
   * @param {number} alpha - 透明度（0-1）
   * @returns {Color} 设置透明度后的颜色
   */
  setAlpha(alpha) {
    return new Color(this.r, this.g, this.b, alpha);
  }

  /**
   * 检查颜色是否相等
   * @param {Color} other - 另一个颜色
   * @param {number} epsilon - 容差
   * @returns {boolean} 是否相等
   */
  equals(other, epsilon = 0.001) {
    return Math.abs(this.r - other.r) < epsilon &&
           Math.abs(this.g - other.g) < epsilon &&
           Math.abs(this.b - other.b) < epsilon &&
           Math.abs(this.a - other.a) < epsilon;
  }

  /**
   * 转换为字符串
   * @returns {string} 颜色字符串表示
   */
  toString() {
    return this.toRGBA();
  }

  /**
   * 线性插值
   * @param {Color} a - 起始颜色
   * @param {Color} b - 目标颜色
   * @param {number} t - 插值系数（0-1）
   * @returns {Color} 插值结果
   */
  static lerp(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    return new Color(
      a.r + (b.r - a.r) * t,
      a.g + (b.g - a.g) * t,
      a.b + (b.b - a.b) * t,
      a.a + (b.a - a.a) * t
    );
  }
}