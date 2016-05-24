# spa-router

Router Module for Single Page Application

[![版本](https://img.shields.io/npm/v/spa-router-better.svg?style=flat-square "版本")](https://www.npmjs.com/package/spa-router-better)
[![协议](https://img.shields.io/npm/l/spa-router-better.svg?style=flat-square "协议")](./LICENSE)

## 介绍

spa-router是一个前端路由模块，适用于单页应用程序的开发。如果你正在使用[vue.js](https://github.com/yyx990803/vue)进行单页应用开发，spa-router可以作为路由模块使用。

## Install

`npm install spa-router-better`

或者使用其它载入方式：在dist目录有支持4种模块再入方式的打包文件，其中iife下的spa-router.js可以直接在页面使用`script`标签引入。

## 使用方法

1. 构造路由表
2. 使用构造函数，创建一个路由对象
3. 调用`.start()`方法，初始化路由

```javascript
////////// 一个完整的例子
var routes = {
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
var router = new Router(routes);
router.start({
  root: '/'
});
```

## 和vue.js一起使用

在vue-router`目录有一个vue.js的实例项目，使用了spa-router作为路由，如果想查看这个例子的效果，请运行`npm run vue`，然后打开`http://localhost:9999`即可。

这个例子使用了webpack-dev-server并且支持live-reload，因此你可以随时修改源码以测试更多的使用技巧。

## 传值

通过url传值有两种方式：

1. 通过参数传值
2. 通过query传值

通过参数传值需要先定义后获取，有利于构造出RESTful风格的路由。

使用query传值则更加灵活，可以传多个值，不限定值的类型、个数和顺序。

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

参数不一定是用来传值的，参数的主要作用是限制路由规则。

### query传值

例子：

```javascript
var routes = {
  '/product': function(req) {
    var query = req.query;
    // 假设当前请求为/produce?color=red&size=normal&price=low
    console.log(query.color, query.size, query.price);
    // console: red normal low
  }
}
```

注意事项：
+ 对于形如`a=1&a=2`的query字符串，将被解析为`{"a":['1','2']}`
+ 只有key没有value的query会被忽略，例如`a&b=2`将被解析为`{"b":"2"}`
+ 注意query中的`+`表示空白符，例如`a=1+1`将被解析为`{"a":"1 1"}`，如果要传`+`字符，应该先编码，即`encodeURIComponent('a=1+1')`将被解析为`{"a":"1+1"}`
+ 所有的query解析出来都是字符串或字符串数组（不会转换为数值或其它类型）

## API
### Instance method
#### `.start([options])`

初始化方法。这个方法有一个可选的参数options

可配置项：
+ `root`: `[String]` 根路径的开始，默认值为'/'，在默认的hashbang模式下，在实际URL上就是'/#!/'
+ `notFound` `[Function]` 找不到路由时触发的回调
+ `mode` `['history'|'hashbang']` 默认为`'hashbang'`，如果使用`'history'`，请保证浏览器支持HTML5 History API（如果浏览器不支持，仍然会使用hashbang mode）

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

#### .dispatch(path)

触发path对应的路由，但不会改变URL

#### .setRoute(path)

改变当前的URL，由此触发对应的路由。

这个方法适用于`'history'`模式。在`'history'`模式下，如果点击`<a>`标签默认会发生页面跳转行为，无法达到单页应用的效果。此时通过捕获点击事件禁止`<a>`标签跳转，然后调用`.setRoute(path)`方法，就实现了改变URL并且触发路由。

+ 如果path未改变则不会产生影响。换句话说，`.setRoute()`方法不能实现当前页面的"刷新"。要实现当前页的刷新，使用`.reload()`方法。`.setRoute()`的意义在于改变，如果不改变则不响应。
+ 虽然通常在history模式下使用，但该方法同样适用于hashbang模式

#### .reload()

对当前的路由重新适配一次，实现当前页的"刷新"

+ 该方法不带任何参数

### API method
