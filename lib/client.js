
/**
 * Module dependencies.
 * @api private
 */

var redis = require('redis');


/**
 * Create redis client.
 * 
 * A job can run in a seprate process 
 * and we should be able to set its own redis config.
 * 
 * Examples:
 *
 *   client({
 *     port: 64000,
 *     host: petrofeed.heroku.com
 *   });
 * 
 * @param  {Object} options
 * @return {Client}
 * @api private
 */

module.exports = function(options) {
  var client;
  if(options) {
    var port = options.port || 6379;
    var host = options.host || '127.0.0.1';
    var auth = options.auth;
    client = redis.createClient(port, host, options.options);
    if (auth) {
      client.auth(auth);
    }
    return client;
  }
  return redis.createClient();
};
