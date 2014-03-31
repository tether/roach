
/**
 * Dependencies
 * @api private
 */

var redis = require('redis');
var Promise = require('component-promise');


/**
 * Jobs list key (test only)
 * @api private
 */

module.exports.key = 'roach:jobs:pending';


/**
 * Expose 'Queue'
 */

module.exports = Queue;


/**
 * Queue constructor.
 * @api public
 */

function Queue() {
  var _this = this;
  this.client = redis.createClient();

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
}


//inherit from queued emitter

require('component-emitter')(Queue.prototype);
require('emitter-queue')(Queue.prototype);


/**
 * Flatten object.
 * example:
 *
 *   flatten({
 *     repo: 'roach',
 *     type: 'github'
 *   });
 *   //['repo', 'github', 'type', 'github']
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
 * @param  {Object} options optional
 * @return {Promise} 
 * @api private
 */

Queue.prototype.create = function(id, name, options) {
  var promise = new Promise();
  var cmd = ['roach:jobs:' + id, 'name', name].concat(flatten(options));
  this.client.hmset(cmd, function(err, res) {
    if(err) promise.reject(err);
    promise.resolve(res);
  });
  return promise;
};


/**
 * Increment task id and push task in queue.
 *
 * @param {Striing} name 
 * @param {Object} options optional
 * @return {Promise}
 * @api private
 */

Queue.prototype.push = function(name, options) {
  var promise = new Promise();
  var _this = this;
  this.client.incr('roach:jobs:id', function(err, res) {
    if(err) promise.reject(err);
    _this.client.lpush('roach:jobs:pending', res, function(err, res) {
      if(err) promise.reject(err);
      promise.resolve(res);
    });
  });
  return promise;
};


/**
 * Add job into the queue.
 * 
 * @param {String}   name 
 * @param {Object} options optional
 * @api public
 */

Queue.prototype.add = function(name, options) {
  var _this = this;
  this.push(name, options).then(function(val) {
    _this.create(val, name, options).then(function() {
      _this.queue('added ' + name, val, options);
      _this.emit('added', name, val, options);
    });
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
 * Remove job from queue.
 * 
 * @param  {Number} id
 * @param {Function} cb (for test purpose)
 * @api private
 */

Queue.prototype.remove = function(id, cb) {
  this.client.lrem('roach:jobs:pending', 0, id, cb);
  return this;
};


// Queue.prototype.peek = function() {
  
// };
