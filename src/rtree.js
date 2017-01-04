import createRNode from './rnode';
import { isArray, makeSureArray } from './utils';

// walk through the routeTree
export function walk (routeTree, cb) {
}

/**
 * 根据给定的 path，以 routeTreeRoot 为根节点查找，返回 path 对应的 rnode 节点
 * 如果节点不存在，并且 createIfNotFound 为 true 就创建新节点
 * 匹配参数（参数名由字母、数字、下划线组成，不能以数字开头。后面带括号的是特定参数的匹配规则。）
 * @param {RNode} tree
 * @param {String} path
 * @param {Boolean} createIfNotFound 当节点不存在时创建新节点
 * @return {RNode}
 * */
export function findNode(routeTreeRoot, routePath, createIfNotFound) {
  if (routePath === '') { // 当前节点
    return routeTreeRoot;
  }
  createIfNotFound = !!createIfNotFound;
  const parts = routePath.split('/');
  let target = null, found = false;
  let parent = routeTreeRoot;
  let params;
  for (let i = 0, len = parts.length; i < len; ++i) {
    params = false;
    let realCurrentValue = parts[i];

    const matcher = /:([a-zA-Z_][a-zA-Z0-9_]*)(\([^\)]+\))?/g;

    let k = 0;

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

    for (let j = 0; j < parent.children.length; ++j ) {
      if (parent.children[j].path === realCurrentValue) {
        target = parent.children[j];
        found = true;
        break;
      }
    }
    if (!found) { // 不存在，创建新节点
      if (!createIfNotFound) return false;
      const extendNode = createRNode(realCurrentValue);
      parent.addChildren(extendNode);
      extendNode.parent = parent;
      extendNode.params = params;
      target = extendNode;
    }
    parent = target;
    found = false;
  }
  return target;
}

function createRouteNodeInPath (rootNode, routePath) {
  routePath = routePath.replace(/^\/([^\/]*)/, '$1'); // 去掉前置 /
  return findNode(rootNode, routePath, true);
}

// 构造路由树
export function createRouteTree(routeNode, routeOptions) {

  routeNode.addHooks('beforeEnter', routeOptions.beforeEnter);
  routeNode.addHooks('callbacks', routeOptions.controllers);
  routeNode.addHooks('beforeLeave', routeOptions.beforeLeave);
  if (routeOptions.sub) { // 子路由
    for (let subRoutePath in routeOptions.sub) {
      if (routeOptions.sub.hasOwnProperty(subRoutePath)) {
        const subRouteNode = createRouteNodeInPath(routeNode, subRoutePath);
        createRouteTree(subRouteNode, routeOptions.sub[subRoutePath]);
      }
    }
  }

}

// 创建根结点
export function createRootRouteTree (routes) {
  const rootRouteNode = createRNode('');
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
export function dfs(currentRouteNode, parts, ci, ri, params) {

  const value = parts[ci];

  var newParams = {};
  for (var p in params) { // copy: params => newParams
    if (params.hasOwnProperty(p)) {
      newParams[p] = params[p];
    }
  }

  var parent = currentRouteNode.parent;

  if (parent === null && ri > 0) { // finally not matched
    return [false, newParams];
  }

  if (parent !== null && ri > parent.children.length-1) { // not matched, go back
    return [false, newParams];
  }

  if (ci > parts.length-1 || ci < 0) return [false, newParams];

  var matcher = new RegExp('^' + currentRouteNode.path + '$');
  var matches = value.match(matcher);

  if (matches === null) return [false, newParams]; // not matched, go back

  if (!!currentRouteNode.params) {
    matches = [].slice.apply(matches, [1]);
    for (var k = 0; k < matches.length; ++k) {
      newParams[currentRouteNode.params[k]] = matches[k];
    }
  }

  if (ci === parts.length-1 && currentRouteNode.callbacks !== null) { // finally matched
    return [currentRouteNode, newParams];
  }

  for (var i = 0; i < currentRouteNode.children.length; ++i) {
    var found = dfs(currentRouteNode.children[i], parts, ci+1, i, newParams); // matched, go ahead
    if (!found[0]) continue;
    return found;
  }

  return dfs(currentRouteNode, parts, ci, ri+1, params); // not matched, go back
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
export function searchRouteTree(tree, path) {

  const result = dfs(tree, path.split('/'), 0, 0, {});

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
