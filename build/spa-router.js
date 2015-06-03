/* spa-router by zcoding, MIT license, 2015-06-03 version: 0.3.10 */
/// 浏览器兼容性：
/// onhashchange: [IE 8.0]
/// history.pushState: [IE 10.0]

(function(factory) {
  if (typeof define === 'function' && define.cmd) {
    define(function(require, exports, module) {
      factory(exports);
    });
  } else {
    factory(window)
  }
}(function(exports) {

var toString = Object.prototype.toString,
  hasOwnProperty = Object.prototype.hasOwnProperty,
  decodeC = window.decodeURIComponent,
  encodeC = window.encodeURIComponent;
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

  addEvent = function(name, handler) {
    if (window.addEventListener) {
      window.addEventListener(name, handler, false);
    } else if (window.attachEvent) {
      window.attachEvent('on' + name, handler);
    } else {
      window['on' + name] = handler;
    }
  };

var queryHelper = {
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

  stringify: function(obj) {
    if (!obj) {
      return '';
    }
    var keys = [];
    for (var p in obj) {
      if (hasOwnProperty.call(obj, p)) {
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

/**
 * RNode
 * @constructor
 * @param {String} value 必须
 *
 * value:     区分同级节点的唯一标识
 * params:    value包含的参数，使用{参数名:参数规则}键值对表示
 * before:    路由匹配时，url改变之前执行的回调函数或队列
 * callbacks: 路由匹配时执行的回调函数或队列
 * after:     路由匹配时，url改变之后，callbacks执行完再执行的回调函数或队列
 *
 * _children: 子节点引用列表
 * _parent:   父节点引用
 */
var RNode = function(value) {
  if (typeof value === 'undefined') throw new TypeError('The RNode Constructor Need A Value.');
  this.value = value;
  this.params = {};
  this.callbacks = null;
  this.before = null;
  this.after = null;
  this._children = [];
  this._parent = null;
};

var nprtt = RNode.prototype;

/**
 * set/get children
 * @param {RNode|[RNode]} children **optional**
 * @return {[RNode]|RNode} return children node list or this
 */
nprtt.children = function(children) {
  if (typeof children === 'undefined') {
    return this._children;
  }
  if (children instanceof RNode) {
    this._children.push(children);
  } else if (isArray(children)) {
    this._children = this.children.concat(children);
  }
  return this;
};

/**
 * set/get parent
 * @param {RNode} parent **optional**
 * @return {RNode} return parent node or this
 */
nprtt.parent = function(parent) {
  if (typeof parent === 'undefined') {
    return this._parent;
  }
  if (parent instanceof RNode) {
    this._parent = parent;
  }
  return this;
};

var historySupport = typeof window['history'] !== 'undefined';

/// Listener
var Listener = {

  listeners: null,

  history: false,

  init: function(mode) {
    this.history = mode === 'history';
    if (this.history && historySupport) { // IE 10+
      addEvent('popstate', onchange);
    } else {
      addEvent('hashchange', onchange);
    }
    return this;
  },

  add: function (fn) {

    if (!this.listeners) {
      this.listeners = [];
    }

    this.listeners.push(fn);

    return this;
  },

  setHashHistory: function (path) {
    if (this.history) {
      history.pushState({}, document.title, path);
    } else {
      if (path[0] === '/') {
        window.location.hash = path;
      } else {
        var currentHash = window.location.hash;
        var idf = currentHash.indexOf('?');
        if (idf !== -1) {
          currentHash = currentHash.slice(0, idf);
        }
        if (/.*\/$/.test(currentHash)) {
          window.location.hash = currentHash + path;
        } else {
          var hash = currentHash.replace(/([^\/]+|)$/, function($1) {
            return $1 === '' ? '/' + path : path;
          });
          window.location.hash = hash;
        }
      }
    }
    return this;
  }

};

function onchange(onChangeEvent) {
  var listeners = Listener.listeners;
  for (var i = 0, l = listeners.length; i < l; i++) {
    listeners[i](onChangeEvent);
  }
}

var defaults = {
  // mode可以是history|hashbang|default
  // mode:history     使用HTML5 History API
  // mode:hashbang    使用hash（hashbang模式）
  // mode:[default]   使用hash（非hashbang模式）
  mode: 'default',
  notFound: false,
  always: false,
  on: false,
  before: false,
  after: false,
  recurse: false // 参考director
};

/**
 * Router (routes)
 * @constructor
 * @param {Object} routes **Optional**
 */
var Router = exports.Router = function(routes) {
  routes = routes || {};
  if (!(this instanceof Router)) return new Router(routes);
  var root = new RNode(''); // 根路径的value指定为空字符串
  root.params = false;
  this.routeTree = createRouteTree(root, routes);
  this.options = {};
  this.configure(defaults);
};

var rprtt = Router.prototype;

/**
 * @param {Object} options **Optional**
 * @return this
 */
rprtt.configure = function(options) {
  options = options || {};
  this.options = extend(this.options, options);
  return this;
};

/**
 * @param {Object} options
 * @return this
 */
rprtt.init = function(options) {
  options = options || {};
  var self = this;

  // 初始化配置
  this.configure(options);
  
  this.handler = function(onChangeEvent) {
    var newURL = onChangeEvent && onChangeEvent.newURL || window.location.hash; // 兼容hashchange事件中调用和第一次调用
    var url;
    switch(self.options.mode) {
      case 'history':
        url = window.location.pathname + window.location.search + window.location.hash;
        if (url.substr(0, 1) !== '/') {
          url = '/' + url;
        }
        break;
      case 'hashbang':
        url = newURL.replace(/.*#!/, '');
        break;
      default:
        url = newURL.replace(/.*#/, '');
    }
    self.dispatch(url.charAt(0) === '/' ? url : '/' + url);
  };
  Listener.init(this.options.mode).add(this.handler);

  // 首次触发
  this.handler();

  return this;
};

/**
 * 将路由挂载到某个节点上
 * e.g. router.mount('/user', {'/list': function() {}});
 * @param {String} path
 * @param {Object} routes
 * @return this
 * */
rprtt.mount = function(path, routes) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  createRouteTree(findNode(this.routeTree, path), routes);
  return this;
};

/**
 * .on()
 *
 * @param {String|RegExp} path
 * @param {Function|Array} handlers
 * @return this
 */
rprtt.on = rprtt.route = function(path, handlers) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  var n = findNode(this.routeTree, path);
  n.callbacks = n.callbacks || [];
  if (isArray(handlers)) {
    n.callbacks = n.callbacks.concat(handlers);
  } else if (isFunction(handlers)) {
    n.callbacks.push(handlers);
  }
  return this;
};

/**
 * 根据给定的path，查找路由树，返回path对应的节点。如果节点不存在就创建新的节点
 * 匹配参数（参数名由字母、数字、下划线组成，不能以数字开头。后面带括号的是特定参数的匹配规则。）
 * @param {RNode} tree
 * @param {String} path
 * @return {RNode}
 * */
function findNode(tree, path) {
  var parts = path.split('/');
  var target = null, found = false;
  var parent = tree;
  var params;
  for (var i = 0, len = parts.length; i < len; ++i) {
    params = false;
    var realCurrentValue = parts[i];

    var matcher = /:([a-zA-Z_][a-zA-Z0-9_]*)(\([^\)]+\))?/g;

    var k = 0;

    realCurrentValue = realCurrentValue.replace(matcher, function($1, $2, $3) {
      params = params || [];
      params[k++] = $2;
      if (typeof $3 === 'undefined') {
        return '([a-zA-Z0-9_]+)';
      } else {
        return $3;
      }
    });

    for (var j = 0; j < parent._children.length; ++j ) {
      if (parent._children[j].value === realCurrentValue) {
        target = parent._children[j];
        found = true;
        break;
      }
    }
    if (!found) { // 不存在，创建新节点
      var extendNode = new RNode(realCurrentValue);
      parent.children(extendNode);
      extendNode.parent(parent);
      extendNode.params = params;
      target = extendNode;
    }
    parent = target;
    found = false;
  }
  return target;
}

/**
 * 构造路由树/子树
 * @param {RNode} root 当前根节点
 * @param {Object} routes 当前节点的路由表
 * @return {RNode} 返回根节点
 * */
function createRouteTree(root, routes) {

  if (isFunction(routes)) {
    root.callbacks = [routes];
    return root;
  } else if (isArray(routes)) {
    root.callbacks = routes;
    return root;
  }

  for (var path in routes) {
    if (routes.hasOwnProperty(path)) {

      var fns = routes[path];

      if (path === '/') {
        createRouteTree(root, fns);
      } else {
        if (path !== '' && path[0] === '/') {
          path = path.slice(1);
        }
        createRouteTree(findNode(root, path), fns);
      }

    }
  }

  return root;
}

/**
 * @param {RNode} root 当前节点
 * @param {Array} parts 路径分段数组
 * @param {Integer} ci 当前路径分段索引
 * @param {Integer} ri 当前节点所在兄弟节点列表的位置
 * @params {Object} params 记录参数的对象
 * @return {[RNode, Object]} 同时返回节点和参数
 */
function dfs(root, parts, ci, ri, params) {

  var value = parts[ci];

  var newParams = {};
  for (var p in params) { // 将旧参数对象复制到新参数对象
    if (params.hasOwnProperty(p)) {
      newParams[p] = params[p];
    }
  }

  var parent = root.parent();

  if (parent === null && ri > 0) { // finally not matched
    return [false, newParams];
  }

  if (parent !== null && ri > parent._children.length-1) { // not matched, go back
    return [false, newParams];
  }

  if (ci > parts.length-1 || ci < 0) return [false, newParams];

  var matcher = new RegExp('^' + root.value + '$');
  var matches = value.match(matcher);

  if (matches === null) return [false, newParams]; // not matched, go back

  if (!!root.params) {
    matches = [].slice.apply(matches, [1]);
    for (var k = 0; k < matches.length; ++k) {
      newParams[root.params[k]] = matches[k];
    }
  }

  if (ci === parts.length-1 && root.callbacks !== null) { // finally matched
    return [root, newParams];
  }

  // matched, go ahead
  for (var i = 0; i < root._children.length; ++i) {
    var found = dfs(root._children[i], parts, ci+1, i, newParams);
    if (!found[0]) continue;
    return found;
  }

  // not matched, go back
  return dfs(root, parts, ci, ri+1, params);

}

/**
 * 搜索路由树，看是否存在匹配的路径，如果存在，返回相应的回调函数
 * @todo 只返回第一个匹配到的路由（如果存在多个匹配？）
 * @param {RNode} tree 树根
 * @param {String} path 要匹配的路径
 * 返回值包含两个，用数组表示[callbacks, params]
 * @return {Function|Array|null} 如果存在就返回相应的回调，否则返回null
 * @return {[Array, Object]} 同时返回回调和参数
 *
 * */
function searchRouteTree(tree, path) {

  var found = dfs(tree, path.split('/'), 0, 0, {});

  if (!found[0]) {
    return [null, {}];
  }

  return [found[0].callbacks, found[1]]

}

/**
 * dispatch
 * 根据给定的路径，遍历路由树，只要找到一个匹配的就把路由返回
 * @param {String} path
 * @return this
 */
rprtt.dispatch = function(path) {

  var routeTree = this.routeTree;
  // 保存原始请求uri
  var uri = path;
  // 取出query部分
  var queryIndex = path.indexOf('?');
  var hashIndex = path.indexOf('#');
  hashIndex = hashIndex === -1 ? path.length : hashIndex;
  var queryString = queryIndex === -1 ? '' : path.slice(queryIndex+1, hashIndex);
  path = queryIndex === -1 ? path : path.slice(0, queryIndex);
  var req = {uri: uri, path: path, query: queryHelper.parse(queryString)};

  if (path === '/') {
    path = '';
  }
  var result = searchRouteTree(routeTree, path);
  var callbacks = result[0];
  req.params = result[1];
  if (callbacks !== null) {
    if (isArray(callbacks)) {
      for (var i = 0, len = callbacks.length; i < len; ++i) { // 不考虑异步操作
        callbacks[i].call(this, req);
      }
    } else {
      throw new TypeError('callbacks must be an array type');
    }
  } else if (this.options.notFound) {
    this.options.notFound(req);
  }

  return this;

};

/**
 * 这个方法会改变当前的`url`，从而触发路由（和dispatch类似，但是dispatch不会改动`url`）
 * 这个方法对于hash/hashbang模式没有多大用处，用户可以通过点击<a>标签实现`url`改变而不跳转页面，但是在history模式下，用户无法通过标签改变`url`而不跳转页面
 * 改方法相当于调用一次history.pushState()然后再调用.dispatch()
 *
 * @param {String} path
 * @return this
 */
rprtt.setRoute = function(path) {
  Listener.setHashHistory(path);
  if (this.options.mode === 'history') {
    var loc = window.location;
    this.dispatch(loc.pathname + loc.search + loc.hash);
  }
  return this;
};

/**
 * the same as .setRoute()
 */
rprtt.redirect = rprtt.setRoute;

/**
 * 和.on()方法类似，但只会触发一次
 * @param {String|RegExp} path
 * @param {Function|Array} handlers
 * @return this
 */
rprtt.once = function(path, handlers) {};

/**
 * .off()方法表示不再侦听某个路由，直接将该路由节点的所有callbacks、before、after、params移除
 */
rprtt.off = function(path) {};

}));