# spa-router

[A Router Module for Single Page Application](http://zcoding.github.io/spa-router)

[![Versoin](https://img.shields.io/npm/v/spa-router-better.svg?style=flat-square "Version")](https://www.npmjs.com/package/spa-router-better)
[![License](https://img.shields.io/npm/l/spa-router-better.svg?style=flat-square "License")](./LICENSE)

## v1.0 changed

+ [x] support `beforeEnter`, `beforeLeave`, `beforeEachEnter`, `beforeEachLeave`
+ [x] `createLink` method
+ [x] `setUrl` changed to `setUrlOnly`
+ [x] 新增 `name` 选项，`name` 可以作为 `go`, `dispatch`, `setUrlOnly` 等方法的参数
+ [x] `go`, `dispatch`, `setUrlOnly` 等方法支持传入路由描述对象作为参数
+ [x] 新增 `data` 选项，可以通过 Req 对象传给回调函数使用
+ [x] 支持异步回调阻塞（即必须等待异步回调完成才调用下一个回调）
+ [ ] 支持 `go`, `back` 等历史操作
+ [x] 增加 `destroy` 方法销毁路由器
+ [x] 移除 `configure` 函数，配置应该在创建路由实例的时候完成
+ [ ] 支持 recurse 模式，即在寻找路由匹配的过程中，如果路由完全匹配完整路径的前缀部分，也可以触发 dispatch
+ [x] 公开 Router.QS 对象，提供操作 query string 的两个重要方法
+ [x] 移除 `setRoute` 方法，用 `go` 代替
+ [x] 移除 `redirect` 方法，用 `go` 代替
+ [x] 移除 `root` 配置项
+ [x] 支持 `*` 匹配
+ [x] 移除 `notFound` 配置项，使用 `*` 匹配

## Introduction

`spa-router-better` is a router module for building large single-page-application(SPA).If you are using [vue.js](https://github.com/yyx990803/vue), it's easy for you to handle routing.

[中文](./README.zh-CN.md)

## Demo

```
npm install && npm start
```

## Install

`npm install spa-router-better`

OR

Use the dist files in the dist folder.

## Basic Usage

1. config your routes
2. create a new `Router`
3. invoke `.start()` method

```javascript
const routes = {
  "/": {
    "name": "home",
    "controllers": [homeController],
    "sub": {
      "/product": {
        "name": "productList",
        "beforeLeave": [doBeforeLeave],
        "controllers": [productController1, productController2],
        "beforeEnter": [doAfterEnter],
        "data": {
          "custom": "data"
        }
      },
      "*": {
        "name": "pageNotFound",
        "controllers": []
      }
    }
  }
};
Router.mode('hashbang');
const configs = {
  mode: "hashbang", // default: hashbang
  beforeEachEnter: [],
  beforeEachLeave: []
};
const myRouter = new Router(routes, configs);
myRouter.start();
```

### options

#### `name` (String)

named-route

#### `controllers` (Function|Array)

callbacks

#### `beforeEnter` (Function|Array)

callbacks which will be called before `controllers`

#### `beforeLeave` (Function|Array)

callbacks which will be called before switch to another route

#### `data` (Object)

custom route data

#### `sub` (Object)

sub routes

## Params and Query

You can get params or query from the `req` argument in the callback handler.

### Params

How to define a param:
+ `:paramName`, the `paramName` matches `[a-zA-Z0-9_]+`
+ `:paramName(matchRule)`, the `matchRule` is a RegExp string
+ if you insert a `matchRule` without a `paramName`, the match rule still works, but you cannot get the params from `req.params`

How to get the params:
+ `req.params`

Examples:

```javascript
var routes = {
  '/product/:color(red|blue|black)-:size-:price([0-9]{1,2})': function(req) {
    var params = req.param;
    console.log('product list with ' + params.color + ' color, ' + params.size + ' size and ' + params.price + ' price');
  }
};
```

### Query

Example

```javascript
var routes = {
  '/product': function(req) {
    var query = req.query;
    // current request url is "/produce?color=red&size=normal&price=low"
    console.log(query.color, query.size, query.price);
    // log: red normal low
  }
}
```

Notice:
+ `a=1&a=2` will be parsed into `{"a":['1','2']}`
+ if the query is not a `key:value` mapping, it will not be parsed, e.g. `a&b=2` will be parsed into `{"b":"2"}`
+ `+` in query string will be parsed into a whitespace string `" "`, e.g. `a=1+1` will be parsed into `{"a":"1 1"}`. If you need to pass a real `+` string from the query, you should wrap the query string with `encodeURIComponent`, e.g. `encodeURIComponent('a=1+1')` will be parsed into `{"a":"1+1"}`
+ all the query strings will be parsed into an `Object` or `Array`

## API

### constructor

```
new Router(options);
```

options:

+ `mode` (String)
+ `beforeEachEnter` (Function|Array)
+ `beforeEachLeave` (Function|Array)

### Instance method
#### `.start()`

start the router

Options
+ `root`: `[String]` where to begin
+ `notFound` `[Function]` this function will be called if current url do not match any routes
+ `mode` `['history'|'hashbang']` url mode, `history` need HTML5 History API support

#### `.stop()`

#### `.on(path, handler)`

add a route to the route table

```javascript
router.on('/test', function(req) {
  // ...
});
```

+ this method will merge the route with current route table
+ if this method is called after the `.start()` method, this route will not dispatch immediately, you must wait until next time the url change or you can call `dispatch` method to trigger the route

#### `.off(path)`

remove a route from route table

#### `.mount(mountPath, subRoutes)`

merge another route table with current route table

+ routes will be merged with current route table
+ if this method is called after the `.start()` method, this route will not dispatch immediately, you must wait until next time the url change or you can call `dispatch` method to trigger the route

#### .dispatch(path)

dispatch a route

#### .setUrlOnly(url)

#### .go(path)

change the url to `path` and dispatch a route

+ if the path has not changed, no routes will be dispatched, so do not use this method to reload a page

#### .reload()

reload the page(dispatch current route again)

+ no arguments
