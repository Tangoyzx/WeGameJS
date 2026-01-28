/**
 * MathUtils 数学工具类
 * 提供常用的数学函数和常量
 */
export default class MathUtils {
  /**
   * 数学常量
   */
  static get PI() { return Math.PI; }
  static get TWO_PI() { return Math.PI * 2; }
  static get HALF_PI() { return Math.PI / 2; }
  static get DEG_TO_RAD() { return Math.PI / 180; }
  static get RAD_TO_DEG() { return 180 / Math.PI; }
  static get EPSILON() { return 0.000001; }

  /**
   * 将角度转换为弧度
   * @param {number} degrees - 角度
   * @returns {number} 弧度
   */
  static degToRad(degrees) {
    return degrees * this.DEG_TO_RAD;
  }

  /**
   * 将弧度转换为角度
   * @param {number} radians - 弧度
   * @returns {number} 角度
   */
  static radToDeg(radians) {
    return radians * this.RAD_TO_DEG;
  }

  /**
   * 限制数值在指定范围内
   * @param {number} value - 输入值
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 限制后的值
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * 线性插值
   * @param {number} a - 起始值
   * @param {number} b - 目标值
   * @param {number} t - 插值系数（0-1）
   * @returns {number} 插值结果
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * 逆线性插值
   * @param {number} a - 起始值
   * @param {number} b - 目标值
   * @param {number} value - 当前值
   * @returns {number} 插值系数（0-1）
   */
  static inverseLerp(a, b, value) {
    return (value - a) / (b - a);
  }

  /**
   * 平滑插值（使用平滑步函数）
   * @param {number} a - 起始值
   * @param {number} b - 目标值
   * @param {number} t - 插值系数（0-1）
   * @returns {number} 平滑插值结果
   */
  static smoothLerp(a, b, t) {
    t = t * t * (3 - 2 * t); // 平滑步函数
    return a + (b - a) * t;
  }

  /**
   * 更平滑的插值（使用更平滑的步函数）
   * @param {number} a - 起始值
   * @param {number} b - 目标值
   * @param {number} t - 插值系数（0-1）
   * @returns {number} 更平滑的插值结果
   */
  static smootherLerp(a, b, t) {
    t = t * t * t * (t * (t * 6 - 15) + 10); // 更平滑的步函数
    return a + (b - a) * t;
  }

