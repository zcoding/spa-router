
var Win = window,
  Loc = Win.location,
  toString = Object.prototype.toString,
  decodeC = Win.decodeURIComponent,
  encodeC = Win.encodeURIComponent;

var TYPE_UNDEFINED = "undefined";

/**
 * Shorthand: hasOwn
 * stand for hasOwnProperty
 */
var hasOwn = Object.prototype.hasOwnProperty,

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
  },

  addEvent = function(name, handler) {
    if (Win.addEventListener) {
      Win.addEventListener(name, handler, false);
    } else if (Win.attachEvent) {
      Win.attachEvent('on' + name, handler);
    } else {
      Win['on' + name] = handler;
    }
  };

var queryHelper = {
  /**
   * parse query string
   * @param {String} queryString
   * @erturn {Object} query object
   */
  parse: function(queryString) {
    if (typeof queryString !== 'string') {
      return {};
    }

    queryString = queryString.replace(/^\s*|\s*$/g, '').replace(/^(\?|#)/, '');

    if (!queryString) {
      return {};
    }

    var queryParts = queryString.split('&');

    var query = {};

    for (var i = 0, len = queryParts.length; i < len; ++i) {
      var parts = queryParts[i].replace(/\+/g, ' ').split('='); // 特殊字符`+`转换为空格
      var key = parts[0];
      var val = parts[1];

      key = decodeC(key);

      val = val === undefined ? null : decodeC(val);

      if (!hasOwn.call(query, key)) {
        query[key] = val;
      } else if (isArray(query[key])) {
        query[key].push(val);
      } else {
        query[key] = [query[key], val];
      }
    }

    return query;

  },

  /**
   * stringify query object
   * @param {Object} obj
   * @return {String} query string
   */
  stringify: function(obj) {
    if (!obj) {
      return '';
    }
    var keys = [];
    for (var p in obj) {
      if (hasOwn.call(obj, p)) {
        keys.push(p);
      }
    }

    keys.sort();

    var parts = [];
    for (var i = 0, len1 = keys.length; i < len1; ++i) {
      var key = keys[i];
      var val = obj[key];

      if (isArray(val)) {
        val.sort();
        var _parts = [];
        for (var j = 0, len2 = val.length; j < len2; ++j) {
          _parts.push(encodeC(key) + '=' + encodeC(val[j]));
        }
        parts.push(_parts.join('&'));
        continue;
      }
      parts.push(encodeC(key) + '=' + encodeC(val));
    }
    return parts.join('&');
  }

};
