
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
	var _this = this;
	this.client.lpush(Queue.key, name, function(err, res) {
		//should throw an error through the pipe
		if(err) return;
		_this.client.incr(Queue.key + ':id', function(err, res) {
			if(err) return;
			//NOTE: no need to send err
			cb && cb(err, res);
		});
	});
};


Queue.prototype.remove = function() {
	
};


Queue.prototype.peek = function() {
	
};
