# spa-router
Router Module for Single Page Application

##Introduce
spa-router是一个前端路由模块，用于SPA（单页应用程序）的开发

##How to use

###基本使用方式

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

###定义参数

    var routes = {
        '/product/:color-:size-:price': function(req) {
            var params = req.params;
            console.log('product list with ' + params.color + ' color, ' + params.size + ' size and ' + params.price + ' price');
        }
    };

###获取query

    var routes = {
        '/product': function(req) {
            var query = req.query;
            // 假设当前请求为/produce?color=red&size=normal&price=low
            console.log(query.color, query.size, query.price);
            // console: red normal low
        }
    }

##API
###instance method
####.on() or .route()
####.configure()