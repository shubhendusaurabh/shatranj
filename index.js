"use strict";

var express = require('express');
var path = require('path');
var morgan = require('morgan');
var serveFavicon = require('serve-favicon');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var compression = require('compression');
var errorHandler = require('errorhandler');

var env = process.env.NODE_ENV || 'development';

var app = express();
app.set('views', __dirname+'/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use(serveFavicon(path.join(__dirname + '/public/img/favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());

if (env == 'development') {
  app.use(errorHandler({ dumpExceptions: true, showStack: true }));
  app.locals.pretty = true;
}

if (env == 'production') {
  app.use(compression());

  app.use(function(req, res, next) {
    res.status(404);
    res.render('404.jade', {title: '404: Page not found!'});
  });

  app.use(function (error, req, res, next) {
    console.error(error.stack);
    res.status(500);
    res.render('500.jade', {title: '500: Internal Server Error'});
  });
}

var server = app.listen(process.env.PORT || 3000);

require('./routes')(app);
