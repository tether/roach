var Proto = require('uberproto');
var path = require('path');
var fs = require('fs');
var client = require('../../client');
var debug = require('debug')('Crawler Service');

var Service = Proto.extend({
  init: function(options){
    this.roach = options.roach;
    // TODO (EK): Read in all the roach.json files and cache them.
  },

  setup: function(app, path){
    this.app = app;
    debug('Crawler Service Initialized');
  },

  get: function(name, params, callback) {
    debug('GET', name, params);

    callback(null, this.crawlers[name]);
  },

  find: function(params, callback){
    debug('FIND', params);

    callback(null, {
      crawlers: this.roach.availableCrawlers
    });
  },

  create: function(data, params, callback) {
    debug('CREATE', data, params);

    roach.use(params.name);

    return callback(new this.app.errors.Forbidden('Not Implemented'));
  },

});

module.exports = function (options) {
  return Proto.create.call(Service, options);
};