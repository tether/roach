
/**
 * Module dependencies.
 * @api private
 */

var Job = require('./job');
var Crawler = require('./crawler');
var Queue = require('./queue');
var client = require('./client');
var fs = require('fs');
var read = fs.readFile;
var readdir = fs.readdirSync;
var debug = require('debug')('roach');


/**
 * Initialize roach UI
 * @api private
 */

//var app = app || require('./app');


/**
 * Expose 'Roach'.
 */

module.exports = function(options) {
  return new Roach(options);
};


/**
 * Create job.
 * 
 * Examples:
 *
 *   var job = roach.job(options);
 *   
 * @return {Job}
 * @api public
 */

module.exports.job = function(options) {
  return new Job(options);
};


/**
 * Create crawler utils.
 * 
 * Examples:
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
 *
 *   - initialize redis queue
 *   - add and use jobs
 *   - use transport layers
 *   - scan folder
 *
 * Examples:
 *
 *   var roach = require('roach')(options);
 *
 * @param {Object} options (redis port, host)
 * @api public
 */

function Roach(options) {
  this.queue = new Queue(options);
  this.client = client(options);
  debug('init');
}


/**
 * Add transport layer.
 * 
 * Transports are based on job in order to be consitent.
 * 
 * Examples:
 *
 *   //builtin transports
 *   roach.transport('rabbit', options);
 *   
 *   //your own transport
 *   roach.transport(job);
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
  debug('booting transport %s', name);
  this.use(job);
};


/**
 * Add job into the queue.
 *
 * Options are stored into a redis
 * hash fields and are identified with the job id.
 * 
 * Examples:
 *
 *   roach.add('weather');
 *   roach.add('weather', options);
 *
 * @param {String} name 
 * @param {Object} options 
 * @return {Roach}
 * @api public
 */

Roach.prototype.add = function(name, options) {
  this.queue.add(name, options);
  debug('adding %s', name);
};


/**
 * Start a roach job.
 * 
 * Examples:
 *
 *   roach.use(job);
 *   roach.use('weather', job);
 *   roach.use('weather', function(job){
 *   });
 *   roach.use('weather');
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
    name.emit('start');
  }
  debug('use job %s', name);
  return this;
};


/**
 * Scan folder and use crawlers.
 * 
 * Examples:
 *
 *   roach.scan(__dirname);
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
          if(job.config && job.start) {
            job.config(file);
            _this.use(job.config('name') || name, job);
          } else {
            console.log('you probably forget to expose the job ', name);
          }
        } catch(e) {
          throw new Error(e);
        }
      });
    }
  });
  return this;
};
