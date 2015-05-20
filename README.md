# spa-router
Router Module for Single Page Application

##Introduce
spa-router是一个前端路由模块，用于SPA（单页应用程序）的开发

##How to use

###基本使用方式
```javascript
var routes = { // 先定义路由表
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
var router = Router(routes);
// or use new operator: var router = new Router(routes);
router.init();
```

###获取参数
```javascript
var routes = {
  '/product/:color-:size-:price': function(req) {
    var params = req.params;
    console.log('product list with ' + params.color + ' color, ' + params.size + ' size and ' + params.price + ' price');
  }
};
```

###获取query
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

##API
###instance method
####.init([root])
初始化方法。这个方法有一个可选的参数root，表示根路径的开始。默认情况下，根路径从'/'开始。如果是hashbang模式，在实际URL上就是'#/'。
####.on(path, handler/handler list) or .route(path, handler/handler list)
这个方法用于动态添加路由
```javascript
router.on('/test', function(req) {
  // ...
});
```
.on()/.route()方法添加的路由，如果在.init()之后执行，不会立即触发（等到下一次才触发），如果要立即触发，可以执行.dispatch()方法
####.mount(routes)

####.configure([options])
可配置项：
+ notFound 找不到路由时触发
+ on 找到任意路由时触发
+ always 总是触发（无论是否存在路由）
+ mode ['history'|'hash'|'hashbang'] 默认为'hashbang'，如果使用'history'，请保证浏览器支持HTML5 History API否则不起作用（如果浏览器不支持，默认仍然会使用hashbang模式）

####.dispatch(path)
触发path对应的路由（但不会改变URL）
####.setRoute(path)
改变当前的URL，由此触发对应的路由。这个方法适用于`'history'`模式。在`'history'`模式下，如果点击`<a>`标签默认会发生页面跳转行为，无法达到SPA的效果。一般我们使用`PJAX`的方法禁止`<a>`标签跳转，但为了改变URL并且触发路由，就需要调用`.setRoute()`方法。
