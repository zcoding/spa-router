import { isArray, makeSureArray, ArrayCopy } from './utils';

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
  this.params = false;
  this.data = null;
  this._hooks = {};
  this.children = [];
  this.parent = null;
}

const proto = RNode.prototype;

proto.callHooks = function _callHooks (hookName, Req) {
  const callbacks = this._hooks[hookName] || [];
  const _copyCallbacks = ArrayCopy(callbacks); // 复制一个，避免中间调用了 off 导致 length 变化
  for (let i = 0; i < _copyCallbacks.length; ++i) {
    const previousCallbackReturnValue = _copyCallbacks[i].call(null, Req);
    if (previousCallbackReturnValue === false) break;
  }
  return this;
};

proto.addHooks = function addHooks (hookName, callbacks) {
  this._hooks[hookName] = makeSureArray(callbacks);
  return this;
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

proto.removeChild = function removeChild (child) {
  for (let i = 0; i < this.children.length; ++i) {
    if (this.children[i] === child) {
      this.children.splice(i, 1);
      break;
    }
  }
  return this;
};

export default function createRNode (value) {
  return new RNode(value);
}
