var toString = Object.prototype.toString;
var hasOwn = function(p) {
  return this.hasOwnProperty(p);
},
isArray = function(obj) {
  return toString.call(obj) === "[object Array]";
},
isFunction = function(obj) {
  return toString.call(obj) === "[object Function]";
},
isPlainObject = function(obj) {
  return toString.call(obj) === "[object Object]";
};
var RNode = function(value) {
  if (typeof value === 'undefined') throw new TypeError('The RNode Constructor Need A Value.');
  this.value = value;
  this.params = {};
  this.callbacks = null;
  this.before = null;
  this.after = null;
  this._children = [];
  this._parent = null;
};

var nprtt = RNode.prototype;

nprtt.children = function(children) {
  if (typeof children === 'undefined') {
    return this._children;
  }
  if (children instanceof RNode) {
    this._children.push(children);
  } else if (utils.isArray(children)) {
    this._children = this.children.concat(children);
  }
  return this;
};

nprtt.parent = function(parent) {
  if (typeof parent === 'undefined') {
    return this._parent;
  }
  if (parent instanceof RNode) {
    this._parent = parent;
  }
  return this;
};
function findNode(tree, path) {
  var parts = path.split('/');
  var target = null, found = false;
  var parent = tree;
  var params;
  for (var i = 0, len = parts.length; i < len; ++i) {
    params = {};
    var realCurrentValue = parts[i];
    var matcher = new RegExp(':([a-zA-Z_][a-zA-Z0-9_]*)', 'g');
    realCurrentValue = realCurrentValue.replace(matcher, '([a-zA-Z0-9]+)');
    var matches = parts[i].match(matcher);
    if (matches !== null) {
      for (var k = 0; k < matches.length; ++k) {
        params[k] = matches[k].slice(1);
      }
    } else {
      params = false;
    }
    for (var j = 0; j < parent._children.length; ++j ) {
      if (parent._children[j].value === realCurrentValue) {
        target = parent._children[j];
        found = true;
        break;
      }
    }
    if (!found) {
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
function createRouteTree(parent, routes) {

  if (isFunction(routes)) {
    parent.callbacks = [routes];
    return parent;
  } else if (isArray(routes)) {
    parent.callbacks = routes;
    return parent;
  }

  for (var path in routes) {
    if (routes.hasOwnProperty(path)) {

      var fns = routes[path];

      if (path === '/') {
        createRouteTree(parent, fns);
      } else {
        if (path !== '' && path[0] === '/') {
          path = path.slice(1);
        }
        var currentNode = findNode(parent, path);
        createRouteTree(currentNode, fns);
      }

    }
  }

  return parent;
}

/**
 * @param {RNode} root 当前节点
 * @param {Array} parts 路径分段数组
 * @param {Integer} ci 当前路径分段索引
 * @param {Integer} ri 当前节点所在兄弟节点列表的位置
 * @params {Object} params 记录参数的对象
 */
function dfs(root, parts, ci, ri, params) {

  var value = parts[ci];

  var newParams = {};
  for (var p in params) { // 将旧参数对象复制到新参数对象
    if (params.hasOwnProperty(p)) {
      newParams[p] = params[p];
    }
  }

  var parent = root.parent();

  if (parent === null && ri > 0) { // 当前节点是根节点，根节点唯一（遍历已结束，没找到）
    return [false, newParams];
  }

  if (parent !== null && ri > parent._children.length-1) { // 当前节点非根节点，同级节点已遍历完（遍历未结束）
    return [false, newParams];
  }

  if (ci > parts.length-1 || ci < 0) return [false, newParams]; // 越界：已返回到第一层，或者超过了最后一层

  var matcher = new RegExp('^' + root.value + '$');
  var matches = value.match(matcher);

  if (matches === null) return [false, newParams]; // 当前节点不匹配

  if (!!root.params) { // 记录当前节点的参数
    matches = [].slice.apply(matches, [1]);
    for (var k = 0; k < matches.length; ++k) {
      newParams[root.params[k]] = matches[k];
    }
  }

  if (ci === parts.length-1 && root.callbacks !== null) { // 找到最后匹配节点（遍历已结束）
    return [root, newParams];
  }

  // 当前节点已匹配成功，进入下一层（传递新的参数对象）
  for (var i = 0; i < root._children.length; ++i) {
    var found = dfs(root._children[i], parts, ci+1, i, newParams);
    if (!found[0]) continue;
    return found;
  }

  // 下一层匹配失败，该节点不匹配，进入兄弟节点（传递旧的参数对象）
  return dfs(root, parts, ci, ri+1, params);

}

function log() {}

var adminRoutes = {
  '/': log,
  '/product': {
    '/': log,
    '/:color-:size-:price': [log, function() { console.log('admin product list'); }],
    '/add': log,
    '/:id': log
  }
};

var tree = createRouteTree(new RNode(''), {
  '/': [log],
    '/product': log,
    '/product/:color-:size-:price': log,
    '/product/:id/one/now': log,
    '/product/id/one': function() {console.log(12345);},
    '/about': log,
    // admin
    '/admin': adminRoutes
});

console.log(dfs(tree, ['', 'product', 'id', 'one', 'now'], 0, 0, {}));
// console.log(dfs(tree, ['', 'admin', 'user', 'b'], 0, 0));
// console.log(tree);
// console.log(params);