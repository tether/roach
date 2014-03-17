
/**
 * Dependencies.
 * @api private
 */

var Job = require('./job'),
		Queue = require('./queue'),
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
	this.queue = new Queue();
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
	this.queue.add(name, options);
};


/**
 * Start a roach job with 
 * priority 1 (processed right away).
 * example:
 *
 *   .use(job);
 *   .use('weather', job);
 *
 * @param {String|Job} name
 * @param {Job} job
 * @return {Roach}
 * @api public
 */

Roach.prototype.use = function(name, job) {
	if(job) {
		//NOTE: beware scope!!
		var worker = new Worker(job);
		this.queue.on('added ' + name, function() {
			worker.start();
		});
	} else {
		//NOTE:In the future, we will have types and priorities.
		var worker = new Worker(name);

		//NOTE: we could start a worker through a redis message
		worker.start();
	}
	return this;
};