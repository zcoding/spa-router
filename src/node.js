/**
 * RNode
 * @constructor
 */
var RNode = function(value) {
  this.value = value;
  this.callbacks = null;
  this.before = null; // 所有callbacks之前执行
  this.after = null; // 所有callbacks之后执行
  this._children = [];
  this._parent = null;
};

/**
 * set/get children
 * @param {Node|[Node]} children **optional**
 * @return {[Node]|Node} return children node list or this
 */
RNode.prototype.children = function(children) {
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
RNode.prototype.parent = function(parent) {
  if (typeof parent === 'undefined') {
    return this._parent;
  }
  if (parent instanceof RNode) {
    this._parent = parent;
  }
  return this;
};