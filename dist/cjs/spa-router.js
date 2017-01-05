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

var isArray = Array.isArray ? Array.isArray : function (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

function makeSureArray(obj) {
  return isArray(obj) ? obj : obj ? [obj] : [];
}

function ArrayCopy(arr) {
  return arr.slice(0);
}

var historySupport = typeof window.history['pushState'] !== "undefined";

var MODE = {
  HASH: 1,
  HASHBANG: 1,
  HISTORY: 2
};

var RouteMode = MODE.HASHBANG;

var _init$1 = false;

/// Listener
var Listener = {
  listeners: [],

  setUrlOnly: false,

  setMode: function setMode(mode) {
    mode = String(mode).toUpperCase();
    RouteMode = MODE[mode] || MODE.HASHBANG;
  },
  init: function init() {
    if (_init$1) {
      return this;
    }
    _init$1 = true;
    if (RouteMode === MODE.HISTORY) {
      // IE 10+
      if (historySupport) {
        addEvent('popstate', onchange);
      } else {
        RouteMode = MODE.HASHBANG;
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
    this.listeners.push(fn);
    return this;
  },
  remove: function remove(id) {
    for (var i = 0; i < this.listeners.length; ++i) {
      if (this.listeners[i].id === id) {
        this.listeners.splice(i, 1);
        break;
      }
    }
    return this;
  },
  setHashHistory: function setHashHistory(targetURL) {
    if (RouteMode === MODE.HISTORY) {
      history.pushState({}, document.title, targetURL);
    } else {
      if (targetURL[0] === '/') {
        location.hash = '!' + targetURL;
      } else {
        var currentURL = location.hash.replace(/^#!?/, ''); // 去掉前面的 #!
        var queryStringIndex = currentURL.indexOf('?');
        if (queryStringIndex !== -1) {
          currentURL = currentURL.slice(0, queryStringIndex);
        }
        if (/.*\/$/.test(currentURL)) {
          location.hash = '!' + currentURL + targetURL;
        } else {
          var hash = currentURL.replace(/([^\/]+|)$/, function ($1) {
            return $1 === '' ? '/' + targetURL : targetURL;
          });
          location.hash = '!' + hash;
        }
      }
    }
    return this;
  },
  stop: function stop() {
    // remove event listener
  }
};

function onchange(onChangeEvent) {
  if (Listener.setUrlOnly) {
    Listener.setUrlOnly = false;
    return false;
  }
  var listeners = Listener.listeners;
  for (var i = 0, l = listeners.length; i < l; i++) {
    listeners[i].handler.call(null, onChangeEvent);
  }
}

var encode = encodeURIComponent;
var decode = decodeURIComponent;

var QS = {
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
          _parts.push('' + encode(name).replace(/%20/g, '+') + appendString + '=' + encode(value[j]).replace(/%20/g, '+'));
        }
        parts.push(_parts.join('&'));
        continue;
      }
      parts.push(encode(name).replace(/%20/g, '+') + '=' + encode(value).replace(/%20/g, '+'));
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

      name = decode(name);

      value = value === undefined ? null : decode(value);

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

function RNode(value) {
  this.path = value;
  this.params = false;
  this.data = null;
  this._hooks = {};
  this.children = [];
  this.parent = null;
}

var proto$1 = RNode.prototype;

proto$1.callHooks = function _callHooks(hookName, Req) {
  var callbacks = this._hooks[hookName] || [];
  var _copyCallbacks = ArrayCopy(callbacks); // 复制一个，避免中间调用了 off 导致 length 变化
  for (var i = 0; i < _copyCallbacks.length; ++i) {
    var previousCallbackReturnValue = _copyCallbacks[i].call(null, Req);
    if (previousCallbackReturnValue === false) break;
  }
  return this;
};

proto$1.addHooks = function addHooks(hookName, callbacks) {
  this._hooks[hookName] = makeSureArray(callbacks);
  return this;
};

// add children
proto$1.addChildren = function addChildren(children) {
  if (isArray(children)) {
    this.children = this.children.concat(children);
  } else {
    this.children.push(children);
  }
  return this;
};

proto$1.removeChild = function removeChild(child) {
  for (var i = 0; i < this.children.length; ++i) {
    if (this.children[i] === child) {
      this.children.splice(i, 1);
      break;
    }
  }
  return this;
};

function createRNode(value) {
  return new RNode(value);
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





















var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

















var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

/**
 * 根据给定的 path，以 routeTreeRoot 为根节点查找，返回 path 对应的 rnode 节点
 * 如果节点不存在，并且 createIfNotFound 为 true 就创建新节点
 * 匹配参数（参数名由字母、数字、下划线组成，不能以数字开头。后面带括号的是特定参数的匹配规则。）
 * @param {RNode} tree
 * @param {String} path
 * @param {Boolean} createIfNotFound 当节点不存在时创建新节点
 * @return {RNode}
 * */
function findNode(routeTreeRoot, routePath, createIfNotFound) {
  if (routePath === '') {
    // 当前节点
    return routeTreeRoot;
  }
  var parts = routePath.split('/');
  var target = null,
      found = false;
  var parent = routeTreeRoot;
  var params = void 0;

  var _loop = function _loop(i, len) {
    params = false;
    var realCurrentValue = parts[i];

    var matcher = /:([a-zA-Z_][a-zA-Z0-9_]*)(\([^\)]+\))?/g;

    var k = 0;

    function replacement($1, $2, $3) {
      params = params || [];
      params[k++] = $2;
      if (!$3) {
        // In IE 8 , $3 is an empty String while in other browser it is undefined.
        return '([a-zA-Z0-9_]+)';
      } else {
        return $3;
      }
    }

    realCurrentValue = realCurrentValue.replace(matcher, replacement);

    for (var j = 0; j < parent.children.length; ++j) {
      if (parent.children[j].path === realCurrentValue) {
        target = parent.children[j];
        found = true;
        break;
      }
    }
    if (!found) {
      // 不存在
      if (!createIfNotFound) return {
          v: false
        };
      // 创建新节点
      var extendNode = createRNode(realCurrentValue);
      parent.addChildren(extendNode);
      extendNode.parent = parent;
      extendNode.params = params;
      target = extendNode;
    }
    parent = target;
    found = false;
  };

  for (var i = 0, len = parts.length; i < len; ++i) {
    var _ret = _loop(i, len);

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }
  return target;
}

function createRouteNodeInPath(rootNode, routePath) {
  routePath = routePath.replace(/^\/([^\/]*)/, '$1'); // 去掉前置 /
  if (routePath === '*') {
    var rnode = createRNode('');
    rnode.parent = rootNode;
    rootNode.addChildren(rnode);
    return rnode;
  } else {
    return findNode(rootNode, routePath, true);
  }
}

// 构造路由树
function createRouteTree(namedRoutes, routeNode, routeOptions) {
  if (routeOptions.name) {
    if (namedRoutes[routeOptions.name]) {
      warn('\u5DF2\u7ECF\u5B58\u5728\u7684\u5177\u540D\u8DEF\u7531 ' + routeOptions.name + ' \u5C06\u88AB\u8986\u76D6');
    }
    namedRoutes[routeOptions.name] = routeNode;
  }
  if (routeOptions.data) {
    routeNode.data = routeOptions.data;
  }
  routeNode.addHooks('beforeEnter', routeOptions.beforeEnter);
  routeNode.addHooks('callbacks', routeOptions.controllers);
  routeNode.addHooks('beforeLeave', routeOptions.beforeLeave);
  if (routeOptions.sub) {
    // 子路由
    for (var subRoutePath in routeOptions.sub) {
      if (routeOptions.sub.hasOwnProperty(subRoutePath)) {
        var subRouteNode = createRouteNodeInPath(routeNode, subRoutePath);
        createRouteTree(namedRoutes, subRouteNode, routeOptions.sub[subRoutePath]);
      }
    }
  }
}

// 创建根结点
function createRootRouteTree(namedRoutes, routes) {
  var rootRouteNode = createRNode('');
  createRouteTree(namedRoutes, rootRouteNode, {
    sub: routes
  });
  return rootRouteNode;
}

// 计算一个节点在一棵树的层次
function calcRNodeDepth(currentRouteNode) {
  var depth = 0;
  var rnode = currentRouteNode;
  while (rnode) {
    depth++;
    rnode = rnode.parent;
  }
  return depth;
}

/**
 * dfs 找匹配的路由节点
 * @param {RNode} currentRouteNode 当前节点
 * @param {Array} parts 路径分段数组
 * */
function dfs(currentRouteNode, parts) {
  var currentPathValue = parts[0];
  var matcher = new RegExp('^' + currentRouteNode.path + '$');
  var matches = currentPathValue.match(matcher);
  if (!matches) {
    // 当前节点不匹配，返回
    // 如果当前节点是 * 节点，则可能在找不到的时候返回这个节点
    if (currentRouteNode.path === '') {
      return {
        rnode: currentRouteNode,
        params: {},
        notFound: true
      };
    }
    return false;
  }
  var currentParams = {};
  if (currentRouteNode.params) {
    var paramsMatches = Array.prototype.slice.call(matches, 1);
    for (var _k = 0; _k < paramsMatches.length; ++_k) {
      currentParams[currentRouteNode.params[_k]] = paramsMatches[_k];
    }
  }
  if (parts.length === 1) {
    // 在当前节点完成匹配
    return {
      rnode: currentRouteNode,
      params: currentParams
    };
  }
  var notFoundList = [];
  for (var i = 0; i < currentRouteNode.children.length; ++i) {
    var _result = dfs(currentRouteNode.children[i], parts.slice(1));
    if (_result && !_result.notFound) {
      // 在子树中完成匹配
      // 合并 params
      for (var p in _result.params) {
        if (_result.params.hasOwnProperty(p)) {
          currentParams[p] = _result.params[p];
        }
      }
      return {
        rnode: _result.rnode,
        params: currentParams
      };
    }
    if (_result.notFound) {
      // 合并 currentParams
      for (var _p in currentParams) {
        if (currentParams.hasOwnProperty(_p)) {
          _result.params[_p] = currentParams[_p];
        }
      }
      notFoundList.push(_result);
    }
  }
  // 全部路径都走完，找不到匹配项
  // 如果有 * 节点匹配，则返回匹配路径最长的 * 节点
  if (notFoundList.length > 0) {
    var max = -1,
        maxIndex = -1;
    for (var _i = 0; _i < notFoundList.length; ++_i) {
      var depth = calcRNodeDepth(notFoundList[_i].rnode);
      if (depth > max) {
        max = depth;
        maxIndex = _i;
      }
    }
    return notFoundList[maxIndex];
  }
  return false;
}

/**
 * 搜索路由树，看是否存在匹配的路径，如果存在，返回相应的回调函数
 * @todo 只返回第一个匹配到的路由（如果存在多个匹配？）
 * @param {RNode} tree 树根
 * @param {String} path 要匹配的路径
 * 返回值包含两个，用数组表示[rnode, params]
 * @return {Function|Array|null} 如果存在就返回相应的回调，否则返回null
 * @return {[Array, Object]} 同时返回回调和参数
 *
 * */
function searchRouteTree(tree, path) {
  path = path === '/' ? '' : path; // 如果是 / 路径，特殊处理（避免 split 之后多一项）

  var result = dfs(tree, path.split('/'));

  if (result.notFound) {
    return {
      rnode: result.rnode,
      params: result.params
    };
  }

  return result;
}

var lastReq = null;
var lastRouteNode = null;

function handlerHashbangMode(onChangeEvent) {
  var newURL = onChangeEvent && onChangeEvent.newURL || location.hash;
  var url = newURL.replace(/.*#!/, '');
  this.dispatch(url.charAt(0) === '/' ? url : '/' + url);
}

function handlerHistoryMode(onChangeEvent) {
  var url = location.pathname + location.search + location.hash;
  this.dispatch(url.charAt(0) === '/' ? url : '/' + url);
}

function start() {
  if (this._isRunning) {
    // start 只调用一次
    warn('start 方法只能调用一次');
    return this;
  }
  this._isRunning = true;
  var _handler = this.options.mode === 'history' ? handlerHistoryMode : handlerHashbangMode;
  var _this = this;
  Listener.init().add({
    id: this._uid,
    handler: function handler() {
      return _handler.call(_this);
    }
  });
  // 首次触发
  _handler.call(this);
  return this;
}

function stop$1() {
  Listener.remove(this._uid);
  this._isRunning = false;
  return this;
}

function destroy() {
  this.stop();
  this._hooks = null;
  this._rtree = null;
  return null;
}

// 动态添加新路由（可能会替换原有的路由）
function mount(routePath, routes) {
  routePath = routePath.replace(/^\/([^\/]*)/, '$1'); // 去掉前置 /
  var currentRouteNode = findNode(this._rtree, routePath, true);
  createRouteTree(this._namedRoutes, currentRouteNode, routes);
  return this;
}

// 路由描述对象转换为路径
function routeDescObjToPath(namedRoutes, routeDescObj) {
  var routeNode = namedRoutes[routeDescObj.name];
  if (!routeNode) {
    return null;
  }
  var paths = [];
  var rnode = routeNode;
  while (rnode) {
    var pathvalue = rnode.path;
    if (rnode.params && routeDescObj.params) {
      (function () {
        var paramsIndex = 0;
        pathvalue = pathvalue.replace(/\([^\)]+\)/g, function ($1) {
          return routeDescObj.params[rnode.params[paramsIndex++]] || $1;
        });
      })();
    }
    paths.unshift(pathvalue);
    rnode = rnode.parent;
  }
  return paths.join('/');
}

// 根据给定的路径，遍历路由树，只要找到一个匹配的就把路由返回
function dispatch(path) {
  if ((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path !== null) {
    // {name: 'routeName', params: {}}
    path = routeDescObjToPath(this._namedRoutes, path);
  }
  if (lastReq) {
    this._callHooks('beforeEachLeave', lastReq);
    if (lastRouteNode) {
      lastRouteNode.callHooks('beforeLeave', lastReq);
    }
  }
  var routeTree = this._rtree;
  // 保存原始请求uri
  var uri = path;
  var queryIndex = path.indexOf('?');
  var _hashIndex = path.indexOf('#');
  var hashIndex = _hashIndex === -1 ? path.length : _hashIndex;
  var queryString = queryIndex === -1 ? '' : path.slice(queryIndex + 1, hashIndex);
  path = queryIndex === -1 ? path : path.slice(0, queryIndex);
  var Req = { uri: uri, path: path, query: QS.parse(queryString), $router: this };

  if (path === '/') {
    path = '';
  }
  var result = searchRouteTree(routeTree, path);
  if (!result) return this; // 啥都找不到
  var routeNode = result.rnode,
      params = result.params;
  Req.params = params;
  Req.data = routeNode ? routeNode.data : null;
  this._callHooks('beforeEachEnter', Req);
  if (routeNode) {
    routeNode.callHooks('beforeEnter', Req);
    routeNode.callHooks('callbacks', Req);
  }
  lastReq = Req;
  lastRouteNode = routeNode;
  return this;
}

// 动态添加路由回调
function on(routePath, callbacks) {
  routePath = routePath.replace(/^\/([^\/]*)/, '$1'); // 去掉前置 /
  var routeNode = findNode(this._rtree, routePath, true);
  if (!routeNode._hooks['callbacks']) {
    routeNode.addHooks('callbacks', callbacks);
  } else {
    routeNode._hooks['callbacks'] = routeNode._hooks['callbacks'].concat(makeSureArray(callbacks));
  }
  return this;
}

// 动态移除路由回调
function off(routePath, cb) {
  routePath = routePath.replace(/^\/([^\/]*)/, '$1'); // 去掉前置 /
  var routeNode = findNode(this._rtree, routePath, false);
  if (routeNode && routeNode._hooks['callbacks']) {
    if (cb) {
      for (var i = 0; i < routeNode._hooks['callbacks'].length; ++i) {
        if (routeNode._hooks['callbacks'][i] === cb) {
          routeNode._hooks['callbacks'].splice(i, 1);
          break;
        }
      }
    } else {
      routeNode._hooks['callbacks'].splice(0, routeNode._hooks['callbacks'].length);
    }
  }
  if (routeNode && routeNode._hooks['callbacks'] && routeNode._hooks['callbacks'].length === 0 && routeNode.children.length === 0 && routeNode.parent) {
    routeNode.parent.removeChild(routeNode);
  }
  return this;
}

// 动态添加路由回调，但是只响应一次
function once(routePath, callbacks) {
  callbacks = makeSureArray(callbacks);
  var _this = this;
  function onlyOnce(req) {
    for (var i = 0; i < callbacks.length; ++i) {
      callbacks[i].call(_this, req);
    }
    _this.off(routePath, onlyOnce);
  }
  return this.on(routePath, onlyOnce);
}

/**
 * 这个方法会改变当前的 `url`，从而触发路由（和 dispatch 类似，但是 dispatch 不会改动 `url`）
 * 这个方法对于 hash/hashbang 模式没有多大用处，用户可以通过点击<a>标签实现`url`改变而不跳转页面，但是在history模式下，用户无法通过标签改变`url`而不跳转页面
 * 该方法相当于调用一次 history.pushState() 然后再调用 .dispatch()
 * 如果 url 没有改变，不会"刷新"
 *
 * @param {String} path
 * @return this
 */
function go(path) {
  var loc = window.location;
  var oldURI = loc.pathname + loc.search;
  if ((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path !== null) {
    path = routeDescObjToPath(this._namedRoutes, path);
  }
  Listener.setHashHistory(path);
  var newURI = '' + loc.pathname + loc.search;
  if (this.options.mode === 'history' && oldURI !== newURI) {
    this.dispatch(newURI);
  }
  return this;
}

function back() {}

// 改变当前的 `url` 但是不触发路由
// 和 dispatch 刚好相反，dispatch 只触发路由但不改变 `url`
function setUrlOnly(path) {
  if ((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path !== null) {
    path = routeDescObjToPath(this._namedRoutes, path);
  }
  Listener.setUrlOnly = true; // make sure not to trigger anything
  Listener.setHashHistory(path);
  return this;
}

// 重载当前页面
function reload() {
  if (this.options.mode === 'history') {
    this.dispatch('' + location.pathname + location.search + location.hash);
  } else {
    this.dispatch(location.hash.replace(/^#!?/, ''));
  }
  return this;
}

// 创建一个链接

var uid = 0;

// mode: history|hashbang
// history     使用 HTML5 History API
// hashbang    使用 hash（hashbang 模式）
var optionDefaults = {
  mode: 'hashbang',
  recurse: false // @TODO
};

/**
 * Router (routes)
 * @constructor
 * @param {Object} routes **Optional**
 */
// 虽然允许在同一个应用创建多个 Router ，但是正常情况下你只需要创建一个实例
function Router(routes, options) {
  routes = routes || {};
  this._namedRoutes = {}; // 具名路由
  this._rtree = createRootRouteTree(this._namedRoutes, routes);
  this._hooks = {}; // 全局钩子
  this._init(options);
}

Router.QS = QS;

var proto = Router.prototype;

proto._init = function _init(options) {
  options = options || {};
  this._uid = uid++;
  this._isRunning = false;
  this.options = extend({}, optionDefaults, options);
  Listener.setMode(options.mode);
  this._hooks['beforeEachEnter'] = makeSureArray(options.beforeEachEnter);
  this._hooks['beforeEachLeave'] = makeSureArray(options.beforeEachLeave);
};

// 调用全局钩子
proto._callHooks = function _callHooks(hookName, Req) {
  var callbacks = this._hooks[hookName] || [];
  for (var i = 0; i < callbacks.length; ++i) {
    callbacks[i].call(this, Req);
  }
};

// start a router
proto.start = start; // 🆗

// stop a router
proto.stop = stop$1; // 🆗

// destroy a router
proto.destroy = destroy; // 🆗

// mount a sub-route-tree on a route node
proto.mount = mount; // 🆗

// dynamic add a route to route-tree
proto.on = on; // 🆗

// like .on except that it will dispatch only once
proto.once = once; // 🆗

// stop listen to a route
proto.off = off; // 🆗

// dispatch a route if path matches
proto.dispatch = dispatch; // 🆗

proto.go = go; // 🆗

proto.back = back;

// only set url, don't dispatch any routes
proto.setUrlOnly = setUrlOnly; // 🆗

// redispatch current route
proto.reload = reload; // 🆗

module.exports = Router;
//# sourceMappingURL=spa-router.js.map
