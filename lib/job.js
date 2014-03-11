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
  //do something
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
	return this.sandbox.get(name);
};