/**
 * Dependencies.
 * @api private
 */

var Emitter = require('component-emitter'),
    Queue = require('emitter-queue'),
    Store = require('store-component'),
    redis = require('redis');


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
  this.once('start', function(id, options) {
    var pattern = 'roach:job:' + id;
    if(options) _this.config(JSON.parse(options));

    //we publish message to redis only if job has an id
    _this.on('_publish', function(channel, val) {
      val = (val!== undefined) ? ' ' + val : '';
      client.publish(pattern, channel + val);
    });

    _this.on('_data', function(data) {
      client.publish(pattern + ':data', data);
    });
  });
}


//inherits from queued emitter

Emitter(Job.prototype);
Queue(Job.prototype);


/**
 * Subscribe to redis events.
 * 
 * @param  {String} name 
 * @return {Job}
 * @api private
 */

Job.prototype.subscribe = function(name) {
  var _this = this;
  //a redis client can only subscribe OR publish,
  //not both in the same time
  var client = redis.createClient();
  client.subscribe('roach:job:' + name);
  client.on('message', function(channel, str) {
    _this.emit.apply(_this, str.split(' '));
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
  this.queue('_publish', 'stop');
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
 * @return {Job}
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
 * @return {Job} 
 * @api public
 */

Job.prototype.data = function(val) {
  this.emit('data', val);
  this.queue('_data', val);
  return this;
};