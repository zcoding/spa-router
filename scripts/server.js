var serve = require('koa-static');
var koa = require('koa');
var path = require('path');
var app = koa();
var fs = require('fs');

app.use(serve(path.resolve(__dirname, '../demo')));
app.use(serve(path.resolve(__dirname, '../build')));

app.use(function *(next) {

  this.type = 'text/html';
  this.body = fs.createReadStream(path.resolve(__dirname, '../demo/demo-history.html'));

});

app.listen(9090);
