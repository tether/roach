
/**
 * Dependencies.
 * @api private
 */

var createClient = require('./client');
var Store = require('datastore');
var Promise = require('bredele-promise');
var Batch = require('batch');
var debug = require('debug')('job');


/**
 * Expose 'Job'
 */

module.exports = Job;


/**
 * Job constructor.
 *
 * @param {Object} options
 * @api public
 */

function Job(options) {
  var _this = this;
  var client = createClient(options);
  this.options = options;
  this.sandbox = new Store({});
  //debug purpose
  this.name = '';

  //init publish mechanism
  this.once('ready', function(id, options, name) {
    _this.name = name;
    debug('ready %s with id %s', _this.name, id);
    //process only if an other job is not active
    active(client, id).then(function() {
      var pattern = 'roach:job:' + id;
      debug('start %s', name);
      _this.emit('start', id, options);
      if(options) _this.config(JSON.parse(options));

      //we publish message to redis only if job has an id
      _this.on('_publish', function(channel, val) {
        val = (val!== undefined) ? ' ' + val : '';
        //added name in pattern because it'll help
        //to filter events by type (instead sending an extra event)
        client.publish(pattern + ' ' + name, channel + val);
      });

      _this.on('_data', function(data) {
        //added name in pattern to know which type of data
        client.publish(pattern + ':data ' + name, data);
      });
    });
  });
}


//inherits from queued emitter

require('component-emitter')(Job.prototype);
require('emitter-queue')(Job.prototype);


/**
 * Add job in active queue.
 * 
 * Check if job id is already active. If not,
 * set job id as active and plug job to redis
 * hub with verbose output.
 * 
 * @param  {Client} client
 * @param {Number} id
 * @api private
 */

function active(client, id) {
  var promise = new Promise();
  var str = 'job ' + id + ' ';
  client.zrank('roach:jobs:active', id, function(err, res) {
    if(err || res !== null) return promise.reject(str + 'already active');
    client.zrem('roach:jobs:pending', id, function(err) {
      if(err) return promise.reject( str + 'can not be removed from pending queue');
      debug('job %s removed from pending queue', id);
      //NOTE:we could index with id instead 1, but it doesn't matter
      client.zadd('roach:jobs:active', 1, id, function(err, res) {
        if(err) return promise.reject(str + 'can not be pushed in active queue');
        debug('job %s added in active queue', id);
        promise.resolve();
      });
    });
  });
  return promise;
}


/**
 * Subscribe to redis events.
 * 
 * Examples:
 *
 *   job.subscribe('myjob');
 * 
 * @param  {String} name 
 * @return {this}
 * @api private
 */

Job.prototype.subscribe = function(name) {
  var _this = this;
  var client = createClient(this.options);
  client.subscribe('roach:job:' + name);
  client.on('message', function(channel, str) {
    _this.emit.apply(_this, str.split(' ').concat(name));
  });
  return this;
};


/**
 * Config handler.
 * 
 * Examples:
 *
 *   //get
 *   .config('type');
 *   
 *   //set
 *   .config('type', 'web');
 *   
 *   //update
 *   .config({
 *     type: 'web'
 *   });
 *
 * @param {String | Object} name 
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
 * 
 * Examples:
 *
 *   .start(function(id, opts) {
 *     //do something
 *   });
 *
 * @param {Function} cb 
 * @param {this}
 * @event start
 * @api public
 */

Job.prototype.start = function(cb) {
  this.on('start', function() {
    try {
      cb.apply(arguments);
    } catch (e) {
      //NOTE: on step2, thow error through redis
      //console.error((new Date).toUTCString());
      console.error(e.stack);
      process.exit(1);
    }
  });
  return this;
};


/**
 * Stop job (hammer time).
 * 
 * Emit stop command or error if
 * a reason is specified.
 * 
 * Examples:
 *
 *   .stop();
 *   .stop('something wrong');
 *
 * @event stop || error
 * @api public
 */

Job.prototype.stop = function(err) {
  this.emit('stop');
  this.queue('_publish', err ? 'error' : 'stop', err);
  debug('stop %s', this.name);
  return this;
};


/**
 * Send log notifications.
 * 
 * Examples:
 *
 *   .log('roach');
 *   .log('type %s', 'roach');
 *   .log('type %1 %0', 'roach', 'jobs');
 *   
 * @param  {String} str (sprintf style)
 * @return {this}
 * @event log
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
    this.queue('_publish', 'log', str);
    debug('log %s', this.name);
    return this;
  }
};


/**
 * Set progress notifications.
 * 
 * Examples:
 *
 *   .progress(10);
 *   .progress(13, 120);
 *   
 * @param  {Number} val  
 * @param  {Number} total optional
 * @return {this}
 * @event progress
 * @api public
 */

Job.prototype.progress = function(val, total) {
  var result = total ? Math.min(100, val / total * 100 | 0) : val;
  this.emit('progress', result);
  this.queue('_publish', 'progress', result);
  debug('progress %s', this.name);
  return this;
};


/**
 * Publish data to roach through redis.
 * 
 * Examples:
 *
 *   .data('something');
 * 
 * @param  {Any} val
 * @return {this} 
 * @event data
 * @api public
 */

Job.prototype.data = function(val) {
  this.emit('data', val);
  this.queue('_data', val);
  debug('data %s', this.name);
  return this;
};


Job.prototype.step = function() {
  var batch = new Batch();
  for(var i = 0, l = arguments.length; i < l; i++) {
    batch.push(arguments[i]);
  }
  this.on('job run', function() {
    batch.end();
  });
};