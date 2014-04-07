
/**
 * Dependencies.
 * @api private
 */

var Job = require('./job');
var Crawler = require('./crawler');
var Queue = require('./queue');
var redis = require('redis');
var fs = require('fs');
var read = fs.readFile;
var readdir = fs.readdirSync;

//NOTE:set process title to know is
//job is on a separate process
//process.title = 'roach';


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
 * example:
 *
 *   var job = roach.job();
 *   
 * @return {Job}
 * @api public
 */

module.exports.job = function() {
	return new Job();
};


/**
 * Create crawler utils.
 * example:
 *
 *   var crawler = roach.crawler();
 *   
 * @return {Crawler}
 * @api public
 */

module.exports.crawler = function(obj) {
	return new Crawler(obj);
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
 * Add transport layer.
 * Transports are based on job in order to be consitent.
 * example:
 *
 *   .transport('rabbit', options);
 *   .transport(job);
 * 
 * @param  {String | Job} name
 * @param  {Object} options 
 * @return {this}
 * @api public
 */

Roach.prototype.transport = function(name, options) {
	var job = name;

	if (typeof name === 'string') {
		try {
			job = require('./transports/' + name);
		}
		catch (error){
			throw error;
		}
	}

	job.config(options);
	this.use(job);
};


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
			options = options? (' ' + JSON.stringify(options)) : ' {}';
			_this.client.publish('roach:job:' + name, 'ready ' + id + options);
		});
	} else {
		//we don't start through redis?
		name.emit('start');
	}
	return this;
};

//NOTE: we could have a stack hash field to stack multiple times
//the same event type.


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