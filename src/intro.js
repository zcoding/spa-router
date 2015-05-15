
/// 浏览器兼容性：
/// onhashchange: [IE 8.0]
/// history.pushState: [IE 10.0]

(function(factory) {
  if (typeof define === 'function' && define.cmd) {
    define(function(require, exports, module) {
      factory(exports);
    });
  } else {
    factory(window)
  }
}(function(exports) {
