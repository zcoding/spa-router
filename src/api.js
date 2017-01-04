import { extend, addEvent, isArray } from './utils';
import RNode from './rnode';
import Listener from './listener';
import QS from './querystring';
import { findNode, createRouteTree, searchRouteTree } from './rtree';

let lastReq = null;

const BeforeLeaveCallbacksQueue = []; // 待调用的 beforeLeave 钩子队列

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
  const _handler = this._mode === 'history' ? handlerHistoryMode : handlerHashbangMode;
  const _this = this;
  Listener.init(this._mode).add(function () {
    return _handler.call(_this);
  });
  // 首次触发
  _handler.call(this);
  return this;
}

export function stop () {
  Listener.stop();
  return this;
}

export function destroy () {}

/**
 * @param {String} path
 * @param {Object} routes
 * @return this
 */
export function mount (path, routes) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  createRouteTree(findNode(this.routeTree, path), routes);
  return this;
}

// 根据给定的路径，遍历路由树，只要找到一个匹配的就把路由返回
export function dispatch (path) {
  if (lastReq) {
    this._callHooks('beforeEachLeave', lastReq);
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
export function on (path, handlers) {
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
export function off (path, cb) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  var n = findNode(this.routeTree, path, true);
  if (n && n.callbacks) {
    if (cb) {
      for (let i = 0; i < n.callbacks.length; ++i) {
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
export function once (path, handlers) {
  const _this = this;
  function onlyOnce (req) {
    for (let i = 0; i < handlers.length; ++i) {
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

/**
 * 这个方法会改变当前的 `url` 但是不触发路由
 */
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

export function createLink (linkTo) {}
