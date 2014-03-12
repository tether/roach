var redis = require('redis');

/**
 * Expose 'Worker'
 */

module.exports = Worker;


/**
 * Worker constructor.
 * @api public
 */

function Worker(job) {
  this.client = redis.createClient();
  this.job = job;
  //this.type
}
