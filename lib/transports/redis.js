var redis = require('redis'),
    debug = require('debug')('Redis'),
    EventEmitter = require('events').EventEmitter,
    _ = require('underscore'),
    Door = require('doors');


/**
* @class Redis Constructor
*/
function Redis($config) {

  this._defaults = {
    protocol : 'redis',
    name: 'redis',
    host : 'localhost',
    port : 6379
  },

  this._connection = null,
  this._db = null,

  // We instantiate an event emitter to emit events.
  // We don't inherit from EventEmitter because we 
  // want to set the scope for the on() function, which
  // as of Node v0.10.9 you can't do.
  this._emitter = new EventEmitter();
  this._dataId = 0;

  // Merge in our default options
  this.options = _.extend(this._defaults, $config);

  this.savedDoor = new Door(this.options.name);
}


/**
* Init redis connection and listen
* Redis events.
*/
Redis.prototype.init = function() {
  var self = this;
  this._db = redis.createClient(this.options.port, this.options.host, {});

  this._db.on('error', function(err) {
    self._emitter.emit('error', err);
  });

  this._emitter.emit('ready', this.options.name);
};


/**
* Listen for redis events.
* @param {String} event's name
* @param {Function} callback's function
* @type {[type]}
*/
Redis.prototype.on = function(name, callback, scope) {
  this._emitter.on(name, _.bind( callback, scope));
};

Redis.prototype.generateScore = function() {
  return this.options.key + new Date().getTime();
};

/**
* Insert data into redis
* Redis events.
*/
Redis.prototype.save = function(data) {
  var name = "data:" + this._dataId;
  var key = null;
  var score = null;

  this.savedDoor.addLock(name);

  if (this.options.key && typeof this.options.key === 'function') {
    key = this.options.key(data);
  }
  else {
    key = this.options.key || name;
  }

  if (this.options.score && typeof this.options.score === 'function') {
    score = this.options.score(data);
  }
  else {
    score = this.options.score || this.generateScore();
  }

  // TODO (EK): We are assuming that these are the operations for saving. We should
  // abstract them so that anyone can pass in config params when initializing the transport
  // for how they would like to save the data.

  delete data.key;
  delete data.score;

  this._db.sadd('keys', key, redis.print);
  this._db.zadd(key, score, JSON.stringify(data), redis.print);

  debug("Saved: %s", name);
  debug("Saved: Score %s with key: %s", score, key);
  this.savedDoor.unlock(name);

  this._dataId++;
};


/**
* Close handler and emit close event.
*/
Redis.prototype.close = function() {
    this._db.quit();

    debug("Closed Connection");

    this._emitter.emit('close');
};

module.exports = Redis;
