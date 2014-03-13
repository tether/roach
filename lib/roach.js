
/**
 * Dependencies.
 * @api private
 */

var Job = require('./job'),
		Worker = require('./worker');


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
  //do something
}


/**
 * Add job into the queue.
 * example:
 *
 * @param {String} name 
 * @param {Job} job 
 * @return {Roach}
 * @api public
 */

Roach.prototype.add = function(name, job) {
	//NOTE:we should pass options
	//should we pass job or pass job later 
	//in a process handler.
};


/**
 * Start a roach job with 
 * priority 1 (processed right away).
 * example:
 *
 *   .use(weather);
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