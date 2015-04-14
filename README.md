# spa-router
Router Module for Single Page Application

##Introduce
spa-router是一个前端路由模块，用于SPA（单页应用程序）的开发

##How to use

###基本使用方式
```javascript
var routes = { // 先定义路由表
  '/': function() {
    console.log('This is the index route!');
  },
  '/user': {
    on: function() {
      console.log('This is the /user route!');
    },
    '/list': function() {
      console.log('This is the /user/list route!');
    },
    '/edit/:id': function(req) {
      console.log('This is the /user/edit/:id route, current user is ' + req.params.id);
    }
  }
};
var router = Router(routes);
// or use new operator: var router = new Router(routes);
router.init();
```

###定义参数
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
初始化方法。这个方法有一个可选的参数root，表示根路径的开始。默认情况下，根路径从'/'开始，在实际URL上就是'#/'。
####.on() or .route()
####.configure([options])
可配置项：
+ notfound Function 找不到路由时触发
+ on Function 找到任意路由时触发
####.param(token, pattern)
自定义参数规则
e.g.
```javascript
var router = Router();
router.param('id', /([0-9]+)/);
router.on('/user/:id', function(req) {
  console.log(req.params.id);
});
router.init();
```

<strong>注意：</strong>

这个方法仅对.on()方法添加的路由有效，且必须在.on()之前定义参数。改方法对路由表无效。