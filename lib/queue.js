
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

module.exports.key = 'roach:jobs';


/**
 * Expose 'Queue'
 */

module.exports = Queue;


/**
 * Queue constructor.
 * @api public
 */

function Queue() {
  this.client = redis.createClient();
}


//inherit from emitter

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
  var cmd = [exports.key + ':' + id, 'name', name].concat(flatten(options));
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
  this.client.incr(exports.key + ':id', function(err, res) {
    if(err) promise.reject(err);
    _this.client.lpush(exports.key, res, function(err, res) {
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


Queue.prototype.get = function(id) {
  var promise = new Promise();
  this.client.hgetall(exports.key + ':' + id, function(err, res) {
    if(err) promise.reject(err);
    promise.resolve(res);
  });
  return promise;
};


// Queue.prototype.remove = function() {
  
// };


// Queue.prototype.peek = function() {
  
// };
