
/**
 * Dependencies.
 * @api private
 */

var Job = require('./job'),
		Worker = require('./worker');


/**
 * Initialize roach UI
 * @api private
 */

var app = app || require('./app');


/**
 * Expose 'Roach'
 */

module.exports = function() {
	return new Roach();
};


/**
 * Create job
 * 
 * @return {Job}
 */

module.exports.job = function() {
	return new Job();
};


/**
 * Roach constructor.
 * @api public
 */

function Roach() {
  //NOTE:create queue and sync with redis (extra config)
  //each job has its own config that can be override
}


/**
 * Add job into the queue.
 * example:
 *
 * @param {String} name 
 * @param {Object} options 
 * @return {Roach}
 * @api public
 */

Roach.prototype.add = function(name, options) {
	
};


/**
 * Start a roach job with 
 * priority 1 (processed right away).
 * example:
 *
 *   .use(weather);
 *   .use('stocks', options);
 *
 * @param {Job} job
 * @return {Roach}
 * @api public
 */

Roach.prototype.use = function(bug) {
	//NOTE:In the future, we will have types and priorities.
	var worker = new Worker(bug);

	//NOTE: we could start a worker through a redis message
	worker.start();
	return this;
};