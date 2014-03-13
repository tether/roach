/**
 * Dependencies.
 * @api private
 */

var Emitter = require('component-emitter'),
		Store = require('store-component');


/**
 * Expose 'Job'
 */

module.exports = Job;


/**
 * Job constructor.
 * @api public
 */

function Job() {
	this.sandbox = new Store({});
}

//inherits from emitter

Emitter(Job.prototype);


/**
 * Config handler.
 * example:
 *
 *   //get
 *   .config('type');
 *   //set
 *   .config('type', 'web');
 *   .config({
 *     type: 'web'
 *   });
 *
 * @param {String|Object} name 
 * @param {Any} val 
 * @return {Any}
 * @api public
 */

Job.prototype.config = function(name, val) {
	if(typeof name === 'object' || val) {
		this.sandbox.set(name, val);
		return this;
	}
	return name ? this.sandbox.get(name) : this.sandbox.data;
};


/**
 * Execute callback on start.
 * example:
 *
 *   .start(function() {
 *     //do something
 *   });
 *
 * @param {Function} cb 
 * @api public
 */

Job.prototype.start = function(cb) {
	this.on('start', cb);
};


/**
 * Stop job (hammer time).
 * Emit stop command.
 *
 * @api public
 */

Job.prototype.stop = function() {
	this.emit('stop');
};

//job.progress set progress
//job.log debug and log
