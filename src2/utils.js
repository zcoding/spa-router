
var Win = window,
  Loc = Win.location,
  toString = Object.prototype.toString,
  decodeC = Win.decodeURIComponent,
  encodeC = Win.encodeURIComponent;

var TYPE_UNDEFINED = "undefined";

export let hasOwn = Object.prototype.hasOwnProperty;

export let isArray = Array.isArray || function(obj) {
  return toString.call(obj) === "[object Array]";
};

export function isFunction(obj) {
  return toString.call(obj) === "[object Function]";
};

export function extend() {
  var obj = {};
  var srcList = Array.prototype.slice.call(arguments, 0);
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

export function addEvent(name, handler) {
  if (window.addEventListener) {
    window.addEventListener(name, handler, false);
  } else if (window.attachEvent) {
    window.attachEvent('on' + name, handler);
  } else {
    window['on' + name] = handler;
  }
};

export let queryHelper = {
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
