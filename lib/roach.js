
/**
 * Dependencies.
 * @api private
 */

var Job = require('./job'),
		Queue = require('./queue'),
		redis = require('redis'),
		fs = require('fs'),
		read = fs.readFile,
		readdir = fs.readdirSync;


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
	this.client = redis.createClient();
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
 * Start a roach job.
 * example:
 *
 *   .use(job);
 *   .use('weather', job);
 *   .use('weather', function(job){
 *   });
 *   .use('weather');
 *
 * @param {String|Job} name
 * @param {Job|Function} job
 * @return {Roach}
 * @api public
 */

Roach.prototype.use = function(name, job) {
	var _this = this;
	if(job) {
		var process = job;
		if(typeof job === 'function') {
			process = new Job();
			job(process);
		}
		process.subscribe(name);
	}
	if(typeof name === 'string') {
		//NOTE: not tested and need some refactoring
		this.queue.on('added ' + name, function(id, options) {
			options = options? (' ' + JSON.stringify(options)) : '';
			//NOTE: may be job should get the options in redis
			_this.client.publish('roach:job:' + name, 'start ' + id + options);
		});
	} else {
		//we don't start through redis?
		name.emit('start');
	}
	return this;
};


/**
 * Scan folder and use crawlers.
 * example:
 *
 *   .scan(__dirname);
 *   
 * @param  {String} dir 
 * @return {Roach}
 * @api public
 */

Roach.prototype.scan = function(dir) {
	var _this = this;
	readdir(dir).forEach(function(name, idx) {
		var path = dir + '/' + name;
		var stat = fs.statSync(path);
		if(stat.isDirectory()) {
			read(path + '/roach.json','utf-8',function(err, file) {
				if(err) return;
				try {
					var job = require(path);
					job.config(file);
					_this.use(job.config('name') || name, job);
				} catch(e) {
					throw new Error(e);
				}
			});
		}
	});
	return this;
};

Roach.prototype.agenda = function() {
	//NOTE: expose scheduler
	//we could use redis and keyspaces notifications to listent expires event
	//it means we'd have a scheduler queue in redis
};