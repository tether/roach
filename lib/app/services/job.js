var Proto = require('uberproto');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var debug = require('debug')('Job Service');
var client = require('../../client');

var Service = Proto.extend({
  init: function(options){
    this.roach = options.roach;
    // TODO (EK): Bring in redis connection options depending on ENV
    this.client = client();
  },

  setup: function(app, path){
    this.app = app;
    debug('Job Service Initialized');
  },

  get: function(name, params, callback) {
    debug('GET', name, params);

    callback(null, {});
  },

  find: function(params, callback){
    debug('FIND', params);

    this.client.zrange('pending', 0, -1, function(error, data){

      if (error) {
        return callback(new this.app.errors.GeneralError('Redis Error: ' + error.message));
      }

      callback(null, {
        data: data
      });
    });
  },

  create: function(data, params, callback) {
    debug('CREATE', data, params);

    // Add a job
    // 
    if ( this.roach.availableCrawlers.indexOf(params.name) !== -1) {
      this.roach.add(params.name, data);
      return callback(null, { success: true });
    }
    
    callback(new this.app.errors.BadRequest('No crawler with the name "' + params.name + '"'));

    // var jobPath = path.resolve(this.app.get('crawlers'), data.name);

    // TOOD (EK): Fire an event to put job in the queue with the parameters

    // Check to see if the crawler exists on disk
    // Move to .scan() method in roach
    // fs.exists(jobPath, _.bind(function(exists) {
    //   if (!exists) {
    //     return callback(new this.app.errors.BadRequest('Invalid crawler name'));
    //   }

    //   try {
    //     var Job = require(jobPath);
    //     job = Job.create();
    //   }
    //   catch(e) {
    //     return callback(new this.app.errors.GeneralError('Bad Crawler File: ' + e.message));
    //   }

    //   // TODO (EK): Schedule the job
    //   // this.scheduler.schedule(job);
    //   callback(null, {});
    // }, this));
  },

});

module.exports = function (options) {
  return Proto.create.call(Service, options);
};