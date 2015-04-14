/**
 * Shorthand: hasOwn
 * stand for hasOwnProperty
 * @param {String} p
 * @return {Boolean}
 */
var hasOwn = function(p) {
  return this.hasOwnProperty(p);
};

/**
 * Utils: Each
 * @param {Function} iterator(element, index, array)
 */
var each = function(iterator) {
  // Array.prototype.forEach support
  if (typeof this.forEach !== "undefined") {
    return this.forEach(iterator);
  }
  for (var i = 0, len = this.length; i < len; ++i) {
    if (iterator(this[i], i, this) === false) {
      return;
    }
  }
}

/**
 * Utils: isArray
 * @param {Obejct} obj
 * @return {Boolean}
 */
var isArray = function(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
};

/**
 * Utils: isFunction
 * @param {Object} obj
 * @return {Boolean}
 */
var isFunction = function(obj) {
  return Object.prototype.toString.call(obj) === "[object Function]";
};

/**
 * Utils: isPlainObject
 * @param {Object} obj
 * @return {Boolean}
 */
var isPlainObject = function(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
};