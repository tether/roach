//redis queue
1: eric
2: eric
3: weather


//server

roach();


//eric

/**
 * Dependencies
 * @api private
 */

var roach = require('roach'),
		utils = require('roach/utils');


//expose job

var job = module.exports = roach.job();


job.on('start', function() {
	//
});