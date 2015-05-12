
/// 可以用作分隔符的字符
/// / - ~ = ! ; @ & #

/// 可以用作匹配符的字符
/// + * ? ( ) $

var dloc = document.location;

/**
 * Utils: dlocHashEmpty 判断当前location.hash是否为空
 * @return {Boolean}
 */
var dlocHashEmpty = function() {
  return dloc.hash === '' || dloc.hash === '#';
};

/// Listener
var Listener = {

  // {[Function]} Listener
  listeners: null,

  /**
   * add to listeners
   * @param {Function} fn
   * @return Listener
   */
  add: function (fn) {

    if (!this.listeners) {
      this.listeners = [];
    }

    this.listeners.push(fn);

    return this;
  },

  /**
   * destroy listener
   * @param {Function} fn
   * @return Listener
   */
  destroy: function (fn) {
    var listeners = this.listeners;
    if (!Router || !listeners) {
      return;
    }
    // 移除
    for (var i = listeners - 1; i >= 0; --i) {
      if (listeners[i] === fn) {
        listeners.splice(i, 1);
      }
    }
    return this;
  },

  setHash: function (s) {
    dloc.hash = (s[0] === '/') ? s : '/' + s;
    return this;
  }

};

// hashChange发生时，遍历所有挂在Router.listeners上的监听器，并逐个执行
// 实现动态添加hashChange监听的方法
// 一个Router实例对应一个listener
function onchange(onChangeEvent) {
  var listeners = Listener.listeners;
  for (var i = 0, l = listeners.length; i < l; i++) {
    listeners[i](onChangeEvent);
  }
}

window.onhashchange = onchange;

/**
 * Router (routes)
 * @constructor
 * @param {Object} routes **Optional**
 * @param {String} mode **Optional**
 *        mode可以是history|hash|hashbang|all
 *        mode:history    使用HTML5 History API
 *        mode:hash       使用hash（非hashbang模式）
 *        mode:hashbang   使用hash（hashbang模式）
 *        mode:all        兼容所有模式
 */
var Router = exports.Router = function(routes) {
  routes = routes || {};
  if (!(this instanceof Router)) return new Router(routes);
  // 规则化参数
  // this.params = {}; // 不再使用，所有规则化或非规则化参数都保存到节点
  // this.routes = {}; // 不再使用，已被routeTree代替
  // 挂载
  var root = new RNode(''); // 根路径的value指定为空字符串
  this.routeTree = createRouteTree(root, routes);
  this.options = {};
  // 初始化配置
  this.configure();
};

var rprtt = Router.prototype;

/**
 * @return this
 */
