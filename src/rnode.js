import { isArray, makeSureArray } from './utils';

/**
 * RNode
 * @constructor
 * @param {String} value
 *
 * path:          区分同级节点的唯一标识
 * params:        path 包含的参数，使用{参数名:参数规则}键值对表示
 * callbacks:     路由匹配时执行的回调函数或队列
 * beforeEnter:   路由匹配时，callbacks 执行之前执行的回调函数或队列（如果 beforeEnter 返回 false 则不会进入 callbacks 执行阶段）
 * beforeLeave:   路由匹配时，进入下一个路由之前（也就是当前路由离开之前）执行的回调函数或队列
 * children:      子节点列表引用
 * parent:        父节点引用
 */
function RNode(value) {
  this.path = value;
  this.params = {};
  this._hooks = {};
  this.children = [];
  this.parent = null;
}

const proto = RNode.prototype;

proto.callHooks = function _callHooks (hookName, Req) {
  const callbacks = this._hooks[hookName] || [];
  for (let i = 0; i < callbacks.length; ++i) {
    callbacks[i].call(this, Req);
  }
};

proto.addHooks = function addHooks (hookName, callbacks) {
  this._hooks[hookName] = makeSureArray(callbacks);
};

// add children
proto.addChildren = function addChildren (children) {
  if (isArray(children)) {
    this.children = this.children.concat(children);
  } else {
    this.children.push(children);
  }
  return this;
};


export default function createRNode (value) {
  return new RNode(value);
}
