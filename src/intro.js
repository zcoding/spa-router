
/// 浏览器兼容性：
/// hashchange: [Chrome 5.0] [Firefox(Gecko) 3.6] [IE 8.0] [Opera 10.6] [Safari 5.0]

(function(factory) {
  if (typeof define === 'function' && define.cmd) {
    define(function(require, exports, module) {
      factory(exports);
    });
  } else {
    factory(window)
  }
}(function(exports) {
