
/**
 * Dependencies
 * @api private
 */

var redis = require('redis');



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
  // this.client = redis.createClient();
}


//inherit from emitter
//NOTE: may be use store

require('component-emitter')(Queue.prototype);
require('emitter-queue')(Queue.prototype);

/**
 * Add job into the queue.
 * 
 * @param {String}   name 
 * @api public
 */

Queue.prototype.add = function(name, options) {
  this.queue('added ' + name, options);
  this.emit('added', name, options);
  // var _this = this;
  // this.client.lpush(Queue.key, name, function(err, res) {
  //   //should throw an error through the pipe
  //   if(err) return;
  //   _this.client.incr(Queue.key + ':id', function(err, res) {
  //     if(err) return;
  //     _this.emit('added');
  //     //NOTE: no need to send err
  //     cb && cb(err, res);
  //   });
  // });
};


// Queue.prototype.remove = function() {
  
// };


// Queue.prototype.peek = function() {
  
// };
