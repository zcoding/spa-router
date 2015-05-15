
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
 * Utils: extend
 * @param {Object,...} src list
 * @return {Object} a new object
 */
extend = function() {
  var obj = {};
  var srcList = [].slice.call(arguments, 0);
  for (var i = 0, len = srcList.length; i < len; ++i) {
    var src = srcList[i];
    for (var q in src) {
      if (hasOwn.call(src, q)) {
        obj[q] = src[q];
      }
    }
  }
  return obj;
};