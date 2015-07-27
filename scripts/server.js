var serve = require('koa-static');
var koa = require('koa');
var path = require('path');
var app = koa();

app.use(serve(path.resolve(__dirname, '../demo')));
app.use(serve(path.resolve(__dirname, '../build')));

app.listen(9090, function() {
  console.log('visit url: http://localhost:9090');
});
