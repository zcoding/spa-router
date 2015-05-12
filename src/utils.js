
var toString = Object.prototype.toString;
/**
 * Shorthand: hasOwn
 * stand for hasOwnProperty
 * @param {String} p
 * @return {Boolean}
 */
var hasOwn = function(p) {
  return this.hasOwnProperty(p);
},

/**
 * Utils: isArray
 * @param {Obejct} obj
 * @return {Boolean}
 */
isArray = function(obj) {
  return toString.call(obj) === "[object Array]";
},

/**
 * Utils: isFunction
 * @param {Object} obj
 * @return {Boolean}
 */
isFunction = function(obj) {
  return toString.call(obj) === "[object Function]";
},

/**
 * Utils: isPlainObject
 * @param {Object} obj
 * @return {Boolean}
 */
isPlainObject = function(obj) {
  return toString.call(obj) === "[object Object]";
};
