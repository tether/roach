
/**
 * Module dependencies.
 * @api private
 */

var Job = require('./job');
var Crawler = require('./crawler');
var Queue = require('./queue');
var client = require('./client');
var fs = require('fs');
var _ = require('lodash');
var read = fs.readFile;
var readdir = fs.readdirSync;
var debug = require('debug')('roach');
var util = require('util');


/**
 * Initialize roach UI
 * @api private
 */




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
 * Create client.
 * 
 * Examples:
 *
 *   var client = roach.client(options);
 *   
 * @return {redis connection}
 * @api public
 */

module.exports.client = function(options) {
  return client(options);
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
  this.options = _.defaults({}, options, {
    redis: {
      host: '127.0.0.1',
      port: 6379
    }
  });

  this.queue = new Queue(this.options.redis);
  this.client = client(this.options.redis);
  this.availableCrawlers = {};

  // If server options were passed in (ie. via CLI) then
  // start up the server
  if (this.options.server) {
    this.server(this.options.server);
  }
  debug('init');
}

/**
 * Add the API server.
 * 
 * The API server let's you manage jobs and crawlers via a REST API
 * 
 * Examples:
 *
 *   roach.app(options, app);
 *
 * @param  {Object} options
 * @param  {Express or Feathers App} app
 * @return {this}
 * @api public
 */

Roach.prototype.server = function(options, app) {
  this.options.server = _.defaults({}, options, {
    host: process.env.HOST || 5000,
    port: process.env.PORT || 'localhost'
  });

  if (app) {
    this.app = app(this, this.options.server);
  }
  else {
    try {
      this.app = require('./app')(this, this.options.server);
    }
    catch (error){
      throw error;
    }
  }

  debug('booting app server');

  return this;
};


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
  debug('use job %s', typeof name === 'string' ? name : util.inspect(name));
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
  debug('Scanning "%s" for crawlers', dir);
  readdir(dir).forEach(function(name, idx) {
    var path = dir + '/' + name;
    var stat = fs.statSync(path);
    if(stat.isDirectory()) {
      read(path + '/roach.json','utf-8',function(err, file) {
        if(err) return;
        try {
          var job = require(path);
          // if (job.config && job.start) {
            // job.config(file);
            _this.availableCrawlers[name] = path;
            // _this.use(job.config('name') || name, job);
          // } else {
            // console.log('you probably forgot to expose the job ', name);
          // }
        } catch(e) {
          throw new Error(e);
        }
      });
    }
  });
  return this;
};
