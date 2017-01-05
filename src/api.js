import { extend, addEvent, isArray, makeSureArray, warn } from './utils';
import RNode from './rnode';
import Listener from './listener';
import QS from './querystring';
import { findNode, createRouteTree, searchRouteTree } from './rtree';

let lastReq = null, lastRouteNode = null;

function handlerHashbangMode (onChangeEvent) {
  var hash = location.hash.slice(1);
  if (hash === '' || hash === '!') {
    return this.go('/');
  }
  var newURL = onChangeEvent && onChangeEvent.newURL || location.hash;
  let url = newURL.replace(/.*#!/, '');
  this.dispatch(url.charAt(0) === '/' ? url : '/' + url);
}

function handlerHistoryMode (onChangeEvent) {
  let url = location.pathname + location.search + location.hash;
  if (url.substr(0, 1) !== '/') {
    url = '/' + url;
  }
  this.dispatch(url.charAt(0) === '/' ? url : '/' + url);
}

export function start () {
  if (this._isRunning) { // start 只调用一次
    warn('start 方法只能调用一次');
    return this;
  }
  this._isRunning = true;
  const _handler = this.options.mode === 'history' ? handlerHistoryMode : handlerHashbangMode;
  const _this = this;
  Listener.init().add({
    id: this._uid,
    handler: function handler () {
      return _handler.call(_this);
    }
  });
  // 首次触发
  _handler.call(this);
  return this;
}

export function stop () {
  Listener.remove(this._uid);
  this._isRunning = false;
  return this;
}

export function destroy () {
  this.stop();
  this._hooks = null;
  this._rtree = null;
  return null;
}

// 动态添加新路由（可能会替换原有的路由）
export function mount (routePath, routes) {
  routePath = routePath.replace(/^\/([^\/]*)/, '$1'); // 去掉前置 /
  const currentRouteNode = findNode(this._rtree, routePath, true);
  createRouteTree(currentRouteNode, routes);
  return this;
}

// 根据给定的路径，遍历路由树，只要找到一个匹配的就把路由返回
export function dispatch (path) {
  if (typeof path === 'object' && path !== null) { // {name: 'routeName', params: {}}
  }
  if (lastReq) {
    this._callHooks('beforeEachLeave', lastReq);
    if (lastRouteNode) {
      lastRouteNode.callHooks('beforeLeave', lastReq);
    }
  }
  let routeTree = this._rtree;
  // 保存原始请求uri
  let uri = path;
  var queryIndex = path.indexOf('?');
  var hashIndex = path.indexOf('#');
  hashIndex = hashIndex === -1 ? path.length : hashIndex;
  const queryString = queryIndex === -1 ? '' : path.slice(queryIndex+1, hashIndex);
  path = queryIndex === -1 ? path : path.slice(0, queryIndex);
  const Req = {uri: uri, path: path, query: QS.parse(queryString), $router: this};

  if (path === '/') {
    path = '';
  }
  const result = searchRouteTree(routeTree, path);
  const routeNode = result[0], params = result[1];
  Req.params = params;
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
export function on (routePath, callbacks) {
  routePath = routePath.replace(/^\/([^\/]*)/, '$1'); // 去掉前置 /
  const routeNode = findNode(this._rtree, routePath, true);
  if (!routeNode._hooks['callbacks']) {
    routeNode.addHooks('callbacks', callbacks);
  } else {
    routeNode._hooks['callbacks'] = routeNode._hooks['callbacks'].concat(makeSureArray(callbacks));
  }
  return this;
}

// 动态移除路由回调
export function off (routePath, cb) {
  routePath = routePath.replace(/^\/([^\/]*)/, '$1'); // 去掉前置 /
  const routeNode = findNode(this._rtree, routePath, false);
  if (routeNode && routeNode._hooks['callbacks']) {
    if (cb) {
      for (let i = 0; i < routeNode._hooks['callbacks'].length; ++i) {
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
export function once (routePath, callbacks) {
  const _this = this;
  function onlyOnce (req) {
    for (let i = 0; i < callbacks.length; ++i) {
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
export function go (path) {
  var loc = window.location;
  var oldURI = loc.pathname + loc.search;
  Listener.setHashHistory(path);
  var newURI = loc.pathname + loc.search;
  if (this.options.mode === 'history' && oldURI !== newURI) {
    this.dispatch(newURI);
  }
  return this;
}

export function back () {}

// 改变当前的 `url` 但是不触发路由
// 和 dispatch 刚好相反，dispatch 只触发路由但不改变 `url`
export function setUrlOnly (path) {
  Listener.setUrlOnly = true; // make sure not to trigger anything
  Listener.setHashHistory(path);
  return this;
}

/**
 * reload page: redispatch current path
 * @method
 * @return this
 */
export function reload () {
  if (this.options.mode === 'history') {
    this.dispatch(location.pathname + location.search + location.hash);
  } else if (this.options.mode === 'hashbang') {
    this.dispatch(location.hash.slice(2));
  } else {
    this.dispatch(location.hash.slice(1));
  }
  return this;
}

// 创建一个链接
export function createLink (linkTo) {}
