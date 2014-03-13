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
	return this;
};


/**
 * Send log notifications.
 * examples:
 *
 *   .log('roach');
 *   .log('type %s', 'roach');
 *   .log('type %1 %0', 'roach', 'jobs');
 *   
 * @param  {String} str (sprintf style)
 * @return {Job}
 * @api public
 */

Job.prototype.log = function(str) {
	var args = [].slice.call(arguments, 1),
			i = 0;
	if(str) {
		str = str.replace(/%([sd]|[0-9]*)/g, function (_, type) {
			var nb = Number(type);
			if(!isNaN(nb)) {
				return args[nb];
			} else {
				var arg = args[i++];
				return (type === 's') ? arg : (arg || 0); 
			}
		});
		this.emit('log', str);
		return this;
	}
};


/**
 * Set progress notifications.
 * examples:
 *
 *   .progress(10);
 *   .progress(13, 120);
 *   
 * @param  {Number} val  
 * @param  {Number} total optional
 * @return {Job}
 * @api public
 */

Job.prototype.progress = function(val, total) {
	this.emit('progress', total ? Math.min(100, val / total * 100 | 0) : val);
	return this;
};
