var redis = require('redis');

/**
 * Expose 'Worker'
 */

module.exports = Worker;


/**
 * Worker constructor.
 * @api public
 */

function Worker() {
  this.client = redis.createClient();
}
