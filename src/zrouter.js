/**
 * 浏览器兼容性：
 * hashchange: [Chrome 5.0] [Firefox(Gecko) 3.6] [IE 8.0] [Opera 10.6] [Safari 5.0]
 */
(function(factory) {
  if (typeof define === 'function' && define.cmd) {
    define(function(require, exports, module) {
      factory(exports);
    });
  } else {
    factory(window)
  }
}(function(exports) {

  /// 可以用作分隔符的字符
  /// / - ~ = ! ; @ & #

  /// 可以用作匹配符的字符
  /// + * ? ( ) $

  var dloc = document.location;

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

  /**
   * Utils: dlocHashEmpty 判断当前location.hash是否为空
   * @return {Boolean}
   */
  var dlocHashEmpty = function() {
    return dloc.hash === '' || dloc.hash === '#';
  };

  /**
   * Utils: clone
   * @param {Object} obj
   * @return {Object}
   */
  var clone = function(obj) {
    var newObj = {};
    return newObj;
  };

  /**
   * Utils: mixin
   * @param {Object} destination
   * @param {Object} source
   * @return {Object}
   */
  var mixin = function(destination, source) {
    var newObj = {};
    // if (isPlainObject(destination)) {
    //   for (var o in destination) {
    //     if (destination.hasOwnProperty(o)) {

    //     }
    //   }
    // } else {
    //   destination = {};
    // }
    // for (var p in source) {
    //   if (source.hasOwnProperty(p)) {
    //     var _dest = destination[p], _src = source[p];
    //     if (isPlainObject(_src) && isPlainObject[_dest]) {
    //       newObj[p] = mixin(_dest, _src);
    //     }
    //     if ()
    //     newObj[p] = source[p];
    //   }
    // }
    return {};
  };

  /**
   * Listener
   */
  var Listener = {

    // {[Function]} Listener
    listeners: null,

    /**
     * add to listeners
     * @param {Function} fn
     * @return Listener
     */
    add: function (fn) {

      if (!this.listeners) {
        this.listeners = [];
      }

      this.listeners.push(fn);

      return this;
    },

    /**
     * destroy listener
     * @param {Function} fn
     * @return Listener
     */
    destroy: function (fn) {
      var listeners = this.listeners;
      if (!Router || !listeners) {
        return;
      }
      // 移除
      for (var i = listeners - 1; i >= 0; --i) {
        if (listeners[i] === fn) {
          listeners.splice(i, 1);
        }
      }
      return this;
    },

    setHash: function (s) {
      dloc.hash = (s[0] === '/') ? s : '/' + s;
      return this;
    }

  };

  // hashChange发生时，遍历所有挂在Router.listeners上的监听器，并逐个执行
  // 实现动态添加hashChange监听的方法
  // 一个Router实例对应一个listener
  function onchange(onChangeEvent) {
    var listeners = Listener.listeners;
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i](onChangeEvent);
    }
  }

  window.onhashchange = onchange;

  /**
   * Router (routes)
   * @constructor
   * @param {Object} routes **Optional**
   */
  var Router = exports.Router = function(routes) {
    if (!(this instanceof Router)) return new Router(routes);
    // 规则化参数
    this.params = {};
    this.routes = {};
    // 挂载
    mount.call(this, routes);
    this.options = {};
    // 初始化配置
    this.configure();
  };

  /**
   * @param {String} root [optional]
   * @return this
   */
  Router.prototype.init = function(root) {
    var self = this;
    // 一个Router实例对应一个listener，并按照初始化顺序添加到Router.listeners数组中
    // handler单独处理该路由实例的所有路由
    this.handler = function(onChangeEvent) {
      var newURL = onChangeEvent && onChangeEvent.newURL || window.location.hash;
      var url = newURL.replace(/.*#/, '');
      // dispatch
      dispatch.call(self, url.charAt(0) === '/' ? url : '/' + url);
    };

    Listener.add(this.handler);
  };

  /**
   * @param {String|RegExp} path
   * @param {Function|Array} handler
   * @return this
   */
  Router.prototype.on = Router.prototype.route = function(path, handler) {};

  /**
   * @param {Object} options **Optional**
   * @return this
   */
  Router.prototype.configure = function(options) {
    options = options || {};
    this.notfound = options.notFound;
  };

  /**
   * @param {String|Array} token
   * @param {String|RegExp} matcher
   * @return this
   */
  Router.prototype.param = function(token, matcher) {
    var compiled = new RegExp(token, "g");
    this.params[token] = function(str) {
      return str.replace(compiled, matcher.source || matcher);
    };
    return this;
  };
  
  /**
   * redirect to another route
   * @param {String} path
   * @return this
   */
  Router.prototype.redirect = function(path) {
    // redirect to another route...
    Listener.setHash(path);
    return this;
  };

  /**
   * 挂载新的路由
   */
  function mount(routes) {
    for (var p in routes) {
      if (hasOwn.call(routes, p)) {
        if (isFunction(routes[p])) {
          // 替换特定规则参数（通过.param()方法定义的参数）
          // 替换其它参数
          var rp = p.replace(/\:[a-zA-Z0-9_]+/g, '([^\-\=\&\@\/\!]+)');
          var rule = new RegExp('^' + rp + '$').source;
          // 插入路由表
          this.routes[rule] = routes[p];
        }
      }
    }
  }

  /**
   * turn query string into object
   * e.g. color=ffee88&width=12                           =>  {color: "ffee88", width: 12}
   *      color=ffee88&arr[0]=12&arr[1]=13                =>  {color: "ffee88", arr: [12, 13]}
   *      color=ffee88&obj['name']=wuzijie&obj['age']=23  =>  {color: "ffee88", obj: {name: "wuzijie", age: 23}}
   * @param {String} queryString
   * @erturn {Object}
   * @todo 未支持多维数组或嵌套对象
   */
  var parseQueryString = function(queryString) {
    var queryArr = queryString.split('&');
    var param = {};
    var objectLike = /^([0-9a-zA-Z_]+)\[([0-9a-zA-Z_]+)\]$/;
    for (var i = 0, len = queryArr.length; i < len; ++i) {
      var _param = queryArr[i].split('=');
      if (_param.length < 2) {
        continue;
      }
      var key = _param[0], value = _param.slice(1).join('');
      // 判断是不是数组或对象
      var matches = key.match(objectLike);
      if (matches === null) {
        // 不是数组或对象，直接覆盖
        param[key] = value;
        continue;
      }
      key = matches[1];
      var index = matches[2], currentValue = param[key];
      if (typeof currentValue === "undefined") { // 未定义
        if (/^[0-9]+$/.test(index)) { // 如果index为整数，就假定是数组
          currentValue = [];
        } else { // 否则就假定是对象
          currentValue = {};
        }
      } else if (isArray(currentValue) && !/^[0-9]+$/.test(index)) { // 之前假定是数组，但发现不是（因为当前索引不是整数）
        // 转为对象
        var newCurrentValue = {};
        for (var j = 0, len2 = currentValue.length; j < len2; ++j) {
          if (typeof currentValue[j] === "undefined") continue; // 可能是稀疏数组
          newCurrentValue[j] = currentValue[j];
        }
        currentValue = newCurrentValue;
      }
      currentValue[index] = value;
      param[key] = currentValue;
    }
    return param;
  };

  function dispatch(path) {
    var routes = this.routes;
    var match = false;
    // 保存原始请求uri
    var uri = path;
    // 取出query部分
    var queryIndex = path.indexOf('?');
    var query = queryIndex === -1 ? '' : path.slice(queryIndex+1);
    path = queryIndex === -1 ? path : path.slice(0, queryIndex);
    for (var p in routes) {
      if (hasOwn.call(routes, p)) {
        var pathRegExp = new RegExp(p);
        var matches = path.match(pathRegExp);
        if (matches !== null) {
          match = true;
          var params = matches.slice(1);
          routes[p].call(this, {
            uri: uri,
            path: path,
            params: params,
            query: parseQueryString(query)
          });
          break;
        }
      }
    }
    if (!match && this.notfound) {
      this.notfound.call(this);
    }
  }

}));
