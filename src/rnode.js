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

export default class RNode {
  constructor(value) {
    var valueType = typeof value;
    if (valueType !== 'string') {
      throw new TypeError(`Expected a string in the first argument, got ${ valueType }`);
    }
    this.value = value;
    this.params = {};
    this.callbacks = null;
    this.before = null;
    this.after = null;
    this._children = [];
    this._parent = null;
  }

  /**
   * set/get children
   * @param {RNode|[RNode]} children **optional**
   * @return {[RNode]|RNode} return children node list or this
   */
  children(children) {
    if (undefined === children) {
      return this._children;
    }
    if (children instanceof RNode) {
      this._children.push(children);
    } else if (isArray(children)) {
      this._children = this._children.concat(children);
    } else {
      throw new TypeError(`Expected RNode or Array in the first argument, got ${ Object.prototype.toString.call(children) }`);
    }
    return this;
  }

  /**
   * set/get parent
   * @param {RNode} parent **optional**
   * @return {RNode} return parent node or this
   */
  parent(parent) {
    if (undefined === parent) {
      return this._parent;
    }
    if (parent instanceof RNode) {
      this._parent = parent;
    } else {
      throw new TypeError(`Expected RNode in the first argument, got ${ Object.prototype.toString.call(parent) }`);
    }
    return this;
  }
}
