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

  var listener = {
    hash: document.location.hash,

    check: function () {
      var h = document.location.hash;
      if (h != this.hash) {
        this.hash = h;
        this.onHashChanged();
      }
    },

    fire: function () {
      this.onHashChanged();
    },

    init: function (fn) {
      var self = this;

      if (!Router.listeners) {
        Router.listeners = [];
      }

      // hashChange发生时，遍历所有挂在Router.listeners上的监听器，并逐个执行
      // 实现动态添加hashChange监听的方法
      // 一个Router实例对应一个listener
      function onchange(onChangeEvent) {
        for (var i = 0, l = Router.listeners.length; i < l; i++) {
          Router.listeners[i](onChangeEvent);
        }
      }

      window.onhashchange = onchange;

      Router.listeners.push(fn);

      // return this.mode;
    },

    destroy: function (fn) {
      if (!Router || !Router.listeners) {
        return;
      }

      var listeners = Router.listeners;

      for (var i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i] === fn) {
          listeners.splice(i, 1);
        }
      }
    },

    setHash: function (s) {
      dloc.hash = (s[0] === '/') ? s : '/' + s;
      return this;
    },

    onHashChanged: function () {}
  };

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
      self.dispatch('on', url.charAt(0) === '/' ? url : '/' + url);
    };

    listener.init(this.handler);
  };

  /**
   * @param {String|RegExp} path
   * @param {Function|Array} handle
   * @return this
   */
  Router.prototype.on = Router.prototype.route = function(path, handle) {};

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

  // hashChange
  var hashChange = function() {};
  // window.onhashchange = hashChange;

}));