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

  var dloc = document.location;

  /**
   * Shorthand: hasOwn
   * stand for hasOwnProperty
   * @param {Object} obj
   * @param {String} p
   * @return {Boolean}
   */
  var hasOwn = function(obj, p) {
    return obj.hasOwnProperty(p);
  };

  /**
   * Utils: Each
   * @param {Array} arr
   * @param {Function} iterator
   */
  var each = function(arr, iterator) {
    for (var i = 0, len = arr.length; i < len; ++i) {
      if (iterator(arr[i], i, arr) === false) {
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
   * Constructor: Router (routes)
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
  };

  function mount(routes) {
    for (var p in routes) {
      if (hasOwn(routes, p)) {
        if (isFunction(routes[p])) {
          var rule = new RegExp('^' + p + '$');
          this.routes[rule.source] = routes[p];
        }
      }
    }
  }

  function dispatch(path) {
    var routes = this.routes;
    var match = false;
    for (var p in routes) {
      if (hasOwn(routes, p)) {
        var pathRegExp = new RegExp(p);
        if(pathRegExp.test(path)) {
          match = true;
          routes[p].call(this);
          break;
        }
      }
    }
    if (!match && this.notfound) {
      this.notfound.call(this);
    }
  }

}));
