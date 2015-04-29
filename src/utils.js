var utils =  {

  /**
   * Shorthand: hasOwn
   * stand for hasOwnProperty
   * @param {String} p
   * @return {Boolean}
   */
  hasOwn: function(p) {
    return this.hasOwnProperty(p);
  },

  /**
   * Utils: isArray
   * @param {Obejct} obj
   * @return {Boolean}
   */
  isArray: function(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  },

  /**
   * Utils: isFunction
   * @param {Object} obj
   * @return {Boolean}
   */
  isFunction: function(obj) {
    return Object.prototype.toString.call(obj) === "[object Function]";
  },

  /**
   * Utils: isPlainObject
   * @param {Object} obj
   * @return {Boolean}
   */
  isPlainObject: function(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
  }

}