
/**
 * Modules dependencies.
 * @api private
 */

var roach = require('../roach');
var redis = require('redis');


//expose transport

var job = module.exports = roach.job();

// Setup Redis Connection

var client = redis.createClient();
client.psubscribe('roach:job:*:data*');
client.on('pmessage', function(pattern, channel, data) {
  console.log('  \033[31mlogger data\033[m : \033[90m%s\033[m', data);
});


