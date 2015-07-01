var express = require('express');
var ejs = require('ejs');
var path = require('path');
var app = express();

app.set('views', './demo');
app.set('view engine', 'ejs');
app.engine('.html', ejs.__express);
app.engine('.ejs', ejs.__express);
app.use(express.static(__dirname + '/demo'));
app.use(express.static(__dirname + '/build'));

app.get('/', function(req, res) {
  res.render('demo-history.html');
});

app.listen(9090, function() {
  console.log('Open browser and goto http://localhost:9090/');
});
