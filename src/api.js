import { makeSureArray, warn } from './utils';
import Listener from './listener';
import QS from './querystring';
import { findNode, createRouteTree, searchRouteTree } from './rtree';

let lastReq = null, lastRouteNode = null;

function handlerHashbangMode (onChangeEvent) {
  const newURL = onChangeEvent && onChangeEvent.newURL || location.hash;
  const url = newURL.replace(/.*#!/, '');
  this.dispatch(url.charAt(0) === '/' ? url : `/${url}`);
}

function handlerHistoryMode (onChangeEvent) {
  const url = location.pathname + location.search + location.hash;
  this.dispatch(url.charAt(0) === '/' ? url : `/${url}`);
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
  this._namedRoutes = null;
  this._rtree = null;
  this._hooks = null;
  this.options = null;
  return null;
}

// 动态添加新路由（可能会替换原有的路由）
export function mount (routePath, routes) {
  routePath = routePath.replace(/^\/([^\/]*)/, '$1'); // 去掉前置 /
  const currentRouteNode = findNode(this._rtree, routePath, true);
  createRouteTree(this._namedRoutes, currentRouteNode, routes);
  return this;
}

// 路由描述对象转换为路径
// 如果缺少参数，会抛出错误
function routeDescObjToPath (namedRoutes, routeDescObj) {
  const routeNode = namedRoutes[routeDescObj.name];
  if (!routeNode) {
    return null;
  }
  const paths = [];
  let rnode = routeNode;
  while (rnode) {
    let pathvalue = rnode.path;
    if (rnode.params) {
      if (!routeDescObj.params) {
        throw new Error('缺少参数');
      }
      let paramsIndex = 0;
      pathvalue = pathvalue.replace(/\([^\)]+\)/g, function ($1) {
        const paramKey = rnode.params[paramsIndex++];
        if (!routeDescObj.params.hasOwnProperty(paramKey)) {
          throw new Error(`缺少参数 "${paramKey}"`);
        }
        return routeDescObj.params[paramKey];
      });
    }
    paths.unshift(pathvalue);
    rnode = rnode.parent;
  }
  return paths.join('/');
}

// 根据给定的路径，遍历路由树，只要找到一个匹配的就把路由返回
export function dispatch (path) {
  if (typeof path === 'object' && path !== null) { // {name: 'routeName', params: {}}
    path = routeDescObjToPath(this._namedRoutes, path);
  }
  if (lastReq) {
    this._callHooks('beforeEachLeave', lastReq);
    if (lastRouteNode) {
      lastRouteNode.callHooks('beforeLeave', lastReq);
    }
  }
  const routeTree = this._rtree;
  // 保存原始请求uri
  const uri = path;
  const queryIndex = path.indexOf('?');
  const _hashIndex = path.indexOf('#');
  const hashIndex = _hashIndex === -1 ? path.length : _hashIndex;
  const queryString = queryIndex === -1 ? '' : path.slice(queryIndex+1, hashIndex);
  path = queryIndex === -1 ? path : path.slice(0, queryIndex);
  const Req = {uri: uri, path: path, query: QS.parse(queryString), $router: this};

  if (path === '/') {
    path = '';
  }
  const result = searchRouteTree(routeTree, path);
  if (!result) return this; // 啥都找不到
  const routeNode = result.rnode, params = result.params;
  Req.params = params;
  Req.data = routeNode ? routeNode.data : null;
  if (routeNode) {
    if (routeNode.title !== false) {
      document.title = routeNode.title;
    } else {
      if (this.options.title !== false) {
        document.title = this.options.title;
      }
    }
  }
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
  callbacks = makeSureArray(callbacks);
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
 * 这个方法会改变当前页面的 `url`，从而触发路由
 * 在 history 模式下，用户无法通过标签改变 `url` 而不跳转页面，需要监听 click 事件，禁止默认跳转行为，并调用 go 方法
 * 如果是 history 模式，相当于调用一次 history.pushState() 然后再调用 .dispatch()
 * 如果 url 没有改变，不会"刷新"页面，要通过代码“刷新”页面，可以调用 reload 方法
 *
 * path 可以是一个路由描述对象
 * */
export function go (path) {
  const loc = window.location;
  const oldURI = loc.pathname + loc.search;
  if (typeof path === 'object' && path !== null) {
    path = routeDescObjToPath(this._namedRoutes, path);
  }
  Listener.setHashHistory(path);
  const newURI = `${loc.pathname}${loc.search}`;
  if (this.options.mode === 'history' && oldURI !== newURI) {
    this.dispatch(newURI);
  }
  return this;
}

export function back () {
  if (Listener.supportHistory()) {
    window['history'].back();
  } else {
  }
  return this;
}

// 只改变当前的 `url` 但是不触发路由
// 和 dispatch 刚好相反，dispatch 只触发路由但不改变 `url`
export function setUrlOnly (path) {
  if (typeof path === 'object' && path !== null) {
    path = routeDescObjToPath(this._namedRoutes, path);
  }
  Listener.setUrlOnly = true; // make sure not to trigger anything
  Listener.setHashHistory(path);
  return this;
}

// 重载当前页面
export function reload () {
  if (this.options.mode === 'history') {
    this.dispatch(`${location.pathname}${location.search}${location.hash}`);
  } else {
    this.dispatch(location.hash.replace(/^#!?/, ''));
  }
  return this;
}

// 创建一个链接
export function createLink (linkTo) {
  let result = routeDescObjToPath(this._namedRoutes, linkTo);
  if (result === null) {
    warn(`路径 ${linkTo.name} 不存在`);
    result = '/';
  }
  result = result === '' ? '/' : result;
  return this.options.mode === 'history' ? result : `/#!${result}`;
}
