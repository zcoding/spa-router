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
   * Utils: isArray
   * @param {Obejct} obj
   * @return {Boolean}
   */
  var isArray = function(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };

  /**
   * Utils: dlocHashEmpty 判断当前location.hash是否为空
   * @return {Boolean}
   */
  var dlocHashEmpty = function() {
    return dloc.hash === '' || dloc.hash === '#';
  };

  /**
   * Utils: mixin
   * @param {Object} destination
   * @param {Object} source
   * @return {Object}
   */
  var mixin = function(destination, source) {
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
   * Constructor: Router
   * @param {Object} routes
   */
  var Router = exports.Router = function(routes) {
    if (!(this instanceof Router)) return new Router(routes);
    // 规则化参数
    this.params = {};
    // 路由
    this.routes = {};
  };

  /**
   * @param {String} root [optional]
   * @return this
   */
  Router.prototype.init = function(root) {
    // 一个Router实例对应一个listener，并按照初始化顺序添加到Router.listeners数组中
    // handler单独处理该路由实例的所有路由
    this.handler = function(onChangeEvent) {
      var newURL = onChangeEvent && onChangeEvent.newURL || window.location.hash;
      var url = newURL.replace(/.*#/, '');
      dispatch('on', url.charAt(0) === '/' ? url : '/' + url);
    };

    Listener.add(this.handler);
  };

  /**
   * @param {String|RegExp} path
   * @param {Function|Array} handle
   * @return this
   */
  Router.prototype.on = Router.prototype.route = function(path, handle) {};

  /**
   * Default Configuration
   * {Object}
   */
  var defaults = {};

  /**
   * @param {Object} options
   * @return this
   */
  Router.prototype.configure = function(options) {};

  /**
   * @param {String|Array} token
   * @param {String|RegExp} pattern
   * @return this
   */
  Router.prototype.param = function(token, matcher) {
    var compiled = new RegExp(token, "g");
    this.params[token] = function(str) {
      return str.replace(compiled, matcher.source || matcher);
    };
    return this;
  };

  function dispatch() {}

}));