'use strict';

var express = require('express');
var app = express();
var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./bet_tracker.db"
  }
});
var bookshelf = require('bookshelf')(knex);
app.set('bookshelf', bookshelf);

var Bets = bookshelf.Model.extend({
  tableName: 'bets'
});

// marker for `grunt-express` to inject static folder/contents
app.use(function staticsPlaceholder(req, res, next) {
  return next();
});

var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');

app.use(bodyParser());
app.use(methodOverride());

app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

app.get('/', function(req, res){
  res.redirect("/index.html");
});

app.get('/api/bets', function(req, res, next){
  // res.send(users);
  new Bets()
    .fetchAll()
    .then(function(bets){
      res.json(bets.toJSON());
    });
});

module.exports = app;
