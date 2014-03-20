var redis = require('redis');

/**
 * Expose 'Worker'
 */

module.exports = Worker;


/**
 * Worker constructor.
 * @api private
 */

function Worker(job) {
  this.client = redis.createClient();
  this.job = job;
  this.state = 'inactive';
  //this.id
  //this.type
}




/**
 * Start job.
 * 
 * @return {Worker}
 * @api private
 */

Worker.prototype.start = function() {
	//NOTE: what if job is a function?
	this.job.emit('start');

  //NOTE:should we set active when ack from 
  //worker redis client?
	this.state = 'active';
	return this;
};