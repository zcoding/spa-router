
/**
 * RNode
 * @constructor
 * @param {String} value 必须
 *
 * value:     区分同级节点的唯一标识
 * params:    value包含的参数，使用{参数名:参数规则}键值对表示
 * before:    路由匹配时，url改变之前执行的回调函数或队列
 * callbacks: 路由匹配时执行的回调函数或队列
 * after:     路由匹配时，url改变之后，callbacks执行完再执行的回调函数或队列
 *
 * _children: 子节点引用列表
 * _parent:   父节点引用
 */
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

/**
 * set/get children
 * @param {Node|[Node]} children **optional**
 * @return {[Node]|Node} return children node list or this
 */
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

/**
 * set/get parent
 * @param {Node} parent **optional**
 * @return {Node} return parent node or this
 */
nprtt.parent = function(parent) {
  if (typeof parent === 'undefined') {
    return this._parent;
  }
  if (parent instanceof RNode) {
    this._parent = parent;
  }
  return this;
};
