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

    // Add a job if it is available
    if ( this.roach.availableCrawlers.indexOf(params.name) !== -1) {
      this.roach.add(params.name, data);
      return callback(null, { success: true });
    }
    
    callback(new this.app.errors.BadRequest('No crawler with the name "' + params.name + '"'));
  },

});

module.exports = function (options) {
  return Proto.create.call(Service, options);
};