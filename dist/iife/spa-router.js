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

var isArray = Array.isArray ? Array.isArray : function (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
};

function makeSureArray(obj) {
  return isArray(obj) ? obj : obj ? [obj] : [];
}

function RNode(value) {
  this.path = value;
  this.params = {};
  this._hooks = {};
  this.children = [];
  this.parent = null;
}

var proto$1 = RNode.prototype;

proto$1.callHooks = function _callHooks(hookName, Req) {
  var callbacks = this._hooks[hookName] || [];
  for (var i = 0; i < callbacks.length; ++i) {
    callbacks[i].call(this, Req);
  }
};

proto$1.addHooks = function addHooks(hookName, callbacks) {
  this._hooks[hookName] = makeSureArray(callbacks);
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

function createRNode(value) {
  return new RNode(value);
}

var historySupport = typeof window.history['pushState'] !== "undefined";

var Listener = {
  listeners: [],

  setUrlOnly: false,

  init: function init() {
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
  },
  stop: function stop() {}
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
  createIfNotFound = !!createIfNotFound;
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

    /* jshint ignore:start */
    realCurrentValue = realCurrentValue.replace(matcher, function ($1, $2, $3) {
      params = params || [];
      params[k++] = $2;
      if (!$3) {
        // In IE 8 , $3 is an empty String while in other browser it is undefined.
        return '([a-zA-Z0-9_]+)';
      } else {
        return $3;
      }
    });
    /* jshint ignore:end */

    for (var j = 0; j < parent.children.length; ++j) {
      if (parent.children[j].path === realCurrentValue) {
        target = parent.children[j];
        found = true;
        break;
      }
    }
    if (!found) {
      // 不存在，创建新节点
      if (!createIfNotFound) return {
          v: false
        };
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
  return findNode(rootNode, routePath, true);
}

// 构造路由树
function createRouteTree(routeNode, routeOptions) {

  routeNode.addHooks('beforeEnter', routeOptions.beforeEnter);
  routeNode.addHooks('callbacks', routeOptions.controllers);
  routeNode.addHooks('beforeLeave', routeOptions.beforeLeave);
  if (routeOptions.sub) {
    // 子路由
    for (var subRoutePath in routeOptions.sub) {
      if (routeOptions.sub.hasOwnProperty(subRoutePath)) {
        var subRouteNode = createRouteNodeInPath(routeNode, subRoutePath);
        createRouteTree(subRouteNode, routeOptions.sub[subRoutePath]);
      }
    }
  }
}

// 创建根结点
function createRootRouteTree(routes) {
  var rootRouteNode = createRNode('');
  createRouteTree(rootRouteNode, {
    sub: routes
  });
  return rootRouteNode;
}

/**
 * @param {RNode} currentRouteNode 当前节点
 * @param {Array} parts 路径分段数组
 * @param {Integer} ci 当前路径分段索引
 * @param {Integer} ri 当前节点所在兄弟节点列表的位置
 * @params {Object} params 记录参数的对象
 * @return {[RNode, Object]} 同时返回节点和参数
 */
function dfs(currentRouteNode, parts, ci, ri, params) {

  var value = parts[ci];

  var newParams = {};
  for (var p in params) {
    // copy: params => newParams
    if (params.hasOwnProperty(p)) {
      newParams[p] = params[p];
    }
  }

  var parent = currentRouteNode.parent;

  if (parent === null && ri > 0) {
    // finally not matched
    return [false, newParams];
  }

  if (parent !== null && ri > parent.children.length - 1) {
    // not matched, go back
    return [false, newParams];
  }

  if (ci > parts.length - 1 || ci < 0) return [false, newParams];

  var matcher = new RegExp('^' + currentRouteNode.path + '$');
  var matches = value.match(matcher);

  if (matches === null) return [false, newParams]; // not matched, go back

  if (!!currentRouteNode.params) {
    matches = [].slice.apply(matches, [1]);
    for (var k = 0; k < matches.length; ++k) {
      newParams[currentRouteNode.params[k]] = matches[k];
    }
  }

  if (ci === parts.length - 1 && currentRouteNode.callbacks !== null) {
    // finally matched
    return [currentRouteNode, newParams];
  }

  for (var i = 0; i < currentRouteNode.children.length; ++i) {
    var found = dfs(currentRouteNode.children[i], parts, ci + 1, i, newParams); // matched, go ahead
    if (!found[0]) continue;
    return found;
  }

  return dfs(currentRouteNode, parts, ci, ri + 1, params); // not matched, go back
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

  var result = dfs(tree, path.split('/'), 0, 0, {});

  if (!result[0]) {
    return [null, {}];
  }

  return [result[0], result[1]];
}

// export function removeRNode (rnode) {
//   const _parent = rnode._parent;
//   if (_parent) {
//     for (let i = 0; i < _parent.children.length; ++i) {
//       if (_parent.children[i] === rnode) {
//         _parent.children.splice(i, 0);
//         break;
//       }
//     }
//   }
//   return rnode;
// }

var lastReq = null;

function handlerHashbangMode(onChangeEvent) {
  var hash = location.hash.slice(1);
  if (hash === '' || hash === '!') {
    return this.go('/');
  }
  var newURL = onChangeEvent && onChangeEvent.newURL || location.hash;
  var url = newURL.replace(/.*#!/, '');
  this.dispatch(url.charAt(0) === '/' ? url : '/' + url);
}

function handlerHistoryMode(onChangeEvent) {
  var url = location.pathname + location.search + location.hash;
  if (url.substr(0, 1) !== '/') {
    url = '/' + url;
  }
  this.dispatch(url.charAt(0) === '/' ? url : '/' + url);
}

function start() {
  var _handler = this._mode === 'history' ? handlerHistoryMode : handlerHashbangMode;
  var _this = this;
  Listener.init(this._mode).add(function () {
    return _handler.call(_this);
  });
  // 首次触发
  _handler.call(this);
  return this;
}

function stop$1() {
  Listener.stop();
  return this;
}

function destroy() {}

/**
 * @param {String} path
 * @param {Object} routes
 * @return this
 */
function mount(path, routes) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  createRouteTree(findNode(this.routeTree, path), routes);
  return this;
}

// 根据给定的路径，遍历路由树，只要找到一个匹配的就把路由返回
function dispatch(path) {
  if (lastReq) {
    this._callHooks('beforeEachLeave', lastReq);
  }
  var routeTree = this._rtree;
  // 保存原始请求uri
  var uri = path;
  var queryIndex = path.indexOf('?');
  var hashIndex = path.indexOf('#');
  hashIndex = hashIndex === -1 ? path.length : hashIndex;
  var queryString = queryIndex === -1 ? '' : path.slice(queryIndex + 1, hashIndex);
  path = queryIndex === -1 ? path : path.slice(0, queryIndex);
  var Req = { uri: uri, path: path, query: QS.parse(queryString), $router: this };

  if (path === '/') {
    path = '';
  }
  var result = searchRouteTree(routeTree, path);
  // const callbacks = result[0].callbacks;
  Req.params = result[1];
  this._callHooks('beforeEachEnter', Req);
  if (result[0]) {
    result[0].callHooks('beforeEnter', Req);
    result[0].callHooks('callbacks', Req);
  }
  // if (callbacks !== null) {
  //   const _callbacksCopy = callbacks.slice(0); // 复制一个，避免中间调用了 off 导致 length 变化
  //   for (let i = 0; i < _callbacksCopy.length; ++i) {
  //     const previousCallbackReturnValue = _callbacksCopy[i].call(this, Req);
  //     if (previousCallbackReturnValue === false) {
  //       break;
  //     }
  //   }
  // }
  lastReq = Req;
  return this;
}

/**
 * @param {String|RegExp} path
 * @param {Function|Array} handlers
 * @return this
 */
function on(path, handlers) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  var n = findNode(this.routeTree, path);
  n.callbacks = n.callbacks || [];
  if (isArray(handlers)) {
    n.callbacks = n.callbacks.concat(handlers);
  } else if (typeof handlers === 'function') {
    n.callbacks.push(handlers);
  }
  return this;
}

/**
 * .off() 方法表示不再侦听某个路由的某个 cb
 * 如果没有指定 cb 则直接将该路由节点的所有 callbacks 移除并设置为 null
 * 如果 callbacks 已经全部移除，则设置为 null
 * @return this
 */
function off(path, cb) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  var n = findNode(this.routeTree, path, true);
  if (n && n.callbacks) {
    if (cb) {
      for (var i = 0; i < n.callbacks.length; ++i) {
        if (n.callbacks[i] === cb) {
          n.callbacks.splice(i, 1);
          break;
        }
      }
    } else {
      n.callbacks.splice(0, n.callbacks.length);
    }
    if (n.callbacks.length === 0) {
      n.callbacks = null;
    }
  }
  return this;
}

