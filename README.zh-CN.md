# spa-router

[单页 Web 应用的路由模块](http://zcoding.github.io/spa-router)

[![版本](https://img.shields.io/npm/v/spa-router-better.svg?style=flat-square "版本")](https://www.npmjs.com/package/spa-router-better)
[![协议](https://img.shields.io/npm/l/spa-router-better.svg?style=flat-square "协议")](./LICENSE)

## 计划

+ [ ] 增加 `redirect` 选项
+ [ ] 增加 `beforeLeave` 钩子

## Change Log

+ 2016-09-28 v0.5.6
  + `beforeEach` 和 `afterEach` 增加了 `req` 参数
+ 2016-10-14 v0.5.7
  + 新增 `setUrl` 方法，允许只改变 url 但不会触发响应

## 介绍

spa-router-better 是一个前端路由模块，适用于单页 Web 应用的开发。如果你正在使用 [vue.js](https://github.com/vuejs/vue) 进行单页 Web 应用开发，spa-router-better 可以作为路由模块使用。

## 安装

如果你的项目使用 CommonJS 规范组织模块，直接通过 [NPM](https://www.npmjs.com/package/spa-router-better) 可以安装：

```bash
npm install spa-router-better --save
```

如果你需要其它模块规范的支持，在 dist 目录有4种模块载入方式的打包文件，其中 iife 下的 spa-router.js 可以直接在页面通过 `script` 标签引入（会产生一个全局变量`Router`）。

es 目录下的 spa-router.js 可以使用 es6 模块规范导入。

## 使用方法

1. 构造路由表
2. 使用构造函数，创建一个路由对象
3. 调用 `.start()` 方法，初始化路由

```javascript
////////// 一个完整的例子（以下是 ES2015 代码）
import Router from 'spa-router-better';

const routes = {
  '/': function(req) {
    console.log('This is the index route!');
  },
  '/user': {
    '/': function(req) {
      console.log('This is the /user route!');
    },
    '/list': function(req) {
      console.log('This is the /user/list route!');
      console.log(req.query);
    },
    '/edit/:id': function(req) {
      console.log('This is the /user/edit/:id route, current user is ' + req.params.id);
      console.log(req.params['id']);
    }
  }
};

let router = new Router(routes);

router.start({
  root: '/',
  notFound: function() {
    console.log('Page not found.');
  }
});
```

## 和 vue.js 一起使用

在 `vue-router` 目录有一个 vue.js 的实例项目，使用了 spa-router 作为路由，如果想查看这个例子的效果，请运行 `npm run vue`，然后打开 `http://localhost:9999` 即可。

这个例子使用了 webpack-dev-server 并且支持 live-reload，因此你可以随时修改源码以测试更多的使用技巧。

## 传值

通过 url 传值有两种方式：

1. 通过参数传值
2. 通过 query 传值

区别：通过参数传值需要先定义后获取，有利于构造出符合 RESTful 风格的路由。使用 query 传值则更加灵活，可以传多个值，不限定值的类型、个数和顺序。

### 参数传值

定义：

+ 普通参数通过`:`+`参数名`声明，普通参数匹配规则为`[a-zA-Z0-9_]+`，即字母数字下划线
+ 特殊参数通过`:`+`参数名`+`(匹配规则)`声明，匹配规则为正则表达式字符串（注意不要在匹配规则里面写小括号）
+ 虽然正则表达式字符串可以直接作为匹配串，但是如果没有声明为参数，则无法通过`req.params`获取

获取：

+ `req.params`

例子：

```javascript
var routes = {
  '/product/:color(red|blue|black)-:size-:price([0-9]{1,2})': function(req) {
    var params = req.param;
    console.log('product list with ' + params.color + ' color, ' + params.size + ' size and ' + params.price + ' price');
  }
};
```

参数不一定是用来传值的，参数的主要作用是过滤路由规则。

### query传值

例子：

```javascript
var routes = {
  '/product': function(req) {
    var query = req.query;
    // 假设当前请求为/produce?color=red&size=normal&price=low
    console.log(query.color, query.size, query.price);
    // console输出:
    // > red normal low
  }
}
```

注意事项：

+ 对于形如 `a=1&a=2` 的 query 字符串，将被解析为 `{"a":['1','2']}`
+ 只有 key 没有 value 的 query 会被忽略，例如 `a&b=2` 将被解析为 `{"b":"2"}`
+ __注意 query 中的 `+` 表示空白符，例如 `a=1+1` 将被解析为 `{"a":"1 1"}`，如果要传 `+` 字符，应该先编码，即 `encodeURIComponent('a=1+1')` 将被解析为 `{"a":"1+1"}`__
+ 所有的 query 解析出来都是字符串或字符串数组（不会转换为 Number 型或其它类型）

## `$router` 对象

可以通过 `req.$router` 获取当前 Router 实例，并调用实例方法。

## API

### 实例方法

#### `.start([options])`

初始化方法。这个方法有一个可选的参数 options

可配置项：

+ `root`: `[String]` 根路径的开始，默认值为 '/'，在默认的hashbang模式下，在实际 URL 应该是 '/#!/'
+ `notFound`: `[Function]` 找不到路由时触发的回调
+ `mode`: `['history'|'hashbang']` 默认为`'hashbang'`，如果使用`'history'`，请保证浏览器支持HTML5 History API（如果浏览器不支持，仍然会使用 hashbang mode）

#### `.on(path, handler)`

这个方法用于添加路由

```javascript
router.on('/test', function(req) {
  // ...
});
```

+ `.on()`方法添加的路由将和当前的路由表合并
+ `.on()`方法如果在`.start()`之后执行，不会立即触发，必须等到下一次url发生改变或者调用`.dispatch()`方法才会触发

#### `.off(path)`

这个方法用于移除路由

#### `.mount(routes)`

这个方法用于挂载路由表

+ `.mount()`方法挂载的路由表会和原来的路由表合并
+ `.mount()`方法如果在`.start()`之后执行，不会立即触发，必须等到下一次url发生改变或者调用`.dispatch()`方法才会触发

#### `.dispatch(path)`

触发path对应的路由，但不会改变URL

#### `.setRoute(path)`

改变当前的URL，由此触发对应的路由。

这个方法适用于`'history'`模式。在`'history'`模式下，如果点击`<a>`标签默认会发生页面跳转行为，无法达到单页应用的效果。此时通过捕获点击事件禁止`<a>`标签跳转，然后调用`.setRoute(path)`方法，就实现了改变URL并且触发路由。

+ 如果path未改变则不会产生影响。换句话说，`.setRoute()`方法不能实现当前页面的"刷新"。要实现当前页的刷新，使用`.reload()`方法。`.setRoute()`的意义在于改变，如果不改变则不响应。
+ 虽然通常在history模式下使用，但该方法同样适用于hashbang模式

#### `.reload()`

对当前的路由重新适配一次，实现当前页的"刷新"

+ 该方法不带任何参数

#### `.setUrl()`

设置当前页面的 URL 但是不触发任何响应

使用场景：某些情况下，我们需要区分“跳转”和“刷新”。每次“刷新”都会重新调用路由回调函数，但是如果“跳转”的回调与“刷新”的回调不一致，就需要手动设置当前 URL 并调用“跳转”的回调。

## 钩子函数

为了方便控制路由转发，提供了以下钩子函数：

+ `beforeEach`
+ `afterEach`

### 使用方法

在 `.start` 方法中传入即可