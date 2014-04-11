
/**
 * Module dependencies
 * @api private
 */

var client = require('./client');
var redis = require('redis');
var Promise = require('bredele-promise');
var debug = require('debug')('queue');


/**
 * Jobs list key (test only)
 * 
 * @type {String}
 * @api private
 */

module.exports.pending = 'roach:jobs:pending';
module.exports.active = 'roach:jobs:active';
module.exports.finished = 'roach:jobs:finished';


/**
 * Expose 'Queue'
 */

module.exports = Queue;


/**
 * Queue constructor.
 *
 *   - add job in pending queue
 *   - remove job from active queue
 *   - listen messages from running jobs
 * 
 * @api public
 */

function Queue(options) {
  var _this = this;
  this.client = client(options);
  var sub = client(options);
  sub.psubscribe("roach:job:*");
  sub.on('pmessage', function(pattern, channel, msg) {
    debug('message received from %s %s', channel, msg);
    var details = channel.split(' ');
    if(msg === 'stop') {
      _this.remove(details[0].substring(10));
    }
  });

 // function add(id) {
 //    return function(val) {
 //      //NOTE:remove name from val to be consistent with 
 //      //queue.add
 //      _this.queue('added ' + val.name, id, val);
 //      _this.emit('added', val.name, id, val);
 //    }
 //  }

 //  //init
 //  this.client.lrange(exports.key, 0, -1, function(err, res) {
 //    //NOTE: we should have a error handler for promises and callbacks
 //    if(err) return;
 //    for(var i = 0, l = res.length; i < l; i++) {
 //      _this.get(res[i]).then(add(res[i]));
 //    }
 //  });
 
 this.on('error', function() {});
}


//inherits from queued emitter

require('component-emitter')(Queue.prototype);
require('emitter-queue')(Queue.prototype);


/**
 * Flatten object.
 * 
 * Examples:
 *
 *   flatten({
 *     repo: 'roach',
 *     type: 'github'
 *   });
 *   // => ['repo', 'github', 'type', 'github']
 *   
 * @param  {Object} obj 
 * @return {Array}
 * @api private
 */

function flatten(obj) {
  var arr = [];
  for(var name in obj) {
    arr.push(name, obj[name]);
  }
  return arr;
}


/**
 * Create task hkey with name and
 * options.
 * 
 * @param  {Number} id   
 * @param  {String} name  
 * @param  {Object} options
 * @return {Promise} 
 * @api private
 */

Queue.prototype.create = function(id, name, options) {
  var promise = new Promise();
  var cmd = ['roach:jobs:' + id, 'name', name].concat(flatten(options));
  this.client.hmset(cmd, function(err, res) {
    if(err) promise.reject(err);
    debug('options %s stored under roach:jobs:%s', name, id);
    promise.resolve(res);
  });
  return promise;
};


/**
 * Increment task id and push task in queue.
 *
 * @param {String} name 
 * @param {Object} options
 * @return {Promise}
 * @api private
 */

Queue.prototype.push = function(name, options) {
  var promise = new Promise();
  var _this = this;
  this.client.incr('roach:jobs:id', function(err, res) {
    if(err) promise.reject(err);
    _this.client.zadd('roach:jobs:pending', res, res, function(err) {
      if(err) promise.reject(err);
      promise.resolve(res);
    });
  });
  return promise;
};


/**
 * Add job into the queue.
 *
 * Emits an 'added' event if job has successfully 
 * been added into the roach pending queue.
 *
 * Examples:
 *
 *   queue.add('weather');
 *   queue.add('stocks', options);
 * 
 * 
 * @param {String}   name 
 * @param {Object} options
 * @api public
 */

Queue.prototype.add = function(name, options) {
  var _this = this;
  this.push(name, options).then(function(val) {
    _this.create(val, name, options).then(function() {
      debug('job %s added in pending queue', name);
      _this.queue('added ' + name, val, options);
      _this.emit('added', name, val, options);
    });
  }, function(reason) {
    _this.emit('error', reason);
  });
};


/**
 * Get job hashkey.
 * 
 * @param  {Number} id
 * @return {Promise}
 * @api private
 */

Queue.prototype.get = function(id) {
  var promise = new Promise();
  this.client.hgetall('roach:jobs:' + id, function(err, res) {
    if(err) promise.reject(err);
    promise.resolve(res);
  });
  return promise;
};


/**
 * Remove job from active queue and put
 * it on finished queue.
 * 
 * @param  {Number} id
 * @param {Function} cb (for test purpose)
 * @api private
 */

Queue.prototype.remove = function(id, cb) {
  var _this = this;
  this.client.zrem('roach:jobs:active', id, function(err) {
    if(!err) {
      debug('job %s removed from active queue', id);
      _this.client.zadd('roach:jobs:finished', id, id, function(err, res) {
        if(!err) {
          //just to be sure
          _this.client.zrem('roach:jobs:pending', id);
          cb && cb.apply(null, arguments);
        }
      });
    }
  });
  return this;
};