  /**
   * 将值映射到新的范围
   * @param {number} value - 输入值
   * @param {number} inMin - 输入范围最小值
   * @param {number} inMax - 输入范围最大值
   * @param {number} outMin - 输出范围最小值
   * @param {number} outMax - 输出范围最大值
   * @returns {number} 映射后的值
   */
  static map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
  }

  /**
   * 将值限制在0-1范围内
   * @param {number} value - 输入值
   * @returns {number} 限制后的值
   */
  static clamp01(value) {
    return this.clamp(value, 0, 1);
  }

  /**
   * 检查两个浮点数是否近似相等
   * @param {number} a - 数值A
   * @param {number} b - 数值B
   * @param {number} epsilon - 容差
   * @returns {boolean} 是否近似相等
   */
  static approximately(a, b, epsilon = this.EPSILON) {
    return Math.abs(a - b) < epsilon;
  }

  /**
   * 获取两个数值的差值
   * @param {number} a - 数值A
   * @param {number} b - 数值B
   * @returns {number} 差值
   */
  static delta(a, b) {
    return Math.abs(a - b);
  }

  /**
   * 获取数值的符号
   * @param {number} value - 数值
   * @returns {number} 符号（-1, 0, 1）
   */
  static sign(value) {
    if (value > 0) return 1;
    if (value < 0) return -1;
    return 0;
  }

  /**
   * 获取数值的绝对值
   * @param {number} value - 数值
   * @returns {number} 绝对值
   */
  static abs(value) {
    return Math.abs(value);
  }

  /**
   * 获取数值的平方
   * @param {number} value - 数值
   * @returns {number} 平方值
   */
  static square(value) {
    return value * value;
  }

  /**
   * 获取数值的平方根
   * @param {number} value - 数值
   * @returns {number} 平方根
   */
  static sqrt(value) {
    return Math.sqrt(value);
  }

  /**
   * 获取两个数值中的最大值
   * @param {number} a - 数值A
   * @param {number} b - 数值B
   * @returns {number} 最大值
   */
  static max(a, b) {
    return Math.max(a, b);
  }

  /**
   * 获取两个数值中的最小值
   * @param {number} a - 数值A
   * @param {number} b - 数值B
   * @returns {number} 最小值
   */
  static min(a, b) {
    return Math.min(a, b);
  }

  /**
   * 获取数组中的最大值
   * @param {Array} values - 数值数组
   * @returns {number} 最大值
   */
  static maxArray(values) {
    return Math.max(...values);
  }

  /**
   * 获取数组中的最小值
   * @param {Array} values - 数值数组
   * @returns {number} 最小值
   */
  static minArray(values) {
    return Math.min(...values);
  }

  /**
   * 获取数值的平均值
   * @param {Array} values - 数值数组
   * @returns {number} 平均值
   */
  static average(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * 获取数值的总和
   * @param {Array} values - 数值数组
   * @returns {number} 总和
   */
  static sum(values) {
    return values.reduce((sum, value) => sum + value, 0);
  }

  /**
   * 生成随机整数
   * @param {number} min - 最小值（包含）
   * @param {number} max - 最大值（包含）
   * @returns {number} 随机整数
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 生成随机浮点数
   * @param {number} min - 最小值（包含）
   * @param {number} max - 最大值（包含）
   * @returns {number} 随机浮点数
   */
  static randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * 生成随机布尔值
   * @param {number} probability - 真值的概率（0-1）
   * @returns {boolean} 随机布尔值
   */
  static randomBool(probability = 0.5) {
    return Math.random() < probability;
  }

  /**
   * 从数组中随机选择一个元素
   * @param {Array} array - 数组
   * @returns {*} 随机元素
   */
  static randomChoice(array) {
    if (array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 打乱数组（Fisher-Yates洗牌算法）
   * @param {Array} array - 要打乱的数组
   * @returns {Array} 打乱后的数组
   */
  static shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 计算两点之间的距离
   * @param {number} x1 - 点1的X坐标
   * @param {number} y1 - 点1的Y坐标
   * @param {number} x2 - 点2的X坐标
   * @param {number} y2 - 点2的Y坐标
   * @returns {number} 距离
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算两点之间距离的平方
   * @param {number} x1 - 点1的X坐标
   * @param {number} y1 - 点1的Y坐标
   * @param {number} x2 - 点2的X坐标
   * @param {number} y2 - 点2的Y坐标
   * @returns {number} 距离的平方
   */
  static distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  }

  /**
   * 计算点到线段的距离
   * @param {number} px - 点的X坐标
   * @param {number} py - 点的Y坐标
   * @param {number} x1 - 线段起点X坐标
   * @param {number} y1 - 线段起点Y坐标
   * @param {number} x2 - 线段终点X坐标
   * @param {number} y2 - 线段终点Y坐标
   * @returns {number} 点到线段的距离
   */
  static distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 计算两个角度之间的最小差值
   * @param {number} angle1 - 角度1（弧度）
   * @param {number} angle2 - 角度2（弧度）
   * @returns {number} 最小角度差（弧度）
   */
  static angleDifference(angle1, angle2) {
    let diff = angle2 - angle1;
    while (diff > Math.PI) diff -= this.TWO_PI;
    while (diff < -Math.PI) diff += this.TWO_PI;
    return diff;
  }

  /**
   * 将角度标准化到0-2π范围内
   * @param {number} angle - 角度（弧度）
   * @returns {number} 标准化后的角度
   */
  static normalizeAngle(angle) {
    while (angle < 0) angle += this.TWO_PI;
    while (angle >= this.TWO_PI) angle -= this.TWO_PI;
    return angle;
  }

  /**
   * 检查点是否在矩形内
   * @param {number} x - 点的X坐标
   * @param {number} y - 点的Y坐标
   * @param {number} rectX - 矩形X坐标
   * @param {number} rectY - 矩形Y坐标
   * @param {number} rectWidth - 矩形宽度
   * @param {number} rectHeight - 矩形高度
   * @returns {boolean} 是否在矩形内
   */
  static pointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
    return x >= rectX && x <= rectX + rectWidth &&
           y >= rectY && y <= rectY + rectHeight;
  }

  /**
   * 检查两个矩形是否相交
   * @param {number} x1 - 矩形1的X坐标
   * @param {number} y1 - 矩形1的Y坐标
   * @param {number} w1 - 矩形1的宽度
   * @param {number} h1 - 矩形1的高度
   * @param {number} x2 - 矩形2的X坐标
   * @param {number} y2 - 矩形2的Y坐标
   * @param {number} w2 - 矩形2的宽度
   * @param {number} h2 - 矩形2的高度
   * @returns {boolean} 是否相交
   */
  static rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 &&
           y1 < y2 + h2 && y1 + h1 > y2;
  }

  /**
   * 计算两个矩形的交集
   * @param {number} x1 - 矩形1的X坐标
   * @param {number} y1 - 矩形1的Y坐标
   * @param {number} w1 - 矩形1的宽度
   * @param {number} h1 - 矩形1的高度
   * @param {number} x2 - 矩形2的X坐标
   * @param {number} y2 - 矩形2的Y坐标
   * @param {number} w2 - 矩形2的宽度
   * @param {number} h2 - 矩形2的高度
   * @returns {Object|null} 交集矩形 {x, y, width, height}，如果没有交集则返回null
   */
  static rectIntersection(x1, y1, w1, h1, x2, y2, w2, h2) {
    const x = Math.max(x1, x2);
    const y = Math.max(y1, y2);
    const w = Math.min(x1 + w1, x2 + w2) - x;
    const h = Math.min(y1 + h1, y2 + h2) - y;
    
    if (w <= 0 || h <= 0) return null;
    
    return { x, y, width: w, height: h };
  }
}