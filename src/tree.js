import RNode from './rnode';

// TODO: root怎么处理？
export function handler(onChangeEvent) {
  let mode = this.options.mode;
  let url;
  switch(mode) {
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
export function findNode(tree, path, onlyFind) {
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
      if (!$3) { // In IE 8 , $3 is an empty String while in other browser it is undefined.
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

export function removeRNode (rnode) {
  const _parent = rnode._parent;
  if (_parent) {
    for (let i = 0; i < _parent._children.length; ++i) {
      if (_parent._children[i] === rnode) {
        _parent._children.splice(i, 0);
        break;
      }
    }
  }
  return rnode;
}

/**
 * 构造路由树/子树
 * @param {RNode} root 当前根节点
 * @param {Object} routes 当前节点的路由表
 * @return {RNode} 返回根节点
 * */
export function createRouteTree(root, routes) {

  if (typeof routes === 'function') {
    root.callbacks = [routes];
    return root;
  } else if (Array.isArray(routes)) {
    root.callbacks = routes;
    return root;
  }

  for (var path in routes) {
    if (routes.hasOwnProperty(path)) {
      // @TODO 如何实现 beforeLeave
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
export function dfs(root, parts, ci, ri, params) {

  var value = parts[ci];

  var newParams = {};
  for (var p in params) { // copy: params => newParams
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
export function searchRouteTree(tree, path) {

  var found = dfs(tree, path.split('/'), 0, 0, {});

  if (!found[0]) {
    return [null, {}];
  }

  return [found[0].callbacks, found[1]];
}
