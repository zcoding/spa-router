import { extend, addEvent } from './utils';
import RNode from './rnode';
import Listener from './listener';
import querystring from './querystring';
import { handler, findNode, createRouteTree, dfs, searchRouteTree } from './tree';

const optionDefaults = {
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

export default class Router {
  constructor(routes) {
    routes = routes || {};
    if (!(this instanceof Router)) {
      throw new TypeError('Use "new" to create a Router instance');
    }
    var root = new RNode('');
    root.params = false;
    this.routeTree = createRouteTree(root, routes);
    this.options = {};
    this.configure(optionDefaults);
  }

  /**
   * .configure()
   * @method
   * @param {Object} options **Optional**
   * @return this
   */
  configure(options) {
    options = options || {};
    this.options = extend(this.options, options);
    return this;
  }

  /**
   * .start()
   * @method
   * @param {Object} options
   * @return this
   */
  start(options) {
    options = options || {};
    var self = this;
    // 初始化配置
    this.configure(options);
    Listener.init(this.options.mode).add(function() {
      return handler.call(self);
    });
    // 首次触发
    handler.call(this);
    return this;
  }

  /**
   * .mount() 将路由挂载到某个节点上
   * @method
   * @param {String} path
   * @param {Object} routes
   * @return this
   */
  mount() {
    if (path !== '' && path[0] === '/') {
      path = path.slice(1);
    }
    createRouteTree(findNode(this.routeTree, path), routes);
    return this;
  }

  /**
   * .on()
   * @method
   * @param {String|RegExp} path
   * @param {Function|Array} handlers
   * @return this
   */
  on() {
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
  }

  /**
   * .dispatch() 根据给定的路径，遍历路由树，只要找到一个匹配的就把路由返回
   * @method
   * @param {String} path
   * @return this
   */
  dispatch() {
    var routeTree = this.routeTree;
    // 保存原始请求uri
    var uri = path;
    // 取出query部分
    var queryIndex = path.indexOf('?');
    var hashIndex = path.indexOf('#');
    hashIndex = hashIndex === -1 ? path.length : hashIndex;
    var queryString = queryIndex === -1 ? '' : path.slice(queryIndex+1, hashIndex);
    path = queryIndex === -1 ? path : path.slice(0, queryIndex);
    var req = {uri: uri, path: path, query: querystring.parse(queryString)};

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
        throw new TypeError(`Expected Array, got ${ typeof callbacks }`);
      }
    } else if (this.options.notFound) {
      this.options.notFound(req);
    }
    return this;
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
  setRoute(path) {
    var loc = window.location;
    var oldURI = loc.pathname + loc.search;
    Listener.setHashHistory(path);
    var newURI = loc.pathname + loc.search;
    if (this.options.mode === 'history' && oldURI !== newURI) {
      this.dispatch(newURI);
    }
    return this;
  }

  /**
   * alias: `setRoute`
   */
  redirect(path) {
    return this.setRoute(path);
  }

  /**
   * TODO: once
   * 和.on()方法类似，但只会触发一次
   * @param {String|RegExp} path
   * @param {Function|Array} handlers
   * @return this
   */
  once(path, handlers) {
    return this;
  }

  /**
   * .off()方法表示不再侦听某个路由，直接将该路由节点的所有callbacks移除
   * @return this
   */
  off(path) {
    if (path !== '' && path[0] === '/') {
      path = path.slice(1);
    }
    var n = findNode(this.routeTree, path);
    if (n !== null && n.callbacks !== null) {
      n.callbacks.splice(0, n.callbacks.length);
    }
    return this;
  }

  /**
   * .reload()
   * reload page: redispatch current path
   * @method
   * @return this
   */
  reload() {
    if (this.options.mode === 'history') {
      this.dispatch(location.pathname + location.search + location.hash);
    } else {
      this.dispatch(location.hash.slice(1));
    }
    return this;
  }
}
