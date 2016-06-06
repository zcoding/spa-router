var show = (function () {
  var uriD = getDom('[data-uri]');
  var pathD = getDom('[data-path]');
  var paramD = getDom('[data-param]');
  var queryD = getDom('[data-query]');

  return function process (req, msg) {
    msg = msg || '';
    uriD.innerText = req.uri;
    pathD.innerText = req.path;
    var params = req.params, query = req.query;
    var paramString = '', queryString = '';
    for (var p in params) {
      if (params.hasOwnProperty(p)) {
        paramString += '<p>' + p + ': ' + params[p] + '</p>';
      }
    }
    paramD.innerHTML = paramString || '-';
    for (var q in query) {
      queryString += '<p>' + q + ': ' + query[q] + '</p>';
    }
    queryD.innerHTML = queryString || '-';
    getDom('[data-msg]').innerText = msg;
  }
})();

function notFound(req) {
  getDom('[data-uri]').innerText = '-';
  getDom('[data-path]').innerText = '-';
  getDom('[data-param]').innerHTML = '-';
  getDom('[data-query]').innerHTML = '-';
  getDom('[data-msg]').innerText = 'Page not found';
}

var routesTable = {
  '/': show,
  '/product': show,
  '/product/:color(r.+)-:size-:price': show,
  '/product/:id': show,
  '/about': show,
};

var routerA = new Router(routesTable);

// .mount()
routerA.mount('/admin', {
  '/': show,
  '/product': {
    '/': show,
    '/:color-:size-:price': show,
    '/:id': [show, function(req) { console.log(req.params['id']); }],
    '/add': function(req) { console.log('You will never make it work.'); }
  }
});

routerA.start({
  notFound: notFound
});

// .route() & .dispatch()
routerA.on('/whatever/foo', [show, function(req) {}])
  .on('/whatever/bar', function(req) { console.log('done'); })
  .dispatch('/whatever/bar');

parseRouterTree(getDom('.render-tree ul'), routerA.routeTree);
