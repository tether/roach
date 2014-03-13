
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
  //NOTE:create queue and sync with redis (extra config)
  //each job has its own config that can be override
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
	//add is more like process. job will be started
	//every time a 'name' job is created/saved
	
	//if we pass the options, it's save/run + process
	//the save/run could be use!!
	//.use('video-conversion', options);  --> run the added job with options
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