rprtt.init = function() {
  var self = this;
  // 一个Router实例对应一个listener，并按照初始化顺序添加到Router.listeners数组中
  // handler单独处理该路由实例的所有路由
  this.handler = function(onChangeEvent) {
    var newURL = onChangeEvent && onChangeEvent.newURL || window.location.hash; // 兼容hashchange事件中调用和第一次调用
    var url = newURL.replace(/.*#/, '');
    self.dispatch(url.charAt(0) === '/' ? url : '/' + url);
  };
  Listener.add(this.handler);

  // 首次触发
  this.handler();

};

/**
 * 将路由挂载到某个节点上
 * e.g. router.mount('/user', {'/list': function() {}});
 * @param {String} path
 * @param {Object} routes
 * @return this
 * */
rprtt.mount = function(path, routes) {};

/**
 * @param {String|RegExp} path
 * @param {Function|Array} handler
 * @return this
 */
rprtt.on = rprtt.route = function(path, handler) {
  if (path !== '' && path[0] === '/') {
    path = path.slice(1);
  }
  var node = findNode(this.routeTree, path);
  node.callbacks = node.callbacks || [];
  if (isArray(handler)) {
    node.callbacks = node.callbacks.concat(handler);
  } else if (isFunction(handler)) {
    node.callbacks.push(handler);
  }
  return this;
};

/**
 * 将路由挂载到某个节点上
 * .add()与.on()/.route()类似，但是.add()添加的路由不会覆盖原有的路由，而是将回调加入原有的队列（队尾）
 */
rprtt.add = function() {};

/**
 * .off()方法表示不再侦听某个路由，直接将该路由节点的所有callbacks、before、after、params移除
 */
rprtt.off = function(path) {};

/**
 * @param {Object} options **Optional**
 * @return this
 */
rprtt.configure = function(options) {
  options = options || {};
  this.notFound = options.notFound;
};

rprtt.map = function() {};

/**
 * redirect to another route
 * @param {String} path
 * @return this
 */
rprtt.redirect = function(path) {
  // redirect to another path...
  Listener.setHash(path);
  return this;
};

rprtt.before = function() {};

rprtt.after = function() {};

/**
 * 根据给定的path，查找路由树，返回path对应的节点。如果节点不存在就创建新的节点
 * @param {RNode} tree
 * @param {String} path
 * */
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
    if (!found) { // 不存在，创建新节点
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
 * @param {RNode} parent 当前根节点
 * @param {Object} routes 当前节点的路由表
 * @return {RNode} 返回根节点
 * */
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
 * turn query string into object
 * e.g. color=ffee88&width=12                           =>  {color: "ffee88", width: 12}
 *      color=ffee88&arr[0]=12&arr[1]=13                =>  {color: "ffee88", arr: [12, 13]}
 *      color=ffee88&obj['name']=wuzijie&obj['age']=23  =>  {color: "ffee88", obj: {name: "wuzijie", age: 23}}
 * @param {String} queryString
 * @erturn {Object}
 * @todo 未支持多维数组或嵌套对象
 */
var parseQueryString = function(queryString) {
  var queryArr = queryString.split('&');
  var param = {};
  var objectLike = /^([0-9a-zA-Z_]+)\[([0-9a-zA-Z_]+)\]$/;
  for (var i = 0, len = queryArr.length; i < len; ++i) {
    var _param = queryArr[i].split('=');
    if (_param.length < 2) {
      continue;
    }
    var key = _param[0], value = _param.slice(1).join('');
    // 判断是不是数组或对象
    var matches = key.match(objectLike);
    if (matches === null) {
      // 不是数组或对象，直接覆盖
      param[key] = value;
      continue;
    }
    key = matches[1];
    var index = matches[2], currentValue = param[key];
    if (typeof currentValue === "undefined") { // 未定义
      if (/^[0-9]+$/.test(index)) { // 如果index为整数，就假定是数组
        currentValue = [];
      } else { // 否则就假定是对象
        currentValue = {};
      }
    } else if (isArray(currentValue) && !/^[0-9]+$/.test(index)) { // 之前假定是数组，但发现不是（因为当前索引不是整数）
      // 转为对象
      var newCurrentValue = {};
      for (var j = 0, len2 = currentValue.length; j < len2; ++j) {
        if (typeof currentValue[j] === "undefined") continue; // 可能是稀疏数组
        newCurrentValue[j] = currentValue[j];
      }
      currentValue = newCurrentValue;
    }
    currentValue[index] = value;
    param[key] = currentValue;
  }
  return param;
};

/**
 * 搜索路由树，看是否存在匹配的路径，如果存在，返回相应的回调函数
 * @todo 只返回第一个匹配到的路由（如果存在多个匹配？）
 * @param {RNode} tree 树根
 * @param {String} path 要匹配的路径
 * @param {Array} local 当前已匹配的路径 **optional**
 * 返回值包含两个，用数组表示[callbacks, params]
 * @return {Function|Array|null} 如果存在就返回相应的回调，否则返回null
 * @return {Object} 同时返回参数
 * */
function searchRouteTree(tree, path, local) {

  var params = {}, callbacks = null, parent = tree;

  var parts = path.split('/');

  if (parts[0] !== tree.value) {
    return [callbacks, params];
  }

  var target = tree, found = true;

  for (var i = 1, len = parts.length; i < len; ++i) {
    for (var j = 0; j < parent._children.length; ++j) {
      var currentNode = parent._children[j];
      var matcher = new RegExp('^' + currentNode.value + '$');
      found = false;
      var matches = parts[i].match(matcher)
      if (matches !== null) {
        if (!!currentNode.params) {
          matches = [].slice.apply(matches, [1]);
          for (var k = 0; k < matches.length; ++k) {
            params[currentNode.params[k]] = matches[k];
          }
        }
        target = currentNode;
        parent = target;
        found = true;
        break;
      }
    }
    if (!found) break;
  }

  if (found) {
    callbacks = target.callbacks;
  }

  return [callbacks, params];

}

/**
 * dispatch
 * 根据给定的路径，遍历路由树，只要找到一个匹配的就把路由返回
 */
rprtt.dispatch = function(path) {
  var routeTree = this.routeTree;
  // 保存原始请求uri
  var uri = path;
  // 取出query部分
  var queryIndex = path.indexOf('?');
  var query = queryIndex === -1 ? '' : path.slice(queryIndex+1);
  path = queryIndex === -1 ? path : path.slice(0, queryIndex);
  var req = {uri: uri, path: path, query: parseQueryString(query)};

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
  } else if (this.notFound) {
    this.notFound(req);
  }
};
