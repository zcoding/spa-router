// 使用koa.js搭建一个简单的pjax服务器

const koa = require('koa');
const serve = require('koa-static');
const app = koa();
const path = require('path');
const openBrowser = require('open');
const fs = require('fs');
const PORT = 9898;

app.use(serve(path.resolve(__dirname, '../demo'))); // serve the static demo files
app.use(serve(path.resolve(__dirname, '../dist/iife'))); // serve the static dist file

app.use(function *() {
  this.type = 'text/html';
  this.body = fs.createReadStream(path.resolve(__dirname, '../demo/index.html'));
});

app.listen(PORT, () => {
  openBrowser(`http://localhost:${PORT}`);
  console.log(`Server start at localhost:${PORT}`);
});
