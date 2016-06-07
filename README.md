# spa-router

[A Router Module for Single Page Application](http://zcoding.github.io/spa-router)

[![Versoin](https://img.shields.io/npm/v/spa-router-better.svg?style=flat-square "Version")](https://www.npmjs.com/package/spa-router-better)
[![License](https://img.shields.io/npm/l/spa-router-better.svg?style=flat-square "License")](./LICENSE)

## Introduction

`spa-router-better` is a router module for building large single-page-application(SPA).If you are using [vue.js](https://github.com/yyx990803/vue), it's easy for you to handle routing.

[中文](./README.zh-CN.md)

## Demo

See demos in the `demo` folder.

If you want to see demos with `history mode`, run `npm run server`.

## Install

`npm install spa-router-better`

OR

Use the dist files in the dist folder.

## Basic Usage

1. config your routes
2. create a new `Router`
3. invoke `.start()` method

```javascript
////////// a complete demo
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

## Basic Uasge with Vue.js

You can see the demo's source files in the `vue-router` folder.

In the project's root directory, run `npm run vue` to start the demo, and then open `http://localhost:9999`.

This demo use [webpack-dev-server](https://github.com/webpack/webpack-dev-server) and support livereload. Try to change the demo's source and learn more usage about spa-router.

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
### Instance method
#### `.start([options])`

start the router

Options
+ `root`: `[String]` where to begin
+ `notFound` `[Function]` this function will be called if current url do not match any routes
+ `mode` `['history'|'hashbang']` url mode, `history` need HTML5 History API support

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

#### `.mount(routes)`

merge another route table with current route table

+ routes will be merged with current route table
+ if this method is called after the `.start()` method, this route will not dispatch immediately, you must wait until next time the url change or you can call `dispatch` method to trigger the route

#### .dispatch(path)

dispatch a route

#### .setRoute(path)

change the url to `path` and dispatch a route

+ if the path has not changed, no routes will be dispatched, so do not use this method to reload a page
+ usually used in `history` mode

#### .reload()

reload the page(dispatch current route again)

+ no arguments

### API method
