
/**
 * Dependencies.
 * @api private
 */

var Store = require('datastore');
var Promise = require('bredele-promise');
var redis = require('redis');


/**
 * Expose 'Job'
 */

module.exports = Job;


/**
 * Job constructor.
 * @api public
 */

function Job() {
  var _this = this;
  var client = redis.createClient();
  this.sandbox = new Store({});

  //init publish mechanism
  //QUESTION: what if a job is called multiple times in
  //the same time?
  this.once('ready', function(id, options, name) {
    //process only if an other job is not active
    active(client, id).then(function() {
      var pattern = 'roach:job:' + id;
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
      //NOTE:we could index with id instead 1, but it doesn't matter
      client.zadd('roach:jobs:active', 1, id, function(err, res) {
        if(err) return promise.reject(str + 'can not be pushed in active queue');
        promise.resolve();
      });
    });
  });
  return promise;
}


/**
 * Subscribe to redis events.
 * 
 * @param  {String} name 
 * @return {this}
 * @api private
 */

Job.prototype.subscribe = function(name) {
  var _this = this;
  //NOTE:a redis client can only subscribe OR publish,
  //not both in the same time
  var client = redis.createClient();
  client.subscribe('roach:job:' + name);
  client.on('message', function(channel, str) {
    _this.emit.apply(_this, str.split(' ').concat(name));
  });
  return this;
};


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
      //console.error((new Date).toUTCString());
      console.error(e.stack);
      process.exit(1);
    }
  });
  return this;
};


/**
 * Stop job (hammer time).
 * Emit stop command or error if
 * reason.
 * example:
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
 * @return {this}
 * @event progress
 * @api public
 */

Job.prototype.progress = function(val, total) {
  var result = total ? Math.min(100, val / total * 100 | 0) : val;
  this.emit('progress', result);
  this.queue('_publish', 'progress', result);
  return this;
};


/**
 * Publish data to roach
 * through redis.
 * example:
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
  return this;
};