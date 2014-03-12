
/**
 * Dependencies.
 * @api private
 */

var Job = require('./job');


/**
 * Expose 'Roach'
 */

module.exports = function() {
	return new Roach();
};


/**
 * Create job (aka bug).
 * 
 * @return {[type]} [description]
 */

module.exports.bug = function() {
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
 * Start a roach job/bug with 
 * priority 1 (processed right away).
 * example:
 *
 *   .use(weather);
 *
 * @param {Job} bug
 * @return {Roach}
 * @api public
 */

Roach.prototype.use = function(bug) {
	if(bug instanceof Job) bug.emit('start');
	return this;
};