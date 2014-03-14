
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
  this.client = redis.createClient();
}


Queue.prototype.add = function(name, cb) {
	this.client.lpush(Queue.key, name, cb);
};


Queue.prototype.remove = function() {
	
};


Queue.prototype.peek = function() {
	
};
