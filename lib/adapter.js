var redis = require('redis');

/**
 * Expose 'Adapter'
 */

module.exports = Adapter;


/**
 * Adapter constructor.
 * @api private
 */

function Adapter(job) {
  this.client = redis.createClient();
  this.job = job;
  this.state = 'inactive';
  //this.id
  //this.type
}




/**
 * Start job.
 * 
 * @return {Adapter}
 * @api private
 */

Adapter.prototype.start = function() {
	//NOTE: what if job is a function?
	this.job.emit('start');

  //NOTE:should we set active when ack from 
  //Adapter redis client?
	this.state = 'active';
	return this;
};