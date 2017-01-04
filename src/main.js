import {
  destroy,
  start,
  stop,
  mount,
  dispatch,
  on,
  off,
  once,
  go,
  back,
  setUrlOnly,
  reload,
  createLink
} from './api';

import { plugin } from './plugin';
import createRNode from './rnode';
import { createRootRouteTree } from './rtree';
import { extend, makeSureArray } from './utils';

// mode: history|hashbang
// history     使用 HTML5 History API
// hashbang    使用 hash（hashbang 模式）
const optionDefaults = {
  mode: 'hashbang',
  recurse: false // TODO
};

/**
 * Router (routes)
 * @constructor
 * @param {Object} routes **Optional**
 */
// 虽然允许在同一个应用创建多个 Router ，但是正常情况下你只需要创建一个实例
export default function Router(routes, options) {
  routes = routes || {};
  this._rtree = createRootRouteTree(routes);
  this.options = {};
  this._hooks = {}; // 全局钩子
  this._init(options);
}

let _mode = 'hashbang';
let _alreadySetMode = false;

Router.mode = function setMode (mode) {
  if (_alreadySetMode) return _mode;
  _alreadySetMode = true;
  _mode = mode;
  return _mode;
};

const proto = Router.prototype;

proto._init = function _init (options) {
  options = options || {};
  this.options = extend({}, optionDefaults, options);
  this._hooks['beforeEachEnter'] = makeSureArray(options.beforeEachEnter);
};

// 调用全局钩子
proto._callHooks = function _callHooks (hookName, Req) {
  const callbacks = this._hooks[hookName] || [];
  for (let i = 0; i < callbacks.length; ++i) {
    callbacks[i].call(this, Req);
  }
};

// start a router
proto.start = start;

// stop a router
proto.stop = stop

// destroy a router
proto.destroy = destroy;

// register a plugin
proto.plugin = plugin;

// mount a sub-route-tree on a route node
proto.mount = mount;

// dynamic add a route to route-tree
proto.on = on;

// like .on except that it will dispatch only once
proto.once = once;

// stop listen to a route
proto.off = off;

// dispatch a route if path matches
proto.dispatch = dispatch;

proto.go = go;

proto.back = back;

// only set url, don't dispatch any routes
proto.setUrlOnly = setUrlOnly;

// redispatch current route
proto.reload = reload;
