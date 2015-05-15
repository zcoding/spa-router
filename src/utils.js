var toString = Object.prototype.toString, decodeC = window.decodeURIComponent, encodeC = window.encodeURIComponent;
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
  },

  queryHelper = {
    /**
     * parse query string
     * @param {String} queryString
     * @erturn {Object}
     *
     */
    parse: function(queryString) {
      if (typeof queryString !== 'string') {
        return {};
      }

      queryString = queryString.trim().replace(/^(\?|#)/, '');

      if (!queryString) {
        return {};
      }

      queryString = queryString.replace(/^\s*|\s*$/g, '');

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
        } else if (Array.isArray(query[key])) {
          query[key].push(val);
        } else {
          query[key] = [query[key], val];
        }
      }

      return query;

    },

    stringify: function(obj) {
      return obj ? Object.keys(obj).sort().map(function(key) {
        var val = obj[key];

        if (Array.isArray(val)) {
          return val.sort().map(function(val2) {
            return encodeC(key) + '=' + encodeC(val2);
          }).join('&');
        }

        return encodeC(key) + '=' + encodeC(val);
      }).join('&') : '';
    }
  };