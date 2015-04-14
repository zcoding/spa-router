/**
 * Node
 * @constructor
 */
var Node = function(value) {
  this.value = value;
  this._children = [];
  this._parent = null;
};

/**
 * set/get children
 * @param {Node|[Node]} children **optional**
 * @return {[Node]|Node} return children node list or this
 */
Node.prototype.children = function(children) {
  if (typeof children === 'undefined') {
    return this._children;
  }
  if (children instanceof Node) {
    this._children.push(children);
  } else if (isArray(children)) {
    this._children = this.children.concat(children);
  }
  return this;
};

/**
 * set/get parent
 * @param {Node} parent **optional**
 * @return {Node} return parent node or this
 */
Node.prototype.parent = function(parent) {
  if (typeof parent === 'undefined') {
    return this._parent;
  }
  if (parent instanceof Node) {
    this._parent = parent;
  }
  return this;
};