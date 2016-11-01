var Router = (function () {
'use strict';

function extend() {
  var obj = {};
  var srcList = Array.prototype.slice.call(arguments, 0);
  for (var i = 0, len = srcList.length; i < len; ++i) {
    var src = srcList[i];
    for (var q in src) {
      if (src.hasOwnProperty(q)) {
        obj[q] = src[q];
      }
    }
  }
  return obj;
}

function addEvent(name, handler) {
  if (window.addEventListener) {
    window.addEventListener(name, handler, false);
  } else if (window.attachEvent) {
    window.attachEvent('on' + name, handler);
  } else {
    window['on' + name] = handler;
  }
}

function warn(message) {
  if (window['console'] && console.warn) {
    console.warn(message);
  }
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

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

var RNode = function () {
  function RNode(value) {
    classCallCheck(this, RNode);

    var valueType = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    if (valueType !== 'string') {
      throw new TypeError('Expected a string in the first argument, got ' + valueType);
    }
    this.value = value;
    this.params = {};
    this.callbacks = null;
    this.before = null;
    this.after = null;
    this._children = [];
    this._parent = null;
  }

  /**
   * set/get children
   * @param {RNode|[RNode]} children **optional**
   * @return {[RNode]|RNode} return children node list or this
   */


  createClass(RNode, [{
    key: 'children',
    value: function children(_children) {
      if (undefined === _children) {
        return this._children;
      }
      if (_children instanceof RNode) {
        this._children.push(_children);
      } else if (isArray(_children)) {
        this._children = this._children.concat(_children);
      } else {
        throw new TypeError('Expected RNode or Array in the first argument, got ' + Object.prototype.toString.call(_children));
      }
      return this;
    }

    /**
     * set/get parent
     * @param {RNode} parent **optional**
     * @return {RNode} return parent node or this
     */

  }, {
    key: 'parent',
    value: function parent(_parent) {
      if (undefined === _parent) {
        return this._parent;
      }
      if (_parent instanceof RNode) {
        this._parent = _parent;
      } else {
        throw new TypeError('Expected RNode in the first argument, got ' + Object.prototype.toString.call(_parent));
      }
      return this;
    }
  }]);
  return RNode;
}();

var historySupport = typeof window.history['pushState'] !== "undefined";

/// Listener
var Listener = {
  listeners: null,

  history: false,

  setUrlOnly: false,

  init: function init(mode) {
    this.history = mode === 'history';
    if (this.history) {
      // IE 10+
      if (historySupport) {
        addEvent('popstate', onchange);
      } else {
        this.history = false;
        // warning
        warn('你的浏览器不支持 History API ，只能使用 hashbang 模式');
        addEvent('hashchange', onchange);
      }
    } else {
      addEvent('hashchange', onchange);
    }
    return this;
  },

  add: function add(fn) {
    if (!this.listeners) {
      this.listeners = [];
    }
    this.listeners.push(fn);
    return this;
  },

  setHashHistory: function setHashHistory(path) {
    if (this.history) {
      history.pushState({}, document.title, path);
    } else {
      if (path[0] === '/') {
        location.hash = '!' + path;
      } else {
        var currentURL = location.hash.slice(2); // 去掉前面的#!
        var idf = currentURL.indexOf('?');
        if (idf !== -1) {
          currentURL = currentURL.slice(0, idf);
        }
        if (/.*\/$/.test(currentURL)) {
          location.hash = '!' + currentURL + path;
        } else {
          var hash = currentURL.replace(/([^\/]+|)$/, function ($1) {
            return $1 === '' ? '/' + path : path;
          });
          location.hash = '!' + hash;
        }
      }
    }
    return this;
  }
};

function onchange(onChangeEvent) {
  if (Listener.setUrlOnly) {
    Listener.setUrlOnly = false;
    return false;
  }
  var listeners = Listener.listeners;
  for (var i = 0, l = listeners.length; i < l; i++) {
    listeners[i](onChangeEvent);
  }
}

var querystring = {
  /**
   * querystring.stringify
   * @param { Object } obj
   * @param { Boolean } traditional [default:false]
   * @return { String }
   *
   * traditional is true:  {x: [1, 2]} => 'x=1&x=2'
   * traditional is false: {x: [1, 2]} => 'x[]=1&x[]=2'
   */
  stringify: function stringify(obj, traditional) {
    if (!obj) {
      return '';
    }
    var appendString = traditional ? '' : '[]';
    var names = Object.keys(obj).sort();

    var parts = [];
    for (var i = 0; i < names.length; ++i) {
      var name = names[i];
      var value = obj[name];

      if (Array.isArray(value)) {
        value.sort();
        var _parts = [];
        for (var j = 0; j < value.length; ++j) {
          _parts.push('' + encodeURIComponent(name).replace(/%20/g, '+') + appendString + '=' + encodeURIComponent(value[j]).replace(/%20/g, '+'));
        }
        parts.push(_parts.join('&'));
        continue;
      }
      parts.push(encodeURIComponent(name).replace(/%20/g, '+') + '=' + encodeURIComponent(value).replace(/%20/g, '+'));
    }
    return parts.join('&');
  },

  /**
   * querystring.parse
   * @param { String } queryString
   * @return { Object }
   * 
   * 'x=1&y=2' => {x: 1, y: 2}
   * 'x=1&x=2' => {x: 2}
   */
  parse: function parse(queryString) {
    if (typeof queryString !== 'string') {
      return {};
    }

    queryString = queryString.trim().replace(/^(\?|#)/, '');

    if (queryString === '') {
      return {};
    }

    var queryParts = queryString.split('&');

    var query = {};

    for (var i = 0; i < queryParts.length; ++i) {
      var parts = queryParts[i].replace(/\+/g, '%20').split('='); // 特殊字符`+`转换为空格
      var name = parts[0],
          value = parts[1];

      name = decodeURIComponent(name);

      value = value === undefined ? null : decodeURIComponent(value);

      if (!query.hasOwnProperty(name)) {
        query[name] = value;
      } else if (Array.isArray(query[name])) {
        query[name].push(value);
      } else {
        query[name] = [query[name], value];
      }
    }
    return query;
  }
};

// TODO: root怎么处理？
function handler(onChangeEvent) {
  var mode = this.options.mode;
  var url = void 0;
  switch (mode) {
    case 'history':
      url = location.pathname + location.search + location.hash;
      if (url.substr(0, 1) !== '/') {
        url = '/' + url;
      }
      break;
    case 'hashbang':
    default:
      var hash = location.hash.slice(1);
      if (hash === '' || hash === '!') {
        return this.redirect(this.options.root);
      }
      var newURL = onChangeEvent && onChangeEvent.newURL || location.hash;
      url = newURL.replace(/.*#!/, '');
  }
  this.dispatch(url.charAt(0) === '/' ? url : '/' + url);
}

/**
 * 根据给定的path，查找路由树，返回path对应的节点。如果节点不存在就创建新的节点
 * 匹配参数（参数名由字母、数字、下划线组成，不能以数字开头。后面带括号的是特定参数的匹配规则。）
 * @param {RNode} tree
 * @param {String} path
 * @param {Boolean} onlyFind 只找节点，当节点不存在时不要创建新节点
 * @return {RNode}
 * */
function findNode(tree, path, onlyFind) {
  onlyFind = !!onlyFind;
  var parts = path.split('/');
  var target = null,
      found = false;
  var parent = tree;
  var params;
  for (var i = 0, len = parts.length; i < len; ++i) {
    params = false;
    var realCurrentValue = parts[i];

    var matcher = /:([a-zA-Z_][a-zA-Z0-9_]*)(\([^\)]+\))?/g;

    var k = 0;

    /* jshint ignore:start */
    realCurrentValue = realCurrentValue.replace(matcher, function ($1, $2, $3) {
      params = params || [];
      params[k++] = $2;
      if (typeof $3 === 'undefined') {
        return '([a-zA-Z0-9_]+)';
      } else {
        return $3;
      }
    });
    /* jshint ignore:end */

    for (var j = 0; j < parent._children.length; ++j) {
      if (parent._children[j].value === realCurrentValue) {
        target = parent._children[j];
        found = true;
        break;
      }
    }
    if (!found) {
      // 不存在，创建新节点
      if (onlyFind) return false;
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

  if (typeof routes === 'function') {
    root.callbacks = [routes];
    return root;
  } else if (Array.isArray(routes)) {
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
  for (var p in params) {
    // copy: params => newParams
    if (params.hasOwnProperty(p)) {
      newParams[p] = params[p];
    }
  }

  var parent = root.parent();

  if (parent === null && ri > 0) {
    // finally not matched
    return [false, newParams];
  }

  if (parent !== null && ri > parent._children.length - 1) {
    // not matched, go back
    return [false, newParams];
  }

  if (ci > parts.length - 1 || ci < 0) return [false, newParams];

  var matcher = new RegExp('^' + root.value + '$');
  var matches = value.match(matcher);

  if (matches === null) return [false, newParams]; // not matched, go back

  if (!!root.params) {
    matches = [].slice.apply(matches, [1]);
    for (var k = 0; k < matches.length; ++k) {
      newParams[root.params[k]] = matches[k];
    }
  }

  if (ci === parts.length - 1 && root.callbacks !== null) {
    // finally matched
    return [root, newParams];
  }

  for (var i = 0; i < root._children.length; ++i) {
    var found = dfs(root._children[i], parts, ci + 1, i, newParams); // matched, go ahead
    if (!found[0]) continue;
    return found;
  }

  return dfs(root, parts, ci, ri + 1, params); // not matched, go back
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

  return [found[0].callbacks, found[1]];
}

var optionDefaults = {
  // mode可以是history|hashbang
  // mode:history     使用HTML5 History API
  // mode:hashbang    使用hash（hashbang模式）
  root: '/', // TODO
  mode: 'hashbang',
  notFound: false,
  recurse: false // TODO
};

/**
 * Router (routes)
 * @constructor
 * @param {Object} routes **Optional**
 */

function Router(routes) {
  routes = routes || {};
  var root = new RNode('');
  root.params = false;
  this.routeTree = createRouteTree(root, routes);
  this.options = {};
  this._hooks = {};
  this.configure(optionDefaults);
}

var proto = Router.prototype;

/**
 * .configure()
 * @method
 * @param {Object} options **Optional**
 * @return this
 */
proto.configure = function (options) {
  options = options || {};
  this.options = extend(this.options, options);
  return this;
};

/**
 * .start()
 * @method
 * @param {Object} options
 * @return this
 */
proto.start = function (options) {
  var _this = this;

  options = options || {};
  this._hooks['beforeEach'] = options.beforeEach ? [options.beforeEach] : [];
  this._hooks['afterEach'] = options.afterEach ? [options.afterEach] : [];
  // 初始化配置
  this.configure(options);
  Listener.init(this.options.mode).add(function () {
    return handler.call(_this);
  });
  // 首次触发
  handler.call(this);
  return this;
};

// 停止路由监听
proto.stop = function () {
  Listener.stop();
  return this;
};

/**
 * .mount() 将路由挂载到某个节点上
 * @method
 * @param {String} path
 * @param {Object} routes
 * @return this
 */
proto.mount = function (path, routes) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  createRouteTree(findNode(this.routeTree, path), routes);
  return this;
};

/**
 * .on()
 * @method
 * @param {String|RegExp} path
 * @param {Function|Array} handlers
 * @return this
 */
proto.on = function (path, handlers) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  var n = findNode(this.routeTree, path);
  n.callbacks = n.callbacks || [];
  if (Array.isArray(handlers)) {
    n.callbacks = n.callbacks.concat(handlers);
  } else if (typeof handlers === 'function') {
    n.callbacks.push(handlers);
  }
  return this;
};

/**
 * .dispatch() 根据给定的路径，遍历路由树，只要找到一个匹配的就把路由返回
 * @method
 * @param {String} path
 * @return this
 */
proto.dispatch = function (path) {
  var routeTree = this.routeTree;
  // 保存原始请求uri
  var uri = path;
  // 取出query部分
  var queryIndex = path.indexOf('?');
  var hashIndex = path.indexOf('#');
  hashIndex = hashIndex === -1 ? path.length : hashIndex;
  var queryString = queryIndex === -1 ? '' : path.slice(queryIndex + 1, hashIndex);
  path = queryIndex === -1 ? path : path.slice(0, queryIndex);
  var req = { uri: uri, path: path, query: querystring.parse(queryString), $router: this };

  if (path === '/') {
    path = '';
  }
  var result = searchRouteTree(routeTree, path);
  var callbacks = result[0];
  req.params = result[1];
  this._callHooks('beforeEach', req);
  if (callbacks !== null) {
    if (Array.isArray(callbacks)) {
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        // 不考虑异步操作
        var pre = callbacks[i].call(this, req); // @TODO 可以中断 callback 的调用
        if (typeof pre === 'boolean' && !pre) {
          // 如果前一个 callback 返回了 false ，就不执行后面的 callback
          break;
        }
      }
    } else {
      throw new TypeError('Expected Array, got ' + (typeof callbacks === 'undefined' ? 'undefined' : _typeof(callbacks)));
    }
  } else if (this.options.notFound) {
    this.options.notFound(req);
  }
  this._callHooks('afterEach', req);
  return this;
};

/**
 * 这个方法会改变当前的`url`，从而触发路由（和dispatch类似，但是dispatch不会改动`url`）
 * 这个方法对于hash/hashbang模式没有多大用处，用户可以通过点击<a>标签实现`url`改变而不跳转页面，但是在history模式下，用户无法通过标签改变`url`而不跳转页面
 * 改方法相当于调用一次history.pushState()然后再调用.dispatch()
 * 如果url没有改变，则不"刷新"
 *
 * @param {String} path
 * @return this
 */
proto.setRoute = function (path) {
  var loc = window.location;
  var oldURI = loc.pathname + loc.search;
  Listener.setHashHistory(path);
  var newURI = loc.pathname + loc.search;
  if (this.options.mode === 'history' && oldURI !== newURI) {
    this.dispatch(newURI);
  }
  return this;
};

/**
 * 这个方法会改变当前的 `url` 但是不触发路由
 */
proto.setUrl = function (path) {
  Listener.setUrlOnly = true;
  Listener.setHashHistory(path);
  return this;
};

/**
 * alias: `setRoute`
 */
proto.redirect = function (path) {
  return this.setRoute(path);
};

/**
 * TODO: once
 * 和.on()方法类似，但只会触发一次
 * @param {String|RegExp} path
 * @param {Function|Array} handlers
 * @return this
 */
proto.once = function (path, handlers) {
  return this;
};

/**
 * .off()方法表示不再侦听某个路由，直接将该路由节点的所有callbacks移除
 * @return this
 */
proto.off = function (path) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  var n = findNode(this.routeTree, path);
  if (n !== null && n.callbacks !== null) {
    n.callbacks.splice(0, n.callbacks.length);
  }
  return this;
};

/**
 * .reload()
 * reload page: redispatch current path
 * @method
 * @return this
 */
proto.reload = function () {
  if (this.options.mode === 'history') {
    this.dispatch(location.pathname + location.search + location.hash);
  } else if (this.options.mode === 'hashbang') {
    this.dispatch(location.hash.slice(2));
  } else {
    this.dispatch(location.hash.slice(1));
  }
  return this;
};

proto._callHooks = function (hookName, req) {
  var callbacks = this._hooks[hookName] || [];
  for (var i = 0; i < callbacks.length; ++i) {
    callbacks[i].call(this, req);
  }
};

return Router;

}());
//# sourceMappingURL=spa-router.js.map
