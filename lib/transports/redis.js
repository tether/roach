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
    port : 6379,
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
  this._db.on("error", function(err) {
    debug("Received error: %s", err);
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
  debug("Inside ON: %s", name);
  this._emitter.on(name, _.bind( callback, scope));
};


/**
* Insert data into redis
* Redis events.
*/
Redis.prototype.save = function(data) {
  debug("Inside SAVE with data: %s", data);
  var self = this,
      name = "data:" + this._dataId;

  this.savedDoor.addLock(name);

  var type = Object.keys(data)[0];
  var licenseNumber = data[type][0].licenseNumber;
  var reportDate = data[type][0].reportDate;
  
  function pad(number, pad_length, char) {
    var pad_char = typeof char !== 'undefined' ? char : '0';
    var pad = new Array(1 + pad_length).join(pad_char);
    return (pad + number).slice(-pad.length);
  }

  var key = 'well:' + licenseNumber;
  var score = new Date(reportDate).getTime() + pad(this._dataId, 6);

  this._db.sadd('keys', key, redis.print);
  this._db.zadd(key, score, JSON.stringify(data), redis.print);

  debug("Saved: Score %s with key: %s", score, key);
  self.savedDoor.unlock(name);

  this._dataId++;
};


/**
* Close handler and emit close event.
*/
Redis.prototype.close = function() {
    var self = this;
    this._db.quit()
    debug("Closed Connection");
    self._emitter.emit('close');
};

module.exports = Redis;
