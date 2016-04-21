
import utils from './utils';

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
    if (!(this instanceof Router)) return new Router(routes);
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

// TODO: root怎么处理？
function handler(onChangeEvent) {
  var mode = this.options.mode;
  var url;
  switch(mode) {
    case 'history':
      url = Loc.pathname + Loc.search + Loc.hash;
      if (url.substr(0, 1) !== '/') {
        url = '/' + url;
      }
      break;
    case 'hashbang':
    default:
      var hash = Loc.hash.slice(1);
      if (hash === '' || hash === '!') {
        return this.redirect(this.options.root);
      }
      var newURL = onChangeEvent && onChangeEvent.newURL || Loc.hash;
      url = newURL.replace(/.*#!/, '');
  }
  this.dispatch(url.charAt(0) === '/' ? url : '/' + url);
};

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
  var target = null, found = false;
  var parent = tree;
  var params;
  for (var i = 0, len = parts.length; i < len; ++i) {
    params = false;
    var realCurrentValue = parts[i];

    var matcher = /:([a-zA-Z_][a-zA-Z0-9_]*)(\([^\)]+\))?/g;

    var k = 0;

    /* jshint ignore:start */
    realCurrentValue = realCurrentValue.replace(matcher, function($1, $2, $3) {
      params = params || [];
      params[k++] = $2;
      if (typeof $3 === 'undefined') {
        return '([a-zA-Z0-9_]+)';
      } else {
        return $3;
      }
    });
    /* jshint ignore:end */

    for (var j = 0; j < parent._children.length; ++j ) {
      if (parent._children[j].value === realCurrentValue) {
        target = parent._children[j];
        found = true;
        break;
      }
    }
    if (!found) { // 不存在，创建新节点
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

  if (isFunction(routes)) {
    root.callbacks = [routes];
    return root;
  } else if (isArray(routes)) {
    root.callbacks = routes;
    return root;
  }

  for (var path in routes) {
    if (hasOwn.call(routes, path)) {

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
  for (var p in params) { // copy: params => newParams
    if (hasOwn.call(params, p)) {
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

  for (var i = 0; i < root._children.length; ++i) {
    var found = dfs(root._children[i], parts, ci+1, i, newParams); // matched, go ahead
    if (!found[0]) continue;
    return found;
  }

  return dfs(root, parts, ci, ri+1, params); // not matched, go back
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