/**
 * 和.on()方法类似，但只会触发一次
 * @param {String|RegExp} path
 * @param {Function|Array} handlers
 * @return this
 */
function once(path, handlers) {
  var _this = this;
  function onlyOnce(req) {
    for (var i = 0; i < handlers.length; ++i) {
      handlers[i].call(_this, req);
    }
    _this.off(path, onlyOnce);
  }
  return this.on(path, onlyOnce);
}

/**
 * 这个方法会改变当前的`url`，从而触发路由（和dispatch类似，但是dispatch不会改动`url`）
 * 这个方法对于hash/hashbang模式没有多大用处，用户可以通过点击<a>标签实现`url`改变而不跳转页面，但是在history模式下，用户无法通过标签改变`url`而不跳转页面
 * 改方法相当于调用一次history.pushState()然后再调用.dispatch()
 * 如果url没有改变，则不"刷新"
 *
 * @param {String} path
 * @return this
 */
function go(path) {
  var loc = window.location;
  var oldURI = loc.pathname + loc.search;
  Listener.setHashHistory(path);
  var newURI = loc.pathname + loc.search;
  if (this.options.mode === 'history' && oldURI !== newURI) {
    this.dispatch(newURI);
  }
  return this;
}

function back() {}

/**
 * 这个方法会改变当前的 `url` 但是不触发路由
 */
