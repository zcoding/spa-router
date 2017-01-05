import createRNode from './rnode';
import { warn } from './utils';

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
  const parts = routePath.split('/');
  let target = null, found = false;
  let parent = routeTreeRoot;
  let params;
  for (let i = 0, len = parts.length; i < len; ++i) {
    params = false;
    let realCurrentValue = parts[i];

    const matcher = /:([a-zA-Z_][a-zA-Z0-9_]*)(\([^\)]+\))?/g;

    let k = 0;

    function replacement($1, $2, $3) {
      params = params || [];
      params[k++] = $2;
      if (!$3) { // In IE 8 , $3 is an empty String while in other browser it is undefined.
        return '([a-zA-Z0-9_]+)';
      } else {
        return $3;
      }
    }

    realCurrentValue = realCurrentValue.replace(matcher, replacement);

    for (let j = 0; j < parent.children.length; ++j ) {
      if (parent.children[j].path === realCurrentValue) {
        target = parent.children[j];
        found = true;
        break;
      }
    }
    if (!found) { // 不存在
      if (!createIfNotFound) return false;
      // 创建新节点
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
  if (routePath === '*') {
    const rnode = createRNode('');
    rnode.parent = rootNode;
    rootNode.addChildren(rnode);
    return rnode;
  } else {
    return findNode(rootNode, routePath, true);
  }
}

// 构造路由树
export function createRouteTree(namedRoutes, routeNode, routeOptions) {
  if (routeOptions.name) {
    if (namedRoutes[routeOptions.name]) {
      warn(`已经存在的具名路由 ${routeOptions.name} 将被覆盖`);
    }
    namedRoutes[routeOptions.name] = routeNode;
  }
  if (routeOptions.data) {
    routeNode.data = routeOptions.data;
  }
  routeNode.addHooks('beforeEnter', routeOptions.beforeEnter);
  routeNode.addHooks('callbacks', routeOptions.controllers);
  routeNode.addHooks('beforeLeave', routeOptions.beforeLeave);
  if (routeOptions.sub) { // 子路由
    for (let subRoutePath in routeOptions.sub) {
      if (routeOptions.sub.hasOwnProperty(subRoutePath)) {
        const subRouteNode = createRouteNodeInPath(routeNode, subRoutePath);
        createRouteTree(namedRoutes, subRouteNode, routeOptions.sub[subRoutePath]);
      }
    }
  }

}

// 创建根结点
export function createRootRouteTree (namedRoutes, routes) {
  const rootRouteNode = createRNode('');
  createRouteTree(namedRoutes, rootRouteNode, {
    sub: routes
  });
  return rootRouteNode;
}

// 计算一个节点在一棵树的层次
function calcRNodeDepth (currentRouteNode) {
  let depth = 0;
  let rnode = currentRouteNode;
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
export function dfs (currentRouteNode, parts) {
  const currentPathValue = parts[0];
  const matcher = new RegExp('^' + currentRouteNode.path + '$');
  const matches = currentPathValue.match(matcher);
  if (!matches) { // 当前节点不匹配，返回
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
  const currentParams = {};
  if (currentRouteNode.params) {
    const paramsMatches = Array.prototype.slice.call(matches, 1);
    for (let k = 0; k < paramsMatches.length; ++k) {
      currentParams[currentRouteNode.params[k]] = paramsMatches[k];
    }
  }
  if (parts.length === 1) { // 在当前节点完成匹配
    return {
      rnode: currentRouteNode,
      params: currentParams
    };
  }
  const notFoundList = [];
  for (let i = 0; i < currentRouteNode.children.length; ++i) {
    const _result = dfs(currentRouteNode.children[i], parts.slice(1));
    if (_result && !_result.notFound) { // 在子树中完成匹配
      // 合并 params
      for (let p in _result.params) {
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
      notFoundList.push(_result);
    }
  }
  // 全部路径都走完，找不到匹配项
  // 如果有 * 节点匹配，则返回匹配路径最长的 * 节点
  if (notFoundList.length > 0) {
    let max = -1, maxIndex = -1;
    for (let i = 0; i < notFoundList.length; ++i) {
      const depth = calcRNodeDepth(notFoundList[i].rnode);
      if (depth > max) {
        max = depth;
        maxIndex = i;
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
export function searchRouteTree(tree, path) {
  path = path === '/' ? '' : path; // 如果是 / 路径，特殊处理（避免 split 之后多一项）

  const result = dfs(tree, path.split('/'));

  if (result.notFound) {
    return {
      rnode: result.rnode,
      params: result.params
    };
  }

  return result;
}
