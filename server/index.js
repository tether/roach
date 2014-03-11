/**
 * Module dependencies.
 */

var express = require('express');

// setup

var app = express();
var stylus = require('stylus');
var nib = require('nib');
var redis = require('redis');
var Queue = app.Queue = require('kue');
var roach = app.roach = require('../lib/roach');
roach.use('logger')
     .start();


// Setup redis url

if (process.env.REDISTOGO_URL) {
  var rtg = require("url").parse(process.env.REDISTOGO_URL);

  Queue.redis.createClient = function() {
    var client = redis.createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(":")[1]);
    return client;
  };
}

// expose the app

module.exports = app;

// stylus config

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

// config

app.set('port', process.env.PORT || 5000);
app.set('view options', { doctype: 'html' });
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.set('title', 'Roach');

// middleware

app.use(express.favicon());
app.use(express.urlencoded());
app.use(express.json());
app.use(app.router);
app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
app.use(express.static(__dirname + '/public'));

// Routes
var routes = require('./routes')(app);

app.listen(app.get('port'));
console.log('Roach server started on port ' + app.get('port'));