function setUrlOnly(path) {
  Listener.setUrlOnly = true; // make sure not to trigger anything
  Listener.setHashHistory(path);
  return this;
}

/**
 * reload page: redispatch current path
 * @method
 * @return this
 */
function reload() {
  if (this.options.mode === 'history') {
    this.dispatch(location.pathname + location.search + location.hash);
  } else if (this.options.mode === 'hashbang') {
    this.dispatch(location.hash.slice(2));
  } else {
    this.dispatch(location.hash.slice(1));
  }
  return this;
}

function plugin(register) {}

var optionDefaults = {
  mode: 'hashbang',
  recurse: false // TODO
};

/**
 * Router (routes)
 * @constructor
 * @param {Object} routes **Optional**
 */
// 虽然允许在同一个应用创建多个 Router ，但是正常情况下你只需要创建一个实例
function Router(routes, options) {
  routes = routes || {};
  this._rtree = createRootRouteTree(routes);
  this.options = {};
  this._hooks = {}; // 全局钩子
  this._init(options);
}

var _mode = 'hashbang';
var _alreadySetMode = false;

Router.mode = function setMode(mode) {
  if (_alreadySetMode) return _mode;
  _alreadySetMode = true;
  _mode = mode;
  return _mode;
};

var proto = Router.prototype;

proto._init = function _init(options) {
  options = options || {};
  this.options = extend({}, optionDefaults, options);
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
proto.start = start;

// stop a router
proto.stop = stop$1;

// destroy a router
proto.destroy = destroy;

// register a plugin
proto.plugin = plugin;

// mount a sub-route-tree on a route node
proto.mount = mount;

// dynamic add a route to route-tree
proto.on = on;

// like .on except that it will dispatch only once
proto.once = once;

// stop listen to a route
proto.off = off;

// dispatch a route if path matches
proto.dispatch = dispatch;

proto.go = go;

proto.back = back;

// only set url, don't dispatch any routes
proto.setUrlOnly = setUrlOnly;

// redispatch current route
proto.reload = reload;

return Router;

}());
//# sourceMappingURL=spa-router.js.map
